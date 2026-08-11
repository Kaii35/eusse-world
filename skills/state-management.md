# Skill — Gestión de estado

## Objetivo

Que cada dato tenga **un solo dueño**. La mayoría de los bugs de estado en frontend nacen
de tener el mismo dato en dos sitios.

## La regla

| Tipo de estado                                          | Dueño           | Ejemplos                                    |
| ------------------------------------------------------- | --------------- | ------------------------------------------- |
| **Servidor** — remoto, cacheable, puede quedar obsoleto | TanStack Query  | catálogo, carrito, órdenes, precios, cuenta |
| **URL** — compartible, navegable                        | _search params_ | filtros, búsqueda, página, pestaña activa   |
| **Cliente global** — sólo UI, efímero                   | Zustand         | tema, drawer abierto, sidebar colapsada     |
| **Formulario**                                          | React Hook Form | cualquier entrada de datos                  |
| **Local**                                               | `useState`      | acordeón abierto, hover, foco               |

**Si vino de la API, lo posee TanStack Query. Punto.**

## Buenas prácticas

- **`staleTime` explícito por tipo de dato.** El valor por defecto casi nunca es correcto.
- **Claves de consulta jerárquicas y en un solo lugar**: `cartKeys.detail(accountId)`.
- **Invalidación por prefijo** tras una mutación, no refetch manual.
- **Optimistic updates con reversión.** Si el servidor rechaza, se restaura y se avisa.
- **Zustand con slices pequeños y selectores**, para no re-renderizar de más.
- **Filtros en la URL**, no en estado de React.
- **Errores manejados en el nivel correcto**: global (sesión expirada) vs. local (validación).

## Errores comunes

| Error                                   | Consecuencia                                |
| --------------------------------------- | ------------------------------------------- |
| Copiar la respuesta de la API a Zustand | Dos fuentes de verdad; una queda obsoleta   |
| `useEffect` para sincronizar estado     | Cascadas de renders y bugs de temporización |
| Un store global gigante                 | Todo re-renderiza con cualquier cambio      |
| `staleTime: 0` en todo                  | Peticiones constantes; la app parece lenta  |
| Optimistic update sin reversión         | La UI miente cuando el servidor falla       |
| Filtros sólo en `useState`              | Enlace no compartible; botón atrás roto     |
| `refetch()` manual tras cada mutación   | Se olvida uno y la UI queda desincronizada  |
| Estado de servidor en Context           | Se pierde caché, deduplicación y reintentos |

## Patrones

**Claves centralizadas**

```
export const cartKeys = {
  all: ['cart'] as const,
  detail: (accountId: string) => [...cartKeys.all, 'detail', accountId] as const,
}
// invalidar todo lo del carrito: queryClient.invalidateQueries({ queryKey: cartKeys.all })
```

**Optimistic update con reversión**

```
useMutation({
  mutationFn: sdk.cart.updateQuantity,
  onMutate: async (vars) => {
    await qc.cancelQueries({ queryKey: cartKeys.all })
    const previous = qc.getQueryData(cartKeys.detail(accountId))
    qc.setQueryData(cartKeys.detail(accountId), optimistic(previous, vars))
    return { previous }
  },
  onError: (_e, _v, ctx) => {
    qc.setQueryData(cartKeys.detail(accountId), ctx.previous)   // reversión
    toast.error(t('cart.updateFailed'))
  },
  onSettled: () => qc.invalidateQueries({ queryKey: cartKeys.all }),
})
```

**Zustand sólo para UI**

```
export const useUiStore = create<UiState>((set) => ({
  isCartOpen: false,
  openCart:  () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
}))
// El contenido del carrito NO está aquí. Está en TanStack Query.
```

**staleTime por tipo de dato**

| Dato                 | `staleTime` | Motivo                                    |
| -------------------- | ----------- | ----------------------------------------- |
| Categorías           | 1 h         | Cambian rara vez                          |
| Listado de productos | 5 min       | Cambia con publicaciones                  |
| Precio de cuenta     | 1 min       | Debe ser fresco                           |
| Carrito              | 0           | Siempre fresco: es el estado de la compra |
| Órdenes              | 30 s        | Casi estático tras confirmar              |

## Antipatrones

- **Redux para todo** en un proyecto que no lo necesita.
- **Prop drilling** de estado global.
- **`useEffect` que copia props a estado**: la fuente de verdad se duplica.
- **Store global de "todo el estado de la app"**.
- **Estado derivado almacenado**: si se puede calcular, se calcula; no se guarda.

## Ejemplos

**Bien**

```
function CartDrawer() {
  const { data: cart, isLoading } = useCart()          // servidor
  const isOpen = useUiStore((s) => s.isCartOpen)       // UI, con selector
  ...
}
```

**Mal**

```
const useCartStore = create((set) => ({
  items: [],
  fetchCart: async () => set({ items: await api.getCart() }),  // ← servidor en Zustand
  addItem: (item) => set((s) => ({ items: [...s.items, item] })), // ← ¿y el servidor?
}))
```

## Convenciones

- Hooks de datos: `use-<recurso>.ts`, envolviendo `@eusse/sdk`.
- Claves: `<recurso>Keys` exportadas desde el hook.
- Stores: `features/<x>/stores/<nombre>.store.ts`.
- Siempre con selector: `useUiStore((s) => s.campo)`.
- Un store por preocupación, no uno global.

## Checklist

- [ ] Cada dato tiene un solo dueño
- [ ] Nada del servidor duplicado en Zustand
- [ ] `staleTime` explícito y justificado
- [ ] Claves jerárquicas y centralizadas
- [ ] Invalidación tras mutación, no refetch manual
- [ ] Optimistic updates con reversión y aviso
- [ ] Filtros y búsqueda en la URL
- [ ] Selectores en Zustand
- [ ] Sin `useEffect` para obtener o sincronizar datos
- [ ] Estado derivado calculado, no almacenado
- [ ] Errores manejados en el nivel correcto

## Plantillas

[`skills/frontend-nextjs.md`](frontend-nextjs.md) ·
[`skills/forms-validation.md`](forms-validation.md)
