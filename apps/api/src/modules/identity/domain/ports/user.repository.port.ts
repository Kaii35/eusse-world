import type { User } from '../user.entity'

/**
 * Repositorio de usuarios.
 *
 * Nótese que aquí **no** hay `accountId`: el usuario es previo a la cuenta y no pertenece
 * a ninguna. El ámbito obligatorio por cuenta (RFC-0003 §4.5) aplica a los recursos de
 * negocio, no a la identidad.
 */
export type UserRepositoryPort = {
  /** El email debe venir ya normalizado (`normalizeEmail`). */
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  /** Falla si el email ya existe: la unicidad la garantiza la base de datos, no un SELECT previo. */
  create(user: User): Promise<void>
  save(user: User): Promise<void>
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')
