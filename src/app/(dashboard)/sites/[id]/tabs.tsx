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
import { ExternalLink } from 'lucide-react'
import type { UptimeCheck, SSLCheck, SecurityScan, PerformanceScore, Alert, Deployment, SupabaseHealth, Site } from '@/types/database.types'

interface SiteDetailTabsProps {
  uptimeChecks: UptimeCheck[]
  calendarDays: { date: string; uptimePercent: number | null }[]
  sslCheck: SSLCheck | null
  securityScan: SecurityScan | null
  perfScore: PerformanceScore | null
  alerts: Alert[]
  deployments: Deployment[]
  supabaseHealth: SupabaseHealth | null
  site: Site
  siteId: string
}

function DeploymentStateBadge({ state }: { state: string }) {
  const colors: Record<string, string> = {
    READY: 'bg-green-500/10 text-green-400 border-green-500/20',
    ERROR: 'bg-red-500/10 text-red-400 border-red-500/20',
    BUILDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    QUEUED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    CANCELED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors[state] ?? colors.QUEUED}`}>
      {state}
    </span>
  )
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min((value / max) * 100, 100)
  const color = pct < 60 ? 'bg-green-500' : pct < 80 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value} / {max}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function SiteDetailTabs({
  uptimeChecks,
  calendarDays,
  sslCheck,
  securityScan,
  perfScore,
  alerts,
  deployments,
  supabaseHealth,
  site,
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
        <TabsTrigger value="deployments">Deployments</TabsTrigger>
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

        {/* Database Health */}
        {site.supabase_project_ref ? (
          supabaseHealth ? (
            <Card>
              <CardHeader><CardTitle>Database Health</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <ProgressBar
                    value={supabaseHealth.db_size_mb ?? 0}
                    max={500}
                    label={`DB Size: ${supabaseHealth.db_size_mb ?? 0}MB / 500MB`}
                  />
                  <ProgressBar
                    value={supabaseHealth.active_connections ?? 0}
                    max={20}
                    label={`Connections: ${supabaseHealth.active_connections ?? 0} / 20`}
                  />
                  <div className="rounded-lg border border-slate-700 p-3">
                    <p className="text-sm text-slate-400">Storage</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {supabaseHealth.storage_used_mb != null ? `${supabaseHealth.storage_used_mb}MB` : 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500">used</p>
                  </div>
                  <div className="rounded-lg border border-slate-700 p-3">
                    <p className="text-sm text-slate-400">Auth Users</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {supabaseHealth.auth_users_count ?? 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500">registered users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle>Database Health</CardTitle></CardHeader>
              <CardContent>
                <p className="text-slate-400">No health data yet. Data will appear after the next scheduled check.</p>
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardHeader><CardTitle>Database Health</CardTitle></CardHeader>
            <CardContent>
              <p className="text-slate-400">Add your Supabase Project Ref in Settings to see database health</p>
            </CardContent>
          </Card>
        )}
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
      <TabsContent value="deployments" className="mt-4">
        <Card>
          <CardHeader><CardTitle>Deployments</CardTitle></CardHeader>
          <CardContent>
            {!site.vercel_project_id ? (
              <p className="text-slate-400">Add your Vercel Project ID in Settings to see deployment history</p>
            ) : deployments.length === 0 ? (
              <p className="text-slate-400">No deployments found yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>Commit</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deployments.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell><DeploymentStateBadge state={dep.state} /></TableCell>
                      <TableCell className="max-w-[300px] truncate text-slate-300">
                        {dep.commit_message
                          ? dep.commit_message.length > 60
                            ? dep.commit_message.slice(0, 60) + '...'
                            : dep.commit_message
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {dep.branch ? <Badge>{dep.branch}</Badge> : '-'}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {formatRelativeTime(dep.created_at)}
                      </TableCell>
                      <TableCell>
                        {dep.url ? (
                          <a href={dep.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-200">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : '-'}
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
