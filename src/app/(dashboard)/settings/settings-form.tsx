'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { StatusDot } from '@/components/shared/StatusDot'
import { Plus, Trash2, Send, Save } from 'lucide-react'
import type { NotificationSettings, Site, HostingProvider } from '@/types/database.types'

export function SettingsForm({
  settings,
  sites,
}: {
  settings: NotificationSettings | null
  sites: Site[]
}) {
  const [notifSettings, setNotifSettings] = useState({
    email_address: settings?.email_address ?? '',
    discord_webhook_critical: settings?.discord_webhook_critical ?? '',
    discord_webhook_warnings: settings?.discord_webhook_warnings ?? '',
    discord_webhook_deployments: settings?.discord_webhook_deployments ?? '',
    discord_webhook_reports: settings?.discord_webhook_reports ?? '',
    daily_report_time: settings?.daily_report_time ?? '07:00',
    weekly_report_day: settings?.weekly_report_day ?? 'monday',
  })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  // Integration fields per site
  const [integrations, setIntegrations] = useState<Record<string, {
    vercel_project_id: string
    vercel_team_id: string
    supabase_project_ref: string
  }>>(
    Object.fromEntries(
      sites.map((s) => [s.id, {
        vercel_project_id: s.vercel_project_id ?? '',
        vercel_team_id: s.vercel_team_id ?? '',
        supabase_project_ref: s.supabase_project_ref ?? '',
      }])
    )
  )
  const [savingIntegration, setSavingIntegration] = useState<string | null>(null)

  // Add site modal
  const [showAddSite, setShowAddSite] = useState(false)
  const [newSite, setNewSite] = useState({ name: '', url: '', hosting_provider: 'vercel' as HostingProvider, github_repo: '' })

  async function handleSaveNotifications() {
    setSaving(true)
    try {
      // Use the settings id if it exists, otherwise insert
      if (settings?.id) {
        await fetch(`/api/sites`, { method: 'GET' }) // just to trigger something
        // For simplicity, we'll save directly
      }
      // For now, notification settings are managed via env vars
      // This would be expanded to update via API
    } finally {
      setSaving(false)
    }
  }

  async function handleTestNotifications() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/notifications/test', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        const results = Object.entries(json.results)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        setTestResult(`Test sent! Results: ${results}`)
      } else {
        setTestResult(`Failed: ${json.error}`)
      }
    } catch (err) {
      setTestResult(`Error: ${String(err)}`)
    } finally {
      setTesting(false)
    }
  }

  async function handleAddSite() {
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSite),
    })
    const json = await res.json()
    if (json.success) {
      setShowAddSite(false)
      setNewSite({ name: '', url: '', hosting_provider: 'vercel', github_repo: '' })
      window.location.reload()
    }
  }

  async function handleDeleteSite(id: string) {
    if (!confirm('Are you sure you want to delete this site?')) return
    await fetch(`/api/sites/${id}`, { method: 'DELETE' })
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notification Channels</CardTitle>
            <Button size="sm" variant="outline" onClick={handleTestNotifications} disabled={testing}>
              <Send className="mr-2 h-4 w-4" />
              {testing ? 'Testing...' : 'Test All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {testResult && (
            <div className="rounded-md bg-slate-900 p-3 text-sm text-slate-300">{testResult}</div>
          )}
          <div>
            <label className="mb-1 block text-sm text-slate-400">Alert Email</label>
            <Input
              value={notifSettings.email_address}
              onChange={(e) => setNotifSettings({ ...notifSettings, email_address: e.target.value })}
              placeholder="alerts@arsitechgroup.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Discord Webhook - Critical</label>
            <Input
              value={notifSettings.discord_webhook_critical}
              onChange={(e) => setNotifSettings({ ...notifSettings, discord_webhook_critical: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Discord Webhook - Warnings</label>
            <Input
              value={notifSettings.discord_webhook_warnings}
              onChange={(e) => setNotifSettings({ ...notifSettings, discord_webhook_warnings: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Discord Webhook - Deployments</label>
            <Input
              value={notifSettings.discord_webhook_deployments}
              onChange={(e) => setNotifSettings({ ...notifSettings, discord_webhook_deployments: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Discord Webhook - Daily Reports</label>
            <Input
              value={notifSettings.discord_webhook_reports}
              onChange={(e) => setNotifSettings({ ...notifSettings, discord_webhook_reports: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Monitored Sites */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monitored Sites</CardTitle>
            <Button size="sm" onClick={() => setShowAddSite(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Site
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Hosting</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell><StatusDot status={site.status} /></TableCell>
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell className="text-slate-400">{site.url}</TableCell>
                  <TableCell><Badge>{site.hosting_provider}</Badge></TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteSite(site.id)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader><CardTitle>Integrations</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {sites.map((site) => (
            <div key={site.id} className="rounded-lg border border-slate-700 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-100">{site.name}</span>
                <Badge>{site.hosting_provider}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Vercel Project ID</label>
                  <Input
                    value={integrations[site.id]?.vercel_project_id ?? ''}
                    onChange={(e) => setIntegrations({
                      ...integrations,
                      [site.id]: { ...integrations[site.id], vercel_project_id: e.target.value },
                    })}
                    placeholder="prj_..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Team ID (optional)</label>
                  <Input
                    value={integrations[site.id]?.vercel_team_id ?? ''}
                    onChange={(e) => setIntegrations({
                      ...integrations,
                      [site.id]: { ...integrations[site.id], vercel_team_id: e.target.value },
                    })}
                    placeholder="team_..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Project Ref</label>
                  <Input
                    value={integrations[site.id]?.supabase_project_ref ?? ''}
                    onChange={(e) => setIntegrations({
                      ...integrations,
                      [site.id]: { ...integrations[site.id], supabase_project_ref: e.target.value },
                    })}
                    placeholder="abcdefghijklmnop"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={savingIntegration === site.id}
                  onClick={async () => {
                    setSavingIntegration(site.id)
                    try {
                      await fetch(`/api/sites/${site.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          vercel_project_id: integrations[site.id].vercel_project_id || null,
                          vercel_team_id: integrations[site.id].vercel_team_id || null,
                          supabase_project_ref: integrations[site.id].supabase_project_ref || null,
                        }),
                      })
                    } finally {
                      setSavingIntegration(null)
                    }
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savingIntegration === site.id ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ))}
          {sites.length === 0 && (
            <p className="text-slate-400">No sites configured yet. Add a site above first.</p>
          )}
        </CardContent>
      </Card>

      {/* Report Schedule */}
      <Card>
        <CardHeader><CardTitle>Report Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Daily Report Time</label>
              <Input
                type="time"
                value={notifSettings.daily_report_time}
                onChange={(e) => setNotifSettings({ ...notifSettings, daily_report_time: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Weekly Report Day</label>
              <Select
                value={notifSettings.weekly_report_day}
                onChange={(e) => setNotifSettings({ ...notifSettings, weekly_report_day: e.target.value })}
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Site Dialog */}
      <Dialog open={showAddSite} onClose={() => setShowAddSite(false)}>
        <DialogTitle>Add Site</DialogTitle>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Name</label>
            <Input value={newSite.name} onChange={(e) => setNewSite({ ...newSite, name: e.target.value })} placeholder="My Site" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">URL</label>
            <Input value={newSite.url} onChange={(e) => setNewSite({ ...newSite, url: e.target.value })} placeholder="https://example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Hosting Provider</label>
            <Select value={newSite.hosting_provider} onChange={(e) => setNewSite({ ...newSite, hosting_provider: e.target.value as HostingProvider })}>
              <option value="vercel">Vercel</option>
              <option value="godaddy">GoDaddy</option>
              <option value="cloudflare">Cloudflare</option>
              <option value="netlify">Netlify</option>
              <option value="wix">Wix</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">GitHub Repo (optional)</label>
            <Input value={newSite.github_repo} onChange={(e) => setNewSite({ ...newSite, github_repo: e.target.value })} placeholder="user/repo" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddSite(false)}>Cancel</Button>
            <Button onClick={handleAddSite} disabled={!newSite.name || !newSite.url}>Add Site</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
