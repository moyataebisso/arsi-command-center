'use client'

import { useState } from 'react'
import { SiteCard } from './SiteCard'
import type { Site, SiteStatus } from '@/types/database.types'

interface SiteWithMetrics {
  site: Site
  uptimePercent?: number
  responseTime?: number
  sslDaysRemaining?: number | null
  securityScore?: number | null
}

type FilterTab = 'all' | 'healthy' | 'issues' | 'vercel' | 'godaddy'

export function SiteGrid({ sites }: { sites: SiteWithMetrics[] }) {
  const [filter, setFilter] = useState<FilterTab>('all')

  const filtered = sites.filter((s) => {
    switch (filter) {
      case 'healthy':
        return s.site.status === 'healthy'
      case 'issues':
        return s.site.status === 'degraded' || s.site.status === 'down'
      case 'vercel':
        return s.site.hosting_provider === 'vercel'
      case 'godaddy':
        return s.site.hosting_provider === 'godaddy'
      default:
        return true
    }
  })

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'healthy', label: 'Healthy' },
    { key: 'issues', label: 'Issues' },
    { key: 'vercel', label: 'Vercel' },
    { key: 'godaddy', label: 'GoDaddy' },
  ]

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-lg bg-slate-900 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <SiteCard key={s.site.id} {...s} />
        ))}
      </div>
    </div>
  )
}
