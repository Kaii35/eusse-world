import { Inject, Injectable } from '@nestjs/common'

import type { RegisterRequest } from '@eusse/contracts'

import { ACCOUNTS_PORT, type AccountsPort } from '../../accounts/public/accounts.port'
import { TOKEN_PURPOSE, emailVerificationExpiryFrom } from '../domain/one-time-token'
import { CLOCK, type ClockPort } from '../domain/ports/clock.port'
import {
  EVENT_PUBLISHER,
  type DomainEventInput,
  type EventPublisherPort,
} from '../domain/ports/event-publisher.port'
import {
  ONE_TIME_TOKEN_REPOSITORY,
  type OneTimeTokenRepositoryPort,
} from '../domain/ports/one-time-token.repository.port'
import { PASSWORD_HASHER, type PasswordHasherPort } from '../domain/ports/password-hasher.port'
import { TOKEN_GENERATOR, type TokenGeneratorPort } from '../domain/ports/token-generator.port'
import { UNIT_OF_WORK, type UnitOfWorkPort } from '../domain/ports/unit-of-work.port'
import { USER_REPOSITORY, type UserRepositoryPort } from '../domain/ports/user.repository.port'
import { User, normalizeEmail } from '../domain/user.entity'

/**
 * Registro (RFC-0003 §4.4).
 *
 * En B2B el registro crea **dos cosas**: la persona y su empresa. Van en la misma
 * transacción; una persona sin empresa no puede hacer nada y nadie la repararía.
 *
 * La respuesta es **uniforme**: registrarse con un email ya existente devuelve exactamente
 * lo mismo que hacerlo con uno nuevo. Si no, el formulario de registro se convierte en el
 * oráculo de enumeración que el de login evita con tanto cuidado.
 */
@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    @Inject(ONE_TIME_TOKEN_REPOSITORY) private readonly oneTimeTokens: OneTimeTokenRepositoryPort,
    @Inject(ACCOUNTS_PORT) private readonly accounts: AccountsPort,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(TOKEN_GENERATOR) private readonly tokens: TokenGeneratorPort,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisherPort,
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWorkPort,
    @Inject(CLOCK) private readonly clock: ClockPort,
  ) {}

  async execute(input: RegisterRequest): Promise<void> {
    const email = normalizeEmail(input.email)
    const existing = await this.users.findByEmail(email)

    if (existing) {
      // Ya existe. Si nunca verificó su correo, esto es en la práctica un reenvío del
      // enlace —que es justo lo que esa persona necesita—. Si ya lo verificó, no se hace
      // nada: no se le avisa a quien prueba emails de que ha acertado.
      if (!existing.isEmailVerified) {
        await this.uow.run(async () => {
          const event = await this.issueVerification(existing.id, email, this.clock.now())
          await this.events.publish([event])
        })
      }
      return
    }

    const passwordHash = await this.hasher.hash(input.password)
    const user = User.register({
      id: this.tokens.newId(),
      email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    })

    // Un solo instante para toda la transacción: los dos eventos describen el mismo
    // hecho. Leer el reloj dos veces les daría marcas distintas y el orden en que un
    // consumidor los ve dependería de microsegundos.
    const now = this.clock.now()

    await this.uow.run(async () => {
      await this.users.create(user)

      const { accountId } = await this.accounts.provisionAccount({
        ownerUserId: user.id,
        legalName: input.company.legalName,
        taxId: input.company.taxId,
        phone: input.company.phone,
      })

      const verification = await this.issueVerification(user.id, email, now)

      await this.events.publish([
        {
          type: 'identity.UserRegistered.v1',
          occurredAt: now,
          // Payload autocontenido: Notifications y CRM no deben volver a preguntar.
          payload: {
            userId: user.id,
            accountId,
            email,
            firstName: user.firstName,
            lastName: user.lastName,
            legalName: input.company.legalName,
            taxId: input.company.taxId,
          },
        },
        verification,
      ])
    })
  }

  /** Emite el enlace de verificación e invalida los anteriores. */
  private async issueVerification(
    userId: string,
    email: string,
    now: Date,
  ): Promise<DomainEventInput> {
    await this.oneTimeTokens.invalidateAllFor(userId, TOKEN_PURPOSE.EMAIL_VERIFICATION, now)

    const token = this.tokens.generate()
    await this.oneTimeTokens.create({
      id: this.tokens.newId(),
      userId,
      purpose: TOKEN_PURPOSE.EMAIL_VERIFICATION,
      hash: token.hash,
      expiresAt: emailVerificationExpiryFrom(now),
      consumedAt: null,
    })

    return {
      type: 'identity.EmailVerificationRequested.v1',
      occurredAt: now,
      // El token en claro sólo existe aquí y en el correo. En la base de datos, su hash.
      payload: { userId, email, token: token.value },
    }
  }
}
