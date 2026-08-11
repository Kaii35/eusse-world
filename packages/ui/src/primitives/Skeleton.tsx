import { cn } from '../lib/cn'

import type { ComponentPropsWithoutRef } from 'react'

export type SkeletonProps = ComponentPropsWithoutRef<'div'>

/**
 * Marcador de carga.
 *
 * REGLA: debe tener las DIMENSIONES EXACTAS del contenido final. Un skeleton de otro
 * tamaño produce salto de layout (CLS), que es peor que no tenerlo
 * (skills/ui-implementation.md).
 *
 * Se prefiere a un spinner centrado: comunica la forma de lo que viene y se percibe
 * más rápido.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      // Es decorativo: el lector de pantalla anuncia el estado con aria-live en la vista,
      // no leyendo cada bloque gris.
      aria-hidden="true"
      className={cn('bg-surface-sunken animate-pulse rounded-sm', className)}
      {...props}
    />
  )
}
