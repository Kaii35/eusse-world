import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Recorrido crítico 1: el visitante llega a la landing.
 *
 * Es puerta de despliegue (skills/testing.md). Se consulta por ROL ACCESIBLE, nunca
 * por clase CSS ni `data-testid`: así el test verifica accesibilidad de paso y no se
 * rompe con un cambio visual.
 */
test.describe('landing', () => {
  test('debería negociar el idioma desde Accept-Language', async ({ browser }) => {
    // ADR-0013: prefijo de URL → preferencia guardada → Accept-Language → es.
    // Un navegador en inglés va a /en; uno en español, a /es.
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

  test('debería mostrar la propuesta de valor y los CTA en español', async ({ page }) => {
    await page.goto('/es')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Tus precios')
    await expect(page.getByRole('link', { name: /crear cuenta mayorista/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /ver catálogo/i })).toBeVisible()
  })

  test('debería servir la versión en inglés', async ({ page }) => {
    await page.goto('/en')

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Your pricing')
  })

  test('debería declarar hreflang recíproco con URLs absolutas', async ({ page }) => {
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

  test('debería tener un solo h1', async ({ page }) => {
    await page.goto('/es')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  })

  test('debería ser navegable con teclado hasta el CTA principal', async ({ page }) => {
    await page.goto('/es')

    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
    await expect(focused).toHaveAccessibleName(/crear cuenta mayorista/i)
  })

  test('no debería tener violaciones de accesibilidad críticas ni serias', async ({ page }) => {
    await page.goto('/es')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    const blocking = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    )

    expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join('\n')).toEqual([])
  })

  test('debería mostrar el contenido sin JavaScript', async ({ browser }) => {
    // Si el contenido crítico depende del JS, un fallo de red lo deja en blanco
    // (docs/12-ux-guidelines.md §4).
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await page.goto('/es')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /crear cuenta mayorista/i })).toBeVisible()

    await context.close()
  })
})
