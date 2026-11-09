import { setRequestLocale } from 'next-intl/server'

import { AppNav } from '@/components/app/AppNav'
import { QueryProvider } from '@/components/app/QueryProvider'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Zona de cuenta: tienda, carrito y panel del proveedor. Es privada, así que no se indexa
 * (skills/seo.md). El estado del servidor vive en TanStack Query, no en el layout.
 */
export default async function AccountLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <QueryProvider>
      <AppNav />
      <main id="main" className="min-h-dvh">
        {children}
      </main>
    </QueryProvider>
  )
}
