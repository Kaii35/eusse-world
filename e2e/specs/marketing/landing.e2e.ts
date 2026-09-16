import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Recorrido crÃ­tico 1: el visitante llega a la landing.
 *
 * Es puerta de despliegue (skills/testing.md). Se consulta por ROL ACCESIBLE, nunca
 * por clase CSS ni `data-testid`: asÃ­ el test verifica accesibilidad de paso y no se
 * rompe con un cambio visual.
 */
test.describe('landing', () => {
  test('deberÃ­a negociar el idioma desde Accept-Language', async ({ browser }) => {
    // ADR-0013: prefijo de URL â†’ preferencia guardada â†’ Accept-Language â†’ es.
    // Un navegador en inglÃ©s va a /en; uno en espaÃ±ol, a /es.
    const english = await browser.newContext({ locale: 'en-US' })
    const englishPage = await english.newPage()
    await englishPage.goto('/')
    await expect(englishPage).toHaveURL(/\/en$/)
    await english.close()

    const spanish = await browser.newContext({ locale: 'es-CO' })
    const spanishPage = await spanish.newPage()
    await spanishPage.goto('/')
    await expect(spanishPage).toHaveURL(/\/es$/)
    await spanish.close()
  })

  test('deberÃ­a mostrar la propuesta de valor y los CTA en espaÃ±ol', async ({ page }) => {
    await page.goto('/es')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Conectamos mercados')
    await expect(page.getByRole('link', { name: /cotizar por whatsapp/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /ver servicios/i })).toBeVisible()
  })

  test('deberÃ­a servir la versiÃ³n en inglÃ©s', async ({ page }) => {
    await page.goto('/en')

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('We connect markets')
  })

  test('deberÃ­a declarar hreflang recÃ­proco con URLs absolutas', async ({ page }) => {
    // Google ignora los hreflang relativos (skills/seo.md).
    await page.goto('/es')

    const alternates = page.locator('link[rel="alternate"]')
    await expect(alternates).toHaveCount(3)

    for (const href of await alternates.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href') ?? ''),
    )) {
      expect(href).toMatch(/^https?:\/\//)
    }
  })

  test('deberÃ­a tener un solo h1', async ({ page }) => {
    await page.goto('/es')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  })

  test('deberÃ­a ser navegable con teclado hasta el CTA principal', async ({ page }) => {
    await page.goto('/es')

    // El primer Tab abre el enlace de salto: sin Ã©l, el teclado recorre toda la barra.
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAccessibleName(/saltar al contenido/i)
    await expect(page.locator(':focus')).toBeVisible()

    // El CTA principal se alcanza en pocos pasos mÃ¡s, sin trampas de foco por el camino.
    const reachedCta = async () => {
      for (let step = 0; step < 12; step += 1) {
        await page.keyboard.press('Tab')
        const name = await page.locator(':focus').evaluate((node) => node.textContent)
        if (/cotizar por whatsapp/i.test(name)) return true
      }
      return false
    }
    expect(await reachedCta()).toBe(true)
    await expect(page.locator(':focus')).toBeVisible()
  })

  test('no deberÃ­a tener violaciones de accesibilidad crÃ­ticas ni serias', async ({ page }) => {
    await page.goto('/es')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    const blocking = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    )

    expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join('\n')).toEqual([])
  })

  test('deberÃ­a mostrar el contenido sin JavaScript', async ({ browser }) => {
    // Si el contenido crÃ­tico depende del JS, un fallo de red lo deja en blanco
    // (docs/12-ux-guidelines.md Â§4).
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await page.goto('/es')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /cotizar por whatsapp/i })).toBeVisible()

    await context.close()
  })
})
