import 'reflect-metadata'

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'

import { AppModule } from './app.module'
import { DomainExceptionFilter } from './common/domain-exception.filter'
import { ENV } from './config/config.module'

import type { Env } from './config/env.schema'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const env = app.get<Env>(ENV)
  const logger = new Logger('Bootstrap')

  // Todas las rutas bajo /api/v1 (RFC-0012 §4.6). El versionado va en la URL:
  // explícito, fácil de enrutar y de depurar.
  app.setGlobalPrefix('api/v1')

  // Cabeceras de seguridad (skills/security.md). La CSP la aplica el frontend, que es
  // quien sirve HTML; aquí sólo se responde JSON.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }))

  // CORS restrictivo: lista explícita, sin comodines, con credenciales para las cookies
  // httpOnly de sesión (ADR-0008).
  app.enableCors({
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Idempotency-Key', 'X-Correlation-Id', 'Accept-Language'],
    exposedHeaders: ['X-Correlation-Id'],
  })

  // Sin ValidationPipe: arrastra class-validator y sería una SEGUNDA fuente de verdad
  // para la validación. Los contratos se validan con Zod en la frontera (ADR-0009).
  app.useGlobalFilters(new DomainExceptionFilter())

  // Apagado ordenado: se dejan de aceptar peticiones, se terminan las en curso y se
  // cierran las conexiones. Sin esto, cada despliegue corta peticiones a medias.
  app.enableShutdownHooks()

  await app.listen(env.API_PORT)

  logger.log(`API escuchando en http://localhost:${env.API_PORT}/api/v1 · entorno=${env.APP_ENV}`)
}

void bootstrap()
