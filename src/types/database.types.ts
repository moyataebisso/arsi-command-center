export type HostingProvider = 'vercel' | 'cloudflare' | 'netlify' | 'godaddy' | 'wix' | 'other'
export type SiteStatus = 'healthy' | 'degraded' | 'down' | 'unknown'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertStatus = 'open' | 'acknowledged' | 'resolved'
export type AlertType = 'downtime' | 'ssl' | 'security' | 'performance' | 'deployment' | 'database'

export interface Site {
  id: string
  name: string
  url: string
  hosting_provider: HostingProvider
  supabase_project_url?: string
  vercel_project_id?: string
  vercel_team_id?: string
  supabase_project_ref?: string
  github_repo?: string
  ssl_expiry?: string
  domain_expiry?: string
  status: SiteStatus
  created_at: string
  updated_at: string
}

export interface UptimeCheck {
  id: string
  site_id: string
  status_code: number | null
  response_time_ms: number
  error_message: string | null
  checked_at: string
}

export interface SSLCheck {
  id: string
  site_id: string
  issuer: string | null
  valid_from: string | null
  valid_to: string | null
  days_remaining: number | null
  is_valid: boolean
  checked_at: string
}

export interface SecurityScan {
  id: string
  site_id: string
  scan_type: 'headers' | 'dependencies' | 'ports'
  findings_json: SecurityFinding[]
  severity: 'critical' | 'warning' | 'info' | 'pass'
  score: number
  scanned_at: string
}

export interface SecurityFinding {
  header: string
  label: string
  present: boolean
  severity: 'critical' | 'warning' | 'info'
}

export interface PerformanceScore {
  id: string
  site_id: string
  lighthouse_score: number | null
  performance_score: number | null
  accessibility_score: number | null
  seo_score: number | null
  best_practices_score: number | null
  lcp_ms: number | null
  fid_ms: number | null
  cls: number | null
  device: 'mobile' | 'desktop'
  measured_at: string
}

export interface Alert {
  id: string
  site_id: string | null
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  status: AlertStatus
  created_at: string
  acknowledged_at: string | null
  resolved_at: string | null
}

export interface Report {
  id: string
  type: 'daily' | 'weekly'
  data_json: Record<string, unknown>
  sites_summary_json: SiteSummary[]
  incidents_count: number
  generated_at: string
  sent_at: string | null
  sent_to: string[] | null
}

export interface SiteSummary {
  site_id: string
  name: string
  uptime_percent: number
  incident_count: number
  ssl_days_remaining: number | null
  avg_response_time: number
}

export interface NotificationSettings {
  id: string
  email_address: string | null
  discord_webhook_critical: string | null
  discord_webhook_warnings: string | null
  discord_webhook_deployments: string | null
  discord_webhook_reports: string | null
  twilio_phone: string | null
  sms_enabled: boolean
  daily_report_time: string
  weekly_report_day: string
  updated_at: string
}

export interface Integration {
  id: string
  site_id: string
  type: 'supabase' | 'vercel' | 'github'
  credentials_encrypted: string | null
  last_synced_at: string | null
  created_at: string
}

export interface Deployment {
  id: string
  site_id: string
  deployment_id: string | null
  state: 'READY' | 'ERROR' | 'BUILDING' | 'CANCELED' | 'QUEUED'
  url: string | null
  commit_message: string | null
  commit_sha: string | null
  branch: string | null
  created_at: string
  deployed_at: string | null
}

export interface SupabaseHealth {
  id: string
  site_id: string
  db_size_mb: number | null
  active_connections: number | null
  storage_used_mb: number | null
  auth_users_count: number | null
  checked_at: string
}
