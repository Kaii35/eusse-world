export {
  ERROR_CODE,
  ERROR_STATUS,
  ERROR_TYPE_BASE_URL,
  errorCodeSchema,
  errorTypeUri,
  problemDetailsSchema,
} from './shared/errors'
export type { ErrorCode, ProblemDetails } from './shared/errors'

export {
  currencySchema,
  emailSchema,
  idempotencyKeySchema,
  isoDateTimeSchema,
  localeSchema,
  moneySchema,
  skuSchema,
  slugSchema,
  uuidSchema,
} from './shared/primitives'
export type { Locale, MoneyDto } from './shared/primitives'

export {
  cursorQuerySchema,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  paginatedSchema,
  parseSort,
  sortSchema,
} from './shared/pagination'
export type { CursorQuery, Paginated } from './shared/pagination'

export {
  DEPENDENCY_STATUS,
  dependencyHealthSchema,
  livenessResponseSchema,
  readinessResponseSchema,
} from './health/health.contract'
export type {
  DependencyHealth,
  DependencyStatus,
  LivenessResponse,
  ReadinessResponse,
} from './health/health.contract'

export {
  ACCOUNT_ROLE,
  ACCOUNT_STATUS,
  accountRoleSchema,
  accountStatusSchema,
  forgotPasswordRequest,
  loginRequest,
  meResponse,
  membershipSchema,
  passwordSchema,
  registerRequest,
  resetPasswordRequest,
  switchAccountRequest,
} from './auth/auth.contract'
export type {
  AccountRole,
  AccountStatus,
  LoginRequest,
  MeResponse,
  Membership,
  RegisterRequest,
  ResetPasswordRequest,
  SwitchAccountRequest,
} from './auth/auth.contract'
