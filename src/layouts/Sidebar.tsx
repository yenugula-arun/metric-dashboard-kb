import { NavLink }          from 'react-router-dom'
import { ChevronLeft, Cpu } from 'lucide-react'
import { cn }               from '@/utils/cn'
import { SIDEBAR_ITEMS }    from '@/constants/sidebar'

interface SidebarProps {
  collapsed:  boolean
  onCollapse: (v: boolean) => void
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col',
        'bg-white border-r border-slate-200',
        'transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center h-14 px-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 shrink-0">
            <Cpu size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                K8s Optimizer
              </p>
              <p className="text-[10px] text-slate-500 truncate leading-tight">
                EKS Dashboard
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-2 py-2.5 text-sm transition-colors duration-100',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600',
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent',
                  collapsed ? 'justify-center' : ''
                )
              }
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && (
                <span className="truncate font-medium">{item.label}</span>
              )}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto text-[10px] font-semibold bg-blue-600 text-white px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Collapse Toggle ──────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-slate-200 p-2">
        <button
          onClick={() => onCollapse(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="
            flex items-center justify-center w-full h-8
            text-slate-500 hover:text-slate-900 hover:bg-slate-100
            transition-colors duration-100 cursor-pointer
          "
        >
          <ChevronLeft
            size={14}
            className={cn(
              'transition-transform duration-200',
              collapsed ? 'rotate-180' : ''
            )}
          />
        </button>
      </div>
    </aside>
  )
}
