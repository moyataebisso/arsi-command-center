import { createClient } from '@supabase/supabase-js'

interface HealthResult {
  db_size_mb: number | null
  active_connections: number | null
  storage_used_mb: null
  auth_users_count: number | null
}

export async function getSupabaseHealth(
  projectRef: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<HealthResult | null> {
  try {
    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const [usersRes, dbSizeRes, connectionsRes] = await Promise.allSettled([
      client.rpc('exec_sql', { query: 'SELECT count(*) as cnt FROM auth.users' }).single(),
      client.rpc('exec_sql', { query: 'SELECT pg_database_size(current_database()) as size' }).single(),
      client.rpc('exec_sql', { query: "SELECT count(*) as cnt FROM pg_stat_activity WHERE state = 'active'" }).single(),
    ])

    let auth_users_count: number | null = null
    let db_size_mb: number | null = null
    let active_connections: number | null = null

    if (usersRes.status === 'fulfilled' && usersRes.value.data) {
      const row = usersRes.value.data as Record<string, unknown>
      auth_users_count = Number(row.cnt) || 0
    }
    if (dbSizeRes.status === 'fulfilled' && dbSizeRes.value.data) {
      const row = dbSizeRes.value.data as Record<string, unknown>
      db_size_mb = Math.round((Number(row.size) / (1024 * 1024)) * 100) / 100
    }
    if (connectionsRes.status === 'fulfilled' && connectionsRes.value.data) {
      const row = connectionsRes.value.data as Record<string, unknown>
      active_connections = Number(row.cnt) || 0
    }

    return { db_size_mb, active_connections, storage_used_mb: null, auth_users_count }
  } catch (error) {
    console.error('Failed to fetch Supabase health:', error)
    return null
  }
}
