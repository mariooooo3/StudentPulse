export function Skeleton({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-white/[0.04] ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.06) 50%, transparent 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2.4s linear infinite',
      }}
    />
  )
}

export function PageSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.05] p-5 space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-8 w-full mt-4 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
