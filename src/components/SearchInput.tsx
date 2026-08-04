import { Search } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}

export function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search size={13} className="absolute left-2.5 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full h-7 pl-8 pr-3 text-xs
          bg-slate-50 border border-slate-200 text-slate-900
          placeholder:text-slate-400
          focus:outline-none focus:border-blue-600 focus:bg-white
          transition-colors duration-100
        "
      />
    </div>
  )
}
