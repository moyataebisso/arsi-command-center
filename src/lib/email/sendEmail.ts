import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}) {
  const from = process.env.RESEND_FROM_EMAIL ?? 'alerts@arsitechgroup.com'
  const { data, error } = await getResend().emails.send({
    from: `Arsi Command Center <${from}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
  })
  if (error) throw new Error(error.message)
  return data
}
