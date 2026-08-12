import { Inject, Injectable } from '@nestjs/common'

import type { ResetPasswordRequest } from '@eusse/contracts'

import {
  InvalidOneTimeTokenError,
  TOKEN_PURPOSE,
  assertUsableToken,
} from '../domain/one-time-token'
import { CLOCK, type ClockPort } from '../domain/ports/clock.port'
import { EVENT_PUBLISHER, type EventPublisherPort } from '../domain/ports/event-publisher.port'
import {
  ONE_TIME_TOKEN_REPOSITORY,
  type OneTimeTokenRepositoryPort,
} from '../domain/ports/one-time-token.repository.port'
import { PASSWORD_HASHER, type PasswordHasherPort } from '../domain/ports/password-hasher.port'
import {
  SESSION_REPOSITORY,
  type SessionRepositoryPort,
} from '../domain/ports/session.repository.port'
import { TOKEN_GENERATOR, type TokenGeneratorPort } from '../domain/ports/token-generator.port'
import { UNIT_OF_WORK, type UnitOfWorkPort } from '../domain/ports/unit-of-work.port'
import { USER_REPOSITORY, type UserRepositoryPort } from '../domain/ports/user.repository.port'

/**
 * Restablecimiento de contraseña.
 *
 * Cierra **todas** las sesiones del usuario. Quien restablece su contraseña suele hacerlo
 * porque sospecha que alguien más entró: dejarle abiertas las sesiones existentes deja
 * dentro exactamente a quien intenta echar.
 */
@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    @Inject(ONE_TIME_TOKEN_REPOSITORY) private readonly oneTimeTokens: OneTimeTokenRepositoryPort,
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepositoryPort,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(TOKEN_GENERATOR) private readonly tokens: TokenGeneratorPort,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisherPort,
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWorkPort,
    @Inject(CLOCK) private readonly clock: ClockPort,
  ) {}

  async execute(input: ResetPasswordRequest): Promise<void> {
    const now = this.clock.now()
    const stored = await this.oneTimeTokens.findByHash(this.tokens.hashOf(input.token))

    assertUsableToken(stored, TOKEN_PURPOSE.PASSWORD_RESET, now)

    // El hash es lo caro (Argon2id). Se hace antes de abrir la transacción para no tener
    // una transacción de escritura abierta durante ~50 ms bajo un endpoint público.
    const passwordHash = await this.hasher.hash(input.password)

    await this.uow.run(async () => {
      const consumed = await this.oneTimeTokens.consume(stored.id, now)
      if (!consumed) throw new InvalidOneTimeTokenError()

      const user = await this.users.findById(stored.userId)
      if (!user) throw new InvalidOneTimeTokenError()

      user.changePassword(passwordHash)
      await this.users.save(user)

      // El correo NO se marca como verificado aquí, aunque llegar a este punto pruebe que
      // el usuario lo controla: la verificación mueve la empresa a la cola de aprobación,
      // y ese camino tiene su propio caso de uso. Mezclarlos dejaría cuentas aprobadas por
      // una ruta que nadie diseñó para eso.
      await this.sessions.revokeAllForUser(user.id, now)

      await this.events.publish([
        {
          type: 'identity.PasswordChanged.v1',
          occurredAt: now,
          // Aviso al usuario: si no fue él, tiene que enterarse de inmediato.
          payload: { userId: user.id, email: user.email, firstName: user.firstName },
        },
      ])
    })
  }
}
