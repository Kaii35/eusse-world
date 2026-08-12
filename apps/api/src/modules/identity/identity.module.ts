import { Module } from '@nestjs/common'

import { ENV } from '../../config/config.module'
import { AccountsModule } from '../accounts/accounts.module'

import { LoginUseCase } from './application/login.use-case'
import { LogoutUseCase } from './application/logout.use-case'
import { RefreshSessionUseCase } from './application/refresh-session.use-case'
import { RegisterUseCase } from './application/register.use-case'
import { RequestPasswordResetUseCase } from './application/request-password-reset.use-case'
import { ResetPasswordUseCase } from './application/reset-password.use-case'
import { SessionIssuer } from './application/session-issuer'
import { SwitchAccountUseCase } from './application/switch-account.use-case'
import { VerifyEmailUseCase } from './application/verify-email.use-case'
import { ACCESS_TOKEN } from './domain/ports/access-token.port'
import { CLOCK } from './domain/ports/clock.port'
import { EVENT_PUBLISHER } from './domain/ports/event-publisher.port'
import { ONE_TIME_TOKEN_REPOSITORY } from './domain/ports/one-time-token.repository.port'
import { PASSWORD_HASHER } from './domain/ports/password-hasher.port'
import { SESSION_REPOSITORY } from './domain/ports/session.repository.port'
import { TENANT_ID } from './domain/ports/tenant.port'
import { TOKEN_GENERATOR } from './domain/ports/token-generator.port'
import { UNIT_OF_WORK } from './domain/ports/unit-of-work.port'
import { USER_REPOSITORY } from './domain/ports/user.repository.port'
import { Argon2PasswordHasher } from './infrastructure/argon2-password-hasher'
import { CryptoTokenGenerator } from './infrastructure/crypto-token-generator'
import { JwtAccessToken } from './infrastructure/jwt-access-token'
import { OutboxEventPublisher } from './infrastructure/persistence/outbox-event-publisher'
import { PrismaOneTimeTokenRepository } from './infrastructure/persistence/prisma-one-time-token.repository'
import { PrismaSessionRepository } from './infrastructure/persistence/prisma-session.repository'
import { PrismaUnitOfWork } from './infrastructure/persistence/prisma-unit-of-work'
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository'
import { SystemClock } from './infrastructure/system-clock'

import type { Env } from '../../config/env.schema'

/**
 * Módulo Identity: cablea puertos con adaptadores.
 *
 * Éste es el único archivo del módulo donde `domain/` y Prisma aparecen juntos, y aun así
 * sólo por nombre: es lo que permite que los casos de uso se prueben sin base de datos.
 *
 * Aún **sin controladores**: los endpoints, guards, rate limiting y cookies son B6.
 */
@Module({
  imports: [AccountsModule],
  providers: [
    SessionIssuer,
    RegisterUseCase,
    VerifyEmailUseCase,
    LoginUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    SwitchAccountUseCase,

    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: SESSION_REPOSITORY, useClass: PrismaSessionRepository },
    { provide: ONE_TIME_TOKEN_REPOSITORY, useClass: PrismaOneTimeTokenRepository },
    { provide: UNIT_OF_WORK, useClass: PrismaUnitOfWork },
    { provide: EVENT_PUBLISHER, useClass: OutboxEventPublisher },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    { provide: TOKEN_GENERATOR, useClass: CryptoTokenGenerator },
    { provide: ACCESS_TOKEN, useClass: JwtAccessToken },
    { provide: CLOCK, useClass: SystemClock },
    { provide: TENANT_ID, inject: [ENV], useFactory: (env: Env): string => env.TENANT_ID },
  ],
  exports: [
    RegisterUseCase,
    VerifyEmailUseCase,
    LoginUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    SwitchAccountUseCase,
  ],
})
export class IdentityModule {}
