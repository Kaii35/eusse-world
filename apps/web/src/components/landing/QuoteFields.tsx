'use client'

import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
import { useState, type SyntheticEvent } from 'react'

// Clases escritas enteras y sin `cn`: este es el único formulario de cliente de la
// landing y tailwind-merge costaría más JavaScript que todo el componente.
const FIELD =
  'border-line-strong bg-page-alt text-ink placeholder:text-ink-subtle focus-visible:border-brand/70 w-full rounded-lg border px-4 text-body-sm transition-colors duration-300'
const INPUT = `${FIELD} h-12`

export type QuoteLabels = Record<
  | 'name'
  | 'company'
  | 'origin'
  | 'destination'
  | 'service'
  | 'detail'
  | 'placeCity'
  | 'placeDetail'
  | 'submit'
  | 'sent',
  string
>

type QuoteFieldsProps = {
  /** Textos ya traducidos en el servidor: el cliente no carga el runtime de next-intl. */
  labels: QuoteLabels
  services: { value: string; label: string }[]
  /** Clases del botón, calculadas en el servidor con ctaClass. */
  submitClassName: string
}

/**
 * Campos del formulario de cotización. Aún no envía datos: sólo valida y confirma en
 * cliente hasta que exista el endpoint de leads (RFC-0009 §4.7).
 */
export function QuoteFields({ labels, services, submitClassName }: QuoteFieldsProps) {
  const [sent, setSent] = useState(false)

  const onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-page text-ink shadow-float relative grid gap-5 rounded-xl p-6 md:p-8 lg:col-span-7"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="quote-name" label={labels.name}>
          <input id="quote-name" name="name" required className={INPUT} />
        </Field>
        <Field id="quote-company" label={labels.company}>
          <input id="quote-company" name="company" className={INPUT} />
        </Field>
        <Field id="quote-origin" label={labels.origin}>
          <input id="quote-origin" name="origin" placeholder={labels.placeCity} className={INPUT} />
        </Field>
        <Field id="quote-destination" label={labels.destination}>
          <input
            id="quote-destination"
            name="destination"
            placeholder={labels.placeCity}
            className={INPUT}
          />
        </Field>
      </div>

      <Field id="quote-service" label={labels.service}>
        <div className="relative">
          <select
            id="quote-service"
            name="service"
            className={`${INPUT} cursor-pointer appearance-none pr-10`}
          >
            {services.map((service) => (
              <option key={service.value} value={service.value}>
                {service.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            strokeWidth={1.5}
            className="text-ink-muted pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2"
          />
        </div>
      </Field>

      <Field id="quote-detail" label={labels.detail}>
        <textarea
          id="quote-detail"
          name="detail"
          rows={4}
          placeholder={labels.placeDetail}
          className={`${FIELD} resize-y py-3`}
        />
      </Field>

      <button type="submit" className={submitClassName}>
        {labels.submit}
        <ArrowRight strokeWidth={1.75} className="group-hover/cta:translate-x-1" />
      </button>

      <p aria-live="polite" className="text-brand text-body-sm flex min-h-6 items-center gap-2">
        {sent ? (
          <>
            <CheckCircle2
              aria-hidden
              strokeWidth={1.5}
              className="motion-safe:animate-emerge size-5"
            />
            {labels.sent}
          </>
        ) : null}
      </p>
    </form>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-ink-muted text-caption mb-2 block font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}
