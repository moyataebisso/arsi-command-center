'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, Check, X, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import type { SecurityScan, SecurityFinding } from '@/types/database.types'

interface SecurityPanelProps {
  scan: SecurityScan | null
  siteId: string
}

export function SecurityPanel({ scan: initialScan, siteId }: SecurityPanelProps) {
  const [scan, setScan] = useState(initialScan)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  async function handleRescan() {
    setLoading(true)
    setToast(null)
    try {
      const res = await fetch(`/api/sites/${siteId}/rescan-security`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        setScan((prev) => ({
          ...(prev ?? { id: '', site_id: siteId, scan_type: 'headers' as const, severity: 'pass' as const }),
          score: data.score,
          findings_json: data.headers,
          scanned_at: data.scannedAt,
        }))
        setToast('Scan complete')
        setTimeout(() => setToast(null), 3000)
      } else {
        setToast('Scan failed')
        setTimeout(() => setToast(null), 3000)
      }
    } catch {
      setToast('Scan failed')
      setTimeout(() => setToast(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (!scan) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security Headers</CardTitle>
            <Button size="sm" variant="outline" onClick={handleRescan} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Scanning...' : 'Re-scan now'}
            </Button>
          </div>
        </CardHeader>
        <CardContent><p className="text-slate-400">No security scan data yet.</p></CardContent>
      </Card>
    )
  }

  const scoreColor = scan.score >= 80 ? 'text-green-400' : scan.score >= 50 ? 'text-yellow-400' : 'text-red-400'
  const barColor = scan.score >= 80 ? 'bg-green-500' : scan.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security Headers</CardTitle>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${scoreColor}`}>{scan.score}/100</span>
            <Button size="sm" variant="outline" onClick={handleRescan} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Scanning...' : 'Re-scan now'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${scan.score}%` }} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scan.findings_json.map((f: SecurityFinding) => (
              <TableRow key={f.header}>
                <TableCell className="font-mono text-xs">{f.label}</TableCell>
                <TableCell>
                  {f.present ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <X className="h-4 w-4 text-red-400" />
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={f.present ? 'success' : 'warning'}>
                    {f.present ? 'pass' : 'warning'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="text-xs text-slate-500">
          Last scanned: {format(new Date(scan.scanned_at), 'MMM d, yyyy HH:mm')}
        </p>

        {toast && (
          <div className={`rounded-md px-3 py-2 text-sm ${toast === 'Scan complete' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {toast}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
