# 00 — Visión

**Dueño:** Product Owner · **Última revisión:** 2026-08-06 · **Estado:** Vigente

## Qué es Eusse World

Una plataforma B2B donde clientes empresariales (distribuidores, mayoristas, comercios,
instaladores) compran de forma autónoma, con **sus precios**, **sus condiciones** y **su
histórico**, sin depender de un vendedor por WhatsApp.

## El problema

La venta mayorista tradicional funciona por catálogo PDF, listas de precios en Excel y
pedidos por chat. Eso produce:

- Precios desactualizados y errores de cotización.
- Pedidos ambiguos que se corrigen por teléfono.
- Cero visibilidad para el cliente sobre su pedido, su crédito y su histórico.
- El equipo comercial haciendo captura de datos en vez de vender.

## La apuesta

Un canal digital que **no es un B2C con descuentos**. B2B tiene reglas propias:

| B2C                       | Eusse World (B2B)                                        |
| ------------------------- | -------------------------------------------------------- |
| Un precio para todos      | Lista de precios por cuenta, con escalas por volumen     |
| Compra el usuario         | Compra la **cuenta**; el usuario es un comprador con rol |
| Pago inmediato            | Pago inmediato **o** crédito con términos                |
| Carrito de 1–3 ítems      | Carrito de 40+ SKUs, recompra desde pedidos anteriores   |
| Catálogo público completo | Visibilidad y precio dependen de la cuenta autenticada   |
| Checkout de 1 paso        | Orden de compra, aprobador, dirección de despacho, NIT   |

Esta tabla es la razón de la mayoría de decisiones de arquitectura del proyecto.

## Público

| Actor                       | Qué necesita                                                               |
| --------------------------- | -------------------------------------------------------------------------- |
| **Visitante**               | Entender qué vende Eusse World y confiar en la empresa. Explorar catálogo. |
| **Comprador**               | Reordenar rápido, ver su precio real, saber cuándo llega su pedido.        |
| **Aprobador**               | Autorizar pedidos por encima de un monto antes de que se cursen.           |
| **Administrador de cuenta** | Gestionar quién compra dentro de su empresa y con qué límites.             |
| **Comercial (Eusse)**       | Ver cuentas, cotizar, destrabar pedidos, medir.                            |
| **Operaciones (Eusse)**     | Preparar, despachar y facturar sin retrabajos.                             |
| **Administrador (Eusse)**   | Gobernar catálogo, precios, cuentas y contenido.                           |

## Alcance de la Fase 1

**Dentro:** Landing · Catálogo con búsqueda y filtros · Ficha de producto ·
Autenticación · Carrito B2B · Checkout · Portal de cliente · Back-office administrativo ·
i18n (es/en) · Dark mode.

**Fuera (pero la arquitectura debe admitirlo sin reescritura):** CRM · Inventario
multi-bodega · Cursos/LMS · App móvil · Chat en vivo · Multi-tenant por marca.

**Fuera y explícitamente descartado por ahora:** Marketplace de terceros ·
Suscripciones recurrentes · Subastas.

## Principios de producto

1. **El precio correcto o ningún precio.** Antes que mostrar un precio equivocado a un
   cliente B2B, se muestra "inicia sesión para ver tu precio".
2. **La recompra es la función principal.** El 70% del valor está en repetir un pedido en
   menos de un minuto, no en descubrir productos.
3. **Explorar es libre, comprar requiere identidad.** El visitante ve y busca; al pulsar
   "Añadir al carrito" se autentica y **vuelve exactamente al producto que intentaba
   agregar**. Ver [RFC-0004](../rfcs/RFC-0004-guest-intent-auth-return.md).
4. **Nada bloquea al comercial.** Todo lo que el cliente puede hacer, el back-office lo
   puede hacer en su nombre y con trazabilidad.
5. **La landing vende confianza, no features.** Es la primera prueba de que la empresa es
   seria. Ver [12-ux-guidelines.md](12-ux-guidelines.md).

## Métricas de éxito de la Fase 1

| Métrica                                        | Objetivo            |
| ---------------------------------------------- | ------------------- |
| Pedidos digitales / pedidos totales            | > 40% a los 3 meses |
| Tiempo de recompra (login → pedido confirmado) | < 90 s              |
| Tasa de abandono en checkout                   | < 25%               |
| LCP en landing y catálogo (p75, móvil)         | < 2.5 s             |
| Errores de precio reportados                   | 0                   |
| Tickets "¿dónde está mi pedido?"               | −60%                |

## No-objetivos

- No competimos en velocidad de salida a producción sacrificando el modelo de dominio.
- No construimos un CMS genérico; el contenido de la landing es estructurado y acotado.
- No soportamos navegadores sin ES2022.

## Enlaces

- Arquitectura → [01-architecture.md](01-architecture.md)
- Dominio → [02-domain-model.md](02-domain-model.md)
- Roadmap → [05-roadmap.md](05-roadmap.md)
