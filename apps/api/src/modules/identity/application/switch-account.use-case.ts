import { ACCOUNT_STATUS } from '@eusse/contracts'
import { Inject, Injectable } from '@nestjs/common'

import { DomainError, NotFoundError } from '../../../shared-kernel/domain/domain-error'
import { ACCOUNTS_PORT, type AccountsPort } from '../../accounts/public/accounts.port'
import { CLOCK, type ClockPort } from '../domain/ports/clock.port'
import {
  SESSION_REPOSITORY,
  type SessionRepositoryPort,
} from '../domain/ports/session.repository.port'

import { SessionIssuer, type AccessGrant } from './session-issuer'

export type SwitchAccountInput = {
  readonly sessionId: string
  readonly userId: string
  readonly accountId: string
}

export type SwitchAccountResult = AccessGrant & {
  readonly activeAccountId: string
}

/**
 * Cambio de cuenta activa (RFC-0003 §4.6).
 *
 * En B2B una persona puede comprar para varias empresas. Cambiar de cuenta es un **cambio
 * de contexto completo**: carrito, precios y permisos son otros. El frontend invalida toda
 * la caché de TanStack Query al recibir la respuesta; si no lo hiciera, el usuario vería
 * los precios de la empresa anterior.
 *
 * El refresh token **no** se rota aquí: lo que cambia es el claim `acc` del access token,
 * que dura 15 minutos. Rotar además el refresh sólo añadiría carreras.
 */
@Injectable()
export class SwitchAccountUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepositoryPort,
    @Inject(ACCOUNTS_PORT) private readonly accounts: AccountsPort,
    @Inject(CLOCK) private readonly clock: ClockPort,
    @Inject(SessionIssuer) private readonly issuer: SessionIssuer,
  ) {}

  async execute(input: SwitchAccountInput): Promise<SwitchAccountResult> {
    // `userId` sale de la sesión, nunca del cliente. Si viniera del cuerpo de la petición,
    // cualquiera se cambiaría a la cuenta de otro escribiendo su id.
    const membership = await this.accounts.membershipOf(input.userId, input.accountId)

    // 404 y no 403: un 403 confirmaría que esa cuenta existe (RFC-0003 §4.5).
    if (!membership) throw new NotFoundError('Cuenta')

    if (membership.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new DomainError(
        'ACCOUNT_NOT_ACTIVE',
        `La cuenta está en estado ${membership.status} y no puede operar`,
        { status: membership.status },
      )
    }

    const now = this.clock.now()
    await this.sessions.setActiveAccount(input.sessionId, input.accountId, now)

    const grant = await this.issuer.grant({
      userId: input.userId,
      sessionId: input.sessionId,
      activeAccountId: input.accountId,
      now,
    })

    return { ...grant, activeAccountId: input.accountId }
  }
}
