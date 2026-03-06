export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { SiteGrid } from '@/components/dashboard/SiteGrid'
import { Globe, ArrowUpCircle, Bell, FileText } from 'lucide-react'
import type { Site } from '@/types/database.types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: sites } = await supabase.from('sites').select('*').order('name')
  const allSites: Site[] = sites ?? []

  // Get open alerts count
  const { count: alertCount } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')

  // Get latest uptime data per site
  const siteMetrics = await Promise.all(
    allSites.map(async (site) => {
      // Last 30 days uptime
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { data: checks } = await supabase
        .from('uptime_checks')
        .select('status_code, response_time_ms')
        .eq('site_id', site.id)
        .gte('checked_at', since)

      const total = checks?.length ?? 0
      const up = checks?.filter((c) => c.status_code && c.status_code >= 200 && c.status_code < 400).length ?? 0
      const uptimePercent = total > 0 ? Math.round((up / total) * 1000) / 10 : undefined

      // Latest response time
      const { data: latest } = await supabase
        .from('uptime_checks')
        .select('response_time_ms')
        .eq('site_id', site.id)
        .order('checked_at', { ascending: false })
        .limit(1)
        .single()

      // Latest SSL
      const { data: ssl } = await supabase
        .from('ssl_checks')
        .select('days_remaining')
        .eq('site_id', site.id)
        .order('checked_at', { ascending: false })
        .limit(1)
        .single()

      // Latest security
      const { data: security } = await supabase
        .from('security_scans')
        .select('score')
        .eq('site_id', site.id)
        .order('scanned_at', { ascending: false })
        .limit(1)
        .single()

      return {
        site,
        uptimePercent,
        responseTime: latest?.response_time_ms,
        sslDaysRemaining: ssl?.days_remaining ?? null,
        securityScore: security?.score ?? null,
      }
    })
  )

  // Average uptime across all sites
  const sitesWithUptime = siteMetrics.filter((s) => s.uptimePercent !== undefined)
  const avgUptime =
    sitesWithUptime.length > 0
      ? (sitesWithUptime.reduce((sum, s) => sum + (s.uptimePercent ?? 0), 0) / sitesWithUptime.length).toFixed(1)
      : '--'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Sites" value={String(allSites.length)} icon={Globe} />
        <MetricCard title="Avg Uptime" value={avgUptime === '--' ? '--' : `${avgUptime}%`} icon={ArrowUpCircle} />
        <MetricCard title="Active Alerts" value={String(alertCount ?? 0)} icon={Bell} />
        <MetricCard title="Next Report" value="7:00 AM" icon={FileText} />
      </div>

      <SiteGrid sites={siteMetrics} />
    </div>
  )
}
