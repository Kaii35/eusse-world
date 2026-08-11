import { Injectable } from '@nestjs/common'

import type { LivenessResult } from '../domain/health-result'

/**
 * Comprobación superficial: el proceso está vivo y responde.
 *
 * No consulta dependencias a propósito. Si esto falla, el proceso está muerto y el
 * balanceador debe dejar de enrutarle tráfico.
 */
@Injectable()
export class CheckLivenessUseCase {
  private readonly startedAt = Date.now()

  execute(): LivenessResult {
    return {
      status: 'ok',
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
    }
  }
}
