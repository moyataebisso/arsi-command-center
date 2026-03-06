'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { UptimeCheck } from '@/types/database.types'
import { format } from 'date-fns'

type Range = '24h' | '7d' | '30d'

export function ResponseTimeChart({ checks }: { checks: UptimeCheck[] }) {
  const [range, setRange] = useState<Range>('24h')

  const now = Date.now()
  const rangeMs: Record<Range, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  }

  const filtered = checks
    .filter((c) => now - new Date(c.checked_at).getTime() < rangeMs[range])
    .sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime())

  const data = filtered.map((c) => ({
    time: format(new Date(c.checked_at), range === '24h' ? 'HH:mm' : 'MMM d'),
    ms: c.response_time_ms,
  }))

  return (
    <div>
      <div className="mb-3 flex gap-1">
        {(['24h', '7d', '30d'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded px-2 py-1 text-xs font-medium ${
              range === r ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} unit="ms" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#f1f5f9' }}
            itemStyle={{ color: '#6366f1' }}
          />
          <Line type="monotone" dataKey="ms" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
