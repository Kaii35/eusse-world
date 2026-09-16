import { useTranslations } from 'next-intl'

/**
 * Marcos vacíos a propósito: los logos de aliados y las certificaciones se
 * cargan cuando exista autorización comercial (RFC-0009 §10, pregunta 2).
 */
const SLOTS = [
  { id: 'partner-1', label: 'partner' },
  { id: 'partner-2', label: 'partner' },
  { id: 'partner-3', label: 'partner' },
  { id: 'certification-1', label: 'certification' },
  { id: 'certification-2', label: 'certification' },
] as const

export function Partners() {
  const t = useTranslations('landing.partners')

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-content mx-auto px-6">
        <h2 className="text-ink-subtle text-eyebrow tracking-eyebrow mb-8 flex items-center gap-4 font-mono uppercase">
          {t('title')}
          <span aria-hidden className="bg-line h-px flex-1" />
        </h2>

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {SLOTS.map((slot) => (
            <li
              key={slot.id}
              data-reveal="fade"
              className="border-line-strong text-ink-subtle text-caption hover:border-brand/40 hover:text-ink-muted grid h-20 place-items-center rounded-xl border border-dashed font-mono uppercase transition duration-500"
            >
              {t(slot.label)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
