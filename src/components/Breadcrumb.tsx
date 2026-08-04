import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items:     BreadcrumbItem[]
  className?: string
}

/**
 * Breadcrumb — reusable breadcrumb navigation.
 * The last item is treated as the current page (no link, slightly dimmed).
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: 'Dashboard', href: '/dashboard' },
 *     { label: 'Clusters',  href: '/clusters' },
 *     { label: 'my-cluster' },
 *   ]} />
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1', className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && (
              <ChevronRight size={12} className="text-slate-400 shrink-0" />
            )}
            {isLast || !item.href ? (
              <span
                aria-current={isLast ? 'page' : undefined}
                className={cn(
                  'text-xs font-medium',
                  isLast ? 'text-slate-900' : 'text-slate-500'
                )}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors duration-100"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
