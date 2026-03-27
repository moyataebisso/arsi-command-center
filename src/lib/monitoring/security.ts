import type { SecurityResult, SecurityHeaderFinding } from '@/types/monitoring'

const SECURITY_HEADERS = [
  { name: 'x-frame-options', weight: 15, label: 'X-Frame-Options' },
  { name: 'x-content-type-options', weight: 15, label: 'X-Content-Type-Options' },
  { name: 'referrer-policy', weight: 15, label: 'Referrer-Policy' },
  { name: 'permissions-policy', weight: 15, label: 'Permissions-Policy' },
  { name: 'strict-transport-security', weight: 15, label: 'HSTS' },
  { name: 'content-security-policy', weight: 25, label: 'CSP' },
]

export async function scanSecurityHeaders(url: string): Promise<SecurityResult> {
  // Use GET — many servers omit security headers on HEAD requests
  const response = await fetch(url, { redirect: 'follow' })
  const headers = response.headers
  let score = 0
  const findings: SecurityHeaderFinding[] = SECURITY_HEADERS.map((h) => {
    const present = !!headers.get(h.name)
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
