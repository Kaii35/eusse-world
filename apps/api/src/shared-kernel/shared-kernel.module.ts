import { Global, Module } from '@nestjs/common'

import { PrismaService } from './infrastructure/prisma.service'
import { TransactionContext } from './infrastructure/transaction-context'

/**
 * Infraestructura compartida por todos los módulos.
 *
 * Es global a propósito: cada módulo necesitaría declararlo si no, y eso no aporta
 * aislamiento real (el aislamiento viene de las fronteras de `domain/`).
 */
@Global()
@Module({
  // `TransactionContext` DEBE ser una única instancia en todo el proceso: si cada módulo
  // registrara la suya, la transacción abierta por Identity sería invisible para Accounts
  // y el registro dejaría de ser atómico sin que nada fallara a la vista.
  providers: [PrismaService, TransactionContext],
  exports: [PrismaService, TransactionContext],
})
export class SharedKernelModule {}
