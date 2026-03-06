export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from './settings-form'
import type { NotificationSettings, Site } from '@/types/database.types'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('notification_settings')
    .select('*')
    .limit(1)
    .single()

  const { data: sites } = await supabase.from('sites').select('*').order('name')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
      <SettingsForm
        settings={(settings as NotificationSettings) ?? null}
        sites={(sites ?? []) as Site[]}
      />
    </div>
  )
}
