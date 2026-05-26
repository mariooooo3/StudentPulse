import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Trophy, RotateCcw, Flame, CalendarDays, Calendar } from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../app/providers/AuthContext'
import { fetchChallenges, submitChallenge } from './challengesService'
import ChallengeCard from './ChallengeCard'
import SubmitProofModal from './SubmitProofModal'
import { SECTION_ACCENTS, SECTION_META } from '../constants/sectionConfig'
import SectionHeader from '../components/SectionHeader'
import AccentLine from '../components/AccentLine'

const TAB_DEFS = [
  { id: 'daily',   icon: Flame },
  { id: 'weekly',  icon: CalendarDays },
  { id: 'monthly', icon: Calendar },
]

function countCompleted(challenges) {
  return challenges.filter(c => c.status === 'approved').length
}

function totalEarned(challenges) {
  return challenges.reduce((s, c) => s + (c.earnedPoints || 0), 0)
}

export default function ChallengesSection() {
  const { session } = useAuth()
  const { t } = useTranslation()
  const accent = SECTION_ACCENTS.challenges

  const TABS = TAB_DEFS.map(tab => ({
    ...tab,
    label: t(`challenges.tabs.${tab.id}`),
    desc: t(`challenges.tabs.${tab.id}Desc`),
  }))
  const [activeTab, setActiveTab] = useState('daily')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(null) // challenge being submitted

  const load = useCallback(() => {
    // FIX: call setLoading(false) before early return to avoid infinite spinner
    if (!session?.userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    fetchChallenges(session.userId)
      .then(setData)
      .catch(() => setError(t('challenges.error')))
      .finally(() => setLoading(false))
  }, [session?.userId])

  useEffect(() => { load() }, [load])

  async function handleSubmit({ proof, imageFile }) {
    if (!submitting || !session?.userId) throw new Error('Sesiune invalidă')
    const result = await submitChallenge({
      userId: session.userId,
      challengeId: submitting.id,
      challengeType: submitting.type,
      periodKey: submitting.periodKey,
      proofText: proof,
      proofImageFile: imageFile,
      verifyType: submitting.verifyType || 'text',
      challengeTitle: submitting.title,
      challengeDescription: submitting.description,
      challengePoints: submitting.points,
    })
    return result
  }

  function handleModalClose(result) {
    setSubmitting(null)
    // FIX: refresh after any completed submission (approved OR rejected)
    // result is null only when user cancels without submitting
    if (result !== null && result !== undefined) {
      load()
    }
  }

  const currentList = data?.[activeTab] || []
  const completedCount = countCompleted(currentList)
  const tabEarned = totalEarned(currentList)

  return (
    <section className="space-y-5 pb-24 lg:pb-6">
      <SectionHeader section="challenges" accent={accent} meta={SECTION_META.challenges}>
        {data && (
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2"
               style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
            <Trophy size={14} style={{ color: accent.color }} />
            <span className="font-mono text-sm font-black text-white">{data.totalPoints}</span>
            <span className="text-xs font-semibold text-slate-400">{t('challenges.totalPoints')}</span>
          </div>
        )}
      </SectionHeader>

      {/* Tab navigation */}
      <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-1.5">
        {TABS.map(tab => {
          const Icon = tab.icon
          const list = data?.[tab.id] || []
          const done = countCompleted(list)
          const total = list.length
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all',
                active
                  ? 'bg-white/[0.06] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              <Icon size={14} strokeWidth={active ? 2.2 : 1.75}
                    style={active ? { color: accent.color } : undefined} />
              <span className="hidden sm:inline">{tab.label}</span>
              {total > 0 && (
                <span className={clsx(
                  'min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center transition-colors',
                  done === total
                    ? 'bg-emerald-400/20 text-emerald-300'
                    : active ? 'text-white' : 'text-slate-600',
                )} style={active && done < total ? { background: accent.bg, color: accent.color } : undefined}>
                  {done}/{total}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Period info */}
      {data && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {TABS.find(t => t.id === activeTab)?.desc}
          </p>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            <RotateCcw size={11} /> {t('challenges.refresh')}
          </button>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={24} className="animate-spin" style={{ color: accent.color }} />
            <p className="text-sm text-slate-500">{t('challenges.loading')}</p>
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.07] p-6 text-center">
            <p className="text-sm text-rose-300">{error}</p>
            <button onClick={load} className="mt-3 text-xs text-rose-400 underline hover:text-rose-300">
              {t('challenges.retry')}
            </button>
          </motion.div>
        ) : (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      className="space-y-3">

            {/* Tab summary card */}
            {currentList.length > 0 && (
              <div className="premium-card p-4 overflow-hidden">
                <AccentLine color={accent.color} />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      {completedCount === currentList.length
                        ? t('challenges.allCompleted')
                        : t('challenges.remaining', { count: currentList.length - completedCount })}
                    </p>
                    {/* Progress bar */}
                    <div className="w-48 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: accent.color }}
                        initial={{ width: 0 }}
                        animate={{ width: currentList.length > 0 ? `${(completedCount / currentList.length) * 100}%` : '0%' }}
                        transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.1 }}
                      />
                    </div>
                  </div>
                  {tabEarned > 0 && (
                    <div className="text-right">
                      <p className="font-mono text-lg font-black text-white">{tabEarned}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{t('challenges.earnedPoints')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Challenge cards */}
            {currentList.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-8 text-center">
                <p className="text-sm text-slate-500">{t('challenges.noneAvailable')}</p>
              </div>
            ) : (
              currentList.map((c, i) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  index={i}
                  onSubmit={setSubmitting}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer note */}
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
        <p className="text-[11px] text-slate-600 leading-relaxed text-center">
          {t('challenges.aiVerified')}
        </p>
      </div>

      {/* Submit modal */}
      <AnimatePresence>
        {submitting && (
          <SubmitProofModal
            key={submitting.id}
            challenge={submitting}
            onSubmit={handleSubmit}
            onClose={handleModalClose}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
