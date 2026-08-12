/**
 * Permisos, expuestos a otros módulos.
 *
 * Identity los necesita para componer `GET /me` y los guards de RFC-0003 §4.5. Se
 * reexportan desde `public/` porque son funciones puras: no hace falta un puerto con
 * inyección para consultar una tabla constante.
 */
export { PERMISSION, permissionsFor, roleHas, type Permission } from '../domain/permissions'
