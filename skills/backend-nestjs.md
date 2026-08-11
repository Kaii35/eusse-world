# Skill — Backend con NestJS

## Objetivo

Implementar módulos de dominio que se puedan entender, testear y extraer, sin que el
framework se filtre a las reglas de negocio.

## Buenas prácticas

- **Estructura fija por módulo**: `public/ domain/ application/ infrastructure/ interface/`.
  Siempre la misma. Un desarrollador nuevo sabe dónde mirar sin preguntar.
- **Un caso de uso, una clase, un método `execute`.** Sin servicios de 900 líneas.
- **El controller no piensa**: valida con Zod, delega en el caso de uso, mapea la respuesta.
- **Inyecta puertos, no implementaciones.** El caso de uso recibe `PricingPort`, no
  `PrismaPricingRepository`.
- **Transacciones en la capa de aplicación**, no en el dominio ni en el controller.
- **Errores de dominio → HTTP** en un filtro global, con mapeo declarativo. No en cada
  controller.
- **Configuración validada con Zod al arrancar.** Si falta una variable, el proceso no
  arranca.
- **`correlationId`** propagado desde el borde por interceptor, presente en todo log.
- **CRUD sin invariantes no necesita ceremonia.** Un caso de uso que sólo lee y mapea puede
  ir de `application` a Prisma directamente. La arquitectura completa es para donde hay
  reglas.

## Errores comunes

| Error                                       | Consecuencia                                      |
| ------------------------------------------- | ------------------------------------------------- |
| Lógica de negocio en el controller          | Imposible de reutilizar, difícil de testear       |
| Prisma inyectado en el caso de uso          | Dominio acoplado al ORM; tests lentos             |
| `Service` genérico que hace de todo         | Nadie sabe qué hace; crece sin límite             |
| Importar `domain/` de otro módulo           | Se rompe la frontera; extraer se vuelve imposible |
| Publicar un evento fuera de la transacción  | Evento sin cambio, o cambio sin evento            |
| `try/catch` que traga errores               | Fallos silenciosos en producción                  |
| Consultar en bucle                          | N+1; el endpoint muere con datos reales           |
| DTOs escritos a mano además del esquema Zod | Dos fuentes de verdad que divergen                |

## Patrones

**Caso de uso**

```
class AddItemToCartUseCase {
  constructor(
    private readonly carts: CartRepositoryPort,
    private readonly pricing: PricingPort,
    private readonly catalog: CatalogPort,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(cmd: AddItemToCartCommand): Promise<Result<CartDto, DomainError>> {
    return this.uow.run(async () => { /* cargar, decidir en el dominio, guardar, emitir */ })
  }
}
```

**Result en vez de excepciones para errores esperados** — un SKU sin precio no es
excepcional, es un caso de negocio. Se devuelve `Result`. Las excepciones se reservan para
lo imprevisto.

**Unit of Work** — la transacción y la escritura al outbox se coordinan en un solo sitio.

**Facade de módulo** — `PricingFacade` expone lo mínimo que otros módulos necesitan, con
DTOs planos.

**Filtro global de errores** — `DomainError` → _problem+json_ con `code`, mapeo declarativo
en una tabla.

**Guard + decorador de permisos** — `@RequirePermission('order:create')`, evaluado sobre el
recurso concreto.

## Antipatrones

- **Anemic service layer**: casos de uso que sólo llaman al repositorio.
- **Fat controller**: validación, negocio y presentación en el mismo método.
- **Prisma en todas partes**: cada capa consulta la base de datos a su antojo.
- **Módulo `common` que crece sin límite**: acaba siendo el nuevo monolito.
- **Excepciones para control de flujo normal**: caro y opaco.
- **Barrels internos** (`index.ts` de re-export): ocultan dependencias, rompen tree-shaking.

## Ejemplos

**Bien — controller delgado**

```
@Post('items')
async addItem(@Body() body: unknown, @Session() session: SessionData) {
  const cmd = addItemToCartSchema.parse(body)            // contrato compartido
  const result = await this.addItem.execute({ ...cmd, accountId: session.accountId })
  return result.match({ ok: (c) => toCartResponse(c), err: (e) => { throw e } })
}
```

`accountId` sale de la sesión, nunca del cuerpo. Ese detalle previene toda una clase de
IDOR.

**Mal**

```
@Post('items')
async addItem(@Body() body: any) {
  const variant = await this.prisma.variant.findUnique({ where: { id: body.variantId } })
  if (body.quantity < variant.minOrderQty) throw new BadRequestException('bad qty')
  const price = await this.prisma.priceEntry.findFirst({ where: { accountId: body.accountId } })
  // ← `any`, Prisma en el controller, negocio en el controller, accountId del cliente
}
```

## Convenciones

- `<module>/domain/entities/order.entity.ts`
- `<module>/application/commands/place-order.use-case.ts`
- `<module>/application/queries/list-orders.query.ts`
- `<module>/infrastructure/persistence/prisma-order.repository.ts`
- `<module>/interface/http/orders.controller.ts`
- `<module>/public/orders.facade.ts`
- Un `*.module.ts` por módulo, que declara qué exporta (sólo el facade).
- Nombres: comandos en imperativo (`PlaceOrder`), consultas con `List`/`Get`/`Search`.

## Checklist

- [ ] `domain/` sin imports de framework
- [ ] Prisma sólo en `infrastructure/persistence/`
- [ ] Sólo el `public/` de otros módulos importado
- [ ] Un caso de uso por operación de negocio
- [ ] Entrada validada con el esquema de `@eusse/contracts`
- [ ] `accountId` desde la sesión, nunca del cliente
- [ ] Autorización sobre el recurso concreto
- [ ] Transacción en la capa de aplicación
- [ ] Eventos por outbox, dentro de la transacción
- [ ] Errores de dominio con código estable
- [ ] Sin N+1: consultas en lote
- [ ] Logs con `correlationId`, sin datos personales
- [ ] Cobertura: dominio ≥ 90%, aplicación ≥ 80%

## Plantillas

[`templates/module.md`](../templates/module.md) ·
[`templates/use-case.md`](../templates/use-case.md) ·
[`templates/api-contract.md`](../templates/api-contract.md)
