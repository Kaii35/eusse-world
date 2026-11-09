import { Badge } from '@eusse/ui'

import type { ReactNode } from 'react'

import { Link } from '@/lib/i18n/navigation'

/**
 * Piezas visuales de la zona de cuenta. Sólo tokens de @eusse/tokens: sin colores ni
 * medidas sueltas (CLAUDE.md). Todas son sin estado, para usarse desde Server y Client.
 */

export function Surface({
  children,
  className = '',
  as: Tag = 'section',
  labelledBy,
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'article' | 'div'
  labelledBy?: string
}) {
  return (
    <Tag
      aria-labelledby={labelledBy}
      className={`border-border bg-surface shadow-raised flex flex-col gap-5 rounded-lg border p-6 ${className}`}
    >
      {children}
    </Tag>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-h2 text-foreground font-semibold">{title}</h1>
        {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
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
    <div className="border-border flex flex-col items-start gap-3 rounded-lg border border-dashed p-8">
      <h2 className="text-h4 text-foreground font-semibold">{title}</h2>
      <p className="text-body text-muted-foreground max-w-prose">{body}</p>
      {action}
    </div>
  )
}

export type PillTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

export function Pill({ tone = 'neutral', children }: { tone?: PillTone; children: ReactNode }) {
  return <Badge variant={tone}>{children}</Badge>
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
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-body-sm text-foreground font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-caption text-danger">{error}</p>
      ) : hint ? (
        <p className="text-caption text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export const controlClass =
  'border-border bg-surface text-foreground text-body placeholder:text-subtle-foreground focus-visible:outline-ring h-11 w-full rounded-md border px-3 focus-visible:outline-2 focus-visible:outline-offset-2'

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
      className="bg-surface-sunken h-2 w-full overflow-hidden rounded-full"
    >
      <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
    </div>
  )
}

export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="breadcrumb" className="text-body-sm text-muted-foreground">
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
