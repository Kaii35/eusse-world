# Checklist — Frontend

Para cualquier trabajo en `apps/web` o `apps/admin`.

---

## Arquitectura

- [ ] **Server Component** salvo necesidad demostrada
- [ ] `"use client"` lo más abajo posible en el árbol
- [ ] Estrategia de renderizado correcta para la ruta
      ([`docs/01-architecture.md`](../docs/01-architecture.md) §4.5)
- [ ] **Sin lógica de negocio en el frontend**
- [ ] **Ningún precio, total ni impuesto calculado en el cliente**
- [ ] Sin `fetch` directo a la API: siempre `@eusse/sdk`
- [ ] Route Handlers sólo para sesión y webhooks
- [ ] Un feature no importa de otro feature

## Estado

- [ ] Datos del servidor en TanStack Query, **nunca copiados a Zustand**
- [ ] `staleTime` explícito y justificado por tipo de dato
- [ ] Claves de consulta jerárquicas y centralizadas
- [ ] Invalidación tras mutación, no refetch manual
- [ ] Optimistic updates **con reversión** y aviso de error
- [ ] Filtros, búsqueda y paginación **en la URL**
- [ ] Sin `useEffect` para obtener o sincronizar datos
- [ ] Estado derivado calculado, no almacenado

## Estados de la interfaz

- [ ] **Loading**: skeleton con la forma y dimensiones del contenido real
- [ ] **Empty**: explica por qué y ofrece la acción siguiente
- [ ] **Error**: qué pasó, si es recuperable, botón de reintentar
- [ ] **Partial**: datos incompletos señalados sin bloquear el resto
- [ ] **Success**: contenido con jerarquía clara
- [ ] `loading.tsx` y `error.tsx` en los segmentos que cargan datos

## Errores

- [ ] Mapeados por `code`, **nunca por texto**
- [ ] `meta` usado para construir el mensaje
- [ ] Errores de servidor asignados al campo correcto en formularios
- [ ] Sesión expirada manejada globalmente

## Formularios

- [ ] El mismo esquema Zod que el backend
- [ ] Validación en `blur`, revalidación en `change` tras el primer error
- [ ] Botón deshabilitado durante el envío, con estado de carga
- [ ] **Los datos no se pierden** ante error, navegación o expiración
- [ ] `Idempotency-Key` generada al montar, no al pulsar

## Diseño

- [ ] **Cero valores mágicos**: todo de `@eusse/tokens`
- [ ] Claro y oscuro verificados
- [ ] Sin componente nuevo que duplique uno de `@eusse/ui`
- [ ] Variantes con CVA
- [ ] Números tabulares en precios y cantidades
- [ ] Sin glassmorphism ni animaciones de entrada en `apps/admin`

## Accesibilidad

- [ ] Navegación por teclado completa, foco visible
- [ ] Contraste AA en ambos temas
- [ ] `<label>` real en todo campo
- [ ] `prefers-reduced-motion` respetado
- [ ] axe sin violaciones críticas ni serias

## i18n

- [ ] **Cero literales de texto en el código**
- [ ] Claves en `es` **y** `en`
- [ ] Plurales con ICU
- [ ] Fechas, números y monedas con `Intl`
- [ ] Probado con textos largos

## Rendimiento

- [ ] Presupuesto de bundle de la ruta respetado
- [ ] Imágenes con `next/image`, dimensiones y `alt`
- [ ] Sin salto de layout (CLS < 0.1)
- [ ] Motion diferido fuera de la ruta crítica
- [ ] Sólo `transform` y `opacity` animados
- [ ] **Datos privados sin caché compartida**

## Seguridad

- [ ] Rutas protegidas verificadas en `middleware` **y** en la API
- [ ] Sin tokens en `localStorage`
- [ ] Sin secretos con prefijo `NEXT_PUBLIC_`
- [ ] Redirecciones validadas

## Verificación

- [ ] Probado en 375, 768, 1280 y 1920 px
- [ ] Probado en claro y oscuro
- [ ] Probado en ambos idiomas
- [ ] E2E del recorrido afectado en verde
