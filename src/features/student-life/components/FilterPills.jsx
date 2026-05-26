import clsx from 'clsx'

export default function FilterPills({ items, labels, value, onChange, accent }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={clsx(
            'h-8 rounded-xl border px-3 text-[11px] font-semibold transition-all active:scale-[0.97]',
            value === item
              ? 'text-white'
              : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-white/[0.1] hover:text-slate-300',
          )}
          style={value === item ? {
            background: accent?.bg || 'rgba(99,102,241,0.18)',
            borderColor: accent?.border || 'rgba(99,102,241,0.35)',
            color: accent?.color || '#a5b4fc',
          } : undefined}
        >
          {labels ? labels[idx] : item}
        </button>
      ))}
    </div>
  )
}
