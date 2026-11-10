import Image from 'next/image'
import { setRequestLocale, getTranslations } from 'next-intl/server'

import { QueryProvider } from '@/components/app/QueryProvider'
import { barlow, barlowCondensed } from '@/components/marketing/landing/fonts'
import { AppNav } from '@/components/marketplace/AppNav'
import styles from '@/components/marketplace/wholesale.module.css'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * Zona mayorista: tienda, carrito, pedidos y panel del proveedor. Es privada, así que no se
 * indexa (skills/seo.md). Usa la misma tipografía y colores que la landing. El estado del
 * servidor vive en TanStack Query, no en el layout.
 */
export default async function AccountLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('marketplace.nav')

  const brand = (
    <>
      <Image src="/landing/logo-mark.png" alt="" width={34} height={23} priority />
      <span>
        {t('brandName')}
        <span className={styles.brandSub}>{t('brandSuffix')}</span>
      </span>
    </>
  )

  return (
    <div className={[barlow.variable, barlowCondensed.variable, styles.root].join(' ')}>
      <QueryProvider>
        <AppNav brand={brand} />
        <main id="main">{children}</main>
      </QueryProvider>
    </div>
  )
}
