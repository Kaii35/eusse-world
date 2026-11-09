# EUSSE WORLD — React + TypeScript

Dos módulos listos para copiar a `src/`:

```
landing/      Landing page (globo 3D, parallax, animaciones de scroll)
plataforma/   Plataforma mayorista (comerciantes + panel de proveedor)
```

## Instalación
```bash
npm install three
npm install -D @types/three
```
Requiere React 18+. Funciona con Vite, Create React App y Next.js (App Router: ambos archivos incluyen `'use client'`).

## Uso
```tsx
import EusseWorldLanding from './eusse-world/landing/EusseWorldLanding';
import PlataformaMayorista from './eusse-world/plataforma/PlataformaMayorista';

// Ejemplo con react-router
<Route path="/" element={<EusseWorldLanding />} />
<Route path="/tienda" element={<PlataformaMayorista minimumPerProvider={6} productDetailVariant="A" ordersVariant="A" />} />
```

## Landing (`landing/`)
- `EusseWorldLanding.tsx` — página.
- `fx.ts` — parallax, revelado, marquesina, proceso con contenedor 3D, formulario.
- `globe.ts` — globo 3D con rutas (three.js). Se carga diferido y se pausa fuera de pantalla.
- La máscara de continentes se descarga de unpkg; para producción copie `earth-water.png` a `/public` y cambie `LAND_MASK` en `globe.ts`.
- El formulario muestra confirmación local: conecte `onSubmit` en `fx.ts` a su backend.

## Plataforma (`plataforma/`)
- `PlataformaMayorista.tsx` — todas las pantallas (render).
- `logic.ts` — estado, reglas (mínimo por proveedor, precios con estampado) y datos de ejemplo.
- `plataforma.css` — fuentes y estados hover.

Props: `productDetailVariant` ('A' | 'B'), `ordersVariant` ('A' | 'B'), `minimumPerProvider` (número).

### Qué conectar a su backend
| En `logic.ts` | Reemplazar por |
|---|---|
| `PROVS`, `PRODS`, `PRINT` | Proveedores, productos y opciones de estampado desde la API |
| `SEED_P` / `SEED_M` | Órdenes del proveedor / pedidos del comerciante |
| `startUpload` + `EXTRACT` | Subida real del PDF y servicio de extracción (OCR / IA) |
| `pay` | Widget o checkout de Wompi y webhook de confirmación |
| `submitAuth` | Registro / inicio de sesión con rol (comerciante o proveedor) |
| `advanceOrder` | PATCH del estado de la orden + notificación al comerciante |

En producción conviene separar comerciante y proveedor en rutas distintas (`/tienda`, `/panel`) usando el campo `screen` del estado como punto de partida. El botón flotante "Pantallas" es solo para revisar el prototipo: elimínelo del final de `PlataformaMayorista.tsx`.

`logic.ts` lleva `// @ts-nocheck` porque contiene los datos de ejemplo sin tipar; al conectarlo a su API defina las interfaces de Proveedor, Producto y Orden y quite esa línea.
