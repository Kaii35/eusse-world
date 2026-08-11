# @eusse/utils

Helpers puros, sin dependencias. Es la hoja del grafo junto a `@eusse/tokens`.

## Cuándo usarlo

`Result` para errores esperados · `invariant` y `assertNever` para condiciones que, de
fallar, indican un bug · `Brand` para IDs tipados · `roundHalfUp` para dinero.

## Cuándo NO usarlo

- **No para reglas de negocio.** Esas van en el dominio, con su error tipado y su código
  del catálogo.
- **No metas aquí nada que dependa de React, NestJS o Prisma.** Este paquete no tiene
  dependencias de runtime y debe seguir así.

## Result vs. excepciones

Un SKU sin precio para una cuenta **no es excepcional**: es un caso de negocio previsto.
Se devuelve `Result`. Las excepciones se reservan para lo imprevisto.
