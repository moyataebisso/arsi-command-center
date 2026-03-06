import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'healthy':
      return 'text-green-500'
    case 'degraded':
      return 'text-yellow-500'
    case 'down':
      return 'text-red-500'
    default:
      return 'text-slate-400'
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    case 'info':
      return 'text-blue-500'
    default:
      return 'text-slate-400'
  }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-500'
  if (score >= 50) return 'text-yellow-500'
  return 'text-red-500'
}
