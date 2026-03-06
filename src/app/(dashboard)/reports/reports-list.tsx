'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import type { Report, SiteSummary } from '@/types/database.types'

export function ReportsList({ reports }: { reports: Report[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (reports.length === 0) {
    return <EmptyState icon={FileText} title="No reports yet" description="Reports will appear here after the first daily run." />
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const isOpen = expanded === report.id
        const summaries = (report.sites_summary_json ?? []) as SiteSummary[]
        return (
          <Card key={report.id}>
            <button
              onClick={() => setExpanded(isOpen ? null : report.id)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <span className="font-semibold text-slate-100">
                    {report.type === 'daily' ? 'Daily' : 'Weekly'} Report — {format(new Date(report.generated_at), 'MMMM d, yyyy')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {summaries.length} sites &middot; {report.incidents_count} incidents
                  {report.sent_at && (
                    <> &middot; Sent at {format(new Date(report.sent_at), 'h:mm a')}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {report.sent_at ? (
                  <Badge variant="success">Sent</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </div>
            </button>
            {isOpen && summaries.length > 0 && (
              <CardContent className="border-t border-slate-700 pt-4">
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400">
                        <th className="pb-2 pr-4">Site</th>
                        <th className="pb-2 pr-4">Uptime</th>
                        <th className="pb-2 pr-4">Avg Response</th>
                        <th className="pb-2 pr-4">SSL Days</th>
                        <th className="pb-2">Incidents</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaries.map((s) => (
                        <tr key={s.site_id} className="border-t border-slate-700/50">
                          <td className="py-2 pr-4 text-slate-200">{s.name}</td>
                          <td className="py-2 pr-4">{s.uptime_percent}%</td>
                          <td className="py-2 pr-4">{s.avg_response_time}ms</td>
                          <td className="py-2 pr-4">{s.ssl_days_remaining ?? 'N/A'}</td>
                          <td className="py-2">{s.incident_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
