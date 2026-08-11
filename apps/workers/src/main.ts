import 'reflect-metadata'

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

/**
 * Los workers no exponen HTTP: son una aplicación standalone de Nest.
 *
 * Comparten el dominio y la configuración con `apps/api`, pero escalan por separado
 * (docs/09-scalability.md §1).
 */
async function bootstrap(): Promise<void> {
  // Sin `bufferLogs`: en un contexto standalone nadie vacía el búfer (no hay
  // `listen()` que lo haga) y los logs se pierden en silencio. Se descubrió porque el
  // proceso arrancaba sin imprimir absolutamente nada.
  const app = await NestFactory.createApplicationContext(AppModule)

  // Apagado ordenado: se terminan los jobs en curso y se cierran las conexiones.
  // Sin esto, cada despliegue corta trabajos a medias.
  app.enableShutdownHooks()
  await app.init()

  new Logger('Bootstrap').log('Workers en marcha · relay del outbox y consumidores activos')
}

void bootstrap()
