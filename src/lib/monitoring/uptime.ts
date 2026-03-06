import type { UptimeResult } from '@/types/monitoring'

export async function checkSiteUptime(url: string): Promise<UptimeResult> {
  const start = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers: { 'User-Agent': 'ArsiCommandCenter/1.0 UptimeMonitor' },
    })
    clearTimeout(timeout)
    const response_time_ms = Date.now() - start
    const is_up = response.status >= 200 && response.status < 400

    return {
      status_code: response.status,
      response_time_ms,
      error_message: is_up ? null : `HTTP ${response.status}`,
      is_up,
    }
  } catch (error) {
    clearTimeout(timeout)
    const response_time_ms = Date.now() - start
    const error_message = controller.signal.aborted ? 'Timeout after 10s' : String(error)

    return {
      status_code: null,
      response_time_ms,
      error_message,
      is_up: false,
    }
  }
}
