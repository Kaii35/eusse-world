'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

const STALE_TIME_MS = 30_000

/**
 * Cliente de TanStack Query por petición de navegador. Se crea en un estado para que un
 * render de servidor no comparta caché entre usuarios.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: STALE_TIME_MS, refetchOnWindowFocus: false } },
      }),
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
