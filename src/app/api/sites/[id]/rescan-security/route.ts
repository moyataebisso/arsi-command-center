import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { scanSecurityHeaders } from '@/lib/monitoring/security'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { data: site, error } = await supabaseAdmin
      .from('sites')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !site) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 })
    }

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

    return NextResponse.json({
      success: true,
      score: result.score,
      headers: result.findings,
      scannedAt,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
