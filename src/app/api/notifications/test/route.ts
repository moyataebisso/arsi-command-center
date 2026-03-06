import { NextResponse } from 'next/server'
import { sendDiscordMessage } from '@/lib/notifications/discord'
import { sendEmail } from '@/lib/email/sendEmail'
import { alertEmail } from '@/lib/email/templates'

export async function POST() {
  try {
    const results: Record<string, string> = {}

    // Test Discord webhooks
    const webhooks = {
      critical: process.env.DISCORD_WEBHOOK_CRITICAL,
      warnings: process.env.DISCORD_WEBHOOK_WARNINGS,
      deployments: process.env.DISCORD_WEBHOOK_DEPLOYMENTS,
      reports: process.env.DISCORD_WEBHOOK_DAILY_REPORTS,
    }

    for (const [name, url] of Object.entries(webhooks)) {
      if (url) {
        try {
          await sendDiscordMessage(url, {
            title: 'Test Notification',
            description: `This is a test message for the ${name} channel.`,
            color: 'info',
          })
          results[`discord_${name}`] = 'sent'
        } catch {
          results[`discord_${name}`] = 'failed'
        }
      } else {
        results[`discord_${name}`] = 'not configured'
      }
    }

    // Test email
    const email = process.env.ALERT_EMAIL
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: 'Arsi Command Center - Test Notification',
          html: alertEmail({
            title: 'Test Notification',
            message: 'This is a test alert email from the Arsi Command Center.',
            severity: 'info',
          }),
        })
        results.email = 'sent'
      } catch {
        results.email = 'failed'
      }
    } else {
      results.email = 'not configured'
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
