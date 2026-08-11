import { Global, Module } from '@nestjs/common'

import { PrismaService } from './infrastructure/prisma.service'

/**
 * Infraestructura compartida por todos los módulos.
 *
 * Es global a propósito: cada módulo necesitaría declararlo si no, y eso no aporta
 * aislamiento real (el aislamiento viene de las fronteras de `domain/`).
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class SharedKernelModule {}
