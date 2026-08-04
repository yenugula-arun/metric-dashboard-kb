import { cn } from '@/utils/cn'

interface SectionProps {
  title?:       string
  description?: string
  actions?:     React.ReactNode
  children:     React.ReactNode
  className?:   string
}

/**
 * Section — wraps a named group of dashboard content.
 * Provides consistent heading + top-border treatment.
 */
export function Section({ title, description, actions, children, className }: SectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title ?? actions) && (
        <div className="flex items-start justify-between gap-4">
          {title && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                {title}
              </h2>
              {description && (
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
              )}
            </div>
          )}
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
