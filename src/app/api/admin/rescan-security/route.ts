import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { scanSecurityHeaders } from '@/lib/monitoring/security'

async function handleRescan(request: NextRequest) {
  const urlSecret = request.nextUrl.searchParams.get('secret')
  if (urlSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = request.method === 'POST'
      ? await request.json().catch(() => ({}))
      : {}
    const siteId = (body as { siteId?: string }).siteId
      || request.nextUrl.searchParams.get('siteId')

    let query = supabaseAdmin.from('sites').select('*')
    if (siteId) {
      query = query.eq('id', siteId)
    }
    const { data: sites } = await query

    if (!sites?.length) {
      return NextResponse.json({ success: true, rescanned: 0, message: 'No sites found' })
    }

    const results = await Promise.allSettled(
      sites.map(async (site) => {
        const result = await scanSecurityHeaders(site.url)
        const scannedAt = new Date().toISOString()

        await supabaseAdmin.from('security_scans').insert({
          site_id: site.id,
          scan_type: 'headers',
          findings_json: result.findings,
          severity: result.severity,
          score: result.score,
          scanned_at: scannedAt,
        })

        return {
          site: site.name,
          score: result.score,
          headers: result.findings,
          scannedAt,
        }
      })
    )

    const scores = results.map((r) =>
      r.status === 'fulfilled' ? r.value : { error: String(r.reason) }
    )

    return NextResponse.json({ success: true, rescanned: sites.length, scores })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return handleRescan(request)
}

export async function POST(request: NextRequest) {
  return handleRescan(request)
}
