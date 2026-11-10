import { setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { PanelShell } from '@/components/marketplace/SupplierPanel'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = { robots: { index: false, follow: false } }

/** Panel del proveedor: barra lateral con sus cuatro secciones. Privado, no se indexa. */
export default async function SupplierLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  setRequestLocale(locale)
  return <PanelShell>{children}</PanelShell>
}
