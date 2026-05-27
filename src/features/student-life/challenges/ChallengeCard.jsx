import { motion } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Footprints,
  Brain,
  Droplets,
  BookOpen,
  GraduationCap,
  Dumbbell,
  MessageSquare,
  NotebookPen,
  Smartphone,
  Users,
  Briefcase,
  Library,
  Users2,
  Trophy,
  Calendar,
  Zap,
  Star,
  ImageIcon,
} from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

const ICON_MAP = {
  walking:  Footprints,
  focus:    Brain,
  water:    Droplets,
  book:     BookOpen,
  class:    GraduationCap,
  stretch:  Dumbbell,
  message:  MessageSquare,
  notes:    NotebookPen,
  digital:  Smartphone,
  brain:    Brain,
  tutoring: Users,
  users:    Users,
  briefcase: Briefcase,
  library:  Library,
  group:    Users2,
  workout:  Dumbbell,
  event:    Calendar,
  learn:    GraduationCap,
  career:   Briefcase,
  hackathon: Trophy,
  streak:   Zap,
}

const CATEGORY_COLORS = {
  sănătate:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.2)' },
  academic:  { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.2)' },
  social:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)' },
  wellbeing: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' },
  carieră:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)' },
  campus:    { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.2)'  },
}

const STATUS_STYLE = {
  available: { color: 'text-slate-500', bgClass: '' },
  pending:   { color: 'text-amber-400', bgClass: 'border-amber-400/20 bg-amber-400/[0.07]' },
  approved:  { color: 'text-emerald-400', bgClass: 'border-emerald-400/20 bg-emerald-400/[0.07]' },
  rejected:  { color: 'text-rose-400', bgClass: 'border-rose-400/20 bg-rose-400/[0.07]' },
}

export default function ChallengeCard({ challenge, onSubmit, index = 0 }) {
  const { t } = useTranslation()
  const Icon = ICON_MAP[challenge.icon] || Star
  const accent = CATEGORY_COLORS[challenge.category] || CATEGORY_COLORS.academic
  const statusStyle = STATUS_STYLE[challenge.status] || STATUS_STYLE.available
  const isCompleted = challenge.status === 'approved'
  const isRejected = challenge.status === 'rejected'
  const isInApp = challenge.verifyType === 'in-app'
  const canSubmit = !isInApp && (challenge.status === 'available' || challenge.status === 'rejected')
  const inAppProgress = challenge.progress ?? 0
  const inAppTotal = challenge.requiredCount ?? 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 120, damping: 20 }}
      className={clsx(
        'premium-card p-4 transition-all duration-200 overflow-hidden',
        isCompleted && 'opacity-80',
      )}
    >
      {/* Completed overlay line */}
      {isCompleted && (
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
             style={{ background: `linear-gradient(90deg, transparent, ${accent.color}80, transparent)` }} />
      )}

      <div className="flex items-start gap-3.5">
        {/* Icon */}
        <div className={clsx(
          'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all',
          isCompleted ? 'opacity-60' : '',
        )} style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
          {isCompleted
            ? <CheckCircle2 size={18} style={{ color: accent.color }} />
            : <Icon size={17} style={{ color: accent.color }} strokeWidth={1.8} />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={clsx('text-sm font-bold leading-tight', isCompleted ? 'text-slate-400 line-through decoration-slate-600' : 'text-white')}>
                {challenge.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  {challenge.category}
                </span>
                <span className="font-mono text-[10px] font-bold" style={{ color: accent.color + 'bb' }}>
                  {t('challengeCard.points', { count: challenge.points })}
                </span>
              </div>
            </div>

            {/* Status badge */}
            {challenge.status !== 'available' && (
              <span className={clsx('shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold', statusStyle.bgClass, statusStyle.color)}>
                {t(`challengeCard.status.${challenge.status}`)}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500 leading-relaxed">{challenge.description}</p>

          {/* AI feedback on rejected */}
          {isRejected && challenge.aiFeedback && (
            <div className="mt-2.5 rounded-lg border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2">
              <p className="text-[11px] text-amber-300/80 leading-relaxed">{challenge.aiFeedback}</p>
            </div>
          )}

          {/* Completed feedback */}
          {isCompleted && challenge.aiFeedback && (
            <div className="mt-2.5 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2">
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">{challenge.aiFeedback}</p>
            </div>
          )}

          {/* In-app progress bar */}
          {isInApp && !isCompleted && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold">
                  {inAppProgress} / {inAppTotal} {inAppTotal === 1 ? t('challenges.card.appOne') : t('challenges.card.appMany')}
                </span>
                <span className="text-[10px] font-bold" style={{ color: accent.color }}>
                  {inAppProgress >= inAppTotal ? t('challenges.card.processing') : t('challenges.card.inProgress')}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: accent.color }}
                  initial={{ width: 0 }}
                  animate={{ width: inAppTotal > 0 ? `${Math.min(100, (inAppProgress / inAppTotal) * 100)}%` : '0%' }}
                  transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                />
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                {t('challenges.card.careerHintBefore')}
                <span className="text-slate-400 font-semibold">{t('challenges.card.careerHintSection')}</span>
                {t('challenges.card.careerHintAfter')}
              </p>
            </div>
          )}

          {/* Action button */}
          {canSubmit && (
            <button
              onClick={() => onSubmit(challenge)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
            >
              {isRejected ? (
                <><XCircle size={11} /> {t('challengeCard.retry')}</>
              ) : challenge.verifyType === 'screenshot' ? (
                <><ImageIcon size={11} /> {t('challengeCard.uploadScreenshot')}</>
              ) : (
                <><ChevronRight size={11} /> {t('challengeCard.submitProof')}</>
              )}
            </button>
          )}

          {isCompleted && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400/70">
              <CheckCircle2 size={12} />
              {t('challengeCard.completed', { count: challenge.earnedPoints })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
