import {
  BookOpen,
  Briefcase,
  Calendar,
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
  academic: { name: 'StudentCompass', subtitle: 'Academic', label: 'Academic', icon: Compass },
  life: { name: 'StudentCompass', subtitle: 'Student Life', label: 'Student Life', icon: Sparkles },
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
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside className="w-60 flex flex-col h-full shrink-0 bg-[#070b14] border-r border-white/[0.05]">

      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          {/* Double-bezel logo */}
          <div className="p-[1.5px] rounded-[0.85rem] bg-gradient-to-b from-white/10 to-white/[0.03]">
            <div
              className="w-9 h-9 rounded-[0.75rem] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
              style={{ background: `linear-gradient(140deg, ${theme.accent}dd, ${theme.accentStrong || theme.accent}99)` }}
            >
              <ModeIcon size={16} className="text-white" strokeWidth={2} />
            </div>
          </div>
          <div>
            <p className="font-bold text-white text-[13px] leading-tight tracking-tight">{modeCopy.name}</p>
            <p className="text-[11px] text-slate-600 font-medium">{modeCopy.subtitle}</p>
          </div>
        </div>
      </div>

      {/* University pill */}
      {university && (
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-semibold"
            style={{
              background: university.color + '0d',
              borderColor: university.color + '25',
              color: university.color,
            }}
          >
            <span className="text-xs leading-none">{university.avatar}</span>
            <span className="truncate">{university.shortName}</span>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mx-5 h-px bg-white/[0.04] mb-4" />

      {/* Nav */}
      <nav key={platformMode} className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="section-label px-3 pb-3">{modeCopy.label}</p>

        {nav.map(({ id, label, icon: Icon, badge }, i) => {
          const active = currentView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={clsx(
                'nav-item group',
                active && 'nav-item-active',
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                  style={{ background: theme.accent }}
                />
              )}

              <Icon
                size={16}
                strokeWidth={active ? 2 : 1.75}
                className={active ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}
                style={active ? { color: theme.accent } : undefined}
              />
              <span className="flex-1 text-left text-[13px]">{label}</span>

              {badge && (
                <span
                  className="min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: theme.accent }}
                >
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User card */}
      <div className="p-3 mt-2">
        <div className="p-[1px] rounded-[0.9rem] bg-gradient-to-b from-white/[0.06] to-transparent">
          <div className="rounded-[calc(0.9rem-1px)] bg-white/[0.03] backdrop-blur-sm border border-white/[0.04] p-3">
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-[0.6rem] flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                style={{ background: `linear-gradient(140deg, ${theme.accent}cc, ${theme.accentStrong || theme.accent}88)` }}
              >
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-slate-200 truncate leading-tight">{displayName}</p>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">{facultyLabel}</p>
              </div>

              <button
                onClick={logout}
                title="Deconectare"
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:text-slate-400 hover:bg-white/[0.05] transition-all duration-200"
              >
                <LogOut size={13} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
