import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, X, Loader2, Lightbulb } from 'lucide-react'

export default function RecoTab({
  totalUsers,
  pulseData,
  pulseLoading,
  recoMessages,
  recoInput,
  recoLoading,
  setRecoMessages,
  setRecoInput,
  recoHistoryRef,
  onSendRecoChat,
  onRefreshPulse,
}) {
  const recoChatBottomRef = useRef(null)

  useEffect(() => {
    recoChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [recoMessages])

  const now = new Date()
  const h = now.getHours()
  const timeLabel = now.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
  const dayLabel = now.toLocaleDateString('ro-RO', { weekday: 'long' })
  const dateLabel = now.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })
  const crowdLabel = totalUsers === 0 ? '–' : totalUsers < 80 ? t('navigation.reco.crowdQuiet') : totalUsers < 160 ? t('navigation.reco.crowdModerate') : t('navigation.reco.crowdBusy')
  const crowdColor = totalUsers === 0 ? 'text-slate-400' : totalUsers < 80 ? 'text-emerald-400' : totalUsers < 160 ? 'text-amber-400' : 'text-red-400'
  const periodEmoji = h < 7 ? '🌙' : h < 10 ? '🌅' : h < 13 ? '☀️' : h < 17 ? '🌤️' : h < 20 ? '🌆' : '🌙'
  const urgencyStyle = {
    high:   { border: 'border-red-500/40',    bg: 'bg-red-500/8',    dot: 'bg-red-400',    text: 'text-red-400'    },
    medium: { border: 'border-amber-500/40',  bg: 'bg-amber-500/8',  dot: 'bg-amber-400',  text: 'text-amber-400'  },
    low:    { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  }
  const QUICK_CHIPS = [
    { label: t('navigation.reco.chips.eat'),       icon: '🍽️', q: t('navigation.reco.chips.eatQ') },
    { label: t('navigation.reco.chips.rooms'),      icon: '🚪', q: t('navigation.reco.chips.roomsQ') },
    { label: t('navigation.reco.chips.secretary'),  icon: '📋', q: t('navigation.reco.chips.secretaryQ') },
    { label: t('navigation.reco.chips.coffee'),     icon: '☕', q: t('navigation.reco.chips.coffeeQ') },
    { label: t('navigation.reco.chips.study'),      icon: '📚', q: t('navigation.reco.chips.studyQ') },
    { label: t('navigation.reco.chips.exams'),      icon: '🎓', q: t('navigation.reco.chips.examsQ') },
  ]

  return (
    <motion.div key="reco" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="space-y-4">

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative flex items-center justify-between mb-4">
          <div>
            <p className="text-white/50 text-[11px] uppercase tracking-widest mb-0.5">{dayLabel}, {dateLabel}</p>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>{periodEmoji}</span> Campus Pulse
            </h2>
          </div>
          <button
            onClick={onRefreshPulse}
            disabled={pulseLoading}
            className="flex items-center gap-1.5 text-xs bg-white/15 hover:bg-white/25 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-xl font-medium cursor-pointer disabled:cursor-not-allowed"
          >
            {pulseLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
            {pulseLoading ? t('navigation.reco.analyzing') : t('navigation.reco.refresh')}
          </button>
        </div>
        <div className="relative grid grid-cols-3 gap-2">
          {[
            { label: t('navigation.reco.timeLabel'),    value: timeLabel, emoji: '⏰' },
            { label: t('navigation.reco.trafficLabel'), value: crowdLabel, emoji: '👥', valueClass: crowdColor },
            { label: t('navigation.reco.activeLabel'),  value: totalUsers > 0 ? `${totalUsers}` : '–', emoji: '🏃' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center">
              <div className="text-base mb-0.5">{s.emoji}</div>
              <div className="text-[9px] text-white/50 uppercase tracking-wide">{s.label}</div>
              <div className={`text-xs font-bold mt-0.5 ${s.valueClass || 'text-white'}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick chips */}
      <div>
        <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Sparkles size={10} /> {t('navigation.reco.askQuick')}
        </p>
        <div className="flex gap-2 flex-wrap">
          {QUICK_CHIPS.map(chip => (
            <button key={chip.label} onClick={() => onSendRecoChat(chip.q)}
              className="flex items-center gap-1.5 text-xs bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all px-3 py-1.5 rounded-xl cursor-pointer">
              <span>{chip.icon}</span> {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Cards */}
      <div>
        <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Lightbulb size={10} className="text-amber-400" /> {t('navigation.reco.recommendations')}
        </p>

        {pulseLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/[0.03] rounded-2xl border border-white/[0.05] p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.07] shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-white/[0.07] rounded w-3/4" />
                    <div className="h-2.5 bg-white/[0.04] rounded w-full" />
                    <div className="h-2.5 bg-white/[0.04] rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!pulseLoading && pulseData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {pulseData.briefing && (
              <p className="text-sm text-slate-400 italic border-l-2 border-indigo-500/40 pl-3">
                {pulseData.briefing}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(pulseData.cards || []).map((card, i) => {
                const style = urgencyStyle[card.urgency] || urgencyStyle.low
                return (
                  <motion.div key={card.id || i}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`rounded-2xl border ${style.border} ${style.bg} p-4 flex gap-3`}>
                    <div className="text-2xl leading-none pt-0.5 shrink-0">{card.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white leading-tight">{card.title}</p>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {!pulseLoading && !pulseData && (
          <div className="text-center py-8 text-slate-600 text-sm">
            {t('navigation.reco.noRecs')}
          </div>
        )}
      </div>

      {/* Reco AI Chat Zone */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.05]">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Sparkles size={13} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white">{t('navigation.reco.assistantTitle')}</p>
            <p className="text-[10px] text-slate-600 truncate">{t('navigation.reco.assistantSub')}</p>
          </div>
          {recoMessages.length > 0 && (
            <button
              onClick={() => { setRecoMessages([]); recoHistoryRef.current = [] }}
              className="text-slate-700 hover:text-slate-400 transition-colors shrink-0"
              title={t('navigation.reco.clearChat')}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {recoMessages.length > 0 && (
          <div className="max-h-72 overflow-y-auto p-4 space-y-3">
            {recoMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600/25 border border-indigo-500/25 text-slate-200 rounded-br-sm'
                    : 'bg-white/[0.05] border border-white/[0.07] text-slate-300 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {recoLoading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.05] border border-white/[0.07] rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin text-indigo-400" />
                  <span className="text-[12px] text-slate-500">{t('navigation.reco.analyzing')}</span>
                </div>
              </div>
            )}
            <div ref={recoChatBottomRef} />
          </div>
        )}

        <form
          onSubmit={e => { e.preventDefault(); onSendRecoChat(recoInput) }}
          className="flex items-center gap-2 p-3 border-t border-white/[0.05]"
        >
          <input
            value={recoInput}
            onChange={e => setRecoInput(e.target.value)}
            disabled={recoLoading}
            placeholder={t('navigation.reco.inputPlaceholder')}
            className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2 text-[13px] text-slate-300 placeholder-slate-700 outline-none focus:border-indigo-500/40 transition-colors disabled:opacity-50 min-w-0"
          />
          <button
            type="submit"
            disabled={recoLoading || !recoInput.trim()}
            className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center hover:bg-indigo-600/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={13} className="text-indigo-400" />
          </button>
        </form>
      </div>
    </motion.div>
  )
}
