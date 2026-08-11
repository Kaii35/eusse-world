import { defineConfig, devices } from '@playwright/test'

// Puerto DEDICADO a E2E, no el de desarrollo: `reuseExistingServer` reutiliza
// cualquier servidor que escuche ahí, incluida una app ajena. Con el 3000 los tests
// llegaron a ejecutarse contra otro proyecto y fallaban sin explicación.
const WEB_PORT = process.env.E2E_WEB_PORT ?? '3100'
const WEB_URL = process.env.E2E_WEB_URL ?? `http://localhost:${WEB_PORT}`

/**
 * Configuración de E2E (ADR-0015).
 *
 * Los recorridos críticos son PUERTA DE DESPLIEGUE: si uno falla, no se despliega
 * (skills/testing.md).
 */
export default defineConfig({
  testDir: './specs',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  // Un `.only` olvidado dejaría pasar el resto de la suite en silencio.
  forbidOnly: Boolean(process.env.CI),
  // Sin reintentos en local: un test inestable se arregla o se borra, no se disimula.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: WEB_URL,
    // Sin esperas fijas en ninguna parte: siempre por condición.
    actionTimeout: 10_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  // E2E_NO_SERVER para apuntar a un entorno ya desplegado (preview, staging).
  ...(process.env.E2E_NO_SERVER
    ? {}
    : {
        webServer: {
          command: `pnpm --filter @eusse/web exec next start --port ${WEB_PORT}`,
          url: WEB_URL,
          // Sólo se reutiliza en local, y en un puerto DEDICADO: reutilizar el 3000
          // hizo que los tests corrieran contra otra app y fallaran sin explicación.
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
})
