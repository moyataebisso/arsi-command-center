export interface UptimeResult {
  status_code: number | null
  response_time_ms: number
  error_message: string | null
  is_up: boolean
}

export interface SSLResult {
  issuer: string | null
  valid_from: string | null
  valid_to: string | null
  days_remaining: number | null
  is_valid: boolean
}

export interface SecurityResult {
  score: number
  findings: SecurityHeaderFinding[]
  severity: 'critical' | 'warning' | 'info' | 'pass'
}

export interface SecurityHeaderFinding {
  header: string
  label: string
  present: boolean
  severity: 'critical' | 'warning' | 'info'
}

export interface PerformanceResult {
  performance_score: number
  accessibility_score: number
  seo_score: number
  best_practices_score: number
  lcp_ms: number
  fid_ms: number
  cls: number
}
