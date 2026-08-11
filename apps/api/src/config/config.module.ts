import { Global, Logger, Module } from '@nestjs/common'

import { loadEnv, type Env } from './env.schema'

export const ENV = Symbol('ENV')

/**
 * Configuración global, validada una sola vez al arrancar.
 *
 * Si falta una variable obligatoria el proceso NO arranca: el error se lanza aquí, en el
 * arranque, con un mensaje que dice exactamente qué falta
 * (docs/03-conventions.md §15).
 */
@Global()
@Module({
  providers: [
    {
      provide: ENV,
      useFactory: (): Env => {
        const env = loadEnv()
        // Se registra el entorno, nunca los valores: un log con la cadena de conexión
        // es una fuga de credenciales.
        new Logger('Config').log(
          `Configuración cargada · entorno=${env.APP_ENV} · nivel=${env.LOG_LEVEL}`,
        )
        return env
      },
    },
  ],
  exports: [ENV],
})
export class ConfigModule {}
