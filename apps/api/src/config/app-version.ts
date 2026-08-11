/**
 * Versión de la aplicación.
 *
 * Se inyecta en el build a partir del SHA del commit (ADR-0020: las imágenes se etiquetan
 * con el SHA, nunca con `latest`). En local queda `dev`.
 */
export const APP_VERSION = process.env.APP_VERSION ?? 'dev'
