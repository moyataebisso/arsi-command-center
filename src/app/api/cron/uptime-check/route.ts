import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { checkSiteUptime } from '@/lib/monitoring/uptime'
import { routeAlert } from '@/lib/notifications/router'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const urlSecret = request.nextUrl.searchParams.get('secret')
  const isValid =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    urlSecret === process.env.CRON_SECRET

  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: sites } = await supabaseAdmin.from('sites').select('*')
    if (!sites?.length) return NextResponse.json({ success: true, checked: 0 })

    const results = await Promise.allSettled(
      sites.map(async (site) => {
        const result = await checkSiteUptime(site.url)

        await supabaseAdmin.from('uptime_checks').insert({
          site_id: site.id,
          status_code: result.status_code,
          response_time_ms: result.response_time_ms,
          error_message: result.error_message,
        })

        const { data: openAlert } = await supabaseAdmin
          .from('alerts')
          .select('id')
          .eq('site_id', site.id)
          .eq('type', 'downtime')
          .eq('status', 'open')
          .single()

        if (!result.is_up && !openAlert) {
          await supabaseAdmin.from('alerts').insert({
            site_id: site.id,
            type: 'downtime',
            severity: 'critical',
            title: `${site.name} is DOWN`,
            message: result.error_message ?? `Returned status ${result.status_code}`,
            status: 'open',
          })
          await routeAlert('critical', `${site.name} is DOWN`, result.error_message ?? 'Site unreachable', site.url)
        }

        if (result.is_up && openAlert) {
          await supabaseAdmin
            .from('alerts')
            .update({ status: 'resolved', resolved_at: new Date().toISOString() })
            .eq('id', openAlert.id)
          await routeAlert('resolved', `${site.name} RECOVERED`, 'Site is back online', site.url)
        }

        const newStatus = result.is_up
          ? result.response_time_ms > 3000
            ? 'degraded'
            : 'healthy'
          : 'down'
        await supabaseAdmin.from('sites').update({ status: newStatus }).eq('id', site.id)

        return { site: site.name, ...result }
      })
    )

    return NextResponse.json({ success: true, checked: sites.length, results: results.map((r) => r.status) })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
