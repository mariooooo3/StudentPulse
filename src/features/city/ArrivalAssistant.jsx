import { useState } from 'react'
import { CheckSquare, Square, ChevronLeft, AlertTriangle, Clock, Info, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { arrivalChecklist } from '../../shared/data/cityData'
import clsx from 'clsx'

const URGENCY_META = {
  critical: { label: 'Critic',    color: '#ef4444', bg: '#ef444420' },
  high:     { label: 'Urgent',    color: '#f97316', bg: '#f9731620' },
  medium:   { label: 'Mediu',     color: '#eab308', bg: '#eab30820' },
  low:      { label: 'Opțional',  color: '#6b7280', bg: '#6b728020' },
}

const CATS = ['Toate', 'Documente', 'Finanțe', 'Transport', 'Sănătate', 'Social']

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
}
const itemVar = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 20 } },
}

export default function ArrivalAssistant({ onBack }) {
  const [items, setItems]     = useState(arrivalChecklist)
  const [filter, setFilter]   = useState('Toate')
  const [expanded, setExpanded] = useState(null)

  function toggle(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  const filtered = filter === 'Toate' ? items : items.filter(i => i.cat === filter)
  const done     = items.filter(i => i.done).length
  const pct      = items.length === 0 ? 0 : Math.round((done / items.length) * 100)

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 overflow-hidden"
      >
        <div className="dot-grid absolute inset-0 opacity-25 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 90% at 0% 50%, #10b98140, transparent)' }}
        />

        <div className="relative flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.09] hover:border-white/[0.14] transition-all shrink-0"
          >
            <ChevronLeft size={16} className="text-slate-400" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#10b98120', border: '1.5px solid #10b98145' }}>
                <CheckSquare size={14} style={{ color: '#10b981' }} />
              </div>
              <h2 className="text-lg font-bold text-white">Asistent Sosire</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-9">Checklist pentru primele zile</p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{pct}%</p>
            <p className="text-[10px] text-slate-600">{done}/{items.length} completat</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-4 h-2 bg-white/[0.07] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200',
              filter === c
                ? 'text-white shadow-lg'
                : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.07]'
            )}
            style={filter === c ? { background: '#10b981', boxShadow: '0 0 12px #10b98140' } : {}}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Items */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {filtered.map(it => {
          const u     = URGENCY_META[it.urgency]
          const isExp = expanded === it.id
          return (
            <motion.div key={it.id} variants={itemVar}>
              <div
                className={clsx(
                  'rounded-xl border transition-all duration-200 overflow-hidden',
                  it.done
                    ? 'bg-white/[0.01] border-white/[0.03] opacity-55'
                    : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.11]'
                )}
              >
                <div className="flex items-start gap-3 p-3.5">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggle(it.id)}
                    className="mt-0.5 shrink-0 transition-transform duration-150 hover:scale-110"
                  >
                    {it.done
                      ? <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                      : <Square size={18} className="text-slate-500 hover:text-slate-300 transition-colors" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={clsx(
                        'text-sm font-medium transition-all duration-200',
                        it.done ? 'line-through text-slate-600' : 'text-slate-200'
                      )}>
                        {it.icon} {it.title}
                      </span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: u.bg, color: u.color }}
                      >
                        {u.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{it.desc}</p>
                    {it.deadline && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500">
                        <Clock size={10} /> {it.deadline}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setExpanded(isExp ? null : it.id)}
                    className={clsx(
                      'shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200',
                      isExp ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-600 hover:text-slate-400'
                    )}
                  >
                    <Info size={14} />
                  </button>
                </div>

                <AnimatePresence>
                  {isExp && it.tip && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mx-3 mb-3 px-3 py-2.5 rounded-lg flex items-start gap-2"
                        style={{ background: '#10b98112', border: '1px solid #10b98130' }}>
                        <AlertTriangle size={13} style={{ color: '#10b981' }} className="mt-0.5 shrink-0" />
                        <p className="text-xs" style={{ color: '#6ee7b7' }}>{it.tip}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
