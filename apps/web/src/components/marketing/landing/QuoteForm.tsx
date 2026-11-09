'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { CheckCircleIcon } from './icons'

type QuoteFormProps = {
  label: string
  sentTitle: string
  sentDescription: string
  sendAnother: string
  /** Clases de landing.module.css, resueltas en el servidor (ver islands.module.css). */
  classNames: { form: string; sent: string; sentTitle: string; sentText: string; sentAgain: string }
  children: React.ReactNode
}

/**
 * Isla de cliente mínima: sólo el envío y la confirmación. Los campos llegan ya
 * renderizados en el servidor como `children`, y los textos como props, para no cargar
 * el formateador de mensajes en el navegador (presupuesto de JS de la landing).
 *
 * Hoy confirma en local: el contexto Content y el endpoint de leads (RFC-0009 §4.7) aún
 * no existen. Registrado en docs/tech-debt.md.
 */
export function QuoteForm({
  label,
  sentTitle,
  sentDescription,
  sendAnother,
  classNames: styles,
  children,
}: QuoteFormProps) {
  const [sent, setSent] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const statusId = useId()

  // "Cotizar este servicio" en las tarjetas deja el servicio ya elegido. Sin JS el enlace
  // sólo lleva al formulario, que sigue funcionando.
  useEffect(() => {
    const onClick = (event: MouseEvent): void => {
      const link = (event.target as Element | null)?.closest<HTMLElement>('[data-quote-service]')
      const select = formRef.current?.elements.namedItem('service')
      if (!link || !(select instanceof HTMLSelectElement)) return
      select.value = link.dataset.quoteService ?? select.value
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <form
      ref={formRef}
      className={styles.form}
      aria-label={label}
      onSubmit={(event) => {
        event.preventDefault()
        formRef.current?.reset()
        setSent(true)
      }}
      data-reveal=""
      data-delay="120"
    >
      {children}

      <div id={statusId} role="status" aria-live="polite">
        {sent ? (
          <div className={styles.sent}>
            <CheckCircleIcon />
            <span className={styles.sentTitle}>{sentTitle}</span>
            <span className={styles.sentText}>{sentDescription}</span>
            <button
              type="button"
              className={styles.sentAgain}
              onClick={() => {
                setSent(false)
              }}
            >
              {sendAnother}
            </button>
          </div>
        ) : null}
      </div>
    </form>
  )
}
