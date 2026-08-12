/** Identificadores de cuenta y de membresía. UUID v7, como el resto del sistema. */
export type AccountIdGeneratorPort = {
  newId(): string
}

export const ACCOUNT_ID_GENERATOR = Symbol('ACCOUNT_ID_GENERATOR')
