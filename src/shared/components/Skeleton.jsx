/**
 * Skeleton components with shimmer sweep animation.
 * The shimmer keyframe must be defined in your global CSS or tailwind config:
 *
 *   @keyframes shimmer {
 *     from { background-position: 200% center; }
 *     to   { background-position: -200% center; }
 *   }
 *   .animate-shimmer {
 *     background-size: 200% auto;
 *     animation: shimmer 2.4s linear infinite;
 *   }
 */

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 40%, rgba(255,255,255,0.04) 80%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2.4s linear infinite',
      }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
      {/* Avatar + title row */}
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      {/* Content lines */}
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      {/* Action button */}
      <Skeleton className="mt-5 h-8 w-full rounded-xl" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="flex-1 animate-fade-in space-y-6 p-6">
      {/* Page header */}
      <div className="space-y-2.5">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-4 space-y-2"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function TableRowSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-1">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
        >
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3 w-20 shrink-0" />
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ items = 5 }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
