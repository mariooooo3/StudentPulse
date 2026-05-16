import { Bell, Compass, Search, Settings, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import { useNotifications } from '../../shared/hooks/useNotifications'
import { getUniversityTheme } from '../../shared/utils/theme'

const VIEW_TITLES = {
  dashboard: { title: 'Dashboard', sub: 'Bun venit inapoi' },
  navigator: { title: 'Campus Navigator', sub: 'Gaseste orice loc in campus' },
  schedule: { title: 'Schedule Hub', sub: 'Orarul tau academic complet' },
  thesis: { title: 'Thesis Finder', sub: 'Gaseste indrumatorul potrivit' },
  tutoring: { title: 'Peer Tutoring & Skill Swap', sub: 'Invata de la colegi, inveti colegi' },
  messages: { title: 'Mesaje', sub: 'Comunicare academica directa' },
  discounts: { title: 'Discounts & Benefits', sub: 'Oferte studentesti si beneficii locale' },
  career: { title: 'Career & Internships', sub: 'Oportunitati personalizate pe facultate' },
  community: { title: 'Community', sub: 'Grupuri, mentori si evenimente studentesti' },
  citylife: { title: 'Viața în Oraș', sub: 'Transport, locuire, siguranta si ghid urban' },
}

const MODES = [
  { id: 'academic', label: 'StudentAcademic', short: 'Academic', icon: Compass },
  { id: 'life', label: 'StudentLife', short: 'Life', icon: Sparkles },
]

function ModeSwitcher({ platformMode, onModeChange, theme }) {
  const activeIndex = platformMode === 'life' ? 1 : 0

  return (
    <div className="relative hidden sm:grid grid-cols-2 rounded-2xl border border-slate-700/60 bg-slate-950/50 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div
        className="absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-xl border transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${activeIndex * 100}%)`,
          background: theme.accentSoft,
          borderColor: theme.accentBorder,
          boxShadow: `0 16px 34px -24px ${theme.accent}`,
        }}
      />
      {MODES.map(({ id, label, short, icon: Icon }) => {
        const active = platformMode === id
        return (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            className={clsx(
              'relative z-[1] inline-flex h-9 min-w-36 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition-all duration-200 active:scale-[0.98]',
              active ? 'text-white' : 'text-slate-500 hover:text-slate-200',
            )}
          >
            <Icon size={14} style={active ? { color: theme.accent } : undefined} />
            <span className="hidden lg:inline">{label}</span>
            <span className="lg:hidden">{short}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function Header({ platformMode = 'academic', onModeChange, currentView, profile, session }) {
  const { title, sub } = VIEW_TITLES[currentView] || VIEW_TITLES.dashboard
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(session?.userId)
  const visible = notifications.slice(0, 5)
  const university = session?.university
  const theme = getUniversityTheme(university)
  const searchPlaceholder = platformMode === 'life'
    ? 'Cauta oferte, grupuri, internshipuri...'
    : 'Cauta cursuri, profesori...'

  return (
    <header className="min-h-16 bg-slate-900/80 backdrop-blur border-b border-slate-700/50 flex items-center px-4 sm:px-6 gap-3 shrink-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-white text-lg leading-tight truncate">{title}</h1>
          {university && (
            <span
              className="hidden md:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold"
              style={{
                color: theme.accent,
                background: theme.accentSoft,
                borderColor: theme.accentBorder,
              }}
            >
              <span>{university.avatar}</span>
              <span>{university.shortName}</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">{sub}</p>
      </div>

      <ModeSwitcher platformMode={platformMode} onModeChange={onModeChange} theme={theme} />

      <div
        className="hidden xl:flex items-center gap-2 bg-slate-800 border rounded-xl px-3 py-2 w-64 transition-colors focus-within:border-[var(--sc-accent-border)]"
        style={{ borderColor: 'rgba(51, 65, 85, 0.5)' }}
      >
        <Search size={15} style={{ color: theme.accent }} />
        <input
          className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
          placeholder={searchPlaceholder}
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="relative w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center hover:bg-slate-700 transition-colors active:scale-[0.98]"
        >
          <Bell size={16} className="text-slate-400" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-900"
              style={{ background: theme.accent }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Notificari</p>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs" style={{ color: theme.accent }}>
                  Marcheaza toate
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {visible.length === 0 ? (
                <p className="px-4 py-8 text-sm text-slate-500 text-center">Nu ai notificari noi.</p>
              ) : (
                visible.map(n => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className="w-full text-left px-4 py-3 border-b border-slate-800 last:border-b-0 hover:bg-slate-800/70 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: theme.accent }} />}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{n.title || 'Notificare'}</p>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{n.body || n.text}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <button className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center hover:bg-slate-700 transition-colors active:scale-[0.98]">
        <Settings size={16} className="text-slate-400" />
      </button>

      <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 gap-1 rounded-2xl border border-slate-700/70 bg-slate-950/90 p-1 shadow-2xl backdrop-blur sm:hidden">
        {MODES.map(({ id, short, icon: Icon }) => {
          const active = platformMode === id
          return (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              className={clsx(
                'flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all active:scale-[0.98]',
                active ? 'bg-slate-100 text-slate-950' : 'text-slate-500',
              )}
            >
              <Icon size={16} />
              {short}
            </button>
          )
        })}
      </div>
    </header>
  )
}
