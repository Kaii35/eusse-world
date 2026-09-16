import { cn } from '@eusse/ui'

import { riseDelay } from './motion'

type SectionHeadingProps = {
  index: number
  eyebrow: string
  title: string
  lead?: string
  align?: 'start' | 'center'
  /** Revela el titular palabra a palabra en lugar de en bloque. */
  wordByWord?: boolean
  tone?: 'light' | 'night'
  className?: string
}

/**
 * Cabecera común de sección: índice y etiqueta en mono azul, titular en Montserrat y
 * entradilla. El número da ritmo a la página.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
  align = 'start',
  wordByWord = false,
  tone = 'light',
  className,
}: SectionHeadingProps) {
  const centered = align === 'center'
  const night = tone === 'night'

  return (
    <div className={cn('flex flex-col gap-5', centered && 'items-center text-center', className)}>
      <p
        data-reveal="fade"
        className={cn(
          'text-eyebrow tracking-eyebrow flex items-center gap-3 font-mono font-medium uppercase',
          night ? 'text-brand-glow' : 'text-brand',
        )}
      >
        <span>{String(index).padStart(2, '0')}</span>
        <span aria-hidden className={cn('h-px w-10', night ? 'bg-brand-glow/60' : 'bg-brand/40')} />
        <span>{eyebrow}</span>
      </p>

      {wordByWord ? (
        <h2
          data-reveal="words"
          className={cn(
            'font-display text-display-lg max-w-title gap-x-word flex flex-wrap font-bold',
            centered && 'justify-center',
          )}
        >
          {title.split(' ').map((word, position) => (
            <span
              // Las palabras pueden repetirse: la posición es parte de la identidad.
              key={`${String(position)}-${word}`}
              data-word
              className={riseDelay(position)}
            >
              {word}
            </span>
          ))}
        </h2>
      ) : (
        <h2 data-reveal className="font-display text-display-lg max-w-title text-balance font-bold">
          {title}
        </h2>
      )}

      {lead ? (
        <p
          data-reveal
          className={cn('text-lead max-w-blurb', night ? 'text-on-night-muted' : 'text-ink-muted')}
        >
          {lead}
        </p>
      ) : null}
    </div>
  )
}
