import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSupabaseHealth } from '@/lib/monitoring/supabase-health'
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
    const { data: sites } = await supabaseAdmin
      .from('sites')
      .select('*')
      .not('supabase_project_ref', 'is', null)

    if (!sites?.length) return NextResponse.json({ success: true, checked: 0 })

    const results = await Promise.allSettled(
      sites.map(async (site) => {
        const { data: integration } = await supabaseAdmin
          .from('integrations')
          .select('*')
          .eq('site_id', site.id)
          .eq('type', 'supabase')
          .single()

        if (!integration?.credentials_encrypted) {
          console.warn(`No Supabase credentials for site ${site.name}`)
          return { site: site.name, skipped: true }
        }

        let credentials: { url: string; service_role_key: string }
        try {
          credentials = JSON.parse(integration.credentials_encrypted)
        } catch {
          console.error(`Invalid credentials JSON for site ${site.name}`)
          return { site: site.name, skipped: true }
        }

        const health = await getSupabaseHealth(
          site.supabase_project_ref,
          credentials.url,
          credentials.service_role_key
        )

        if (!health) return { site: site.name, error: true }

        await supabaseAdmin.from('supabase_health').insert({
          site_id: site.id,
          db_size_mb: health.db_size_mb,
          active_connections: health.active_connections,
          storage_used_mb: health.storage_used_mb,
          auth_users_count: health.auth_users_count,
        })

        if (health.db_size_mb && health.db_size_mb > 400) {
          const { data: existing } = await supabaseAdmin
            .from('alerts')
            .select('id')
            .eq('site_id', site.id)
            .eq('type', 'database')
            .eq('status', 'open')
            .ilike('title', '%approaching limit%')
            .single()

          if (!existing) {
            await supabaseAdmin.from('alerts').insert({
              site_id: site.id,
              type: 'database',
              severity: 'warning',
              title: `${site.name} database approaching limit`,
              message: `Database size is ${health.db_size_mb}MB / 500MB`,
              status: 'open',
            })
            await routeAlert(
              'warning',
              `${site.name} database approaching limit`,
              `Database size is ${health.db_size_mb}MB / 500MB`,
              site.url
            )
          }
        }

        if (health.active_connections && health.active_connections > 18) {
          const { data: existing } = await supabaseAdmin
            .from('alerts')
            .select('id')
            .eq('site_id', site.id)
            .eq('type', 'database')
            .eq('status', 'open')
            .ilike('title', '%connections%')
            .single()

          if (!existing) {
            await supabaseAdmin.from('alerts').insert({
              site_id: site.id,
              type: 'database',
              severity: 'warning',
              title: `${site.name} high database connections`,
              message: `Active connections: ${health.active_connections} / 20`,
              status: 'open',
            })
            await routeAlert(
              'warning',
              `${site.name} high database connections`,
              `Active connections: ${health.active_connections} / 20`,
              site.url
            )
          }
        }

        return { site: site.name, health }
      })
    )

    return NextResponse.json({ success: true, checked: sites.length })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
