import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common'

import { CorrelationIdMiddleware } from './common/correlation-id.middleware'
import { ConfigModule } from './config/config.module'
import { HealthModule } from './modules/health/health.module'
import { SharedKernelModule } from './shared-kernel/shared-kernel.module'

/**
 * Raíz de la aplicación.
 *
 * Los módulos de dominio se registran aquí y **sólo exponen su `public/`** al resto
 * (docs/07-module-dependencies.md §2). Añadir un módulo obliga a declarar sus
 * dependencias en ese documento: el grafo real se compara con el documentado en cada
 * revisión de arquitectura.
 */
@Module({
  imports: [ConfigModule, SharedKernelModule, HealthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // El correlationId se establece antes que nada: todo log de la petición lo lleva.
    consumer.apply(CorrelationIdMiddleware).forRoutes('*')
  }
}
