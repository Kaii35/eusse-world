import { AsyncLocalStorage } from 'node:async_hooks'

import { Injectable } from '@nestjs/common'

import { PrismaService } from './prisma.service'

import type { Prisma } from '@prisma/client'

/**
 * Transacción ambiental.
 *
 * El problema que resuelve: un caso de uso escribe en varios repositorios y todo debe
 * caer junto. La alternativa —pasar el cliente transaccional como parámetro de método en
 * método— obligaría a que los puertos del `domain/` conocieran a Prisma, y eso es
 * exactamente lo que las fronteras prohíben.
 *
 * Aquí la transacción viaja por contexto asíncrono: la unidad de trabajo la abre y todo
 * repositorio que corra dentro la encuentra sin que nadie se la pase.
 */
@Injectable()
export class TransactionContext {
  private readonly storage = new AsyncLocalStorage<PrismaTransaction>()

  run<T>(tx: PrismaTransaction, work: () => Promise<T>): Promise<T> {
    return this.storage.run(tx, work)
  }

  get current(): PrismaTransaction | undefined {
    return this.storage.getStore()
  }

  /**
   * El cliente que toca usar: el transaccional si estamos dentro de una transacción, el
   * normal si no.
   *
   * Todo repositorio debe leer y escribir a través de esto. Uno que use `prisma`
   * directamente se saldría de la transacción sin avisar, y el fallo sólo se vería el día
   * que algo falle a mitad.
   */
  client(prisma: PrismaService): PrismaTransaction {
    return this.current ?? prisma
  }
}

/**
 * El cliente que Prisma entrega dentro de `$transaction`.
 *
 * `PrismaService` lo satisface estructuralmente, así que el mismo repositorio sirve dentro
 * y fuera de una transacción sin ramas ni casts.
 */
export type PrismaTransaction = Prisma.TransactionClient
