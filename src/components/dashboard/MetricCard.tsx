import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export function MetricCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string
  value: string
  icon: LucideIcon
  className?: string
}) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-100">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-slate-600" />
      </div>
    </Card>
  )
}
