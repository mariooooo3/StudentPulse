import { useState } from 'react'
import { ChevronLeft, Tag, MapPin, CheckCircle, Flame, Percent } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { studentDiscounts } from '../../shared/data/cityData'
import clsx from 'clsx'

const CATS = ['Toate', 'Mâncare', 'Cultură', 'Transport', 'Sport', 'Rechizite', 'Shopping']
const CAT_KEYS = { 'Toate': 'all', 'Mâncare': 'mancare', 'Cultură': 'cultura', 'Transport': 'transport', 'Sport': 'sport', 'Rechizite': 'rechizite', 'Shopping': 'shopping' }

const CAT_COLORS = {
  'Mâncare':   '#f97316',
  'Cultură':   '#8b5cf6',
  'Transport': '#3b82f6',
  'Sport':     '#10b981',
  'Rechizite': '#ef4444',
  'Shopping':  '#6366f1',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const itemVar = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 20 } },
}

export default function StudentDiscounts({ onBack }) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('Toate')

  const filtered = filter === 'Toate'
    ? studentDiscounts
    : studentDiscounts.filter(d => d.cat === filter)

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
          style={{ background: 'radial-gradient(ellipse 70% 90% at 0% 50%, #6366f140, transparent)' }}
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
                style={{ background: '#6366f120', border: '1.5px solid #6366f145' }}>
                <Tag size={14} style={{ color: '#6366f1' }} />
              </div>
              <h2 className="text-lg font-bold text-white">{t('cityContent.cityDiscounts.title')}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-9">
              {t('cityContent.cityDiscounts.subtitle', { count: studentDiscounts.length })}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10">
            <Percent size={11} style={{ color: '#6366f1' }} />
            <span className="text-xs font-semibold" style={{ color: '#818cf8' }}>
              {studentDiscounts.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATS.map(c => {
          const color = CAT_COLORS[c] || '#6366f1'
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200',
                filter === c
                  ? 'text-white shadow-lg'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.07]'
              )}
              style={filter === c
                ? { background: color, boxShadow: `0 0 12px ${color}40` }
                : {}}
            >
              {t(`cityContent.cityDiscounts.cats.${CAT_KEYS[c]}`)}
            </button>
          )
        })}
      </div>

      {/* Discount cards */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-14"
        >
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#6366f118', border: '1.5px solid #6366f135' }}>
            <Tag size={28} className="opacity-50" style={{ color: '#6366f1' }} />
          </div>
          <p className="text-sm text-slate-500">{t('cityContent.cityDiscounts.noDiscounts')}</p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {filtered.map((d) => {
            const catColor = CAT_COLORS[d.cat] || '#6366f1'
            return (
              <motion.div key={d.id} variants={itemVar}>
                <div className="group relative flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.11] transition-all duration-200 overflow-hidden">
                  {/* Left accent */}
                  <div
                    className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                    style={{ background: catColor + '80' }}
                  />

                  {/* Discount badge */}
                  <div
                    className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold transition-transform duration-200 group-hover:scale-105 px-1 text-center"
                    style={{ background: catColor + '20', border: `1.5px solid ${catColor}40` }}
                  >
                    <span className="text-[11px] leading-tight font-bold" style={{ color: catColor }}>
                      {d.discount}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {d.name}
                      </span>
                      {d.hot && <Flame size={12} className="text-orange-400" />}
                      {d.verified && <CheckCircle size={12} style={{ color: '#10b981' }} />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{d.desc}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-600 flex-wrap">
                      <MapPin size={9} /> {d.distance} · {d.address}
                      {d.city && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/[0.05] text-slate-500">{d.city}</span>}
                    </div>
                  </div>

                  <span
                    className="shrink-0 text-[9px] px-2 py-1 rounded-full font-semibold"
                    style={{ background: catColor + '20', color: catColor }}
                  >
                    {d.cat}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
