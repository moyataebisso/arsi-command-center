import type { PerformanceResult } from '@/types/monitoring'

export async function getPageSpeedScore(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<PerformanceResult> {
  const apiKey = process.env.PAGESPEED_API_KEY
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}${apiKey ? `&key=${apiKey}` : ''}`

  const response = await fetch(apiUrl)
  if (!response.ok) throw new Error(`PageSpeed API error: ${response.status}`)
  const data = await response.json()

  const cats = data.lighthouseResult?.categories
  const audits = data.lighthouseResult?.audits

  return {
    performance_score: Math.round((cats?.performance?.score ?? 0) * 100),
    accessibility_score: Math.round((cats?.accessibility?.score ?? 0) * 100),
    seo_score: Math.round((cats?.seo?.score ?? 0) * 100),
    best_practices_score: Math.round((cats?.['best-practices']?.score ?? 0) * 100),
    lcp_ms: Math.round(audits?.['largest-contentful-paint']?.numericValue ?? 0),
    fid_ms: Math.round(audits?.['max-potential-fid']?.numericValue ?? 0),
    cls: audits?.['cumulative-layout-shift']?.numericValue ?? 0,
  }
}
