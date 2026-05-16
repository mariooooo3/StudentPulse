import { useState } from 'react'
import { ChevronLeft, ThumbsUp, CheckCircle, Lightbulb } from 'lucide-react'
import { localTips } from '../../shared/data/cityData'
import clsx from 'clsx'

const CATS = ['Toate', 'transport', 'mancare', 'studiu', 'social', 'financiar', 'locuinta']

export default function LocalTips({ onBack }) {
  const [filter, setFilter] = useState('Toate')
  const [upvoted, setUpvoted] = useState(new Set())
  const [tips, setTips] = useState(localTips)

  function upvote(i) {
    if (upvoted.has(i)) return
    setUpvoted(prev => new Set([...prev, i]))
    setTips(prev => prev.map((t, idx) => idx === i ? { ...t, upvotes: t.upvotes + 1 } : t))
  }

  const filtered = filter === 'Toate' ? tips : tips.filter(t => t.cat === filter)
  const sorted = [...filtered].sort((a, b) => b.upvotes - a.upvotes)

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors">
          <ChevronLeft size={16} className="text-slate-400" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Sfaturi Locale</h2>
          <p className="text-xs text-slate-500">De la studenți pentru studenți · Iași</p>
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
              filter === c ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            )}
          >
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Tips feed */}
      <div className="space-y-3">
        {sorted.map((tip, i) => {
          const origIdx = tips.indexOf(tip)
          const voted = upvoted.has(origIdx)
          return (
            <div key={i} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/40 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm shrink-0">
                  {tip.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">{tip.author}</span>
                    {tip.verified && <CheckCircle size={11} className="text-emerald-400" />}
                    <span className="text-[10px] text-slate-600 ml-auto">{tip.cat}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">{tip.text}</p>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button
                  onClick={() => upvote(origIdx)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    voted
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-slate-700/50 text-slate-500 hover:text-slate-300 border border-slate-700'
                  )}
                >
                  <ThumbsUp size={11} />
                  {tip.upvotes}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-slate-600">
          <Lightbulb size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Niciun sfat în această categorie</p>
        </div>
      )}
    </div>
  )
}
