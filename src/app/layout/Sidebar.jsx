import {
  BookOpen,
  Briefcase,
  Calendar,
  ChevronRight,
  Compass,
  Home,
  LogOut,
  Map,
  MapPin,
  MessageSquare,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../providers/AuthContext'
import { getUniversityTheme } from '../../shared/utils/theme'

const NAV_BY_MODE = {
  academic: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'navigator', label: 'Campus Navigator', icon: Map },
    { id: 'schedule', label: 'Schedule Hub', icon: Calendar },
    { id: 'thesis', label: 'Thesis Finder', icon: BookOpen },
    { id: 'tutoring', label: 'Peer Tutoring', icon: Users },
    { id: 'messages', label: 'Mesaje', icon: MessageSquare, badge: 3 },
  ],
  life: [
    { id: 'discounts', label: 'Discounts & Benefits', icon: Tag },
    { id: 'career', label: 'Career & Internships', icon: Briefcase },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'citylife', label: 'Viața în Oraș', icon: MapPin },
  ],
}

const MODE_COPY = {
  academic: {
    name: 'StudentAcademic',
    subtitle: 'Academic infrastructure',
    label: 'Academic',
    icon: Compass,
  },
  life: {
    name: 'StudentLife',
    subtitle: 'Adaptare si comunitate',
    label: 'Student Life',
    icon: Sparkles,
  },
}

export default function Sidebar({ platformMode = 'academic', currentView, onNavigate, profile, session }) {
  const { logout } = useAuth()

  const university = session?.university
  const theme = getUniversityTheme(university)
  const nav = NAV_BY_MODE[platformMode] || NAV_BY_MODE.academic
  const modeCopy = MODE_COPY[platformMode] || MODE_COPY.academic
  const ModeIcon = modeCopy.icon
  const displayName = profile?.name || session?.email?.split('@')[0] || 'Student'
  const facultyLabel = profile?.faculty || session?.detectedFaculty?.name || university?.shortName || 'FII'
  const yearLabel = profile?.year || 'An 1'

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700/50 flex flex-col h-full shrink-0">
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border border-white/10 transition-all duration-300"
            style={{
              background: university
                ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentStrong})`
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: university ? `0 16px 36px -22px ${theme.accent}` : undefined,
            }}
          >
            <ModeIcon size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">{modeCopy.name}</p>
            <p className="text-xs text-slate-500">{modeCopy.subtitle}</p>
          </div>
        </div>
      </div>

      {university && (
        <div className="px-4 pt-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium"
            style={{ background: university.color + '12', borderColor: university.color + '30', color: university.color }}
          >
            <span className="font-bold">{university.avatar}</span>
            <span className="truncate">{university.shortName}</span>
          </div>
        </div>
      )}

      <nav key={platformMode} className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto animate-fade-in">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          {modeCopy.label}
        </div>
        {nav.map(({ id, label, icon: Icon, badge }) => {
          const active = currentView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group active:scale-[0.98]',
                active
                  ? 'border shadow-lg shadow-slate-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
              )}
              style={active ? {
                background: theme.accentSoft,
                borderColor: theme.accentBorder,
                color: theme.accent,
              } : undefined}
            >
              <Icon
                size={18}
                className={clsx(!active && 'text-slate-500 group-hover:text-slate-300')}
                style={active ? { color: theme.accent } : undefined}
              />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span
                  className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: theme.accent }}
                >
                  {badge}
                </span>
              )}
              {active && <ChevronRight size={14} style={{ color: theme.accent }} />}
            </button>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-700/50 space-y-2">
        <div className="flex items-center gap-3 px-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={university ? { background: university.color } : { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-200 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">{facultyLabel} · {yearLabel}</p>
          </div>
          <button
            onClick={logout}
            title="Deconectare"
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
