import {
  type LivenessResponse,
  type ReadinessResponse,
  livenessResponseSchema,
  readinessResponseSchema,
} from '@eusse/contracts'
import { Controller, Get, HttpCode, Res } from '@nestjs/common'

import { CheckLivenessUseCase } from '../../application/check-liveness.use-case'
import { CheckReadinessUseCase } from '../../application/check-readiness.use-case'

import type { Response } from 'express'

/**
 * Endpoints de salud.
 *
 * El controller no piensa: delega en el caso de uso y mapea la respuesta
 * (skills/backend-nestjs.md).
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly checkLiveness: CheckLivenessUseCase,
    private readonly checkReadiness: CheckReadinessUseCase,
  ) {}

  /**
   * Comprobación superficial: el proceso responde.
   *
   * No consulta dependencias. Es lo que debe usar el balanceador para decidir si
   * enrutar tráfico: un fallo aquí significa que el proceso está muerto.
   */
  @Get('live')
  @HttpCode(200)
  live(): LivenessResponse {
    return livenessResponseSchema.parse(this.checkLiveness.execute())
  }

  /**
   * Comprobación profunda: el servicio puede atender peticiones.
   *
   * Devuelve 503 si alguna dependencia está caída, para que el despliegue no enrute
   * tráfico a una instancia que todavía no puede servir.
   */
  @Get('ready')
  async ready(@Res({ passthrough: true }) response: Response): Promise<ReadinessResponse> {
    const result = await this.checkReadiness.execute()
    response.status(result.status === 'ok' ? 200 : 503)
    return readinessResponseSchema.parse(result)
  }
}
