import { sendDiscordMessage } from './discord'
import type { AlertSeverity } from '@/types/database.types'

export async function routeAlert(
  severity: AlertSeverity | 'resolved',
  title: string,
  description: string,
  siteUrl?: string
) {
  const fields = siteUrl ? [{ name: 'Site', value: siteUrl, inline: true }] : []

  if (severity === 'critical') {
    const webhook = process.env.DISCORD_WEBHOOK_CRITICAL
    if (webhook) {
      await sendDiscordMessage(webhook, { title, description, color: 'critical', fields })
    }
  } else if (severity === 'warning') {
    const webhook = process.env.DISCORD_WEBHOOK_WARNINGS
    if (webhook) {
      await sendDiscordMessage(webhook, { title, description, color: 'warning', fields })
    }
  } else if (severity === 'resolved') {
    const webhook = process.env.DISCORD_WEBHOOK_CRITICAL
    if (webhook) {
      await sendDiscordMessage(webhook, { title, description, color: 'resolved', fields })
    }
  } else {
    const webhook = process.env.DISCORD_WEBHOOK_WARNINGS
    if (webhook) {
      await sendDiscordMessage(webhook, { title, description, color: 'info', fields })
    }
  }
}
