import { Module } from '@nestjs/common'

import { CheckLivenessUseCase } from './application/check-liveness.use-case'
import { CheckReadinessUseCase } from './application/check-readiness.use-case'
import { POSTGRES_PROBE, REDIS_PROBE } from './domain/ports/health-probe.port'
import { PostgresProbe } from './infrastructure/postgres.probe'
import { RedisProbe } from './infrastructure/redis.probe'
import { HealthController } from './interface/http/health.controller'

@Module({
  controllers: [HealthController],
  providers: [
    CheckLivenessUseCase,
    CheckReadinessUseCase,
    { provide: POSTGRES_PROBE, useClass: PostgresProbe },
    { provide: REDIS_PROBE, useClass: RedisProbe },
  ],
})
export class HealthModule {}
