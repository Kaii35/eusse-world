import { Inject, Injectable } from '@nestjs/common'

import type { LoginRequest } from '@eusse/contracts'

import {
  ACCOUNTS_PORT,
  type AccountSummary,
  type AccountsPort,
} from '../../accounts/public/accounts.port'
import { CLOCK, type ClockPort } from '../domain/ports/clock.port'
import { PASSWORD_HASHER, type PasswordHasherPort } from '../domain/ports/password-hasher.port'
import { USER_REPOSITORY, type UserRepositoryPort } from '../domain/ports/user.repository.port'
import { InvalidCredentialsError, normalizeEmail } from '../domain/user.entity'

import { pickActiveAccount } from './active-account'
import { SessionIssuer, type IssuedSession } from './session-issuer'

export type LoginInput = LoginRequest & {
  readonly ip: string | null
  readonly userAgent: string | null
}

export type LoginResult = {
  readonly session: IssuedSession
  readonly userId: string
  readonly activeAccountId: string | null
  readonly memberships: readonly AccountSummary[]
}

/**
 * Login (RFC-0003 §4.8).
 *
 * Dos reglas gobiernan este caso de uso, y las dos son de seguridad:
 *
 *   1. **Misma respuesta** para email inexistente y contraseña incorrecta.
 *   2. **Mismo tiempo** de respuesta en ambos casos. Por eso, cuando el email no existe,
 *      igualmente se ejecuta una verificación señuelo: sin ella, un atacante distingue los
 *      dos casos por el reloj y la regla 1 no sirve de nada.
 */
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    @Inject(ACCOUNTS_PORT) private readonly accounts: AccountsPort,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(CLOCK) private readonly clock: ClockPort,
    @Inject(SessionIssuer) private readonly issuer: SessionIssuer,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const user = await this.users.findByEmail(normalizeEmail(input.email))

    if (!user) {
      await this.hasher.fakeVerify()
      throw new InvalidCredentialsError()
    }

    const matches = await this.hasher.verify(user.credentialHash, input.password)
    if (!matches) throw new InvalidCredentialsError()

    // Sólo ahora, con la contraseña ya demostrada, se puede hablar del estado del usuario
    // sin revelar nada a quien no la conoce.
    user.assertCanAuthenticate()

    const memberships = await this.accounts.membershipsOf(user.id)
    const activeAccountId = pickActiveAccount(memberships)

    user.recordLogin(this.clock.now())
    await this.users.save(user)

    const session = await this.issuer.open({
      userId: user.id,
      activeAccountId,
      ip: input.ip,
      userAgent: input.userAgent,
    })

    return { session, userId: user.id, activeAccountId, memberships }
  }
}
