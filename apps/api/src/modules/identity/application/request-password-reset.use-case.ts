import { Inject, Injectable } from '@nestjs/common'

import { TOKEN_PURPOSE, passwordResetExpiryFrom } from '../domain/one-time-token'
import { CLOCK, type ClockPort } from '../domain/ports/clock.port'
import { EVENT_PUBLISHER, type EventPublisherPort } from '../domain/ports/event-publisher.port'
import {
  ONE_TIME_TOKEN_REPOSITORY,
  type OneTimeTokenRepositoryPort,
} from '../domain/ports/one-time-token.repository.port'
import { TOKEN_GENERATOR, type TokenGeneratorPort } from '../domain/ports/token-generator.port'
import { UNIT_OF_WORK, type UnitOfWorkPort } from '../domain/ports/unit-of-work.port'
import { USER_REPOSITORY, type UserRepositoryPort } from '../domain/ports/user.repository.port'
import { USER_STATUS, normalizeEmail } from '../domain/user.entity'

/**
 * Solicitud de recuperación de contraseña (RFC-0003 §4.9).
 *
 * **Nunca falla y nunca dice nada.** Con email conocido o desconocido, el resultado es
 * idéntico: 202. Un "ese correo no está registrado" convierte este formulario —público y
 * sin sesión— en la forma más cómoda de listar los clientes de la empresa.
 */
@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    @Inject(ONE_TIME_TOKEN_REPOSITORY) private readonly oneTimeTokens: OneTimeTokenRepositoryPort,
    @Inject(TOKEN_GENERATOR) private readonly tokens: TokenGeneratorPort,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisherPort,
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWorkPort,
    @Inject(CLOCK) private readonly clock: ClockPort,
  ) {}

  async execute(rawEmail: string): Promise<void> {
    const email = normalizeEmail(rawEmail)
    const user = await this.users.findByEmail(email)

    if (!user) return
    // Un usuario suspendido no recupera la contraseña: le devolvería el acceso que el
    // staff acaba de quitarle. Por fuera, la respuesta es la misma.
    if (user.currentStatus !== USER_STATUS.ACTIVE) return

    const now = this.clock.now()

    await this.uow.run(async () => {
      // Pedir un enlace nuevo invalida el anterior: si no, cada solicitud deja otra llave
      // viva durante una hora.
      await this.oneTimeTokens.invalidateAllFor(user.id, TOKEN_PURPOSE.PASSWORD_RESET, now)

      const token = this.tokens.generate()
      await this.oneTimeTokens.create({
        id: this.tokens.newId(),
        userId: user.id,
        purpose: TOKEN_PURPOSE.PASSWORD_RESET,
        hash: token.hash,
        expiresAt: passwordResetExpiryFrom(now),
        consumedAt: null,
      })

      await this.events.publish([
        {
          type: 'identity.PasswordResetRequested.v1',
          occurredAt: now,
          payload: { userId: user.id, email, firstName: user.firstName, token: token.value },
        },
      ])
    })
  }
}
