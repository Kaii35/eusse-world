import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'

import { ENV } from '../../../config/config.module'

import { describeProbeError } from './probe-error'

import type { Env } from '../../../config/env.schema'
import type { HealthProbePort, ProbeResult } from '../domain/ports/health-probe.port'

/** Sonda de Redis. Adaptador del puerto `HealthProbePort`. */
@Injectable()
export class RedisProbe implements HealthProbePort {
  readonly name = 'redis'
  private readonly client: Redis

  constructor(@Inject(ENV) env: Env) {
    this.client = new Redis(env.REDIS_URL, {
      keyPrefix: `${env.REDIS_PREFIX}:`,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      commandTimeout: 2_000,
      // Sin reintentos infinitos: una sonda que se cuelga es peor que una que falla.
      retryStrategy: () => null,
    })
  }

  async check(): Promise<ProbeResult> {
    const startedAt = Date.now()
    try {
      if (this.client.status !== 'ready') await this.client.connect()
      await this.client.ping()
      return { status: 'up', latencyMs: Date.now() - startedAt }
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - startedAt,
        error: describeProbeError(error),
      }
    }
  }
}
