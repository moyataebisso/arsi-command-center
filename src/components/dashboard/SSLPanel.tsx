import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'
import type { SSLCheck } from '@/types/database.types'

export function SSLPanel({ check }: { check: SSLCheck | null }) {
  if (!check) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> SSL Certificate</CardTitle></CardHeader>
        <CardContent><p className="text-slate-400">No SSL data available yet.</p></CardContent>
      </Card>
    )
  }

  const variant = check.is_valid
    ? check.days_remaining && check.days_remaining <= 14
      ? 'warning'
      : 'success'
    : 'danger'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" /> SSL Certificate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-400">Status</span>
          <Badge variant={variant}>{check.is_valid ? 'Valid' : 'Invalid'}</Badge>
        </div>
        {check.issuer && (
          <div className="flex justify-between">
            <span className="text-slate-400">Issuer</span>
            <span className="text-slate-200">{check.issuer}</span>
          </div>
        )}
        {check.days_remaining !== null && (
          <div className="flex justify-between">
            <span className="text-slate-400">Days Remaining</span>
            <span className={check.days_remaining <= 14 ? 'text-yellow-400' : 'text-slate-200'}>
              {check.days_remaining}
            </span>
          </div>
        )}
        {check.valid_to && (
          <div className="flex justify-between">
            <span className="text-slate-400">Expires</span>
            <span className="text-slate-200">{format(new Date(check.valid_to), 'MMM d, yyyy')}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-400">Last Checked</span>
          <span className="text-slate-200">{format(new Date(check.checked_at), 'MMM d, yyyy HH:mm')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
