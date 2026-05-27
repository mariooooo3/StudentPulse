import {
  Map, Calendar, BookOpen, Users, MessageSquare,
  Clock, ArrowUpRight, Sparkles, GraduationCap,
  BarChart3, Layers, Trophy, TrendingUp, Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getDashboardData, getScheduleData } from '../../shared/data/facultyCatalog'
import { getUniversityTheme } from '../../shared/utils/theme'
import { formatLiveDate, getNextScheduleItem, getUpcomingScheduleItems } from '../../shared/utils/dateTime'
import { useNow } from '../../shared/hooks/useNow'
import SPLogo from '../../components/ui/SPLogo'

const MODULE_DEFS = [
  { id: 'navigator', icon: Map,           accent: '#6366f1', accentSoft: 'rgba(99,102,241,0.12)', span: 'md:col-span-2', tag: 'Live' },
  { id: 'schedule',  icon: Calendar,      accent: '#10b981', accentSoft: 'rgba(16,185,129,0.12)' },
  { id: 'thesis',    icon: BookOpen,      accent: '#f59e0b', accentSoft: 'rgba(245,158,11,0.12)' },
  { id: 'tutoring',  icon: Users,         accent: '#f43f5e', accentSoft: 'rgba(244,63,94,0.12)' },
  { id: 'messages',  icon: MessageSquare, accent: '#3b82f6', accentSoft: 'rgba(59,130,246,0.12)' },
]

const STAT_ACCENTS = [
  { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)' },
  { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
  { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
  { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
]

function getStatIcon(label) {
  const l = label.toLowerCase()
  if (l.includes('curs') || l.includes('class') || l.includes('corso') || l.includes('clase')) return GraduationCap
  if (l.includes('credit')) return Trophy
  if (l.includes('medi') || l.includes('grade') || l.includes('voto') || l.includes('nota')) return BarChart3
  if (l.includes('ore') || l.includes('orar') || l.includes('hour') || l.includes('ora')) return Clock
  return Layers
}

function nameFromEmail(email) {
  if (!email) return null
  return email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 24 } },
}

function isSameCalendarDay(a, b) {
  return Boolean(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate())
}

export default function Dashboard({ profile, session, onNavigate }) {
  const { t, i18n } = useTranslation()
  const displayName = nameFromEmail(session?.email) || profile?.name || 'Student'
  const firstName = displayName.split(' ')[0]
  const dashboard = getDashboardData(profile, session)
  const now = useNow()
  const scheduleData = getScheduleData(profile, session)
  const schedule = Array.isArray(scheduleData) ? scheduleData : scheduleData?.schedule || []
  const allUpcoming = getUpcomingScheduleItems(schedule, now, Math.max(schedule.length, 1))
  const upcoming = allUpcoming.slice(0, 4)
  const nextCourse = getNextScheduleItem(schedule, now)
  const theme = getUniversityTheme(session?.university)

  const MODULES = MODULE_DEFS.map(m => ({
    ...m,
    label: t(`nav.${m.id}`),
    desc: t(`dashboard.moduleDesc.${m.id}`),
  }))

  function relativeDayLabel(target) {
    if (isSameCalendarDay(target, now)) return t('dashboard.today')
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    if (isSameCalendarDay(target, tomorrow)) return t('dashboard.tomorrow')
    return target.toLocaleDateString(i18n.language, { weekday: 'long' })
  }

  function scheduleSectionLabel(items) {
    const first = items?.[0]
    if (!first?.startDate) return t('dashboard.schedule')
    const label = relativeDayLabel(first.startDate)
    return label === t('dashboard.today')
      ? t('dashboard.scheduleToday')
      : `${label.charAt(0).toUpperCase() + label.slice(1)} — ${t('dashboard.schedule')}`
  }

  const noScheduleLabel = t('dashboard.noSchedule')
  const liveDashboard = {
    ...dashboard,
    nextCourse: nextCourse
      ? { in: nextCourse.in, label: `${nextCourse.name}`, room: nextCourse.room, startDate: nextCourse.startDate }
      : { in: '-', label: noScheduleLabel, room: '' },
    upcoming: upcoming.length ? upcoming : dashboard.upcoming,
  }
  const scheduleTitle = scheduleSectionLabel(liveDashboard.upcoming)
  const h = now.getHours()
  const greeting = h < 12 ? t('dashboard.greetingMorning') : h < 18 ? t('dashboard.greetingAfternoon') : t('dashboard.greetingEvening')

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-auto">

      {/* ── Hero banner ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className="relative overflow-hidden rounded-2xl noise"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}18 0%, rgba(8,14,28,0.95) 50%, rgba(5,8,16,0.98) 100%)`,
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.5), 0 0 40px ${theme.accent}0a`,
        }}
      >
        {/* Background orb */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl"
          style={{ background: theme.accent, opacity: 0.15 }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 w-56 h-40 rounded-full blur-3xl"
          style={{ background: theme.accentStrong || theme.accent, opacity: 0.06 }}
        />
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-25" />

        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}60, transparent)` }}
        />

        <div className="relative p-5 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

            {/* Left */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <SPLogo accent={theme.accent} accentStrong={theme.accentStrong} size="md" />
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-widest uppercase"
                  style={{ background: theme.accentSoft, borderColor: theme.accentBorder, color: theme.accent }}
                >
                  <Sparkles size={9} strokeWidth={2.5} />
                  {t('dashboard.personalized')}
                </div>
              </div>
              <p className="text-slate-500 text-[13px] font-medium">{greeting},</p>
              <h2
                className="text-[2rem] sm:text-[2.4rem] font-bold tracking-tight leading-none mt-1 mb-3"
                style={{ color: '#fff' }}
              >
                {firstName}
                <span className="ml-2 text-[1.2rem] sm:text-[1.5rem] animate-float inline-block">👋</span>
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600">
                <span
                  className="px-2 py-0.5 rounded-full border text-[11px] font-semibold"
                  style={{ background: theme.accentSoft, borderColor: theme.accentBorder, color: theme.accent }}
                >
                  {profile?.faculty || 'Facultatea de Informatică'}
                </span>
                <span className="text-slate-800">·</span>
                <span>{profile?.year || 'Anul 2'}</span>
                <span className="text-slate-800">·</span>
                <span className="font-mono text-slate-600">{formatLiveDate(now, i18n.language)}</span>
              </div>
            </div>

            {/* Next course card */}
            {liveDashboard.nextCourse.label !== noScheduleLabel && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 80, damping: 18 }}
                className="md:text-right shrink-0 rounded-2xl border px-5 py-4"
                style={{
                  background: `${theme.accent}0d`,
                  borderColor: `${theme.accent}28`,
                  boxShadow: `0 0 24px ${theme.accent}0d, inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-2 flex items-center md:justify-end gap-1.5">
                  <Zap size={9} strokeWidth={2.5} style={{ color: theme.accent }} />
                  {t('dashboard.nextCourse')}
                </p>
                <p className="font-mono text-[2rem] font-bold leading-none" style={{ color: theme.accent }}>
                  {liveDashboard.nextCourse.in}
                </p>
                <p className="text-[12px] text-slate-300 mt-2 max-w-[200px] md:ml-auto font-semibold leading-snug">
                  {liveDashboard.nextCourse.label}
                </p>
                {liveDashboard.nextCourse.room && (
                  <p className="text-[10px] text-slate-600 mt-0.5 font-mono">
                    {liveDashboard.nextCourse.room}
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
            {liveDashboard.stats.map((s, i) => {
              const Icon = getStatIcon(s.label)
              const accent = STAT_ACCENTS[i % STAT_ACCENTS.length]
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, type: 'spring', stiffness: 100, damping: 20 }}
                  className="group relative rounded-xl p-3.5 cursor-default overflow-hidden transition-all duration-200 hover:-translate-y-[1px]"
                  style={{
                    background: accent.bg,
                    border: `1px solid ${accent.border}`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  <div
                    className="absolute top-0 inset-x-0 h-[2px] rounded-t-xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${accent.color}60, transparent)` }}
                  />
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${accent.color}20`, border: `1px solid ${accent.color}30` }}
                    >
                      <Icon size={13} strokeWidth={1.75} style={{ color: accent.color }} />
                    </div>
                    <TrendingUp size={10} className="opacity-0 group-hover:opacity-70 transition-opacity" style={{ color: accent.color }} strokeWidth={2} />
                  </div>
                  <p className="font-mono text-[1.4rem] font-bold text-white leading-none">{s.val}</p>
                  <p className="text-[10px] text-slate-600 mt-1.5 font-medium leading-snug">{s.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Main grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_296px] gap-5">

        {/* Modules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">{t('dashboard.modules')}</p>
            <span className="text-[10px] text-slate-700 font-medium">{t('dashboard.available', { count: MODULES.length })}</span>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            {MODULES.map((m) => {
              const Icon = m.icon
              return (
                <motion.button
                  key={m.id}
                  variants={itemVariants}
                  whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(m.id)}
                  className={`module-card group text-left p-5 ${m.span || ''}`}
                >
                  <div
                    className="absolute top-0 inset-x-0 h-[1px] rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${m.accent}55, transparent)` }}
                  />

                  <div className="flex items-start justify-between mb-4">
                    <div className="p-[1.5px] rounded-xl bg-gradient-to-b from-white/10 to-white/[0.02]">
                      <div
                        className="w-11 h-11 rounded-[calc(0.75rem-1.5px)] flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                        style={{
                          background: m.accentSoft,
                          border: `1px solid ${m.accent}25`,
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
                        }}
                      >
                        <Icon size={19} strokeWidth={1.75} style={{ color: m.accent }} />
                      </div>
                    </div>
                    {m.tag && (
                      <span
                        className="text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full border"
                        style={{ color: m.accent, background: m.accent + '10', borderColor: m.accent + '28' }}
                      >
                        {m.tag}
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-white text-[13px] leading-tight mb-2">{m.label}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{m.desc}</p>

                  <div
                    className="flex items-center gap-1.5 mt-4 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200"
                    style={{ color: m.accent }}
                  >
                    {t('dashboard.open')}
                    <ArrowUpRight size={12} strokeWidth={2.5} />
                  </div>

                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: `radial-gradient(circle at 20% 20%, ${m.accent}0b, transparent 60%)` }}
                  />
                </motion.button>
              )
            })}
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Today's schedule */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 80, damping: 20 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="section-label">{scheduleTitle}</p>
              <button
                onClick={() => onNavigate('schedule')}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-1.5 text-[10px] font-bold text-emerald-300 transition-colors hover:bg-emerald-500/[0.1]"
              >
                {t('dashboard.fullSchedule')} <ArrowUpRight size={10} strokeWidth={2.5} />
              </button>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#080e1c] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              {liveDashboard.upcoming.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                    <Calendar size={16} className="text-slate-700" strokeWidth={1.5} />
                  </div>
                  <p className="text-[13px] text-slate-600 font-medium">{t('dashboard.noActivities')}</p>
                  <p className="text-[11px] text-slate-700 mt-1">{t('dashboard.checkSchedule')}</p>
                </div>
              ) : (
                liveDashboard.upcoming.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className={`w-[3px] h-9 rounded-full shrink-0 ${c.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-200 truncate leading-tight">{c.name}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 font-mono">{c.time} · {c.room}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700 shrink-0 group-hover:text-slate-500 transition-colors">
                      <Clock size={11} strokeWidth={1.75} />
                      {c.in}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
