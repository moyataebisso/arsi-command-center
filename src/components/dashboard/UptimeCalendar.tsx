'use client'

import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'

interface DayData {
  date: string
  uptimePercent: number | null
}

function getColor(percent: number | null): string {
  if (percent === null) return 'bg-slate-700'
  if (percent === 100) return 'bg-green-500'
  if (percent >= 95) return 'bg-yellow-500'
  if (percent >= 90) return 'bg-orange-500'
  return 'bg-red-500'
}

export function UptimeCalendar({ days }: { days: DayData[] }) {
  const dayMap = new Map(days.map((d) => [d.date, d.uptimePercent]))

  const grid = Array.from({ length: 90 }, (_, i) => {
    const date = format(subDays(new Date(), 89 - i), 'yyyy-MM-dd')
    return { date, percent: dayMap.get(date) ?? null }
  })

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span>90 days ago</span>
        <span>Today</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {grid.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.percent !== null ? `${day.percent.toFixed(1)}%` : 'No data'}`}
            className={cn('h-3 w-3 rounded-sm', getColor(day.percent))}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" /> 100%</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-yellow-500" /> 95-99%</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-500" /> 90-95%</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" /> &lt;90%</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-700" /> No data</span>
      </div>
    </div>
  )
}
