import { useState } from 'react'
import { ChevronLeft, Tag, MapPin, CheckCircle, Flame } from 'lucide-react'
import { studentDiscounts } from '../../shared/data/cityData'
import clsx from 'clsx'

const CATS = ['Toate', 'food', 'cultura', 'transport', 'sport', 'sanatate', 'tech']

const CAT_COLORS = {
  food: '#f97316', cultura: '#8b5cf6', transport: '#3b82f6',
  sport: '#10b981', sanatate: '#ef4444', tech: '#6366f1',
}

export default function StudentDiscounts({ onBack }) {
  const [filter, setFilter] = useState('Toate')

  const filtered = filter === 'Toate' ? studentDiscounts : studentDiscounts.filter(d => d.cat === filter)

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.07] transition-colors">
          <ChevronLeft size={16} className="text-slate-400" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Reduceri Studenți</h2>
          <p className="text-xs text-slate-500">{studentDiscounts.length} locuri partenere în Iași</p>
        </div>
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

      {/* Discount cards */}
      <div className="space-y-2">
        {filtered.map((d, i) => {
          const catColor = CAT_COLORS[d.cat] || '#6366f1'
          return (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.09] transition-all">
              {/* Discount badge */}
              <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold"
                style={{ background: catColor + '20', border: `1.5px solid ${catColor}40` }}>
                <span className="text-lg leading-none" style={{ color: catColor }}>{d.discount.split('%')[0]}%</span>
                <span className="text-[9px] text-slate-500 mt-0.5">reducere</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">{d.name}</span>
                  {d.hot && <Flame size={12} className="text-orange-400" />}
                  {d.verified && <CheckCircle size={12} className="text-emerald-400" />}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{d.desc}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-600">
                  <MapPin size={9} /> {d.distance} · {d.address}
                </div>
              </div>

              <div className="shrink-0">
                <span className="text-[9px] px-2 py-1 rounded-full font-medium"
                  style={{ background: catColor + '20', color: catColor }}>
                  {d.cat}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-600">
          <Tag size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nicio reducere în această categorie</p>
        </div>
      )}
    </div>
  )
}
