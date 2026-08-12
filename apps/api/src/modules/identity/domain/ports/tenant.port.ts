/**
 * Identificador del tenant, inyectado.
 *
 * Va como claim `ten` en el access token. Se inyecta en vez de leerse de la configuración
 * desde el caso de uso para no atar la capa de aplicación al módulo de configuración, y
 * porque en Fase 2 dejará de ser un valor fijo del proceso.
 */
export const TENANT_ID = Symbol('TENANT_ID')
