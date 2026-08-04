import { memo } from 'react'
import {
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { ChartSeries } from '@/types'

interface LineChartProps {
  series:   ChartSeries[]
  unit?:    string
  domain?:  [number, number]
  height?:  number
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayload {
  name:  string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?:  boolean
  payload?: TooltipPayload[]
  label?:   string
  unit?:    string
}

function CustomTooltip({ active, payload, label, unit = '' }: CustomTooltipProps) {
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

// ─── Line Chart ───────────────────────────────────────────────────────────────

/**
 * LineChart — receives pre-processed ChartSeries[] props.
 * Ideal for network / rate metrics with multiple overlapping series.
 */
export const LineChart = memo(function LineChart({
  series,
  unit = '',
  domain,
  height = 180,
}: LineChartProps) {
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
      <RechartsLine
        data={merged}
        margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
      >
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

        <Legend
          wrapperStyle={{ fontSize: '10px', color: '#475568', paddingTop: '8px' }}
          iconType="circle"
          iconSize={6}
        />

        {series.map((s) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color ?? '#2563eb'}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: s.color ?? '#2563eb' }}
            isAnimationActive={true}
            animationDuration={700}
            animationEasing="ease-out"
          />
        ))}
      </RechartsLine>
    </ResponsiveContainer>
  )
})
