/**
 * El reloj, como puerto.
 *
 * Todo lo de este módulo caduca: access token, refresh token, enlaces de recuperación.
 * Un test que dependa de `new Date()` real no puede comprobar un borde de expiración sin
 * dormir o sin falsear el reloj global.
 */
export type ClockPort = {
  now(): Date
}

export const CLOCK = Symbol('CLOCK')
