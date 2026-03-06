import { Badge } from '@/components/ui/badge'
import type { AlertSeverity } from '@/types/database.types'

const variantMap: Record<AlertSeverity, 'danger' | 'warning' | 'info'> = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return <Badge variant={variantMap[severity]}>{severity}</Badge>
}
