import { memo } from 'react'
import {
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { ChartSeries } from '@/types'

interface AreaChartProps {
  series:   ChartSeries[]
  unit?:    string
  /** Y-axis domain, e.g. [0, 100] */
  domain?:  [number, number]
  height?:  number
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayload {
  name:   string
  value:  number
  color:  string
}

interface CustomTooltipProps {
  active?:  boolean
  payload?: TooltipPayload[]
  label?:   string
  unit?:    string
}

function CustomTooltip({ active, payload, label, unit = '%' }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 px-3 py-2 text-xs shadow-md">
      <p className="text-slate-500 mb-1.5 font-medium">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="text-slate-900 font-semibold tabular-nums">
            {entry.value.toFixed(1)}{unit}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Area Chart ───────────────────────────────────────────────────────────────

/**
 * AreaChart — receives pre-processed ChartSeries[] props.
 * Never fetches data or contains business logic.
 */
export const AreaChart = memo(function AreaChart({
  series,
  unit = '%',
  domain = [0, 100],
  height = 180,
}: AreaChartProps) {
  // Merge multiple series into a single data array keyed by timestamp
  const merged: Record<string, number | string>[] = []
  const timestamps = series[0]?.data.map((p) => p.timestamp) ?? []

  timestamps.forEach((ts, i) => {
    const point: Record<string, number | string> = { timestamp: ts }
    series.forEach((s) => {
      point[s.name] = s.data[i]?.value ?? 0
    })
    merged.push(point)
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsArea
        data={merged}
        margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={s.name} id={`grad-${s.name.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={s.color ?? '#2563eb'} stopOpacity={0.2} />
              <stop offset="95%" stopColor={s.color ?? '#2563eb'} stopOpacity={0}   />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid
          strokeDasharray="2 4"
          stroke="#e2e8f0"
          vertical={false}
        />

        <XAxis
          dataKey="timestamp"
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />

        <YAxis
          domain={domain}
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}${unit}`}
          width={42}
        />

        <Tooltip
          content={<CustomTooltip unit={unit} />}
          cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
        />

        {series.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: '10px', color: '#475568', paddingTop: '8px' }}
            iconType="circle"
            iconSize={6}
          />
        )}

        {series.map((s) => (
          <Area
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color ?? '#2563eb'}
            strokeWidth={1.5}
            fill={`url(#grad-${s.name.replace(/\s+/g, '-')})`}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: s.color ?? '#2563eb' }}
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
          />
        ))}
      </RechartsArea>
    </ResponsiveContainer>
  )
})
