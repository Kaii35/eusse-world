import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../../shared-kernel/infrastructure/prisma.service'

import { describeProbeError } from './probe-error'

import type { HealthProbePort, ProbeResult } from '../domain/ports/health-probe.port'

const PROBE_TIMEOUT_MS = 2_000

/**
 * Sonda de PostgreSQL.
 *
 * Adaptador del puerto `HealthProbePort`: el caso de uso no sabe que existe Prisma.
 */
@Injectable()
export class PostgresProbe implements HealthProbePort {
  readonly name = 'postgres'

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<ProbeResult> {
    const startedAt = Date.now()
    try {
      await withTimeout(this.prisma.$queryRaw`SELECT 1`, PROBE_TIMEOUT_MS)
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

async function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('ProbeTimeout'))
        }, ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}
