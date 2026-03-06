import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getPageSpeedScore } from '@/lib/monitoring/performance'
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
    if (!sites?.length) return NextResponse.json({ success: true, audited: 0 })

    const results = await Promise.allSettled(
      sites.map(async (site) => {
        const mobile = await getPageSpeedScore(site.url, 'mobile')

        await supabaseAdmin.from('performance_scores').insert({
          site_id: site.id,
          lighthouse_score: mobile.performance_score,
          performance_score: mobile.performance_score,
          accessibility_score: mobile.accessibility_score,
          seo_score: mobile.seo_score,
          best_practices_score: mobile.best_practices_score,
          lcp_ms: mobile.lcp_ms,
          fid_ms: mobile.fid_ms,
          cls: mobile.cls,
          device: 'mobile',
        })

        if (mobile.performance_score < 50) {
          await supabaseAdmin.from('alerts').insert({
            site_id: site.id,
            type: 'performance',
            severity: 'warning',
            title: `Low performance score: ${mobile.performance_score}/100`,
            message: `${site.name} scored ${mobile.performance_score}/100 on mobile performance`,
            status: 'open',
          })
          await routeAlert(
            'warning',
            `Performance: ${site.name}`,
            `Mobile score: ${mobile.performance_score}/100`,
            site.url
          )
        }

        return { site: site.name, score: mobile.performance_score }
      })
    )

    return NextResponse.json({ success: true, audited: sites.length, results: results.map((r) => r.status) })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
