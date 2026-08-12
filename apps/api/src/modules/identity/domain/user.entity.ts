import { DomainError } from '../../../shared-kernel/domain/domain-error'

/**
 * Agregado `User`: la persona que se autentica (RFC-0003 §4.1).
 *
 * Ojo con la distinción, porque de ella depende medio sistema: el `User` se autentica,
 * pero quien **compra** es la `Account`. Un mismo usuario puede operar en varias cuentas.
 *
 * Este archivo vive en `domain/`: cero NestJS, cero Prisma. Se testea sin base de datos.
 */

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  /** Bloqueado por el staff. Ya no puede autenticarse aunque su contraseña sea correcta. */
  SUSPENDED: 'SUSPENDED',
} as const

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

/**
 * Credenciales inválidas.
 *
 * **Idéntico** para email inexistente y para contraseña incorrecta (RFC-0003 §4.8). Si se
 * distinguieran, el formulario de login se convierte en un oráculo que confirma qué
 * emails están registrados.
 */
export class InvalidCredentialsError extends DomainError {
  override readonly name = 'InvalidCredentialsError'

  constructor() {
    super('AUTH_INVALID_CREDENTIALS', 'Email o contraseña incorrectos')
  }
}

export class EmailNotVerifiedError extends DomainError {
  override readonly name = 'EmailNotVerifiedError'

  constructor() {
    super(
      'AUTH_EMAIL_NOT_VERIFIED',
      'Debes verificar tu correo antes de entrar. Te reenviamos el enlace.',
    )
  }
}

export class UserSuspendedError extends DomainError {
  override readonly name = 'UserSuspendedError'

  constructor() {
    // No es `AUTH_INVALID_CREDENTIALS`: sólo se llega aquí tras acertar la contraseña, así
    // que no hay enumeración posible y decirlo claro le ahorra al usuario una llamada.
    super('AUTH_FORBIDDEN', 'Tu usuario está suspendido. Contacta con tu comercial.')
  }
}

/**
 * Normaliza el email antes de guardarlo o buscarlo.
 *
 * Debe usarse en TODA búsqueda por email: si el registro guarda `Ana@Empresa.com` y el
 * login busca `ana@empresa.com`, el usuario no puede entrar en su propia cuenta.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export type UserSnapshot = {
  readonly id: string
  readonly email: string
  readonly passwordHash: string
  readonly firstName: string
  readonly lastName: string
  readonly status: UserStatus
  readonly emailVerifiedAt: Date | null
  readonly lastLoginAt: Date | null
}

export class User {
  private constructor(
    readonly id: string,
    readonly email: string,
    private passwordHash: string,
    readonly firstName: string,
    readonly lastName: string,
    private status: UserStatus,
    private emailVerifiedAt: Date | null,
    private lastLoginAt: Date | null,
  ) {}

  static fromSnapshot(snapshot: UserSnapshot): User {
    return new User(
      snapshot.id,
      normalizeEmail(snapshot.email),
      snapshot.passwordHash,
      snapshot.firstName,
      snapshot.lastName,
      snapshot.status,
      snapshot.emailVerifiedAt,
      snapshot.lastLoginAt,
    )
  }

  /** Un usuario nuevo nace activo pero **sin verificar**: aún no puede iniciar sesión. */
  static register(params: {
    id: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
  }): User {
    return new User(
      params.id,
      normalizeEmail(params.email),
      params.passwordHash,
      params.firstName.trim(),
      params.lastName.trim(),
      USER_STATUS.ACTIVE,
      null,
      null,
    )
  }

  get currentStatus(): UserStatus {
    return this.status
  }

  get verifiedAt(): Date | null {
    return this.emailVerifiedAt
  }

  get lastLogin(): Date | null {
    return this.lastLoginAt
  }

  get credentialHash(): string {
    return this.passwordHash
  }

  get isEmailVerified(): boolean {
    return this.emailVerifiedAt !== null
  }

  /**
   * Comprueba que este usuario puede iniciar sesión.
   *
   * Se llama **después** de validar la contraseña, nunca antes: comprobarlo antes
   * revelaría el estado de un usuario a quien sólo conoce su email.
   */
  assertCanAuthenticate(): void {
    if (this.status === USER_STATUS.SUSPENDED) throw new UserSuspendedError()
    if (!this.isEmailVerified) throw new EmailNotVerifiedError()
  }

  /** Idempotente: verificar dos veces conserva la fecha original, no la reescribe. */
  verifyEmail(now: Date): void {
    this.emailVerifiedAt ??= now
  }

  recordLogin(now: Date): void {
    this.lastLoginAt = now
  }

  changePassword(newHash: string): void {
    // Quien llama debe además revocar las sesiones abiertas: cambiar la contraseña sin
    // cerrar sesiones deja dentro a quien la robó, que es justo de quien huyes.
    this.passwordHash = newHash
  }

  suspend(): void {
    this.status = USER_STATUS.SUSPENDED
  }

  toSnapshot(): UserSnapshot {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      firstName: this.firstName,
      lastName: this.lastName,
      status: this.status,
      emailVerifiedAt: this.emailVerifiedAt,
      lastLoginAt: this.lastLoginAt,
    }
  }
}
