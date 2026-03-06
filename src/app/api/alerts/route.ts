import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')
    const siteId = searchParams.get('site_id')

    let query = supabaseAdmin
      .from('alerts')
      .select('*, sites(name, url)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (severity) query = query.eq('severity', severity)
    if (status) query = query.eq('status', status)
    if (siteId) query = query.eq('site_id', siteId)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
