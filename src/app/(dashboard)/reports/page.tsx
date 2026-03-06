export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { ReportsList } from './reports-list'
import type { Report } from '@/types/database.types'

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('generated_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Reports</h1>
      <ReportsList reports={(reports ?? []) as Report[]} />
    </div>
  )
}
