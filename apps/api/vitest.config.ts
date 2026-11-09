import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    globals: false,
    // Los tests de integración comparten una sola base de datos. Identity limpia sus tablas
    // antes de cada caso: en paralelo, borraría los datos de otro archivo a mitad de prueba.
    fileParallelism: false,
  },
})
