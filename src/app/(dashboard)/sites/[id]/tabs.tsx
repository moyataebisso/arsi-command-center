'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { ResponseTimeChart } from '@/components/dashboard/ResponseTimeChart'
import { UptimeCalendar } from '@/components/dashboard/UptimeCalendar'
import { SSLPanel } from '@/components/dashboard/SSLPanel'
import { SecurityPanel } from '@/components/dashboard/SecurityPanel'
import { PerformancePanel } from '@/components/dashboard/PerformancePanel'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRelativeTime } from '@/lib/utils'
import type { UptimeCheck, SSLCheck, SecurityScan, PerformanceScore, Alert } from '@/types/database.types'

interface SiteDetailTabsProps {
  uptimeChecks: UptimeCheck[]
  calendarDays: { date: string; uptimePercent: number | null }[]
  sslCheck: SSLCheck | null
  securityScan: SecurityScan | null
  perfScore: PerformanceScore | null
  alerts: Alert[]
  siteId: string
}

export function SiteDetailTabs({
  uptimeChecks,
  calendarDays,
  sslCheck,
  securityScan,
  perfScore,
  alerts,
  siteId,
}: SiteDetailTabsProps) {
  async function handleAlertAction(alertId: string, action: 'acknowledge' | 'resolve') {
    await fetch(`/api/alerts/${alertId}/${action}`, { method: 'POST' })
    window.location.reload()
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4 space-y-6">
        <Card>
          <CardHeader><CardTitle>Response Time</CardTitle></CardHeader>
          <CardContent>
            <ResponseTimeChart checks={uptimeChecks} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Uptime (90 days)</CardTitle></CardHeader>
          <CardContent>
            <UptimeCalendar days={calendarDays} />
          </CardContent>
        </Card>
        <SSLPanel check={sslCheck} />
      </TabsContent>

      <TabsContent value="performance" className="mt-4">
        <PerformancePanel score={perfScore} />
      </TabsContent>

      <TabsContent value="security" className="mt-4">
        <SecurityPanel scan={securityScan} />
      </TabsContent>

      <TabsContent value="alerts" className="mt-4">
        <Card>
          <CardHeader><CardTitle>Alerts</CardTitle></CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-slate-400">No alerts for this site.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell><SeverityBadge severity={alert.severity} /></TableCell>
                      <TableCell>{alert.title}</TableCell>
                      <TableCell className="text-slate-400">{formatRelativeTime(alert.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={alert.status === 'resolved' ? 'success' : alert.status === 'acknowledged' ? 'warning' : 'danger'}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {alert.status === 'open' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleAlertAction(alert.id, 'acknowledge')}>
                              Ack
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAlertAction(alert.id, 'resolve')}>
                              Resolve
                            </Button>
                          </div>
                        )}
                        {alert.status === 'acknowledged' && (
                          <Button size="sm" variant="outline" onClick={() => handleAlertAction(alert.id, 'resolve')}>
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
