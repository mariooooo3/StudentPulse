import {
  Map, Calendar, BookOpen, Users, MessageSquare,
  Clock, ArrowUpRight, Sparkles, GraduationCap,
  BarChart3, Layers, Trophy, AlertCircle, CheckCircle2, Info,
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
    accent: '#6366f1', span: 'md:col-span-2',
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

const STAT_ICONS = {
  default: BarChart3,
  curs: GraduationCap,
  credite: Trophy,
  medii: Layers,
  ore: Clock,
}

function getStatIcon(label) {
  const l = label.toLowerCase()
  if (l.includes('curs')) return GraduationCap
  if (l.includes('credit')) return Trophy
  if (l.includes('medii') || l.includes('medie')) return BarChart3
  if (l.includes('ore') || l.includes('orar')) return Clock
  return Layers
}

const ALERT_ICONS = { warning: AlertCircle, success: CheckCircle2, info: Info }

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

      {/* ── Hero banner ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.07] p-6"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}12 0%, rgba(5,8,16,0.6) 60%)`,
        }}
      >
        {/* Mesh orb */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{ background: theme.accent }}
        />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-48 h-32 rounded-full blur-3xl opacity-10"
          style={{ background: theme.accentStrong || theme.accent }} />

        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-5">
          {/* Greeting */}
          <div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-widest uppercase mb-4"
              style={{ background: theme.accentSoft, borderColor: theme.accentBorder, color: theme.accent }}
            >
              <Sparkles size={10} strokeWidth={2.5} />
              Personalizat pentru tine
            </div>
            <p className="text-slate-500 text-[13px] font-medium">{greeting},</p>
            <h2 className="text-[1.75rem] font-bold text-white tracking-tight leading-none mt-0.5 mb-2">{firstName}</h2>
            <p className="text-[12px] text-slate-600 font-medium">
              {profile?.faculty || 'Facultatea de Informatică'} &middot; {profile?.year || 'Anul 2'} &middot; {formatLiveDate(now)}
            </p>
          </div>

          {/* Next course */}
          <div
            className="md:text-right shrink-0 rounded-xl border px-4 py-3 bg-white/[0.03] border-white/[0.07]"
          >
            <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mb-1">Următor curs</p>
            <p className="font-mono text-2xl font-bold leading-none" style={{ color: theme.accent }}>
              {liveDashboard.nextCourse.in}
            </p>
            <p className="text-[12px] text-slate-500 mt-1 max-w-[180px] md:ml-auto">{liveDashboard.nextCourse.label}</p>
            {liveDashboard.nextCourse.room && (
              <p className="text-[11px] text-slate-700 mt-0.5">{liveDashboard.nextCourse.room}</p>
            )}
          </div>
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
                className="stat-card"
              >
                <Icon size={14} className="text-slate-600 mb-2" strokeWidth={1.75} />
                <p className="font-mono text-xl font-bold text-white leading-none">{s.val}</p>
                <p className="text-[10px] text-slate-600 mt-1 font-medium leading-snug">{s.label}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Main grid ─────────────────────────────────── */}
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
                  whileHover={{ y: -2, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(m.id)}
                  className={`module-card group text-left p-5 ${m.span || ''}`}
                >
                  {/* Double-bezel icon */}
                  <div className="p-[1.5px] rounded-xl bg-gradient-to-b from-white/10 to-white/[0.03] mb-4 w-fit">
                    <div
                      className="w-10 h-10 rounded-[calc(0.75rem-1.5px)] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                      style={{ background: m.accent + '22' }}
                    >
                      <Icon size={18} strokeWidth={1.75} style={{ color: m.accent }} />
                    </div>
                  </div>

                  <p className="font-semibold text-white text-[13px] leading-tight mb-1.5">{m.label}</p>
                  <p className="text-[12px] text-slate-600 leading-relaxed">{m.desc}</p>

                  <div className="flex items-center gap-1 mt-4 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: m.accent }}>
                    Deschide
                    <ArrowUpRight size={12} strokeWidth={2.5} />
                  </div>

                  {/* Hover glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${m.accent}08, transparent 70%)` }}
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
            <p className="section-label mb-3">Azi — Program</p>
            <div className="glass-card overflow-hidden">
              {liveDashboard.upcoming.length === 0 ? (
                <div className="p-6 text-center">
                  <Calendar size={20} className="text-slate-800 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-[13px] text-slate-600">Nicio oră azi</p>
                </div>
              ) : (
                liveDashboard.upcoming.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Color bar */}
                    <div className={`w-[3px] h-10 rounded-full shrink-0 ${c.color}`} />

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-200 truncate leading-tight">{c.name}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{c.time} &middot; {c.room}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700 shrink-0">
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
            <p className="section-label mb-3">Notificari</p>
            <div className="space-y-2">
              {dashboard.alerts.map((a, i) => {
                const Icon = ALERT_ICONS[a.type] || Info
                return (
                  <div key={i} className="glass-card p-3.5 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={13} className="text-slate-500" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-slate-300 leading-relaxed">{a.text}</p>
                      <p className="text-[10px] text-slate-700 mt-1 font-mono">{a.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
