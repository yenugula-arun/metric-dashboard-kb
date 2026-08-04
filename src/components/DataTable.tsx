import { cn } from '@/utils/cn'

export interface Column<T> {
  key:          string
  header:       string
  width?:       string
  align?:       'left' | 'right' | 'center'
  render:       (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns:     Column<T>[]
  rows:        T[]
  keyField:    keyof T
  className?:  string
  emptyLabel?: string
}

/**
 * DataTable — generic reusable table.
 * Receives typed columns and rows — no business logic inside.
 */
export function DataTable<T>({
  columns,
  rows,
  keyField,
  className,
  emptyLabel = 'No records found',
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 shadow-xs overflow-hidden',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap',
                    col.align === 'right'  && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.width && `w-[${col.width}]`
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={String(row[keyField])}
                  className="
                    border-b border-slate-200 last:border-0
                    hover:bg-slate-50/80 transition-colors duration-100
                  "
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-slate-900 whitespace-nowrap',
                        col.align === 'right'  && 'text-right',
                        col.align === 'center' && 'text-center'
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
