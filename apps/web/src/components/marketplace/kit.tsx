import { useTranslations } from 'next-intl'

import { swatchFor } from './swatch'
import styles from './wholesale.module.css'

import type { ReactNode } from 'react'

import { Link } from '@/lib/i18n/navigation'

/**
 * Piezas visuales de la zona mayorista. Usan la hoja `wholesale.module.css`, que a su vez
 * sólo toma colores de `--landing-*` (mismo lenguaje que la landing). Sin estado: sirven
 * igual desde Server y Client Components.
 */

export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ')
}

export type ButtonVariant = 'primary' | 'secondary' | 'onDark' | 'onDarkGhost' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

/** Clases de botón. Úsalas en `<button>` o en `<Link>` para que se vean igual. */
export function buttonClass({
  variant = 'primary',
  size = 'md',
  block = false,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
} = {}): string {
  const variantClass = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
    onDark: styles.btnOnDark,
    onDarkGhost: styles.btnOnDarkGhost,
    ghost: styles.btnGhost,
  }[variant]
  return cx(
    styles.btn,
    variantClass,
    size === 'sm' && styles.btnSm,
    size === 'lg' && styles.btnLg,
    block && styles.btnBlock,
  )
}

/** Etiqueta de sección. Sobre fondo azul usa un tono que sí se lee (`onDark`). */
export function Eyebrow({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return <span className={cx(styles.eyebrow, onDark && styles.eyebrowOnDark)}>{children}</span>
}

export function Surface({
  children,
  className,
  as: Tag = 'section',
  labelledBy,
  padded = true,
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'article' | 'div'
  labelledBy?: string
  padded?: boolean
}) {
  return (
    <Tag
      aria-labelledby={labelledBy}
      className={cx(styles.card, padded && styles.cardBody, className)}
    >
      {children}
    </Tag>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  level = 'h1',
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  /** Dentro del panel la cabecera de página ya es h1; aquí va como h2 para no duplicarlo. */
  level?: 'h1' | 'h2'
}) {
  const Heading = level
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex max-w-3xl flex-col gap-3">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Heading className={cx(styles.display, styles.h1)}>{title}</Heading>
        {description ? <p className={styles.lead}>{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  )
}

export type NoticeTone = 'info' | 'success' | 'danger' | 'warning'

const NOTICE_TONE: Record<NoticeTone, string> = {
  info: 'bg-info-subtle text-info-subtle-foreground',
  success: 'bg-success-subtle text-success-subtle-foreground',
  danger: 'bg-danger-subtle text-danger-subtle-foreground',
  warning: 'bg-warning-subtle text-warning-subtle-foreground',
}

export function Notice({
  tone = 'info',
  children,
  role = 'status',
}: {
  tone?: NoticeTone
  children: ReactNode
  role?: 'status' | 'alert'
}) {
  return (
    <div role={role} className={`text-body-sm rounded-md px-4 py-3 ${NOTICE_TONE[tone]}`}>
      {children}
    </div>
  )
}

/** Aviso de vista previa: la pantalla existe pero sus datos aún no vienen de la API. */
export function PreviewBanner({ children }: { children: ReactNode }) {
  return (
    <div role="note" className={styles.banner}>
      {children}
    </div>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className={styles.dashed}>
      <h2 className={cx(styles.display, styles.h4)}>{title}</h2>
      <p className={cx(styles.muted, 'max-w-prose')}>{body}</p>
      {action}
    </div>
  )
}

export function Pill({ children, outline = false }: { children: ReactNode; outline?: boolean }) {
  return <span className={cx(styles.pill, outline && styles.pillOutline)}>{children}</span>
}

/** Color de una prenda como muestra. El color es sólo visual, nunca un dato de precio. */
export function Swatch({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className={styles.swatch} style={{ background: swatchFor(name) }} />
  )
}

/** Campo con etiqueta visible, pista y error. El control va como hijo. */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string
  hint?: string | undefined
  error?: string | undefined
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className="text-foreground text-body-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-caption text-danger">{error}</p>
      ) : hint ? (
        <p className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  )
}

export const controlClass = styles.input

/** Barra de progreso accesible hacia un mínimo. El ancho es visual, no un precio. */
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = Math.min(100, Math.round((value / max) * 100))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className={styles.progress}
    >
      <div className={styles.progressFill} style={{ width: `${percent}%` }} />
    </div>
  )
}

/** Migas de pan. La última entrada es la página actual y no es un enlace. */
export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  const t = useTranslations('marketplace.common')
  return (
    <nav aria-label={t('breadcrumb')} className="text-body-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="text-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
