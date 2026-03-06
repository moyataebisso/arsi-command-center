import { cn } from '@/lib/utils'
import type { SiteStatus } from '@/types/database.types'

const statusColors: Record<SiteStatus, string> = {
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500',
  unknown: 'bg-slate-400',
}

export function StatusDot({ status, className }: { status: SiteStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full',
        statusColors[status],
        status === 'down' && 'animate-pulse',
        className
      )}
    />
  )
}
