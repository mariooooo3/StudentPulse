import { useState } from 'react'
import { ChevronLeft, ThumbsUp, CheckCircle, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'
import { localTips } from '../../shared/data/cityData'
import clsx from 'clsx'

const CATS = ['Toate', 'Transport', 'Mâncare', 'Academic', 'Social', 'Birocrație', 'Safety']

const CAT_COLORS = {
  Transport:  '#06b6d4',
  'Mâncare':  '#f59e0b',
  Academic:   '#8b5cf6',
  Social:     '#10b981',
  'Birocrație':'#6366f1',
  Safety:     '#f43f5e',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const itemVar = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 20 } },
}

export default function LocalTips({ onBack }) {
  const [filter, setFilter]   = useState('Toate')
  const [upvoted, setUpvoted] = useState(new Set())
  const [tips, setTips]       = useState(localTips)

  function upvote(i) {
    if (upvoted.has(i)) return
    setUpvoted(prev => new Set([...prev, i]))
    setTips(prev => prev.map((t, idx) => idx === i ? { ...t, upvotes: t.upvotes + 1 } : t))
  }

  const filtered = filter === 'Toate' ? tips : tips.filter(t => t.cat === filter)
  const sorted   = [...filtered].sort((a, b) => b.upvotes - a.upvotes)

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
          style={{ background: 'radial-gradient(ellipse 70% 90% at 0% 50%, #f59e0b40, transparent)' }}
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
                style={{ background: '#f59e0b20', border: '1.5px solid #f59e0b45' }}>
                <Lightbulb size={14} style={{ color: '#f59e0b' }} />
              </div>
              <h2 className="text-lg font-bold text-white">Sfaturi Locale</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-9">De la studenți pentru studenți · Iași</p>
          </div>

          <span className="text-xs text-slate-500 shrink-0">{tips.length} sfaturi</span>
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
            style={filter === c
              ? { background: CAT_COLORS[c] || '#f59e0b', boxShadow: `0 0 12px ${CAT_COLORS[c] || '#f59e0b'}40` }
              : {}}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tips feed */}
      {sorted.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-14"
        >
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#f59e0b18', border: '1.5px solid #f59e0b35' }}>
            <Lightbulb size={28} style={{ color: '#f59e0b' }} className="opacity-50" />
          </div>
          <p className="text-sm text-slate-500">Niciun sfat în această categorie</p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {sorted.map((tip, i) => {
            const origIdx = tips.indexOf(tip)
            const voted   = upvoted.has(origIdx)
            const catColor = CAT_COLORS[tip.cat] || '#f59e0b'

            return (
              <motion.div key={i} variants={itemVar}>
                <div className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.11] transition-all duration-200 overflow-hidden">
                  {/* Top accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-40"
                    style={{ background: `linear-gradient(90deg, ${catColor}, transparent)` }}
                  />

                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 bg-white/[0.06] border border-white/[0.08]">
                        {tip.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-300">{tip.author}</span>
                          {tip.verified && (
                            <CheckCircle size={11} style={{ color: '#10b981' }} />
                          )}
                          <span
                            className="ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: catColor + '20', color: catColor }}
                          >
                            {tip.cat}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">{tip.text}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-1 border-t border-white/[0.04]">
                      <button
                        onClick={() => upvote(origIdx)}
                        className={clsx(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                          voted
                            ? 'text-amber-400 border border-amber-500/35'
                            : 'text-slate-500 hover:text-slate-300 border border-white/[0.07] hover:border-white/[0.12]'
                        )}
                        style={voted ? { background: '#f59e0b18' } : { background: 'rgba(255,255,255,0.02)' }}
                      >
                        <ThumbsUp size={11} />
                        {tip.upvotes}
                      </button>
                    </div>
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
