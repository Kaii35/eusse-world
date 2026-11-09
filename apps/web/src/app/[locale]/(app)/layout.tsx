import Image from 'next/image'
import { setRequestLocale, getTranslations } from 'next-intl/server'

import { QueryProvider } from '@/components/app/QueryProvider'
import { AppNav } from '@/components/marketplace/AppNav'

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
  const t = await getTranslations('marketplace.nav')

  // La marca del landing está pensada para fondo oscuro. Aquí va el isotipo con el nombre
  // en colores del tema, para que se lea igual en claro y en oscuro.
  const brand = (
    <span className="flex items-center gap-3">
      <Image src="/landing/logo-mark.png" alt="" width={36} height={24} priority />
      <span className="text-body text-foreground font-semibold uppercase tracking-wider">
        {t('brand')}
      </span>
    </span>
  )

  return (
    <QueryProvider>
      <AppNav brand={brand} />
      <main id="main" className="bg-background min-h-dvh">
        {children}
      </main>
    </QueryProvider>
  )
}
