'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

export function NotificationBell() {
  const [openCount, setOpenCount] = useState(0)

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch('/api/alerts?status=open')
        const json = await res.json()
        if (json.success) setOpenCount(json.data?.length ?? 0)
      } catch {
        // ignore
      }
    }
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link href="/alerts" className="relative text-slate-400 hover:text-slate-200">
      <Bell className="h-5 w-5" />
      {openCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {openCount > 9 ? '9+' : openCount}
        </span>
      )}
    </Link>
  )
}
