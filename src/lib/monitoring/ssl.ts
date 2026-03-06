import type { SSLResult } from '@/types/monitoring'

export async function checkSSL(url: string): Promise<SSLResult> {
  try {
    const hostname = new URL(url).hostname
    const apiUrl = `https://ssl-checker.io/api/v1/check/${hostname}`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      return { issuer: null, valid_from: null, valid_to: null, days_remaining: null, is_valid: false }
    }

    const data = await response.json()
    const validTo = data.result?.valid_till ? new Date(data.result.valid_till) : null
    const validFrom = data.result?.valid_from ? new Date(data.result.valid_from) : null
    const daysRemaining = validTo
      ? Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    return {
      issuer: data.result?.issuer ?? null,
      valid_from: validFrom?.toISOString() ?? null,
      valid_to: validTo?.toISOString() ?? null,
      days_remaining: daysRemaining,
      is_valid: data.result?.valid === true || (daysRemaining !== null && daysRemaining > 0),
    }
  } catch {
    return { issuer: null, valid_from: null, valid_to: null, days_remaining: null, is_valid: false }
  }
}
