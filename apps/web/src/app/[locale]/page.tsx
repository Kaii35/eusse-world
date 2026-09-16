import { setRequestLocale } from 'next-intl/server'

import { Faq } from '@/components/landing/Faq'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/landing/Hero'
import { LandingMotion } from '@/components/landing/LandingMotion'
import { Nav } from '@/components/landing/Nav'
import { Partners } from '@/components/landing/Partners'
import { Process } from '@/components/landing/Process'
import { QuoteForm } from '@/components/landing/QuoteForm'
import { Routes } from '@/components/landing/Routes'
import { Services } from '@/components/landing/Services'
import { Testimonials } from '@/components/landing/Testimonials'

type PageProps = { params: Promise<{ locale: string }> }

/**
 * Landing pública (RFC-0009). Server Component: el JavaScript de cliente se limita al
 * movimiento (LandingMotion), el globo del hero y el formulario. El mapa de rutas es
 * SVG y CSS.
 */
export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="landing bg-page text-ink font-body overflow-x-clip antialiased">
      <Nav />
      <main id="content">
        <Hero />
        <Services />
        <Routes />
        <Process />
        <Testimonials />
        <Partners />
        <Faq />
        <QuoteForm />
      </main>
      <Footer />
      <LandingMotion />
    </div>
  )
}
