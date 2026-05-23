import { useState } from 'react'
import { ChevronLeft, Bus, Clock, MapPin, CreditCard, ChevronDown, ChevronUp, Zap, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { transportData, DEFAULT_TRANSPORT } from '../../shared/data/cityData'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
}
const itemVar = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 20 } },
}

export default function StudentTransport({ onBack, profile, onNavigate }) {
  const [expanded, setExpanded] = useState(null)

  const universityId = profile?.university?.id || profile?.universityId || ''
  const data = transportData[universityId] || DEFAULT_TRANSPORT
  const lines = data.lines

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
          style={{ background: 'radial-gradient(ellipse 70% 90% at 0% 50%, #06b6d440, transparent)' }}
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
                style={{ background: '#06b6d420', border: '1.5px solid #06b6d445' }}>
                <Bus size={14} style={{ color: '#06b6d4' }} />
              </div>
              <h2 className="text-lg font-bold text-white">Transport {data.operator}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-9">Rute recomandate pentru studenți · {data.city}</p>
          </div>

          <span className="text-xs text-slate-500 shrink-0">{lines.length} linii</span>
        </div>
      </motion.div>

      {/* Student pass info card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 80, damping: 18 }}
        className="relative flex items-start gap-3 p-4 rounded-2xl overflow-hidden border"
        style={{ background: '#06b6d410', borderColor: '#06b6d430' }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: '#06b6d420', border: '1.5px solid #06b6d445' }}>
          <CreditCard size={16} style={{ color: '#06b6d4' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: '#67e8f9' }}>Abonament Student</p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: '#06b6d420', color: '#06b6d4' }}>
              {data.studentPass.discount} OFF
            </span>
          </div>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#a5f3fc80' }}>
            {data.studentPass.price} · {data.studentPass.note}
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={() => {
              sessionStorage.setItem('sc_discount_jump', 'Transport')
              onNavigate('discounts', 'life')
            }}
            className="shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: '#06b6d415', color: '#22d3ee', border: '1px solid #06b6d430' }}
          >
            <Tag size={10} />
            Vezi reduceri
          </button>
        )}
      </motion.div>

      {/* Lines */}
      {lines.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">
          Date transport pentru {data.city} în curând.
        </div>
      ) : (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {lines.map((line, i) => {
          const isExp = expanded === i
          return (
            <motion.div key={i} variants={itemVar}>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden transition-all duration-200 hover:border-white/[0.11]">
                <button
                  onClick={() => setExpanded(isExp ? null : i)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.03] transition-colors"
                >
                  {/* Line badge */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-lg"
                    style={{ background: line.color, boxShadow: `0 4px 12px ${line.color}50` }}
                  >
                    {line.line}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200">{line.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={9} /> {line.frequency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap size={9} /> {line.firstBus} – {line.lastBus}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
                    style={isExp ? { background: line.color + '20' } : {}}>
                    {isExp
                      ? <ChevronUp size={15} style={{ color: line.color }} />
                      : <ChevronDown size={15} className="text-slate-500" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06] pt-3">
                        {/* Tip */}
                        {line.tip && (
                          <div className="flex items-start gap-2 px-3 py-2 rounded-lg border border-amber-500/20"
                            style={{ background: '#f59e0b10' }}>
                            <span className="text-amber-400 text-xs mt-0.5 shrink-0">💡</span>
                            <p className="text-xs text-amber-400/80 leading-relaxed">{line.tip}</p>
                          </div>
                        )}

                        {/* Student pass note */}
                        {line.studentPass && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/20"
                            style={{ background: '#10b98110' }}>
                            <span className="text-emerald-400 text-xs shrink-0">✓</span>
                            <p className="text-xs text-emerald-400/80">
                              Abonament student disponibil pe această linie
                            </p>
                          </div>
                        )}

                        {/* Stops timeline */}
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2.5 uppercase tracking-wider">
                            Stații principale
                          </p>
                          <div className="relative pl-5">
                            <div className="absolute left-2 top-1 bottom-1 w-px bg-white/[0.08]" />
                            {line.stops.map((stop, si) => {
                              const isFirst = si === 0
                              const isLast  = si === line.stops.length - 1
                              return (
                                <div key={si} className="flex items-center gap-2 py-1 relative">
                                  <div
                                    className="w-2.5 h-2.5 rounded-full absolute -left-3.5 border border-white/[0.15]"
                                    style={{
                                      background: (isFirst || isLast) ? line.color : 'rgba(255,255,255,0.1)',
                                      boxShadow: (isFirst || isLast) ? `0 0 6px ${line.color}80` : 'none',
                                    }}
                                  />
                                  <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <MapPin size={9} className="text-slate-600" /> {stop}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
      )}
    </div>
  )
}
