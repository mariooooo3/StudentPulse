import { useState } from 'react'
import { CheckSquare, Square, ChevronLeft, AlertTriangle, Clock, Info } from 'lucide-react'
import { arrivalChecklist } from '../../shared/data/cityData'
import clsx from 'clsx'

const URGENCY_META = {
  critical: { label: 'Critic', color: '#ef4444', bg: '#ef444420' },
  high:     { label: 'Urgent', color: '#f97316', bg: '#f9731620' },
  medium:   { label: 'Mediu', color: '#eab308', bg: '#eab30820' },
  low:      { label: 'Opțional', color: '#6b7280', bg: '#6b728020' },
}

const CATS = ['Toate', 'admin', 'financiar', 'academic', 'locuinta', 'social', 'sanatate']

export default function ArrivalAssistant({ onBack }) {
  const [items, setItems] = useState(arrivalChecklist)
  const [filter, setFilter] = useState('Toate')
  const [expanded, setExpanded] = useState(null)

  function toggle(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  const filtered = filter === 'Toate' ? items : items.filter(i => i.cat === filter)
  const done = items.filter(i => i.done).length
  const pct = Math.round((done / items.length) * 100)

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.07] transition-colors">
          <ChevronLeft size={16} className="text-slate-400" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Asistent Sosire</h2>
          <p className="text-xs text-slate-500">Checklist pentru primele zile</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-indigo-400">{pct}%</p>
          <p className="text-[10px] text-slate-600">{done}/{items.length} completat</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              filter === c
                ? 'bg-indigo-600 text-white'
                : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.07]'
            )}
          >
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {filtered.map(item => {
          const u = URGENCY_META[item.urgency]
          const isExp = expanded === item.id
          return (
            <div
              key={item.id}
              className={clsx(
                'rounded-xl border transition-all duration-200',
                item.done
                  ? 'bg-white/[0.01] border-white/[0.03] opacity-60'
                  : 'bg-white/[0.03] border-white/[0.05]'
              )}
            >
              <div className="flex items-start gap-3 p-3">
                <button onClick={() => toggle(item.id)} className="mt-0.5 shrink-0">
                  {item.done
                    ? <CheckSquare size={18} className="text-emerald-400" />
                    : <Square size={18} className="text-slate-500 hover:text-slate-300 transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={clsx('text-sm font-medium', item.done ? 'line-through text-slate-500' : 'text-slate-200')}>
                      {item.icon} {item.title}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: u.bg, color: u.color }}>
                      {u.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
                  {item.deadline && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500">
                      <Clock size={10} /> {item.deadline}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setExpanded(isExp ? null : item.id)}
                  className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <Info size={15} />
                </button>
              </div>
              {isExp && item.tip && (
                <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2">
                  <AlertTriangle size={13} className="text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-indigo-300">{item.tip}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
