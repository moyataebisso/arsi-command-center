import { TableSkeleton } from '@/components/shared/LoadingSkeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded bg-slate-700" />
      <TableSkeleton rows={8} />
    </div>
  )
}
