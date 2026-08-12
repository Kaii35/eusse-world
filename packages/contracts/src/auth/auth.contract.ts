import { z } from 'zod'

import { emailSchema, isoDateTimeSchema, uuidSchema } from '../shared/primitives'

/**
 * Contratos de identidad y acceso (RFC-0003).
 *
 * Ningún token viaja en el cuerpo: la sesión va en cookies httpOnly emitidas por la API
 * (ADR-0008). Estos contratos describen lo que el cliente envía y el perfil que recibe,
 * nunca credenciales de vuelta.
 */

/** Roles dentro de una cuenta (docs/02-domain-model.md §4.4). */
export const ACCOUNT_ROLE = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  BUYER: 'BUYER',
  APPROVER: 'APPROVER',
  VIEWER: 'VIEWER',
} as const

export type AccountRole = (typeof ACCOUNT_ROLE)[keyof typeof ACCOUNT_ROLE]
export const accountRoleSchema = z.enum([
  ACCOUNT_ROLE.OWNER,
  ACCOUNT_ROLE.ADMIN,
  ACCOUNT_ROLE.BUYER,
  ACCOUNT_ROLE.APPROVER,
  ACCOUNT_ROLE.VIEWER,
])

export const ACCOUNT_STATUS = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED',
} as const

export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS]
export const accountStatusSchema = z.nativeEnum(ACCOUNT_STATUS)

/**
 * Contraseña.
 *
 * Longitud mínima de 12 y sin tope bajo: la longitud protege más que la complejidad
 * obligatoria, que sólo produce `Password1!` (skills/auth.md).
 */
export const passwordSchema = z
  .string()
  .min(12, 'La contraseña debe tener al menos 12 caracteres')
  .max(200, 'La contraseña es demasiado larga')

export const loginRequest = z.object({
  email: emailSchema,
  password: z.string().min(1),
})

export const registerRequest = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  /** Datos de la empresa: en B2B se registra una cuenta, no sólo una persona. */
  company: z.object({
    legalName: z.string().trim().min(1).max(200),
    taxId: z.string().trim().min(5).max(32),
    phone: z.string().trim().min(6).max(32),
  }),
})

export const forgotPasswordRequest = z.object({ email: emailSchema })

export const resetPasswordRequest = z.object({
  token: z.string().min(32),
  password: passwordSchema,
})

export const switchAccountRequest = z.object({ accountId: uuidSchema })

/** Membresía tal y como la ve el cliente. */
export const membershipSchema = z.object({
  accountId: uuidSchema,
  accountName: z.string(),
  accountStatus: accountStatusSchema,
  role: accountRoleSchema,
  /** Monto por encima del cual el pedido requiere aprobación. `null` = sin límite. */
  approvalThreshold: z.number().int().nonnegative().nullable(),
})

/**
 * Respuesta de `GET /me`.
 *
 * Incluye los permisos EFECTIVOS de la cuenta activa. No viajan en el token: se evalúan
 * en servidor para que revocar un permiso tenga efecto inmediato (ADR-0008).
 */
export const meResponse = z.object({
  user: z.object({
    id: uuidSchema,
    email: emailSchema,
    firstName: z.string(),
    lastName: z.string(),
    emailVerifiedAt: isoDateTimeSchema.nullable(),
  }),
  activeAccountId: uuidSchema.nullable(),
  memberships: z.array(membershipSchema),
  permissions: z.array(z.string()),
})

export type LoginRequest = z.infer<typeof loginRequest>
export type RegisterRequest = z.infer<typeof registerRequest>
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequest>
export type SwitchAccountRequest = z.infer<typeof switchAccountRequest>
export type Membership = z.infer<typeof membershipSchema>
export type MeResponse = z.infer<typeof meResponse>
