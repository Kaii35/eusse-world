import { ACCOUNT_ROLE, ACCOUNT_STATUS } from '@eusse/contracts'

import { TOKEN_STATE } from '../../domain/refresh-token-family'

import type { AccountSummary, AccountsPort } from '../../../accounts/public/accounts.port'
import type { StoredOneTimeToken, TokenPurpose } from '../../domain/one-time-token'
import type { AccessTokenClaims, AccessTokenPort } from '../../domain/ports/access-token.port'
import type { ClockPort } from '../../domain/ports/clock.port'
import type { DomainEventInput, EventPublisherPort } from '../../domain/ports/event-publisher.port'
import type { OneTimeTokenRepositoryPort } from '../../domain/ports/one-time-token.repository.port'
import type { PasswordHasherPort } from '../../domain/ports/password-hasher.port'
import type {
  NewRefreshToken,
  NewSession,
  SessionRecord,
  SessionRepositoryPort,
  StoredRefreshToken,
} from '../../domain/ports/session.repository.port'
import type { OpaqueToken, TokenGeneratorPort } from '../../domain/ports/token-generator.port'
import type { UnitOfWorkPort } from '../../domain/ports/unit-of-work.port'
import type { UserRepositoryPort } from '../../domain/ports/user.repository.port'
import type { User } from '../../domain/user.entity'

/**
 * Dobles en memoria de los puertos de Identity.
 *
 * Permiten probar los casos de uso completos —incluidas carreras y revocaciones en
 * cascada— sin PostgreSQL. Los adaptadores reales (B5) se prueban aparte, contra una base
 * de datos de verdad: estos dobles verifican la **lógica**, no el SQL.
 *
 * Se excluyen del build (`tsconfig.build.json`): no viajan a producción.
 */

export class FakeClock implements ClockPort {
  constructor(private current: Date) {}

  now(): Date {
    return this.current
  }

  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms)
  }

  set(at: Date): void {
    this.current = at
  }
}

/** Hash reversible y barato. Argon2id real se prueba en su propio adaptador. */
export class FakePasswordHasher implements PasswordHasherPort {
  fakeVerifyCalls = 0

  hash(plain: string): Promise<string> {
    return Promise.resolve(`hashed:${plain}`)
  }

  verify(hash: string, plain: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${plain}`)
  }

  fakeVerify(): Promise<void> {
    this.fakeVerifyCalls += 1
    return Promise.resolve()
  }
}

/** Secuencia determinista: los tests pueden nombrar el token que esperan. */
export class FakeTokenGenerator implements TokenGeneratorPort {
  private tokenSeq = 0
  private idSeq = 0

  generate(): OpaqueToken {
    this.tokenSeq += 1
    const value = `token-${String(this.tokenSeq)}`
    return { value, hash: this.hashOf(value) }
  }

  hashOf(value: string): string {
    return `sha256:${value}`
  }

  newId(): string {
    this.idSeq += 1
    return `id-${String(this.idSeq)}`
  }
}

export class FakeAccessToken implements AccessTokenPort {
  readonly signed: { claims: AccessTokenClaims; expiresAt: Date }[] = []

  sign(claims: AccessTokenClaims, expiresAt: Date): Promise<string> {
    this.signed.push({ claims, expiresAt })
    return Promise.resolve(`jwt(${claims.sub}/${claims.sid}/${claims.acc ?? 'none'})`)
  }

  get lastClaims(): AccessTokenClaims | undefined {
    return this.signed.at(-1)?.claims
  }
}

/** Ejecuta el trabajo tal cual: lo que se prueba es que el caso de uso lo agrupe. */
export class PassThroughUnitOfWork implements UnitOfWorkPort {
  runs = 0

  run<T>(work: () => Promise<T>): Promise<T> {
    this.runs += 1
    return work()
  }
}

export class RecordingEventPublisher implements EventPublisherPort {
  readonly published: DomainEventInput[] = []

  publish(events: readonly DomainEventInput[]): Promise<void> {
    this.published.push(...events)
    return Promise.resolve()
  }

  typesPublished(): string[] {
    return this.published.map((event) => event.type)
  }

  find(type: string): DomainEventInput | undefined {
    return this.published.find((event) => event.type === type)
  }
}

export class InMemoryUserRepository implements UserRepositoryPort {
  readonly byId = new Map<string, User>()

  findByEmail(email: string): Promise<User | null> {
    const found = [...this.byId.values()].find((user) => user.email === email)
    return Promise.resolve(found ?? null)
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.byId.get(id) ?? null)
  }

  create(user: User): Promise<void> {
    const clash = [...this.byId.values()].some((other) => other.email === user.email)
    // Como en la base de datos: la unicidad revienta en la escritura, no en un SELECT.
    if (clash) return Promise.reject(new Error('email duplicado'))
    this.byId.set(user.id, user)
    return Promise.resolve()
  }

  save(user: User): Promise<void> {
    this.byId.set(user.id, user)
    return Promise.resolve()
  }
}

export class InMemoryOneTimeTokenRepository implements OneTimeTokenRepositoryPort {
  readonly tokens: StoredOneTimeToken[] = []

  create(token: StoredOneTimeToken): Promise<void> {
    this.tokens.push(token)
    return Promise.resolve()
  }

  findByHash(hash: string): Promise<StoredOneTimeToken | null> {
    return Promise.resolve(this.tokens.find((token) => token.hash === hash) ?? null)
  }

  consume(tokenId: string, at: Date): Promise<boolean> {
    const index = this.tokens.findIndex((token) => token.id === tokenId)
    if (index === -1) return Promise.resolve(false)

    const token = this.tokens[index]
    if (!token) return Promise.resolve(false)
    if (token.consumedAt !== null) return Promise.resolve(false)

    this.tokens[index] = { ...token, consumedAt: at }
    return Promise.resolve(true)
  }

  invalidateAllFor(userId: string, purpose: TokenPurpose, at: Date): Promise<void> {
    this.tokens.forEach((token, index) => {
      if (token.userId === userId && token.purpose === purpose && token.consumedAt === null) {
        this.tokens[index] = { ...token, consumedAt: at }
      }
    })
    return Promise.resolve()
  }

  liveFor(userId: string, purpose: TokenPurpose): StoredOneTimeToken[] {
    return this.tokens.filter(
      (token) => token.userId === userId && token.purpose === purpose && token.consumedAt === null,
    )
  }
}

type StoredSession = SessionRecord & {
  readonly ip: string | null
  readonly userAgent: string | null
}

type TokenRow = {
  id: string
  sessionId: string
  userId: string
  familyId: string
  hash: string
  state: (typeof TOKEN_STATE)[keyof typeof TOKEN_STATE]
  expiresAt: Date
}

export class InMemorySessionRepository implements SessionRepositoryPort {
  readonly sessions = new Map<string, StoredSession>()
  readonly refreshTokens: TokenRow[] = []

  openSession(session: NewSession, refresh: NewRefreshToken): Promise<void> {
    this.sessions.set(session.id, {
      id: session.id,
      userId: session.userId,
      activeAccountId: session.activeAccountId,
      createdAt: session.createdAt,
      lastSeenAt: session.createdAt,
      revokedAt: null,
      ip: session.ip,
      userAgent: session.userAgent,
    })
    this.insertToken(refresh, session.userId)
    return Promise.resolve()
  }

  findSession(sessionId: string): Promise<SessionRecord | null> {
    return Promise.resolve(this.sessions.get(sessionId) ?? null)
  }

  findRefreshByHash(hash: string): Promise<StoredRefreshToken | null> {
    const row = this.refreshTokens.find((token) => token.hash === hash)
    if (!row) return Promise.resolve(null)

    return Promise.resolve({
      id: row.id,
      familyId: row.familyId,
      state: row.state,
      expiresAt: row.expiresAt,
      sessionId: row.sessionId,
      userId: row.userId,
    })
  }

  rotate(usedTokenId: string, next: NewRefreshToken, usedAt: Date): Promise<boolean> {
    const row = this.refreshTokens.find((token) => token.id === usedTokenId)
    // Equivale al `UPDATE ... WHERE state = 'ACTIVE'` del adaptador real: quien llega
    // segundo no rota.
    if (!row) return Promise.resolve(false)
    if (row.state !== TOKEN_STATE.ACTIVE) return Promise.resolve(false)

    row.state = TOKEN_STATE.USED
    this.insertToken(next, row.userId)
    this.touch(row.sessionId, usedAt)
    return Promise.resolve(true)
  }

  revokeFamily(familyId: string, at: Date): Promise<void> {
    const affected = this.refreshTokens.filter((token) => token.familyId === familyId)
    for (const token of affected) {
      token.state = TOKEN_STATE.REVOKED
      this.markSessionRevoked(token.sessionId, at)
    }
    return Promise.resolve()
  }

  revokeSession(sessionId: string, at: Date): Promise<void> {
    this.markSessionRevoked(sessionId, at)
    for (const token of this.refreshTokens.filter((row) => row.sessionId === sessionId)) {
      token.state = TOKEN_STATE.REVOKED
    }
    return Promise.resolve()
  }

  revokeAllForUser(userId: string, at: Date): Promise<void> {
    for (const session of this.sessions.values()) {
      if (session.userId === userId) this.markSessionRevoked(session.id, at)
    }
    for (const token of this.refreshTokens.filter((row) => row.userId === userId)) {
      token.state = TOKEN_STATE.REVOKED
    }
    return Promise.resolve()
  }

  setActiveAccount(sessionId: string, accountId: string | null, at: Date): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (session) {
      this.sessions.set(sessionId, { ...session, activeAccountId: accountId, lastSeenAt: at })
    }
    return Promise.resolve()
  }

  private insertToken(token: NewRefreshToken, userId: string): void {
    this.refreshTokens.push({
      id: token.id,
      sessionId: token.sessionId,
      userId,
      familyId: token.familyId,
      hash: token.hash,
      state: TOKEN_STATE.ACTIVE,
      expiresAt: token.expiresAt,
    })
  }

  private markSessionRevoked(sessionId: string, at: Date): void {
    const session = this.sessions.get(sessionId)
    if (session) this.sessions.set(sessionId, { ...session, revokedAt: at })
  }

  private touch(sessionId: string, at: Date): void {
    const session = this.sessions.get(sessionId)
    if (session) this.sessions.set(sessionId, { ...session, lastSeenAt: at })
  }
}

export class FakeAccountsPort implements AccountsPort {
  readonly memberships = new Map<string, AccountSummary[]>()
  readonly submittedForApproval: string[] = []
  private seq = 0

  provisionAccount(input: {
    ownerUserId: string
    legalName: string
    taxId: string
    phone: string
  }): Promise<{ accountId: string }> {
    this.seq += 1
    const accountId = `account-${String(this.seq)}`
    this.give(input.ownerUserId, {
      accountId,
      legalName: input.legalName,
      status: ACCOUNT_STATUS.PENDING_VERIFICATION,
      role: ACCOUNT_ROLE.OWNER,
      approvalThreshold: null,
    })
    return Promise.resolve({ accountId })
  }

  membershipsOf(userId: string): Promise<readonly AccountSummary[]> {
    return Promise.resolve(this.memberships.get(userId) ?? [])
  }

  membershipOf(userId: string, accountId: string): Promise<AccountSummary | null> {
    const found = (this.memberships.get(userId) ?? []).find(
      (membership) => membership.accountId === accountId,
    )
    return Promise.resolve(found ?? null)
  }

  submitForApproval(accountId: string): Promise<void> {
    this.submittedForApproval.push(accountId)
    for (const [userId, list] of this.memberships) {
      this.memberships.set(
        userId,
        list.map((membership) =>
          membership.accountId === accountId
            ? { ...membership, status: ACCOUNT_STATUS.PENDING_APPROVAL }
            : membership,
        ),
      )
    }
    return Promise.resolve()
  }

  /** Ayuda de test: da a `userId` una membresía ya existente. */
  give(userId: string, membership: AccountSummary): void {
    this.memberships.set(userId, [...(this.memberships.get(userId) ?? []), membership])
  }
}
