import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface FilterOption {
  label: string
  value: string
}

interface FilterDropdownProps {
  options: FilterOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function FilterDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className,
}: FilterDropdownProps) {
  return (
    <div className={cn('relative inline-block', className)}>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="
          h-7 pl-3 pr-8 text-xs appearance-none cursor-pointer
          bg-slate-50 border border-slate-200 text-slate-900
          focus:outline-none focus:border-blue-600 focus:bg-white
          transition-colors duration-100
        "
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}
