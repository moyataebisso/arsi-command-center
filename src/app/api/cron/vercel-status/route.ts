import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getVercelDeployments } from '@/lib/monitoring/vercel'
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
    const token = process.env.VERCEL_API_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'VERCEL_API_TOKEN not configured' }, { status: 500 })
    }

    const { data: sites } = await supabaseAdmin
      .from('sites')
      .select('*')
      .not('vercel_project_id', 'is', null)

    if (!sites?.length) return NextResponse.json({ success: true, checked: 0 })

    const results = await Promise.allSettled(
      sites.map(async (site) => {
        const deployments = await getVercelDeployments(
          site.vercel_project_id,
          site.vercel_team_id ?? null,
          token
        )

        for (const dep of deployments) {
          await supabaseAdmin.from('deployments').upsert(
            {
              site_id: site.id,
              deployment_id: dep.deployment_id,
              state: dep.state,
              url: dep.url,
              commit_message: dep.commit_message,
              commit_sha: dep.commit_sha,
              branch: dep.branch,
              deployed_at: dep.deployed_at,
            },
            { onConflict: 'deployment_id' }
          )
        }

        if (deployments.length > 0) {
          const latest = deployments[0]

          const { data: openAlert } = await supabaseAdmin
            .from('alerts')
            .select('id')
            .eq('site_id', site.id)
            .eq('type', 'deployment')
            .eq('status', 'open')
            .single()

          if (latest.state === 'ERROR' && !openAlert) {
            await supabaseAdmin.from('alerts').insert({
              site_id: site.id,
              type: 'deployment',
              severity: 'warning',
              title: `${site.name} deployment failed`,
              message: latest.commit_message || 'Deployment failed',
              status: 'open',
            })
            await routeAlert(
              'warning',
              `${site.name} deployment failed`,
              latest.commit_message || 'Deployment failed',
              site.url
            )
          }

          if (latest.state === 'READY' && openAlert) {
            await supabaseAdmin
              .from('alerts')
              .update({ status: 'resolved', resolved_at: new Date().toISOString() })
              .eq('id', openAlert.id)
            await routeAlert(
              'resolved',
              `${site.name} deployment recovered`,
              'Latest deployment is now ready',
              site.url
            )
          }
        }

        return { site: site.name, deployments: deployments.length }
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
