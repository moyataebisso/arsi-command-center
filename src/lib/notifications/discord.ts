const COLORS = {
  critical: 0xff0000,
  warning: 0xffa500,
  info: 0x00ff00,
  resolved: 0x00cc44,
}

export async function sendDiscordMessage(
  webhookUrl: string,
  params: {
    title: string
    description: string
    color: keyof typeof COLORS
    fields?: { name: string; value: string; inline?: boolean }[]
  }
) {
  if (!webhookUrl) return
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: params.title,
          description: params.description,
          color: COLORS[params.color],
          fields: params.fields ?? [],
          timestamp: new Date().toISOString(),
          footer: { text: 'Arsi Command Center' },
        },
      ],
    }),
  })
}
