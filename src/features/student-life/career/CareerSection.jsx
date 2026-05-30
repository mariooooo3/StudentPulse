import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import {
  Award,
  Bot,
  Briefcase,
  Check,
  Trophy,
} from 'lucide-react'
import { useAuth } from '../../../app/providers/AuthContext'
import { useNow } from '../../../shared/hooks/useNow'
import { rollingDays } from '../../../shared/utils/dateTime'
import { studentLifeData } from '../studentLifeData'
import { SECTION_ACCENTS, SECTION_META, JOB_TYPES } from '../constants/sectionConfig'
import { containerVariants, itemVariants } from '../utils/motionVariants'
import { jobMatch } from '../utils/scoringUtils'
import { reportInAppAction } from '../challenges/challengesService'
import { normalizeCity } from '../utils/profileUtils'
import SectionHeader from '../components/SectionHeader'
import SearchField from '../components/SearchField'
import FilterPills from '../components/FilterPills'
import AccentLine from '../components/AccentLine'
import EmptyState from '../components/EmptyState'
import CVAnalysisPanel from './CVAnalysisPanel'

export default function CareerSection({ lifeProfile, applied, appliedOps }) {
  const { t } = useTranslation()
  const { session } = useAuth()
  const accent = SECTION_ACCENTS.career
  const [type, setType] = useState('Toate')
  const [query, setQuery] = useState('')
  const [challengeToast, setChallengeToast] = useState(null)
  const [cvAnalysis, setCvAnalysis] = useState(() => {
    try {
      const saved = localStorage.getItem('sp_cv_analysis')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  function handleCvAnalysis(data) {
    if (data) localStorage.setItem('sp_cv_analysis', JSON.stringify(data))
    else localStorage.removeItem('sp_cv_analysis')
    setCvAnalysis(data)
  }

  useEffect(() => {
    if (!challengeToast) return
    const timer = setTimeout(() => setChallengeToast(null), 4500)
    return () => clearTimeout(timer)
  }, [challengeToast])

  async function handleApply(job) {
    if (job.url) window.open(job.url, '_blank', 'noopener,noreferrer')
    appliedOps.add(job.id)
    if (!session?.userId) return
    try {
      const data = await reportInAppAction('career-apply')
      if (data.completed?.length > 0) {
        setChallengeToast(data.completed[0])
      }
    } catch { /* silent — challenge tracking is non-critical */ }
  }

  const now = useNow()
  const allJobs = studentLifeData.career[lifeProfile.careerKey] || studentLifeData.career.CS

  const cvAdjMap = useMemo(() => {
    if (!cvAnalysis?.jobAdjustments?.length) return {}
    return Object.fromEntries(cvAnalysis.jobAdjustments.map(a => [a.jobId, a]))
  }, [cvAnalysis])

  const jobs = useMemo(() => {
    const q = query.toLowerCase()
    return allJobs
      .filter((job) => type === 'Toate' || job.type === type)
      .filter((job) => !q || [job.role, job.company, ...job.tags].some((f) => f.toLowerCase().includes(q)))
      .map((job) => {
        const cities = job.cities.map(normalizeCity)
        const warnings = []
        if (lifeProfile.year < job.minYear) warnings.push(`${t('career.year')} ${job.minYear}+`)
        if (!job.remote && !cities.includes('all') && !cities.includes(lifeProfile.city) && job.cities[0]) warnings.push(job.cities[0])
        const deadlineDays = rollingDays(job.id, 3, 21, now)
        const baseScore = jobMatch(job, lifeProfile)
        const adj = cvAdjMap[job.id]
        // When CV is present, blend: CV signal (70%) + faculty/year signal (30%)
        // cvScore = 50 (neutral base) + adjustment → strong mismatch pushes it down to 5, strong match up to 80
        const match = adj
          ? Math.min(99, Math.max(5, Math.round(
              baseScore * 0.3 + Math.max(5, 50 + adj.adjustment) * 0.7
            )))
          : baseScore
        return { ...job, deadlineDays, match, cvReason: adj?.reason || null, warnings }
      })
      .filter((job) => cvAnalysis ? job.match >= 35 : job.baseMatch >= 1)
      .sort((a, b) => b.match - a.match)
  }, [allJobs, lifeProfile, now, query, type, cvAdjMap])

  return (
    <section className="space-y-5">
      <SectionHeader section="career" accent={accent} meta={SECTION_META.career} />

      <CVAnalysisPanel allJobs={allJobs} onAnalysis={handleCvAnalysis} cvAnalysis={cvAnalysis} lifeProfile={lifeProfile} />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] text-slate-500">
        <Award size={14} className="text-slate-400 shrink-0" strokeWidth={1.75} />
        <span><b className="text-slate-300 font-semibold">{lifeProfile.facultyName}</b> · {t('career.year')} {lifeProfile.year} · {lifeProfile.city}</span>
        {cvAnalysis && (
          <span className="ml-auto flex items-center gap-1 text-blue-400 text-[11px] font-semibold">
            <Bot size={11} /> {t('career.cvMatch')}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField value={query} onChange={setQuery} placeholder={t('career.searchPlaceholder')} />
        <FilterPills
          items={JOB_TYPES}
          labels={[t('career.filterAll'), t('career.filterInternship'), t('career.filterResearch'), t('career.filterVolunteer')]}
          value={type}
          onChange={setType}
          accent={accent}
        />
        <span className="shrink-0 font-mono text-xs font-semibold text-slate-500">{t('career.positions', { count: jobs.length })}</span>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title={t('career.notFound')} text={t('career.tryAnother')} accent={accent} />
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          {jobs.map((job) => (
            <motion.article
              key={job.id}
              variants={itemVariants}
              className="premium-card grid grid-cols-1 gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <AccentLine color={accent.color} />
              <div className="flex gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-lg"
                  style={{ background: job.color }}
                >
                  {job.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white">{job.role}</h3>
                  <p className="text-sm text-slate-500">{job.company}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="tag">{job.remote ? 'Remote' : t('career.physical', { city: job.cities?.[0] || '' })}</span>
                    <span className={clsx('tag', job.paid && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300')}>
                      {job.paid ? t('career.paid') : t('career.unpaid')}
                    </span>
                    <span className="tag">{job.type}</span>
                    <span className="tag border-sky-500/30 bg-sky-500/10 text-sky-300">
                      {t('career.applyDays', { count: job.deadlineDays })}
                    </span>
                    {job.warnings.map((w) => (
                      <span key={w} className="tag border-amber-500/30 bg-amber-500/10 text-amber-300">{w}</span>
                    ))}
                    {job.cvReason && (
                      <span className="tag border-blue-500/30 bg-blue-500/10 text-blue-300 flex items-center gap-1">
                        <Bot size={10} strokeWidth={1.75} />{job.cvReason}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.tags.map((tag) => (
                      <span key={tag} className="rounded-lg bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-slate-500">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                {cvAnalysis ? (
                  <span className={clsx(
                    'rounded-full border px-3 py-1 text-xs font-black',
                    job.match >= 80
                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                      : 'border-amber-400/30 bg-amber-400/10 text-amber-300',
                  )}>
                    {t('career.matchPercent', { percent: job.match })}
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-700 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Bot size={11} strokeWidth={1.75} />
                    {t('career.addCV')}
                  </span>
                )}
                <button
                  onClick={() => { if (!applied.has(job.id)) handleApply(job) }}
                  disabled={applied.has(job.id)}
                  className={clsx(
                    'inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all active:scale-[0.97] disabled:cursor-default',
                    applied.has(job.id)
                      ? 'bg-emerald-500/12 border border-emerald-500/25 text-emerald-300'
                      : 'btn-primary',
                  )}
                >
                  {applied.has(job.id) && <Check size={14} />}
                  {applied.has(job.id) ? t('career.applied') : t('career.apply')}
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
      {/* Challenge completion toast */}
      <AnimatePresence>
        {challengeToast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-[#0a1628]/95 px-4 py-3 backdrop-blur-sm"
            style={{ boxShadow: '0 0 40px rgba(16,185,129,0.18), 0 4px 24px rgba(0,0,0,0.4)' }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
              <Trophy size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{t('career.challengeCompleted')}</p>
              <p className="text-xs font-semibold text-emerald-400">
                +{challengeToast.points} {t('career.challengePoints')} · {challengeToast.title}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
