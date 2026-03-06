import type { AlertSeverity, AlertStatus, AlertType } from './database.types'

export interface AlertFilter {
  severity?: AlertSeverity
  status?: AlertStatus
  type?: AlertType
  site_id?: string
}

export interface AlertAction {
  type: 'acknowledge' | 'resolve'
  alert_id: string
}
