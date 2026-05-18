import { Bell, Compass, Menu, Search, Settings, Sparkles, X } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import { useNotifications } from '../../shared/hooks/useNotifications'
import { getUniversityTheme } from '../../shared/utils/theme'

const VIEW_TITLES = {
  dashboard:  { title: 'Dashboard',                  sub: 'Bun venit înapoi' },
  navigator:  { title: 'Campus Navigator',            sub: 'Găsește orice loc în campus' },
  schedule:   { title: 'Schedule Hub',                sub: 'Orarul tău academic complet' },
  thesis:     { title: 'Thesis Finder',               sub: 'Găsește îndrumătorul potrivit' },
  tutoring:   { title: 'Peer Tutoring',               sub: 'Învață de la colegi, ajută colegii' },
  messages:   { title: 'Mesaje',                      sub: 'Comunicare academică directă' },
  discounts:  { title: 'Reduceri & Beneficii',        sub: 'Oferte studențești și beneficii locale' },
  career:     { title: 'Carieră & Internship-uri',    sub: 'Oportunități personalizate pe facultate' },
  community:  { title: 'Comunitate',                  sub: 'Grupuri, mentori și evenimente studențești' },
  citylife:   { title: 'Viața în Oraș',               sub: 'Transport, locuire, siguranță și ghid urban' },
}

const MODES = [
  { id: 'academic', label: 'Academic', icon: Compass },
  { id: 'life',     label: 'Viață',    icon: Sparkles },
]

export default function Header({ platformMode = 'academic', onModeChange, currentView, profile, session, onMenuClick, onSearchOpen }) {
  const { title, sub } = VIEW_TITLES[currentView] || VIEW_TITLES.dashboard
  const [notifOpen, setNotifOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sc_settings') || '{}')
    } catch {
      return {}
    }
  })
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(session?.userId)
  const visible = notifications.slice(0, 5)
  const university = session?.university
  const theme = getUniversityTheme(university)

  function updateSetting(key, value) {
    const next = { ...settings, [key]: value }
    setSettings(next)
    localStorage.setItem('sc_settings', JSON.stringify(next))
  }

  return (
    <header className="h-[3.75rem] bg-[#070b14]/90 backdrop-blur-xl border-b border-white/[0.05] flex items-center px-5 gap-4 shrink-0 relative z-30">

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="sm:hidden w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.07] transition-all duration-200 shrink-0"
      >
        <Menu size={14} className="text-slate-400" strokeWidth={1.75} />
      </button>

      {/* Title */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2.5">
          <h1 className="font-bold text-white text-[15px] leading-none tracking-tight truncate">{title}</h1>
          {university && (
            <span
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide shrink-0"
              style={{ color: theme.accent, background: theme.accentSoft, borderColor: theme.accentBorder }}
            >
              <span className="text-[10px] leading-none">{university.avatar}</span>
              <span>{university.shortName}</span>
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-600 mt-0.5 truncate font-medium">{sub}</p>
      </div>

      {/* Mode switcher — floating glass pill */}
      <div className="hidden sm:flex p-[1px] rounded-full bg-white/[0.05] border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        {MODES.map(({ id, label, icon: Icon }) => {
          const active = platformMode === id
          return (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              className={clsx(
                'relative inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]',
                active
                  ? 'text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]'
                  : 'text-slate-600 hover:text-slate-300',
              )}
              style={active ? { background: theme.accentSoft, color: theme.accent } : undefined}
            >
              <Icon size={13} strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <button
        onClick={onSearchOpen}
        className="hidden xl:flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] rounded-xl px-3 py-2 w-56 transition-all duration-200 text-left"
      >
        <Search size={13} className="text-slate-600 shrink-0" strokeWidth={1.75} />
        <span className="text-[13px] text-slate-700 font-medium flex-1">Caută...</span>
        <kbd className="text-[10px] text-slate-700 border border-white/[0.07] rounded px-1.5 py-0.5">⌘K</kbd>
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(v => !v)}
          className="relative w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.07] transition-all duration-200 active:scale-[0.95]"
        >
          <Bell size={14} className="text-slate-500" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#070b14]"
              style={{ background: theme.accent }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-10 w-80 max-w-[calc(100vw-2rem)] z-50 animate-slide-up">
              <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/[0.1] to-white/[0.03]">
                <div className="rounded-[calc(1rem-1px)] bg-[#0c1120] border border-white/[0.05] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-white">Notificari</p>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[11px] font-semibold" style={{ color: theme.accent }}>
                          Marcheaza toate
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="text-slate-600 hover:text-slate-300 transition-colors">
                        <X size={14} strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {visible.length === 0 ? (
                      <div className="px-4 py-10 text-center">
                        <Bell size={20} className="text-slate-800 mx-auto mb-2" strokeWidth={1.5} />
                        <p className="text-[13px] text-slate-600">Nu ai notificari noi.</p>
                      </div>
                    ) : (
                      visible.map(n => (
                        <button
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className="w-full text-left px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-colors group"
                        >
                          <div className="flex items-start gap-3">
                            {!n.read && (
                              <span className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0 flex-none" style={{ background: theme.accent }} />
                            )}
                            <div className="min-w-0" style={n.read ? { paddingLeft: '0.875rem' } : {}}>
                              <p className="text-[13px] font-semibold text-slate-200 truncate">{n.title || 'Notificare'}</p>
                              <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{n.body || n.text}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Settings */}
      <button
        onClick={() => setSettingsOpen(v => !v)}
        className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.07] transition-all duration-200 active:scale-[0.95]"
      >
        <Settings size={14} className="text-slate-500" strokeWidth={1.75} />
      </button>

      {settingsOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
          <div className="absolute right-5 top-14 w-80 max-w-[calc(100vw-2rem)] z-50 animate-slide-up">
            <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/[0.1] to-white/[0.03]">
              <div className="rounded-[calc(1rem-1px)] bg-[#0c1120] border border-white/[0.05] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-white">Setari rapide</p>
                  <button onClick={() => setSettingsOpen(false)} className="text-slate-600 hover:text-slate-300 transition-colors">
                    <X size={14} strokeWidth={1.75} />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    ['compactMode', 'Mod compact', 'Afiseaza listele mai dens.'],
                    ['voiceGuidance', 'Ghidare vocala', 'Pastreaza vocea activata pentru tururi.'],
                    ['emailDigest', 'Digest email', 'Grupeaza notificarile academice zilnic.'],
                  ].map(([key, label, text]) => (
                    <button
                      key={key}
                      onClick={() => updateSetting(key, !settings[key])}
                      className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-left hover:bg-white/[0.05] transition-colors"
                    >
                      <span>
                        <span className="block text-[13px] font-semibold text-slate-200">{label}</span>
                        <span className="block text-[11px] text-slate-600 mt-0.5">{text}</span>
                      </span>
                      <span
                        className="relative h-5 w-9 rounded-full border transition-colors shrink-0"
                        style={{
                          background: settings[key] ? theme.accentSoft : 'rgba(255,255,255,0.04)',
                          borderColor: settings[key] ? theme.accentBorder : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <span
                          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                          style={{ transform: settings[key] ? 'translateX(17px)' : 'translateX(2px)' }}
                        />
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      onModeChange(platformMode === 'academic' ? 'life' : 'academic')
                      setSettingsOpen(false)
                    }}
                    className="btn-primary w-full text-sm"
                  >
                    Comuta in modul {platformMode === 'academic' ? 'Viata' : 'Academic'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile mode switcher — bottom bar */}
      <div className="fixed inset-x-3 bottom-3 z-40 flex gap-1 rounded-2xl border border-white/[0.08] bg-[#070b14]/95 p-1 shadow-2xl backdrop-blur-xl sm:hidden">
        {MODES.map(({ id, label, icon: Icon }) => {
          const active = platformMode === id
          return (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              className={clsx(
                'flex-1 flex h-11 items-center justify-center gap-2 rounded-xl text-[13px] font-bold transition-all duration-200 active:scale-[0.97]',
                active ? 'bg-white/[0.08] text-white' : 'text-slate-600',
              )}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.75} />
              {label}
            </button>
          )
        })}
      </div>
    </header>
  )
}
