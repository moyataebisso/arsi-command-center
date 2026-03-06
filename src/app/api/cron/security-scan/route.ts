import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { scanSecurityHeaders } from '@/lib/monitoring/security'
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
    if (!sites?.length) return NextResponse.json({ success: true, scanned: 0 })

    const results = await Promise.allSettled(
      sites.map(async (site) => {
        const result = await scanSecurityHeaders(site.url)

        await supabaseAdmin.from('security_scans').insert({
          site_id: site.id,
          scan_type: 'headers',
          findings_json: result.findings,
          severity: result.severity,
          score: result.score,
        })

        if (result.score < 50) {
          await supabaseAdmin.from('alerts').insert({
            site_id: site.id,
            type: 'security',
            severity: 'warning',
            title: `Low security score: ${result.score}/100`,
            message: `${site.name} scored ${result.score}/100 on security headers scan`,
            status: 'open',
          })
          await routeAlert(
            'warning',
            `Security: ${site.name}`,
            `Scored ${result.score}/100 on security headers`,
            site.url
          )
        }

        return { site: site.name, score: result.score }
      })
    )

    return NextResponse.json({ success: true, scanned: sites.length, results: results.map((r) => r.status) })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
