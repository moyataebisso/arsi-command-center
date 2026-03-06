'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatRelativeTime } from '@/lib/utils'
import { Bell } from 'lucide-react'
import type { Alert, AlertSeverity, AlertStatus, Site } from '@/types/database.types'

interface AlertWithSite extends Alert {
  sites: Pick<Site, 'name' | 'url'> | null
}

export function AlertsTable({
  alerts,
  sites,
}: {
  alerts: AlertWithSite[]
  sites: Pick<Site, 'id' | 'name'>[]
}) {
  const [severity, setSeverity] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [siteId, setSiteId] = useState<string>('all')

  const filtered = alerts.filter((a) => {
    if (severity !== 'all' && a.severity !== severity) return false
    if (status !== 'all' && a.status !== status) return false
    if (siteId !== 'all' && a.site_id !== siteId) return false
    return true
  })

  async function handleAction(alertId: string, action: 'acknowledge' | 'resolve') {
    await fetch(`/api/alerts/${alertId}/${action}`, { method: 'POST' })
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-40">
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </Select>
        <Select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="w-48">
          <option value="all">All Sites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="No alerts" description="No alerts match your filters." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell><SeverityBadge severity={alert.severity} /></TableCell>
                <TableCell className="text-slate-300">{alert.sites?.name ?? '--'}</TableCell>
                <TableCell><Badge>{alert.type}</Badge></TableCell>
                <TableCell className="max-w-xs truncate">{alert.title}</TableCell>
                <TableCell className="text-slate-400 whitespace-nowrap">{formatRelativeTime(alert.created_at)}</TableCell>
                <TableCell>
                  <Badge variant={alert.status === 'resolved' ? 'success' : alert.status === 'acknowledged' ? 'warning' : 'danger'}>
                    {alert.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {alert.status === 'open' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAction(alert.id, 'acknowledge')}>Ack</Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(alert.id, 'resolve')}>Resolve</Button>
                    </div>
                  )}
                  {alert.status === 'acknowledged' && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(alert.id, 'resolve')}>Resolve</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
