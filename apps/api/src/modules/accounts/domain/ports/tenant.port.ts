import type { Money } from '@eusse/domain'

/**
 * Contexto del tenant, inyectado.
 *
 * Se inyecta en vez de leerlo de la configuración desde el dominio o la aplicación para no
 * atarlos al módulo de configuración, y porque en Fase 2 dejará de ser un valor fijo del
 * proceso.
 */
export type TenantPort = {
  readonly tenantId: string
  /** Moneda con la que nace el límite de crédito de una cuenta nueva. */
  readonly defaultCurrency: Money['currency']
}

export const TENANT = Symbol('TENANT')
