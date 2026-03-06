import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SiteSummary } from '@/types/database.types'

export async function compileDailyReport(): Promise<{
  summaries: SiteSummary[]
  incidentCount: number
  totalSites: number
}> {
  const { data: sites } = await supabaseAdmin.from('sites').select('*')
  if (!sites?.length) return { summaries: [], incidentCount: 0, totalSites: 0 }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const summaries: SiteSummary[] = await Promise.all(
    sites.map(async (site) => {
      const { data: checks } = await supabaseAdmin
        .from('uptime_checks')
        .select('status_code, response_time_ms')
        .eq('site_id', site.id)
        .gte('checked_at', since)

      const totalChecks = checks?.length ?? 0
      const upChecks = checks?.filter((c) => c.status_code && c.status_code >= 200 && c.status_code < 400).length ?? 0
      const uptimePercent = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 100
      const avgResponseTime =
        totalChecks > 0
          ? (checks?.reduce((sum, c) => sum + c.response_time_ms, 0) ?? 0) / totalChecks
          : 0

      const { data: alerts } = await supabaseAdmin
        .from('alerts')
        .select('id')
        .eq('site_id', site.id)
        .gte('created_at', since)

      const { data: sslCheck } = await supabaseAdmin
        .from('ssl_checks')
        .select('days_remaining')
        .eq('site_id', site.id)
        .order('checked_at', { ascending: false })
        .limit(1)
        .single()

      return {
        site_id: site.id,
        name: site.name,
        uptime_percent: Math.round(uptimePercent * 10) / 10,
        incident_count: alerts?.length ?? 0,
        ssl_days_remaining: sslCheck?.days_remaining ?? null,
        avg_response_time: Math.round(avgResponseTime),
      }
    })
  )

  const incidentCount = summaries.reduce((sum, s) => sum + s.incident_count, 0)

  return { summaries, incidentCount, totalSites: sites.length }
}
