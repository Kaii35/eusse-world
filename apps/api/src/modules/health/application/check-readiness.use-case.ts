import { Inject, Injectable } from '@nestjs/common'

import { APP_VERSION } from '../../../config/app-version'
import { ENV } from '../../../config/config.module'
import { type ReadinessResult, resolveOverallStatus } from '../domain/health-result'
import {
  POSTGRES_PROBE,
  REDIS_PROBE,
  type HealthProbePort,
} from '../domain/ports/health-probe.port'

import type { Env } from '../../../config/env.schema'

/**
 * Comprobación profunda: el servicio puede atender peticiones.
 *
 * Las sondas se ejecutan **en paralelo**: comprobar dos dependencias en serie duplica
 * la latencia del endpoint que más se consulta del sistema.
 */
@Injectable()
export class CheckReadinessUseCase {
  constructor(
    @Inject(POSTGRES_PROBE) private readonly postgres: HealthProbePort,
    @Inject(REDIS_PROBE) private readonly redis: HealthProbePort,
    @Inject(ENV) private readonly env: Env,
  ) {}

  async execute(): Promise<ReadinessResult> {
    const [postgres, redis] = await Promise.all([this.postgres.check(), this.redis.check()])

    return {
      status: resolveOverallStatus([postgres, redis]),
      version: APP_VERSION,
      environment: this.env.APP_ENV,
      timestamp: new Date().toISOString(),
      dependencies: { postgres, redis },
    }
  }
}
