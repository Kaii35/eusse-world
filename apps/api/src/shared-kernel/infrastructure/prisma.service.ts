import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

/**
 * Cliente de Prisma con ciclo de vida gestionado por Nest.
 *
 * Vive en `shared-kernel/infrastructure/`. **Ningún `domain/` ni `application/` puede
 * importarlo**: la regla se verifica en CI con `eslint-plugin-boundaries`
 * (ADR-0002, docs/07-module-dependencies.md).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  async onModuleInit(): Promise<void> {
    await this.$connect()
    this.logger.log({ event: 'prisma.connected' })
  }

  async onModuleDestroy(): Promise<void> {
    // Apagado ordenado: sin esto, cada despliegue corta consultas a medias.
    await this.$disconnect()
    this.logger.log({ event: 'prisma.disconnected' })
  }
}
