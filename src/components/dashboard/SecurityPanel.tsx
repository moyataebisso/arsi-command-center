import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import type { SecurityScan } from '@/types/database.types'

export function SecurityPanel({ scan }: { scan: SecurityScan | null }) {
  if (!scan) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security Headers</CardTitle></CardHeader>
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
          <span className={`text-2xl font-bold ${scoreColor}`}>{scan.score}/100</span>
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
              <TableHead>Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scan.findings_json.map((f) => (
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
                  <Badge variant={f.present ? 'success' : f.severity === 'critical' ? 'danger' : 'warning'}>
                    {f.present ? 'pass' : f.severity}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="text-xs text-slate-500">
          Last scanned: {format(new Date(scan.scanned_at), 'MMM d, yyyy HH:mm')}
        </p>
      </CardContent>
    </Card>
  )
}
