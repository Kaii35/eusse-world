import { Global, Logger, Module } from '@nestjs/common'

import { loadEnv, type Env } from './env.schema'

export const ENV = Symbol('ENV')

@Global()
@Module({
  providers: [
    {
      provide: ENV,
      useFactory: (): Env => {
        const env = loadEnv()
        // Se registra el entorno, nunca los valores: un log con la cadena de conexión
        // es una fuga de credenciales.
        new Logger('Config').log(`Configuración cargada · entorno=${env.APP_ENV}`)
        return env
      },
    },
  ],
  exports: [ENV],
})
export class ConfigModule {}
