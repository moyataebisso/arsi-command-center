import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { compileDailyReport } from '@/lib/reports/compiler'
import { sendEmail } from '@/lib/email/sendEmail'
import { dailyReportEmail } from '@/lib/email/templates'
import { sendDiscordMessage } from '@/lib/notifications/discord'
import { format } from 'date-fns'

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
    const report = await compileDailyReport()
    const dateStr = format(new Date(), 'MMMM d, yyyy')

    const { data: saved } = await supabaseAdmin
      .from('reports')
      .insert({
        type: 'daily',
        data_json: report,
        sites_summary_json: report.summaries,
        incidents_count: report.incidentCount,
      })
      .select('id')
      .single()

    const sentTo: string[] = []

    // Send email
    const alertEmail = process.env.ALERT_EMAIL
    if (alertEmail) {
      await sendEmail({
        to: alertEmail,
        subject: `Daily Report - ${dateStr}`,
        html: dailyReportEmail({
          date: dateStr,
          totalSites: report.totalSites,
          incidentCount: report.incidentCount,
          summaries: report.summaries,
        }),
      })
      sentTo.push(alertEmail)
    }

    // Send Discord summary
    const discordWebhook = process.env.DISCORD_WEBHOOK_DAILY_REPORTS
    if (discordWebhook) {
      const fields = report.summaries.map((s) => ({
        name: s.name,
        value: `Uptime: ${s.uptime_percent}% | Avg: ${s.avg_response_time}ms | Incidents: ${s.incident_count}`,
        inline: false,
      }))
      await sendDiscordMessage(discordWebhook, {
        title: `Daily Report - ${dateStr}`,
        description: `${report.totalSites} sites | ${report.incidentCount} incidents`,
        color: report.incidentCount > 0 ? 'warning' : 'info',
        fields,
      })
      sentTo.push('discord')
    }

    if (saved?.id) {
      await supabaseAdmin
        .from('reports')
        .update({ sent_at: new Date().toISOString(), sent_to: sentTo })
        .eq('id', saved.id)
    }

    return NextResponse.json({ success: true, report: { totalSites: report.totalSites, incidents: report.incidentCount } })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
