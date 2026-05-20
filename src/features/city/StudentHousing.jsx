import { useState } from 'react'
import { ChevronLeft, Home, MapPin, AlertTriangle, ChevronDown, ChevronUp, Wallet } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { housingListings, SCAM_WARNINGS } from '../../shared/data/cityData'
import clsx from 'clsx'

const TYPE_TABS = ['Toate', 'Cămin', 'Chirie', 'Coabitare']

const TYPE_COLORS = {
  'Cămin':      { color: '#3b82f6', bg: '#3b82f620', border: '#3b82f640' },
  'Chirie':     { color: '#8b5cf6', bg: '#8b5cf620', border: '#8b5cf640' },
  'Coabitare':  { color: '#10b981', bg: '#10b98120', border: '#10b98140' },
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
}
const itemVar = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 20 } },
}

export default function StudentHousing({ onBack }) {
  const [tab, setTab]           = useState('Toate')
  const [showScams, setShowScams] = useState(false)

  const filtered = tab === 'Toate' ? housingListings : housingListings.filter(h => h.type === tab)

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
          style={{ background: 'radial-gradient(ellipse 70% 90% at 0% 50%, #3b82f640, transparent)' }}
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
                style={{ background: '#3b82f620', border: '1.5px solid #3b82f645' }}>
                <Home size={14} style={{ color: '#3b82f6' }} />
              </div>
              <h2 className="text-lg font-bold text-white">Cazare Studenți</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-9">Cămine și chirii verificate în Iași</p>
          </div>

          <span className="text-xs text-slate-500 shrink-0">{housingListings.length} oferte</span>
        </div>
      </motion.div>

      {/* Scam warning accordion */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 80, damping: 18 }}
      >
        <button
          onClick={() => setShowScams(s => !s)}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-rose-500/25 bg-rose-500/8 text-left hover:border-rose-500/40 hover:bg-rose-500/12 transition-all duration-200"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-rose-500/15 border border-rose-500/30">
            <AlertTriangle size={13} className="text-rose-400" />
          </div>
          <span className="flex-1 text-sm font-medium text-rose-300">Atenție: Escrocherii frecvente</span>
          {showScams
            ? <ChevronUp size={15} className="text-rose-400 shrink-0" />
            : <ChevronDown size={15} className="text-rose-400 shrink-0" />}
        </button>

        <AnimatePresence>
          {showScams && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 mt-2">
                {SCAM_WARNINGS.map((w) => (
                  <div
                    key={w}
                    className="flex items-start gap-2 px-4 py-2.5 rounded-xl border border-rose-500/18"
                    style={{ background: '#f43f5e0a' }}
                  >
                    <span className="text-rose-400 text-xs mt-0.5 shrink-0">⚠</span>
                    <p className="text-xs text-rose-300/75 leading-relaxed">{w}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Type tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TYPE_TABS.map(t => {
          const tc = TYPE_COLORS[t]
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                tab === t
                  ? 'text-white shadow-lg'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.07]'
              )}
              style={tab === t
                ? { background: tc?.color || '#3b82f6', boxShadow: `0 0 12px ${tc?.color || '#3b82f6'}40` }
                : {}}
            >
              {t}
            </button>
          )
        })}
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-14"
        >
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#3b82f618', border: '1.5px solid #3b82f635' }}>
            <Home size={28} className="opacity-50" style={{ color: '#3b82f6' }} />
          </div>
          <p className="text-sm text-slate-500">Nicio ofertă în această categorie</p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {filtered.map((h) => {
            const tc = TYPE_COLORS[h.type] || TYPE_COLORS['Chirie']
            return (
              <motion.div key={h.id} variants={itemVar}>
                <div className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.11] transition-all duration-200 overflow-hidden">
                  {/* Top accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, ${tc.color}80, transparent)` }}
                  />

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                            {h.name}
                          </span>
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: tc.bg, color: tc.color }}
                          >
                            {h.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-600">
                          <MapPin size={9} /> {h.zone} · {h.distance}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <Wallet size={12} style={{ color: tc.color }} />
                          <p className="text-base font-bold" style={{ color: tc.color }}>{h.price}</p>
                        </div>
                        <p className="text-[10px] text-slate-600">/lună</p>
                      </div>
                    </div>

                    {/* Amenities */}
                    {h.amenities?.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {h.amenities.map((a, ai) => (
                          <span
                            key={ai}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.07] text-slate-400"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}

                    {h.note && (
                      <div className="flex items-start gap-2 px-3 py-2 rounded-lg border border-amber-500/20"
                        style={{ background: '#f59e0b10' }}>
                        <span className="text-amber-400 text-xs mt-0.5 shrink-0">💡</span>
                        <p className="text-xs text-amber-400/80 leading-relaxed">{h.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
