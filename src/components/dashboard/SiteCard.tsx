import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { StatusDot } from '@/components/shared/StatusDot'
import { ArrowRight } from 'lucide-react'
import type { Site } from '@/types/database.types'

interface SiteCardProps {
  site: Site
  uptimePercent?: number
  responseTime?: number
  sslDaysRemaining?: number | null
  securityScore?: number | null
}

export function SiteCard({
  site,
  uptimePercent,
  responseTime,
  sslDaysRemaining,
  securityScore,
}: SiteCardProps) {
  return (
    <Card className="p-5 transition-colors hover:bg-[#263348]">
      <div className="mb-3 flex items-center gap-2">
        <StatusDot status={site.status} />
        <h3 className="font-semibold text-slate-100">{site.name}</h3>
      </div>
      <p className="mb-3 text-sm text-slate-400">{new URL(site.url).hostname}</p>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Uptime (30d)</span>
          <span className="text-slate-200">{uptimePercent !== undefined ? `${uptimePercent}%` : '--'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Response</span>
          <span className="text-slate-200">{responseTime !== undefined ? `${responseTime}ms` : '--'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">SSL</span>
          <span className={sslDaysRemaining !== null && sslDaysRemaining !== undefined && sslDaysRemaining <= 14 ? 'text-yellow-400' : 'text-slate-200'}>
            {sslDaysRemaining !== null && sslDaysRemaining !== undefined ? `${sslDaysRemaining} days` : '--'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Security</span>
          <span className="text-slate-200">{securityScore !== null && securityScore !== undefined ? `${securityScore}/100` : '--'}</span>
        </div>
      </div>
      <Link
        href={`/sites/${site.id}`}
        className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300"
      >
        View Details <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  )
}
