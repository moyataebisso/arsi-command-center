import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Gauge } from 'lucide-react'
import { format } from 'date-fns'
import type { PerformanceScore } from '@/types/database.types'

function ScoreCircle({ label, score }: { label: string; score: number | null }) {
  const value = score ?? 0
  const color = value >= 90 ? 'text-green-400' : value >= 50 ? 'text-yellow-400' : 'text-red-400'
  const ringColor = value >= 90 ? 'stroke-green-500' : value >= 50 ? 'stroke-yellow-500' : 'stroke-red-500'
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#334155" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            className={ringColor}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${color}`}>
          {score !== null ? score : '--'}
        </span>
      </div>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  )
}

export function PerformancePanel({ score }: { score: PerformanceScore | null }) {
  if (!score) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5" /> Performance</CardTitle></CardHeader>
        <CardContent><p className="text-slate-400">No performance data yet.</p></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5" /> Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-around">
          <ScoreCircle label="Performance" score={score.performance_score} />
          <ScoreCircle label="Accessibility" score={score.accessibility_score} />
          <ScoreCircle label="SEO" score={score.seo_score} />
          <ScoreCircle label="Best Practices" score={score.best_practices_score} />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Core Web Vitals</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md bg-slate-900 p-3 text-center">
              <p className="text-lg font-bold text-slate-100">{score.lcp_ms !== null ? `${(score.lcp_ms / 1000).toFixed(1)}s` : '--'}</p>
              <p className="text-xs text-slate-400">LCP</p>
            </div>
            <div className="rounded-md bg-slate-900 p-3 text-center">
              <p className="text-lg font-bold text-slate-100">{score.fid_ms !== null ? `${score.fid_ms}ms` : '--'}</p>
              <p className="text-xs text-slate-400">FID</p>
            </div>
            <div className="rounded-md bg-slate-900 p-3 text-center">
              <p className="text-lg font-bold text-slate-100">{score.cls !== null ? score.cls.toFixed(3) : '--'}</p>
              <p className="text-xs text-slate-400">CLS</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Measured: {format(new Date(score.measured_at), 'MMM d, yyyy HH:mm')} ({score.device})
        </p>
      </CardContent>
    </Card>
  )
}
