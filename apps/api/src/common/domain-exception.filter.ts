import { ERROR_STATUS, errorTypeUri, type ErrorCode, type ProblemDetails } from '@eusse/contracts'
import {
  Catch,
  HttpException,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common'
import { ZodError } from 'zod'

import { DomainError, isDomainError } from '../shared-kernel/domain/domain-error'

import { getCorrelationId } from './correlation-id.middleware'

import type { Request, Response } from 'express'

/**
 * Traduce cualquier excepción a la respuesta uniforme *problem+json* (RFC-0012 §4.4).
 *
 * El mapeo código → HTTP es declarativo y vive en `@eusse/contracts`, no repartido por
 * los controllers.
 *
 * REGLA DE SEGURIDAD: la respuesta nunca revela stack traces, versiones de software ni
 * la existencia de recursos ajenos (skills/security.md).
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const correlationId = getCorrelationId() ?? 'unknown'

    const problem = this.toProblemDetails(exception, request.url, correlationId)

    if (problem.status >= 500) {
      // Sólo los fallos inesperados son `error`. Un CART_QTY_BELOW_MINIMUM es
      // comportamiento correcto del sistema: registrarlo como error genera ruido
      // que acaba ocultando los fallos reales.
      this.logger.error({
        event: 'http.unhandled_error',
        correlationId,
        code: problem.code,
        path: request.url,
        method: request.method,
        error: exception instanceof Error ? exception.message : String(exception),
        stack: exception instanceof Error ? exception.stack : undefined,
      })
    } else {
      this.logger.log({
        event: 'http.domain_error',
        correlationId,
        code: problem.code,
        status: problem.status,
        path: request.url,
      })
    }

    response.status(problem.status).type('application/problem+json').json(problem)
  }

  private toProblemDetails(
    exception: unknown,
    instance: string,
    correlationId: string,
  ): ProblemDetails {
    if (isDomainError(exception)) {
      return this.build(exception.code, exception.message, instance, correlationId, exception.meta)
    }

    if (exception instanceof ZodError) {
      return this.build(
        'COMMON_VALIDATION_FAILED',
        'Los datos enviados no son válidos',
        instance,
        correlationId,
        {
          issues: exception.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
      )
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const code: ErrorCode = status === 404 ? 'COMMON_NOT_FOUND' : 'COMMON_INTERNAL_ERROR'
      return {
        ...this.build(code, exception.message, instance, correlationId),
        status,
      }
    }

    // Fallo imprevisto: se registra completo arriba, pero al cliente sólo le llega un
    // mensaje genérico y el correlationId con el que soporte puede rastrearlo.
    return this.build(
      'COMMON_INTERNAL_ERROR',
      'Ha ocurrido un error inesperado',
      instance,
      correlationId,
    )
  }

  private build(
    code: ErrorCode,
    detail: string,
    instance: string,
    correlationId: string,
    meta?: Readonly<Record<string, unknown>>,
  ): ProblemDetails {
    return {
      type: errorTypeUri(code),
      title: TITLES[code] ?? 'Error',
      status: ERROR_STATUS[code],
      code,
      detail,
      instance,
      correlationId,
      ...(meta ? { meta: { ...meta } } : {}),
    }
  }
}

/**
 * Títulos breves por código. Son la versión corta y estable del error.
 * El texto localizado lo compone el frontend con `t(\`errors.${code}\`, meta)`.
 */
const TITLES: Partial<Record<ErrorCode, string>> = {
  AUTH_INVALID_CREDENTIALS: 'Credenciales no válidas',
  AUTH_SESSION_EXPIRED: 'Sesión expirada',
  AUTH_FORBIDDEN: 'Sin permiso',
  ACCOUNT_NOT_ACTIVE: 'Cuenta no activa',
  ACCOUNT_CREDIT_EXCEEDED: 'Crédito insuficiente',
  CATALOG_VARIANT_NOT_FOUND: 'Producto no encontrado',
  CATALOG_VARIANT_NOT_VISIBLE: 'Producto no disponible para tu cuenta',
  PRICING_NO_PRICE_FOR_ACCOUNT: 'Sin precio para tu cuenta',
  PRICING_PRICE_CHANGED: 'El precio ha cambiado',
  CART_QTY_BELOW_MINIMUM: 'Cantidad por debajo del mínimo',
  CART_QTY_NOT_MULTIPLE: 'Cantidad no válida',
  CART_EMPTY: 'Carrito vacío',
  ORDER_INVALID_TRANSITION: 'Transición no permitida',
  COMMON_VALIDATION_FAILED: 'Datos no válidos',
  COMMON_IDEMPOTENCY_CONFLICT: 'Conflicto de idempotencia',
  COMMON_NOT_FOUND: 'No encontrado',
  COMMON_INTERNAL_ERROR: 'Error interno',
}

export { DomainError }
