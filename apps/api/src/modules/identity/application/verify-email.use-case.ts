import { ACCOUNT_STATUS } from '@eusse/contracts'
import { Inject, Injectable } from '@nestjs/common'

import { ACCOUNTS_PORT, type AccountsPort } from '../../accounts/public/accounts.port'
import {
  InvalidOneTimeTokenError,
  TOKEN_PURPOSE,
  assertUsableToken,
} from '../domain/one-time-token'
import { CLOCK, type ClockPort } from '../domain/ports/clock.port'
import {
  ONE_TIME_TOKEN_REPOSITORY,
  type OneTimeTokenRepositoryPort,
} from '../domain/ports/one-time-token.repository.port'
import { TOKEN_GENERATOR, type TokenGeneratorPort } from '../domain/ports/token-generator.port'
import { UNIT_OF_WORK, type UnitOfWorkPort } from '../domain/ports/unit-of-work.port'
import { USER_REPOSITORY, type UserRepositoryPort } from '../domain/ports/user.repository.port'

/**
 * Verificación de correo (RFC-0003 §4.4).
 *
 * Verificar el correo mueve además a la empresa a la cola de aprobación del staff: es la
 * transición `PENDING_VERIFICATION → PENDING_APPROVAL`. Las dos escrituras van juntas;
 * un usuario verificado cuya empresa nunca llegó a la cola esperaría una aprobación que
 * nadie tiene delante.
 */
@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepositoryPort,
    @Inject(ONE_TIME_TOKEN_REPOSITORY) private readonly oneTimeTokens: OneTimeTokenRepositoryPort,
    @Inject(ACCOUNTS_PORT) private readonly accounts: AccountsPort,
    @Inject(TOKEN_GENERATOR) private readonly tokens: TokenGeneratorPort,
    @Inject(UNIT_OF_WORK) private readonly uow: UnitOfWorkPort,
    @Inject(CLOCK) private readonly clock: ClockPort,
  ) {}

  async execute(presentedToken: string): Promise<void> {
    const now = this.clock.now()
    const stored = await this.oneTimeTokens.findByHash(this.tokens.hashOf(presentedToken))

    assertUsableToken(stored, TOKEN_PURPOSE.EMAIL_VERIFICATION, now)

    await this.uow.run(async () => {
      // El consumo decide: si otra petición se adelantó, `consume` devuelve false y aquí
      // se acaba. Validar sin consumir dejaría pasar dos peticiones simultáneas.
      const consumed = await this.oneTimeTokens.consume(stored.id, now)
      if (!consumed) throw new InvalidOneTimeTokenError()

      const user = await this.users.findById(stored.userId)
      if (!user) throw new InvalidOneTimeTokenError()

      user.verifyEmail(now)
      await this.users.save(user)

      const memberships = await this.accounts.membershipsOf(user.id)
      const pending = memberships.filter((m) => m.status === ACCOUNT_STATUS.PENDING_VERIFICATION)

      for (const membership of pending) {
        await this.accounts.submitForApproval(membership.accountId)
      }
    })
  }
}
