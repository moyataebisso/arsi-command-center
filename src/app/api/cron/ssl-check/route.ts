import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { checkSSL } from '@/lib/monitoring/ssl'
import { routeAlert } from '@/lib/notifications/router'

export async function GET(request: NextRequest) {
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
        const result = await checkSSL(site.url)

        await supabaseAdmin.from('ssl_checks').insert({
          site_id: site.id,
          issuer: result.issuer,
          valid_from: result.valid_from,
          valid_to: result.valid_to,
          days_remaining: result.days_remaining,
          is_valid: result.is_valid,
        })

        if (result.days_remaining !== null && result.days_remaining <= 14) {
          const severity = result.days_remaining <= 7 ? 'critical' : 'warning'
          await supabaseAdmin.from('alerts').insert({
            site_id: site.id,
            type: 'ssl',
            severity,
            title: `SSL expiring in ${result.days_remaining} days`,
            message: `${site.name} SSL certificate expires on ${result.valid_to}`,
            status: 'open',
          })
          await routeAlert(
            severity,
            `SSL expiring: ${site.name}`,
            `Certificate expires in ${result.days_remaining} days`,
            site.url
          )
        }

        if (result.valid_to) {
          await supabaseAdmin.from('sites').update({ ssl_expiry: result.valid_to }).eq('id', site.id)
        }

        return { site: site.name, ...result }
      })
    )

    return NextResponse.json({ success: true, checked: sites.length, results: results.map((r) => r.status) })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
