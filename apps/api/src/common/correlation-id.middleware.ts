import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'

import { Injectable, type NestMiddleware } from '@nestjs/common'

import type { NextFunction, Request, Response } from 'express'

export const CORRELATION_ID_HEADER = 'x-correlation-id'

type RequestContext = { correlationId: string }

/**
 * Contexto de petición propagado sin pasarlo por parámetros.
 *
 * El `correlationId` es lo que convierte cuarenta logs sueltos en una historia legible:
 * viaja del borde a la API, de ahí al evento del outbox, al worker y al tercero
 * (skills/observability.md).
 */
const storage = new AsyncLocalStorage<RequestContext>()

export function getCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId
}

export function runWithCorrelationId<T>(correlationId: string, fn: () => T): T {
  return storage.run({ correlationId }, fn)
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header(CORRELATION_ID_HEADER)
    // Se acepta el del cliente para poder rastrear de punta a punta, pero se acota:
    // un valor arbitrario acabaría en los logs y podría inyectar contenido.
    const correlationId = isSafeCorrelationId(incoming) ? incoming : randomUUID()

    res.setHeader(CORRELATION_ID_HEADER, correlationId)
    runWithCorrelationId(correlationId, () => {
      next()
    })
  }
}

function isSafeCorrelationId(value: string | undefined): value is string {
  return value !== undefined && value.length <= 128 && /^[\w-]+$/.test(value)
}
