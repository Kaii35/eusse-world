/**
 * Unidad de trabajo: varias escrituras, una sola transacción.
 *
 * El registro crea usuario, cuenta, membresía y evento de outbox. Sin transacción, un
 * fallo a mitad deja a una persona registrada sin empresa —o con empresa y sin correo de
 * verificación— y ninguno de los dos casos se arregla solo.
 *
 * El adaptador propaga la transacción a los repositorios por contexto asíncrono, para que
 * el caso de uso no tenga que ir pasándola de método en método.
 */
export type UnitOfWorkPort = {
  run<T>(work: () => Promise<T>): Promise<T>
}

export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK')
