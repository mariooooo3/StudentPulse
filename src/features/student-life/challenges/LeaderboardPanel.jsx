import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, RotateCcw, Loader2, Medal } from 'lucide-react'
import clsx from 'clsx'
import { fetchLeaderboard } from './challengesService'
import { avatarLetters, colorFor } from '../../messages/messages.utils'

const MEDAL = {
  0: { icon: '🥇', color: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
  1: { icon: '🥈', color: '#94a3b8', glow: 'rgba(148,163,184,0.2)' },
  2: { icon: '🥉', color: '#cd7f32', glow: 'rgba(205,127,50,0.2)' },
}

const REFRESH_INTERVAL = 30_000

export default function LeaderboardPanel({ scope, currentUserId, accent }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const intervalRef = useRef(null)

  async function load() {
    setLoading(true)
    try {
      const data = await fetchLeaderboard(scope)
      setRows(data.leaderboard || [])
      setLastUpdated(new Date())
    } catch {
      // keep previous rows on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [scope])

  const timeAgo = lastUpdated
    ? `actualizat acum ${Math.round((Date.now() - lastUpdated) / 1000)}s`
    : ''

  return (
    <div className="premium-card overflow-hidden mb-2">
      {/* Header */}
      <div className="h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${accent?.color || '#f59e0b'}, transparent)` }} />
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Trophy size={15} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Clasament Facultate</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Top 10 · puncte totale acumulate</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
        >
          <RotateCcw size={11} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Se încarcă...' : timeAgo}
        </button>
      </div>

      {/* List */}
      <div className="px-4 pb-4 space-y-1.5">
        <AnimatePresence mode="popLayout">
          {loading && rows.length === 0 ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-amber-400/60" />
            </motion.div>
          ) : rows.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-8 text-slate-600 text-sm">
              Niciun student nu a completat provocări încă. Fii primul!
            </motion.div>
          ) : (
            rows.map((row, i) => {
              const isMe = row.user_id === currentUserId
              const medal = MEDAL[i]
              const initials = avatarLetters(row.display_name || 'U')
              const gradientColor = colorFor(row.user_id)

              return (
                <motion.div
                  key={row.user_id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 24 }}
                  className={clsx(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all',
                    isMe
                      ? 'border border-amber-400/30 bg-amber-400/[0.07]'
                      : 'border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04]',
                  )}
                  style={medal ? { boxShadow: `0 0 12px ${medal.glow}` } : undefined}
                >
                  {/* Rank */}
                  <div className="w-7 shrink-0 text-center">
                    {medal ? (
                      <span className="text-base leading-none">{medal.icon}</span>
                    ) : (
                      <span className="font-mono text-xs font-bold text-slate-600">#{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                    {initials}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      'text-sm font-semibold truncate leading-tight',
                      isMe ? 'text-amber-200' : 'text-white',
                    )}>
                      {row.display_name || 'Anonim'}
                      {isMe && <span className="ml-1.5 text-[10px] font-bold text-amber-400/80">(tu)</span>}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {row.completed_count} {row.completed_count === 1 ? 'provocare' : 'provocări'}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="shrink-0 text-right">
                    <p className={clsx(
                      'font-mono text-sm font-black',
                      medal ? '' : 'text-white',
                    )} style={medal ? { color: medal.color } : undefined}>
                      {row.total_points}
                    </p>
                    <p className="text-[9px] text-slate-600 font-semibold">pts</p>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
