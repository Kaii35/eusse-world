import { loginRequest, registerRequest, verifyEmailRequest } from '@eusse/contracts'
import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UseGuards } from '@nestjs/common'

import { AuthGuard, userIdOf, type AuthedRequest } from '../../../../common/auth.guard'
import { parseBody } from '../../../../common/parse-body'
import {
  clearSessionCookies,
  readCookie,
  sessionCookieNames,
  setSessionCookies,
} from '../../../../common/session-cookies'
import { ENV } from '../../../../config/config.module'
import { DomainError } from '../../../../shared-kernel/domain/domain-error'
import { ACCOUNTS_PORT, type AccountsPort } from '../../../accounts/public/accounts.port'
import { LoginUseCase } from '../../application/login.use-case'
import { LogoutUseCase } from '../../application/logout.use-case'
import { RefreshSessionUseCase } from '../../application/refresh-session.use-case'
import { RegisterUseCase } from '../../application/register.use-case'
import { VerifyEmailUseCase } from '../../application/verify-email.use-case'

import type { Env } from '../../../../config/env.schema'
import type { Request, Response } from 'express'

/**
 * Endpoints de sesión (RFC-0003, ADR-0008). Es la puerta por la que el usuario obtiene las
 * cookies que luego usa el resto de la API.
 *
 * Límite conocido: no hay limitación de intentos todavía (`RATE_LIMIT_LOGIN_PER_MIN` está
 * definido pero sin implementar). Debe resolverse antes de exponer esto a internet.
 */
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(RegisterUseCase) private readonly register: RegisterUseCase,
    @Inject(VerifyEmailUseCase) private readonly verifyEmail: VerifyEmailUseCase,
    @Inject(LoginUseCase) private readonly login: LoginUseCase,
    @Inject(RefreshSessionUseCase) private readonly refresh: RefreshSessionUseCase,
    @Inject(LogoutUseCase) private readonly logout: LogoutUseCase,
    @Inject(ACCOUNTS_PORT) private readonly accounts: AccountsPort,
  ) {}

  /** Siempre la misma respuesta, exista o no el correo: no revela cuentas registradas. */
  @Post('register')
  @HttpCode(202)
  async registerRoute(@Body() body: unknown): Promise<{ status: 'VERIFICATION_SENT' }> {
    await this.register.execute(parseBody(registerRequest, body))
    return { status: 'VERIFICATION_SENT' }
  }

  @Post('verify-email')
  @HttpCode(200)
  async verifyEmailRoute(@Body() body: unknown): Promise<{ status: 'VERIFIED' }> {
    const { token } = parseBody(verifyEmailRequest, body)
    await this.verifyEmail.execute(token)
    return { status: 'VERIFIED' }
  }

  @Post('login')
  @HttpCode(200)
  async loginRoute(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body: unknown,
  ) {
    const input = parseBody(loginRequest, body)
    const result = await this.login.execute({
      ...input,
      ip: request.ip ?? null,
      userAgent: request.get('user-agent') ?? null,
    })
    setSessionCookies(response, this.env, result.session)
    return {
      userId: result.userId,
      activeAccountId: result.activeAccountId,
      memberships: result.memberships,
    }
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshRoute(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = readCookie(request.headers.cookie, sessionCookieNames(this.env).refresh)
    if (!token) throw new DomainError('AUTH_SESSION_EXPIRED', 'Inicia sesión para continuar')

    const result = await this.refresh.execute(token)
    setSessionCookies(response, this.env, result)
    return { activeAccountId: result.activeAccountId }
  }

  @Post('logout')
  @HttpCode(204)
  async logoutRoute(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = readCookie(request.headers.cookie, sessionCookieNames(this.env).refresh)
    await this.logout.execute(token)
    clearSessionCookies(response, this.env)
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() request: AuthedRequest) {
    const userId = userIdOf(request)
    const memberships = await this.accounts.membershipsOf(userId)
    return { userId, activeAccountId: request.auth?.accountId ?? null, memberships }
  }
}
