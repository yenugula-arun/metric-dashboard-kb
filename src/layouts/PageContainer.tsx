import { cn } from '@/utils/cn'

interface PageContainerProps {
  children:   React.ReactNode
  className?: string
}

/**
 * PageContainer — the scrollable content area inside DashboardLayout.
 * Provides consistent horizontal padding and vertical spacing.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn(
        'flex-1 p-6 space-y-6',
        className
      )}
    >
      {children}
    </main>
  )
}
