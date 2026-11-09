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

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Conectamos mercados')
    await expect(page.getByRole('link', { name: /solicitar cotización/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /ver servicios/i })).toBeVisible()
  })

  test('debería servir la versión en inglés', async ({ page }) => {
    await page.goto('/en')

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('We connect markets')
  })

  test('debería cambiar de idioma desde el selector de la cabecera', async ({ page }) => {
    await page.goto('/es')

    await page.getByRole('banner').getByLabel('Cambiar idioma').click()
    await page.getByRole('banner').getByRole('link', { name: 'English' }).click()

    await expect(page).toHaveURL(/\/en$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('We connect markets')
  })

  test('debería preseleccionar el servicio al cotizar desde su tarjeta', async ({ page }) => {
    await page.goto('/es')
    // La preselección es una mejora que llega al hidratar: se espera a que la página
    // sea interactiva (el script de movimiento marca la cabecera al arrancar).
    await expect(page.locator('[data-nav]')).toHaveAttribute('data-at-top', /true|false/)

    await page
      .getByRole('article')
      .filter({ hasText: 'Importaciones y exportaciones' })
      .getByRole('link', { name: /cotizar este servicio/i })
      .click()

    await expect(
      page.getByRole('form', { name: 'Solicitud de cotización' }).getByLabel('Servicio'),
    ).toHaveValue('trade')
  })

  test('debería llevar la ruta del planificador al formulario', async ({ page }) => {
    await page.goto('/es')
    // El planificador se activa al hidratar: se espera a que la página sea interactiva.
    await expect(page.locator('[data-nav]')).toHaveAttribute('data-at-top', /true|false/)

    const origin = page.getByRole('group', { name: 'Origen' })
    const destination = page.getByRole('group', { name: 'Destino' })
    await origin.getByRole('button', { name: 'Costa Rica' }).click()
    await destination.getByRole('button', { name: 'Nicaragua' }).click()
    await page
      .getByRole('group', { name: 'Modalidad' })
      .getByRole('button', { name: 'Marítimo' })
      .click()

    await expect(origin.getByRole('button', { name: 'Costa Rica' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await page.getByRole('link', { name: /cotizar esta ruta/i }).click()

    const form = page.getByRole('form', { name: 'Solicitud de cotización' })
    await expect(form.getByLabel('Origen')).toHaveValue('CR')
    await expect(form.getByLabel('Destino')).toHaveValue('NI')
    await expect(form.getByLabel('Detalles de la carga')).toHaveValue(/Marítimo/)
  })

  test('debería abrir y cerrar una prenda del perchero con el teclado', async ({ page }) => {
    await page.goto('/es')
    await expect(page.locator('[data-nav]')).toHaveAttribute('data-at-top', /true|false/)

    // El perchero se carga al acercarse a la sección.
    await page.getByRole('heading', { name: /revisado pieza por pieza/i }).scrollIntoViewIfNeeded()
    const rail = page.getByRole('group', { name: 'Perchero de prendas' })
    const garment = rail.getByRole('button', { name: 'Hoodie de felpa' })
    await garment.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: 'Hoodie de felpa' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('debería recordar el tema elegido sin depender del sistema', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/es')

    await page.getByRole('banner').getByLabel('Cambiar tema').click()
    await page.getByRole('button', { name: 'Oscuro' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    // Tras recargar, ThemeScript aplica el tema antes de pintar: sin destello claro.
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
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

  test('debería ofrecer saltar al contenido como primer foco', async ({ page }) => {
    await page.goto('/es')

    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
    await expect(focused).toHaveAccessibleName(/saltar al contenido/i)
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`no debería tener violaciones de accesibilidad críticas ni serias (${colorScheme})`, async ({
      page,
    }) => {
      // Recorrer la página y auditarla entera con axe tarda más que un test normal.
      test.setTimeout(60_000)
      // Movimiento reducido: se audita el estado estable (mismos colores y contenido) sin
      // bucles decorativos repintando mientras axe calcula contrastes; si no, bajo carga
      // la auditoría tarda más que el test.
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
      await page.goto('/es')
      // Se audita el estado estable, no un fotograma a mitad de transición: un texto con
      // opacidad 0.5 durante 900 ms no es un fallo de contraste del diseño.
      // axe desplaza la página mientras audita; si una entrada se dispara a mitad, audita
      // un fotograma a medio aparecer. Se recorre la página antes, como un usuario.
      for (let i = 0; i < 30; i += 1) await page.mouse.wheel(0, 400)
      await page.mouse.wheel(0, -20000)
      // Los bucles decorativos (ruta, camión) son infinitos: sólo se esperan las entradas.
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll<HTMLElement>('[data-reveal]')].every(
            (el) => el.style.opacity === '' || el.style.opacity === '1',
          ) &&
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
            .every((animation) => animation.playState !== 'running'),
        undefined,
        { timeout: 15_000 },
      )

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()

      const blocking = results.violations.filter(
        (violation) => violation.impact === 'critical' || violation.impact === 'serious',
      )

      expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join('\n')).toEqual([])
    })
  }

  test('debería mostrar el contenido sin JavaScript', async ({ browser }) => {
    // Si el contenido crítico depende del JS, un fallo de red lo deja en blanco
    // (docs/12-ux-guidelines.md §4).
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await page.goto('/es')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /solicitar cotización/i })).toBeVisible()

    await context.close()
  })
})
