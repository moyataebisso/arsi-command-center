export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { AlertsTable } from './alerts-table'
import type { Alert, Site } from '@/types/database.types'

export default async function AlertsPage() {
  const supabase = await createClient()

  const { data: alerts } = await supabase
    .from('alerts')
    .select('*, sites(name, url)')
    .order('created_at', { ascending: false })
    .limit(200)

  const { data: sites } = await supabase.from('sites').select('id, name').order('name')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Alerts</h1>
      <AlertsTable alerts={(alerts ?? []) as (Alert & { sites: Pick<Site, 'name' | 'url'> | null })[]} sites={(sites ?? []) as Pick<Site, 'id' | 'name'>[]} />
    </div>
  )
}
