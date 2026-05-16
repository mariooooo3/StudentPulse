import { Map, Calendar, BookOpen, Users, MessageSquare, Clock, ArrowRight, Bell, Sparkles } from 'lucide-react'
import { getDashboardData, getScheduleData } from '../../shared/data/facultyCatalog'
import { getUniversityTheme } from '../../shared/utils/theme'
import { formatLiveDate, getNextScheduleItem, getUpcomingScheduleItems } from '../../shared/utils/dateTime'
import { useNow } from '../../shared/hooks/useNow'

const MODULES = [
  { id: 'navigator', icon: Map, label: 'Campus Navigator', desc: 'Gaseste orice sala instantaneu cu AI Photo Navigation', color: 'from-indigo-600 to-violet-600', glow: 'shadow-indigo-500/30' },
  { id: 'schedule', icon: Calendar, label: 'Schedule Hub', desc: 'Orar personal, recuperari, transfer de grupa', color: 'from-emerald-600 to-teal-600', glow: 'shadow-emerald-500/30' },
  { id: 'thesis', icon: BookOpen, label: 'Thesis Finder', desc: 'Profesori disponibili cu criterii clare si locuri in timp real', color: 'from-amber-600 to-orange-600', glow: 'shadow-amber-500/30' },
  { id: 'tutoring', icon: Users, label: 'Peer Tutoring', desc: 'Sesiuni 1-la-1 si grup, Skill Swap automat', color: 'from-rose-600 to-pink-600', glow: 'shadow-rose-500/30' },
  { id: 'messages', icon: MessageSquare, label: 'Mesaje', desc: 'Comunicare academica cu profesori si colegi', color: 'from-blue-600 to-cyan-600', glow: 'shadow-blue-500/30' },
]

function nameFromEmail(email) {
  if (!email) return null
  const local = email.split('@')[0]
  return local.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function Dashboard({ profile, session, onNavigate }) {
  const displayName = nameFromEmail(session?.email) || profile?.name || 'Student'
  const dashboard = getDashboardData(profile)
  const now = useNow()
  const scheduleData = getScheduleData(profile)
  const schedule = Array.isArray(scheduleData) ? scheduleData : scheduleData?.schedule || []
  const upcoming = getUpcomingScheduleItems(schedule, now, 3)
  const nextCourse = getNextScheduleItem(schedule, now)
  const liveDashboard = {
    ...dashboard,
    nextCourse: nextCourse
      ? { in: nextCourse.in, label: `${nextCourse.name} · ${nextCourse.room}` }
      : { in: 'Nicio ora', label: 'Nu exista cursuri programate' },
    stats: dashboard.stats.map((stat) => (
      stat.label.includes('Cursuri azi')
        ? { ...stat, val: String(upcoming.filter(item => item.startDate.toDateString() === now.toDateString()).length) }
        : stat
    )),
    upcoming: upcoming.length ? upcoming : dashboard.upcoming,
  }
  const theme = getUniversityTheme(session?.university)
  const personalizationLabel = profile?.faculty?.replace(/^Facultatea de\s+/i, '') || 'profilul tau'
  const personalizedModules = ['Orar', 'Licenta', 'Tutoring', 'Notificari']

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div
        className="relative overflow-hidden glass-card p-6"
        style={{
          background: `linear-gradient(135deg, ${theme.accentSoft}, rgba(15, 23, 42, 0.42))`,
          borderColor: theme.accentBorder,
        }}
      >
        <div
          className="absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl opacity-30"
          style={{ background: theme.accent }}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <div
              className="inline-flex flex-wrap items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold shadow-lg shadow-slate-950/20 mb-3"
              style={{ background: theme.accentSoft, borderColor: theme.accentBorder, color: theme.accent }}
            >
              <Sparkles size={12} />
              <span>Personalizat pentru {personalizationLabel}</span>
              <span className="hidden sm:inline text-indigo-300/50">·</span>
              <span className="hidden sm:inline text-indigo-100/80">{personalizedModules.join(' + ')}</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Bun venit inapoi,</p>
            <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
            <p className="text-slate-400 text-sm">{profile?.faculty || 'FII'} · {profile?.year || 'Anul 2'} · {formatLiveDate(now)}</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-slate-500 text-xs mb-1">Urmator curs in</p>
            <p className="text-2xl font-bold" style={{ color: theme.accent }}>{liveDashboard.nextCourse.in}</p>
            <p className="text-xs text-slate-500">{liveDashboard.nextCourse.label}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-6">
          {liveDashboard.stats.map(s => (
            <div key={s.label} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/40">
              <div className="text-lg mb-0.5">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.val}</div>
              <div className="text-[10px] text-slate-500 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Module</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MODULES.map(m => {
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  onClick={() => onNavigate(m.id)}
                  className={`glass-card p-5 text-left hover:border-slate-600 hover:scale-[1.02] transition-all duration-200 group shadow-lg ${m.glow}`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <p className="font-semibold text-white text-sm mb-1">{m.label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Deschide <ArrowRight size={12} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Azi - Program</h3>
            <div className="glass-card overflow-hidden">
              {liveDashboard.upcoming.map((c, i) => (
                <div key={i} className={`flex items-center gap-3 p-3.5 ${i < liveDashboard.upcoming.length - 1 ? 'border-b border-slate-700/40' : ''}`}>
                  <div className={`w-2 h-12 rounded-full ${c.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.time} · {c.room} · {c.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={11} /> {c.in}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bell size={13} /> Notificari
            </h3>
            <div className="space-y-2">
              {dashboard.alerts.map((a, i) => (
                <div key={i} className="glass-card p-3 flex items-start gap-3">
                  <span className="text-lg shrink-0">{a.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 leading-relaxed">{a.text}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
