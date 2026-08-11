import { Skeleton } from '@eusse/ui'

/**
 * Skeleton con las DIMENSIONES del contenido real, no un spinner centrado:
 * comunica la forma de lo que viene y evita el salto de layout
 * (skills/ui-implementation.md).
 */
export default function Loading() {
  return (
    <div className="max-w-content mx-auto flex min-h-dvh flex-col items-start justify-center gap-6 px-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-16 w-full max-w-prose" />
      <Skeleton className="h-6 w-full max-w-prose" />
      <div className="flex gap-3">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
  )
}
