import type { SiteSummary } from '@/types/database.types'

export function dailyReportEmail(params: {
  date: string
  totalSites: number
  incidentCount: number
  summaries: SiteSummary[]
}): string {
  const siteRows = params.summaries
    .map(
      (s) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #334155;">${s.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #334155;">${s.uptime_percent.toFixed(1)}%</td>
        <td style="padding: 8px; border-bottom: 1px solid #334155;">${Math.round(s.avg_response_time)}ms</td>
        <td style="padding: 8px; border-bottom: 1px solid #334155;">${s.ssl_days_remaining ?? 'N/A'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #334155;">${s.incident_count}</td>
      </tr>`
    )
    .join('')

  return `
    <div style="background: #0f172a; color: #f1f5f9; padding: 32px; font-family: sans-serif;">
      <h1 style="color: #6366f1; margin-bottom: 4px;">Arsi Command Center</h1>
      <h2 style="color: #94a3b8; font-weight: normal;">Daily Report - ${params.date}</h2>
      <p>${params.totalSites} sites monitored | ${params.incidentCount} incidents</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <thead>
          <tr style="color: #94a3b8; text-align: left;">
            <th style="padding: 8px; border-bottom: 2px solid #334155;">Site</th>
            <th style="padding: 8px; border-bottom: 2px solid #334155;">Uptime</th>
            <th style="padding: 8px; border-bottom: 2px solid #334155;">Avg Response</th>
            <th style="padding: 8px; border-bottom: 2px solid #334155;">SSL Days</th>
            <th style="padding: 8px; border-bottom: 2px solid #334155;">Incidents</th>
          </tr>
        </thead>
        <tbody>${siteRows}</tbody>
      </table>
      <p style="color: #94a3b8; margin-top: 24px; font-size: 12px;">Arsi Technology Group LLC - Minneapolis, MN</p>
    </div>
  `
}

export function alertEmail(params: {
  title: string
  message: string
  severity: string
  siteUrl?: string
}): string {
  const severityColor =
    params.severity === 'critical' ? '#ef4444' : params.severity === 'warning' ? '#eab308' : '#3b82f6'

  return `
    <div style="background: #0f172a; color: #f1f5f9; padding: 32px; font-family: sans-serif;">
      <h1 style="color: #6366f1; margin-bottom: 4px;">Arsi Command Center</h1>
      <div style="background: #1e293b; border-left: 4px solid ${severityColor}; padding: 16px; margin-top: 16px; border-radius: 4px;">
        <h2 style="margin: 0 0 8px 0;">${params.title}</h2>
        <p style="color: #94a3b8; margin: 0;">${params.message}</p>
        ${params.siteUrl ? `<p style="margin-top: 8px;"><a href="${params.siteUrl}" style="color: #6366f1;">${params.siteUrl}</a></p>` : ''}
      </div>
      <p style="color: #94a3b8; margin-top: 24px; font-size: 12px;">Arsi Technology Group LLC - Minneapolis, MN</p>
    </div>
  `
}
