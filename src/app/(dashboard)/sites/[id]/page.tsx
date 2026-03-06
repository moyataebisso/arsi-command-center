export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusDot } from '@/components/shared/StatusDot'
import { ResponseTimeChart } from '@/components/dashboard/ResponseTimeChart'
import { UptimeCalendar } from '@/components/dashboard/UptimeCalendar'
import { SSLPanel } from '@/components/dashboard/SSLPanel'
import { SecurityPanel } from '@/components/dashboard/SecurityPanel'
import { PerformancePanel } from '@/components/dashboard/PerformancePanel'
import { SiteDetailTabs } from './tabs'
import { format, subDays, startOfDay } from 'date-fns'
import type { Site, UptimeCheck, SSLCheck, SecurityScan, PerformanceScore, Alert, Deployment, SupabaseHealth } from '@/types/database.types'

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: site } = await supabase.from('sites').select('*').eq('id', id).single()
  if (!site) notFound()

  // Uptime checks (30 days)
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: uptimeChecks } = await supabase
    .from('uptime_checks')
    .select('*')
    .eq('site_id', id)
    .gte('checked_at', since30d)
    .order('checked_at', { ascending: false })

  // Build daily uptime for calendar (90 days)
  const since90d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { data: calendarChecks } = await supabase
    .from('uptime_checks')
    .select('status_code, checked_at')
    .eq('site_id', id)
    .gte('checked_at', since90d)

  const dayMap = new Map<string, { total: number; up: number }>()
  calendarChecks?.forEach((c) => {
    const day = format(new Date(c.checked_at), 'yyyy-MM-dd')
    const entry = dayMap.get(day) ?? { total: 0, up: 0 }
    entry.total++
    if (c.status_code && c.status_code >= 200 && c.status_code < 400) entry.up++
    dayMap.set(day, entry)
  })
  const calendarDays = Array.from(dayMap.entries()).map(([date, { total, up }]) => ({
    date,
    uptimePercent: total > 0 ? (up / total) * 100 : null,
  }))

  // Latest SSL
  const { data: sslCheck } = await supabase
    .from('ssl_checks')
    .select('*')
    .eq('site_id', id)
    .order('checked_at', { ascending: false })
    .limit(1)
    .single()

  // Latest security scan
  const { data: securityScan } = await supabase
    .from('security_scans')
    .select('*')
    .eq('site_id', id)
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single()

  // Latest performance
  const { data: perfScore } = await supabase
    .from('performance_scores')
    .select('*')
    .eq('site_id', id)
    .order('measured_at', { ascending: false })
    .limit(1)
    .single()

  // Deployments
  const { data: deployments } = await supabase
    .from('deployments')
    .select('*')
    .eq('site_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Supabase health (latest)
  const { data: supabaseHealth } = await supabase
    .from('supabase_health')
    .select('*')
    .eq('site_id', id)
    .order('checked_at', { ascending: false })
    .limit(1)
    .single()

  // Alerts for this site
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('site_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <StatusDot status={(site as Site).status} className="h-3 w-3" />
        <h1 className="text-2xl font-bold text-slate-100">{site.name}</h1>
        <Badge variant={(site as Site).status === 'healthy' ? 'success' : (site as Site).status === 'down' ? 'danger' : 'warning'}>
          {(site as Site).status}
        </Badge>
      </div>
      <p className="text-slate-400">{site.url}</p>

      <SiteDetailTabs
        uptimeChecks={(uptimeChecks ?? []) as UptimeCheck[]}
        calendarDays={calendarDays}
        sslCheck={(sslCheck as SSLCheck) ?? null}
        securityScan={(securityScan as SecurityScan) ?? null}
        perfScore={(perfScore as PerformanceScore) ?? null}
        alerts={(alerts ?? []) as Alert[]}
        deployments={(deployments ?? []) as Deployment[]}
        supabaseHealth={(supabaseHealth as SupabaseHealth) ?? null}
        site={site as Site}
        siteId={id}
      />
    </div>
  )
}
