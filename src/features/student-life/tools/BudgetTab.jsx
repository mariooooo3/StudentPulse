import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Trash2 } from 'lucide-react'
import { SECTION_ACCENTS } from '../constants/sectionConfig'
import { containerVariants, itemVariants } from '../utils/motionVariants'
import AccentLine from '../components/AccentLine'

export default function BudgetTab() {
  const accent = SECTION_ACCENTS.tools
  const CATEGORIES = ['Cazare', 'Mâncare', 'Transport', 'Cursuri', 'Distracție', 'Diverse']
  const AVERAGES   = { Cazare: 800, Mâncare: 400, Transport: 100, Cursuri: 150, Distracție: 200, Diverse: 100 }

  const [budget, setBudget] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('sc_budget') || '{}')
      const sanitized = {}
      for (const [k, v] of Object.entries(raw)) {
        const n = Number(v)
        if (!isNaN(n) && n >= 0) sanitized[k] = n
      }
      return sanitized
    } catch { return {} }
  })

  function updateBudget(cat, val) {
    const parsed = Number(val)
    const next = { ...budget }
    if (val === '' || isNaN(parsed)) {
      delete next[cat]
    } else {
      next[cat] = Math.max(0, parsed)
    }
    setBudget(next)
    localStorage.setItem('sc_budget', JSON.stringify(next))
  }

  function resetBudget() {
    setBudget({})
    localStorage.removeItem('sc_budget')
  }

  const total    = CATEGORIES.reduce((s, c) => s + (budget[c] ?? 0), 0)
  const avgTotal = Object.values(AVERAGES).reduce((s, v) => s + v, 0)
  const diff     = total - avgTotal

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="premium-card flex items-center justify-between p-5">
        <AccentLine color={accent.color} />
        <div>
          <p className="section-label mb-1">Total lunar</p>
          <p className="font-mono text-3xl font-black text-white">{total} <span className="text-lg text-slate-400">RON</span></p>
          {total > 0 && (
            <p className={clsx('mt-1 text-xs font-semibold', diff > 0 ? 'text-red-400' : 'text-emerald-400')}>
              {diff > 0 ? `+${diff} față de medie` : `${diff} față de medie`}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="section-label mb-1">Medie studenți Iași</p>
          <p className="font-mono text-xl font-bold text-slate-400">{avgTotal} RON</p>
          <button onClick={resetBudget} className="mt-2 flex items-center gap-1 text-[11px] text-slate-600 hover:text-red-400 transition-colors ml-auto">
            <Trash2 size={11} /> Resetează
          </button>
        </div>
      </div>

      {/* Categories */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
        {CATEGORIES.map(cat => {
          const val = budget[cat] ?? null
          const pct = val !== null ? Math.min(100, (val / AVERAGES[cat]) * 100) : 0
          const over = val !== null && val > AVERAGES[cat]
          return (
            <motion.div key={cat} variants={itemVariants} className="premium-card p-4">
              <AccentLine color={over ? '#f43f5e' : accent.color} />
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">{cat}</span>
                <span className="font-mono text-xs text-slate-500">Medie: {AVERAGES[cat]} RON</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={val ?? ''}
                  onChange={e => updateBudget(cat, e.target.value)}
                  placeholder={String(AVERAGES[cat])}
                  className="input-base h-9 w-28 text-sm"
                />
                <span className="font-mono text-xs text-slate-600">RON/lună</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.05]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: over ? '#f43f5e' : accent.color,
                    }}
                  />
                </div>
                {val !== null && val !== AVERAGES[cat] && (
                  <span className={clsx('font-mono text-[11px] font-semibold shrink-0', over ? 'text-red-400' : 'text-emerald-400')}>
                    {over ? `+${val - AVERAGES[cat]}` : `-${AVERAGES[cat] - val}`}
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
