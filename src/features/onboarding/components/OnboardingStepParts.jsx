import { useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100)
  return (
    <div className="mb-8 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">Progres</span>
        <span className="text-[11px] font-bold text-indigo-400">{pct}%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        />
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'h-0.5 flex-1 rounded-full transition-all duration-500',
              i < step ? 'bg-indigo-500' : i === step ? 'bg-indigo-400/40' : 'bg-white/[0.05]',
            )}
          />
        ))}
      </div>
    </div>
  )
}

export function SelectOption({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2',
        selected
          ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.12)]'
          : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:border-white/[0.12] hover:text-white hover:bg-white/[0.05] hover:-translate-y-px',
      )}
    >
      <span
        className={clsx(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected ? 'border-indigo-500 bg-indigo-500' : 'border-white/[0.2]',
        )}
      >
        {selected && <Check size={9} className="text-white" />}
      </span>
      {label}
    </button>
  )
}

export function CardOption({ opt, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-200',
        selected
          ? 'bg-indigo-600/20 border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.13)] -translate-y-px'
          : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] hover:-translate-y-px',
      )}
    >
      <div
        className={clsx(
          'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
          selected ? 'border-indigo-500 bg-indigo-500' : 'border-white/[0.2]',
        )}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <div>
        <p className={clsx('font-semibold text-sm', selected ? 'text-indigo-300' : 'text-slate-200')}>{opt.label}</p>
        {opt.desc && <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>}
      </div>
    </button>
  )
}

export function TagOptions({ options, selected = [], onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(tag => {
        const sel = selected.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={clsx(
              'chip transition-all duration-200',
              sel
                ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.18)]'
                : 'hover:border-white/[0.14] hover:text-white',
            )}
          >
            {sel && <Check size={10} className="text-indigo-400" />}
            {tag}
          </button>
        )
      })}
    </div>
  )
}

export function FacultyStep({ value, onChange, universityFaculties }) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(
    () => universityFaculties.filter(f => f.name.toLowerCase().includes(search.toLowerCase())),
    [search, universityFaculties],
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 focus-within:border-indigo-500/40 transition-colors">
        <Search size={14} className="text-slate-500 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          className="bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none flex-1"
          placeholder="Caută facultatea ta..."
        />
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
        {filtered.map(f => (
          <SelectOption
            key={f.code}
            label={f.name}
            selected={value?.code === f.code}
            onClick={() => onChange(f)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-600 text-center py-6">
            Nicio facultate găsită. Încearcă alți termeni.
          </p>
        )}
      </div>
    </div>
  )
}
