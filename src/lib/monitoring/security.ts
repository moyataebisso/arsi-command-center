import type { SecurityResult, SecurityHeaderFinding } from '@/types/monitoring'

const SECURITY_HEADERS = [
  { name: 'strict-transport-security', weight: 20, label: 'HSTS' },
  { name: 'content-security-policy', weight: 25, label: 'CSP' },
  { name: 'x-frame-options', weight: 15, label: 'X-Frame-Options' },
  { name: 'x-content-type-options', weight: 15, label: 'X-Content-Type-Options' },
  { name: 'referrer-policy', weight: 15, label: 'Referrer-Policy' },
  { name: 'permissions-policy', weight: 10, label: 'Permissions-Policy' },
]

export async function scanSecurityHeaders(url: string): Promise<SecurityResult> {
  const response = await fetch(url, { method: 'HEAD' })
  const headers = response.headers
  let score = 0
  const findings: SecurityHeaderFinding[] = SECURITY_HEADERS.map((h) => {
    const present = headers.has(h.name)
    if (present) score += h.weight
    return {
      header: h.name,
      label: h.label,
      present,
      severity: present ? ('info' as const) : ('warning' as const),
    }
  })
  return {
    score,
    findings,
    severity: score < 60 ? 'warning' : 'pass',
  }
}
