import {
  Map, Calendar, BookOpen, Users, MessageSquare,
  Clock, ArrowUpRight, Sparkles, GraduationCap,
  BarChart3, Layers, Trophy, AlertCircle, CheckCircle2, Info,
  TrendingUp, Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getDashboardData, getScheduleData } from '../../shared/data/facultyCatalog'
import { getUniversityTheme } from '../../shared/utils/theme'
import { formatLiveDate, getNextScheduleItem, getUpcomingScheduleItems } from '../../shared/utils/dateTime'
import { useNow } from '../../shared/hooks/useNow'

const MODULES = [
  {
    id: 'navigator', icon: Map, label: 'Campus Navigator',
    desc: 'Hartă live, AI chat și recunoaștere vizuală a clădirilor.',
    accent: '#6366f1', span: 'md:col-span-2', tag: 'Live',
  },
  {
    id: 'schedule', icon: Calendar, label: 'Schedule Hub',
    desc: 'Orar personal, recuperări și transfer de grupă.',
    accent: '#10b981',
  },
  {
    id: 'thesis', icon: BookOpen, label: 'Thesis Finder',
    desc: 'Profesori disponibili cu locuri în timp real.',
    accent: '#f59e0b',
  },
  {
    id: 'tutoring', icon: Users, label: 'Peer Tutoring',
    desc: 'Sesiuni 1-la-1, grup și Skill Swap automat.',
    accent: '#f43f5e',
  },
  {
    id: 'messages', icon: MessageSquare, label: 'Mesaje',
    desc: 'Comunicare academică cu profesori și colegi.',
    accent: '#3b82f6',
  },
]

function getStatIcon(label) {
  const l = label.toLowerCase()
  if (l.includes('curs')) return GraduationCap
  if (l.includes('credit')) return Trophy
  if (l.includes('medii') || l.includes('medie')) return BarChart3
  if (l.includes('ore') || l.includes('orar')) return Clock
  return Layers
}

const ALERT_ICONS = { warning: AlertCircle, success: CheckCircle2, info: Info }
const ALERT_COLORS = {
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '#f59e0b' },
  success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: '#10b981' },
  info:    { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', icon: '#6366f1' },
}

function nameFromEmail(email) {
  if (!email) return null
  return email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 20 } },
}

export default function Dashboard({ profile, session, onNavigate }) {
  const displayName = nameFromEmail(session?.email) || profile?.name || 'Student'
  const firstName = displayName.split(' ')[0]
  const dashboard = getDashboardData(profile)
  const now = useNow()
  const scheduleData = getScheduleData(profile)
  const schedule = Array.isArray(scheduleData) ? scheduleData : scheduleData?.schedule || []
  const upcoming = getUpcomingScheduleItems(schedule, now, 4)
  const nextCourse = getNextScheduleItem(schedule, now)
  const theme = getUniversityTheme(session?.university)

  const liveDashboard = {
    ...dashboard,
    nextCourse: nextCourse
      ? { in: nextCourse.in, label: `${nextCourse.name}`, room: nextCourse.room }
      : { in: '—', label: 'Nicio oră programată', room: '' },
    upcoming: upcoming.length ? upcoming : dashboard.upcoming,
  }

  const h = now.getHours()
  const greeting = h < 12 ? 'Bună dimineața' : h < 18 ? 'Bună ziua' : 'Bună seara'

  return (
    <div className="p-5 space-y-5 overflow-auto">

      {/* ── Hero banner ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.07] noise"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}14 0%, rgba(7,11,20,0.9) 55%, rgba(5,8,16,0.95) 100%)`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 3px rgba(0,0,0,0.5)',
        }}
      >
        {/* Background orb */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl"
          style={{ background: theme.accent, opacity: 0.18 }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/4 w-48 h-32 rounded-full blur-3xl opacity-[0.08]"
          style={{ background: theme.accentStrong || theme.accent }}
        />
        {/* Dot grid */}
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

        <div className="relative p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

            {/* Left: greeting */}
            <div>
              <div
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-widest uppercase mb-4"
                style={{ background: theme.accentSoft, borderColor: theme.accentBorder, color: theme.accent }}
              >
                <Sparkles size={10} strokeWidth={2.5} />
                Personalizat pentru tine
              </div>
              <p className="text-slate-500 text-[13px] font-medium">{greeting},</p>
              <h2 className="text-[2rem] font-bold text-white tracking-tight leading-none mt-1 mb-2">{firstName}</h2>
              <p className="text-[12px] text-slate-600 font-medium flex items-center gap-1.5">
                <span>{profile?.faculty || 'Facultatea de Informatică'}</span>
                <span className="text-slate-800">·</span>
                <span>{profile?.year || 'Anul 2'}</span>
                <span className="text-slate-800">·</span>
                <span>{formatLiveDate(now)}</span>
              </p>
            </div>

            {/* Right: next course */}
            {liveDashboard.nextCourse.label !== 'Nicio oră programată' && (
              <div
                className="md:text-right shrink-0 rounded-xl border px-4 py-3"
                style={{
                  background: `${theme.accent}0a`,
                  borderColor: `${theme.accent}25`,
                  boxShadow: `0 0 20px ${theme.accent}10`,
                }}
              >
                <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mb-1.5 flex items-center md:justify-end gap-1">
                  <Clock size={10} strokeWidth={2} />
                  Următor curs
                </p>
                <p className="font-mono text-2xl font-bold leading-none" style={{ color: theme.accent }}>
                  {liveDashboard.nextCourse.in}
                </p>
                <p className="text-[12px] text-slate-400 mt-1.5 max-w-[180px] md:ml-auto font-medium">{liveDashboard.nextCourse.label}</p>
                {liveDashboard.nextCourse.room && (
                  <p className="text-[11px] text-slate-600 mt-0.5 font-mono">{liveDashboard.nextCourse.room}</p>
                )}
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
            {liveDashboard.stats.map((s, i) => {
              const Icon = getStatIcon(s.label)
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 100, damping: 20 }}
                  className="stat-card group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={13} className="text-slate-700 group-hover:text-slate-500 transition-colors" strokeWidth={1.75} />
                    <TrendingUp size={11} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                  </div>
                  <p className="font-mono text-xl font-bold text-white leading-none">{s.val}</p>
                  <p className="text-[10px] text-slate-600 mt-1.5 font-medium leading-snug">{s.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Main grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">

        {/* Modules */}
        <div>
          <p className="section-label mb-3">Module</p>
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
                  {/* Colored top border */}
                  <div
                    className="absolute top-0 inset-x-0 h-[1px] rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${m.accent}50, transparent)` }}
                  />

                  {/* Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-[1.5px] rounded-xl bg-gradient-to-b from-white/10 to-white/[0.03]">
                      <div
                        className="w-10 h-10 rounded-[calc(0.75rem-1.5px)] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-transform duration-200 group-hover:scale-105"
                        style={{ background: m.accent + '1e' }}
                      >
                        <Icon size={18} strokeWidth={1.75} style={{ color: m.accent }} />
                      </div>
                    </div>
                    {m.tag && (
                      <span
                        className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full border"
                        style={{ color: m.accent, background: m.accent + '12', borderColor: m.accent + '30' }}
                      >
                        {m.tag}
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-white text-[13px] leading-tight mb-1.5">{m.label}</p>
                  <p className="text-[12px] text-slate-600 leading-relaxed">{m.desc}</p>

                  <div
                    className="flex items-center gap-1 mt-4 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200"
                    style={{ color: m.accent }}
                  >
                    Deschide
                    <ArrowUpRight size={12} strokeWidth={2.5} />
                  </div>

                  {/* Hover glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: `radial-gradient(circle at 25% 25%, ${m.accent}0d, transparent 65%)` }}
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
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 80, damping: 20 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="section-label">Azi — Program</p>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-[10px] font-semibold text-slate-600 hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                Orar complet <ArrowUpRight size={10} />
              </button>
            </div>
            <div className="glass-card overflow-hidden">
              {liveDashboard.upcoming.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                    <Calendar size={16} className="text-slate-700" strokeWidth={1.5} />
                  </div>
                  <p className="text-[13px] text-slate-600 font-medium">Nicio oră azi</p>
                  <p className="text-[11px] text-slate-700 mt-1">Zi liberă, bucură-te!</p>
                </div>
              ) : (
                liveDashboard.upcoming.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.025] transition-colors group"
                  >
                    <div className={`w-[3px] h-10 rounded-full shrink-0 ${c.color}`} />

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

          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 80, damping: 20 }}
          >
            <p className="section-label mb-3">Notificări</p>
            <div className="space-y-2">
              {dashboard.alerts.map((a, i) => {
                const Icon = ALERT_ICONS[a.type] || Info
                const colors = ALERT_COLORS[a.type] || ALERT_COLORS.info
                return (
                  <div
                    key={i}
                    className="rounded-xl border p-3.5 flex items-start gap-3 transition-all duration-200 hover:border-white/[0.1]"
                    style={{ background: colors.bg, borderColor: colors.border }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: colors.icon + '18', border: `1px solid ${colors.icon}30` }}
                    >
                      <Icon size={13} strokeWidth={1.75} style={{ color: colors.icon }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-slate-300 leading-relaxed">{a.text}</p>
                      <p className="text-[10px] text-slate-700 mt-1.5 font-mono">{a.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Quick action */}
          <motion.button
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 80, damping: 20 }}
            onClick={() => onNavigate('navigator')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.1] hover:border-indigo-500/30 p-4 text-left transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                <Zap size={16} className="text-indigo-400" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-slate-200">Explorează campusul</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Hartă live · AI chat · Clădiri</p>
              </div>
              <ArrowUpRight size={14} className="text-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
