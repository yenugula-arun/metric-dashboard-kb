import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaginationProps {
  /** Total number of items */
  totalItems:   number
  /** Items per page */
  pageSize:     number
  /** Current page (1-indexed) */
  currentPage:  number
  /** Called when user navigates to a different page */
  onPageChange: (page: number) => void
  className?:   string
}

/** Maximum number of page buttons to display before collapsing with ellipsis */
const MAX_VISIBLE_PAGES = 7

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []

  // Always show first page
  pages.push(1)

  if (current > 4) {
    pages.push('...')
  }

  const start = Math.max(2, current - 2)
  const end   = Math.min(total - 1, current + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 3) {
    pages.push('...')
  }

  // Always show last page
  pages.push(total)

  return pages
}

/**
 * Pagination — reusable paginator for any large dataset.
 * Supports 100–1000+ items with ellipsis collapsing.
 */
export function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize)

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem   = Math.min(currentPage * pageSize, totalItems)
  const pageNums  = getPageNumbers(currentPage, totalPages)

  return (
    <div className={cn('flex items-center justify-between gap-4 py-3', className)}>
      {/* Item count label */}
      <span className="text-xs text-slate-500 shrink-0">
        Showing{' '}
        <span className="font-medium text-slate-700">{startItem}–{endItem}</span>
        {' '}of{' '}
        <span className="font-medium text-slate-700">{totalItems}</span>
      </span>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={cn(
            'flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors duration-100',
            'border border-slate-200',
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed bg-slate-50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
          )}
        >
          <ChevronLeft size={12} />
          Prev
        </button>

        {/* Page numbers */}
        {pageNums.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex items-center justify-center w-7 h-7 text-xs text-slate-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                'flex items-center justify-center w-7 h-7 text-xs font-medium transition-colors duration-100 border cursor-pointer',
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={cn(
            'flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors duration-100',
            'border border-slate-200',
            currentPage === totalPages
              ? 'text-slate-300 cursor-not-allowed bg-slate-50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
          )}
        >
          Next
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}
