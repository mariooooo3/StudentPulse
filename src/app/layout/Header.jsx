import {
  ArrowRight,
  Bell,
  CheckCheck,
  Compass,
  Menu,
  Search,
  Settings,
  Sparkles,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../../shared/hooks/useNotifications'
import { useSocket } from '../../shared/hooks/useSocket'
import { useToast } from '../../shared/components/Toast'
import { getUniversityTheme } from '../../shared/utils/theme'
import { useSettings } from '../providers/SettingsContext'
import { VIEW_TITLES, NOTIFICATION_FILTERS } from './header.constants'
import { getNotificationRoute, getNotificationIcon, timeAgo } from './header.utils'

const MODES = [
  { id: 'academic', label: 'Academic', icon: Compass },
  { id: 'life',     label: 'Viață',    icon: Sparkles },
]

export default function Header({
  platformMode = 'academic',
  onModeChange,
  currentView,
  profile,
  session,
  onMenuClick,
  onSearchOpen,
  onNavigate,
  onSettingsOpen,
}) {
  const { title, sub } = VIEW_TITLES[currentView] || VIEW_TITLES.dashboard
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifFilter, setNotifFilter] = useState('all')
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(session?.userId)
  const { connected } = useSocket()
  const toast = useToast()
  const { settings } = useSettings()
  const seenNotificationIds = useRef(new Set())
  const initializedNotifications = useRef(false)

  const filteredNotifications = useMemo(
    () => notifFilter === 'unread' ? notifications.filter(n => !n.read) : notifications,
    [notifFilter, notifications],
  )
  const visible = filteredNotifications.slice(0, 8)
  const university = session?.university
  const theme = getUniversityTheme(university)

  useEffect(() => {
    if (!notifications.length) return
    const known = seenNotificationIds.current
    const newest = notifications.filter(n => !known.has(n.id))
    notifications.forEach(n => known.add(n.id))
    if (!initializedNotifications.current) {
      initializedNotifications.current = true
      return
    }
    const live = newest.find(n => !n.read)
    if (!live) return
    if (settings?.appNotifications === false) return
    toast({
      type: live.type === 'warning' ? 'error' : live.type || 'info',
      title: live.title || 'Notificare noua',
      message: live.body || live.text || 'Ai un update nou in StudentCompass.',
      duration: 4500,
    })
  }, [notifications, toast])

  function openNotification(notification) {
    markRead(notification.id)
    const route = getNotificationRoute(notification)
    onNavigate?.(route.view, route.mode)
    setNotifOpen(false)
  }

  // Dropdown animation config
  const dropdownAnim = {
    initial: { opacity: 0, y: -8, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.97 },
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  }

  return (
    <header className="h-[3.75rem] bg-[#060a15]/95 backdrop-blur-xl border-b border-white/[0.05] flex items-center px-5 gap-4 shrink-0 relative z-30 shadow-[0_1px_0_rgba(0,0,0,0.4)]">

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="sm:hidden w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.07] transition-all duration-200 shrink-0"
      >
        <Menu size={14} className="text-slate-400" strokeWidth={1.75} />
      </button>

      {/* Title area */}
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

      {/* Connection status dot */}
      <div className="hidden lg:flex items-center gap-1.5 shrink-0">
        <div className={clsx('w-1.5 h-1.5 rounded-full shrink-0', connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400')} />
        <span className={clsx('text-[11px] font-semibold', connected ? 'text-emerald-500' : 'text-amber-500')}>
          {connected ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Mode switcher — premium pill */}
      <div className="hidden sm:flex p-[1px] rounded-full bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        {MODES.map(({ id, label, icon: Icon }) => {
          const active = platformMode === id
          return (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              className={clsx(
                'relative inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]',
                active ? 'text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]' : 'text-slate-600 hover:text-slate-300',
              )}
              style={active ? { background: theme.accentSoft, color: theme.accent } : undefined}
            >
              {active && (
                <motion.div
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: theme.accentSoft }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={13} strokeWidth={active ? 2.25 : 1.75} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          )
        })}
      </div>

      {/* Search bar */}
      <button
        onClick={onSearchOpen}
        className="hidden xl:flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.12] rounded-xl px-3 py-2 w-56 transition-all duration-200 text-left group"
      >
        <Search size={13} className="text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" strokeWidth={1.75} />
        <span className="text-[13px] text-slate-700 group-hover:text-slate-500 font-medium flex-1 transition-colors">
          Caută în StudentCompass...
        </span>
        <kbd className="text-[10px] text-slate-700 border border-white/[0.07] rounded-md px-1.5 py-0.5 font-mono shrink-0">
          {typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? '⌘K' : 'Ctrl+K'}
        </kbd>
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(v => !v)}
          className={clsx(
            'relative w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-[0.95]',
            unreadCount > 0
              ? 'border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07]'
              : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07]',
          )}
        >
          <Bell
            size={14}
            className={unreadCount > 0 ? 'text-slate-300' : 'text-slate-500'}
            strokeWidth={1.75}
          />
          {unreadCount > 0 && (
            <>
              {/* glow-pulse ring */}
              <span
                className="absolute inset-[-2px] rounded-xl animate-glow-pulse"
                style={{ boxShadow: `0 0 0 1.5px ${theme.accent}40` }}
              />
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#060a15]"
                style={{ background: theme.accent }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <motion.div
                className="absolute right-0 top-10 w-80 max-w-[calc(100vw-2rem)] z-50"
                {...dropdownAnim}
              >
                <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/[0.1] to-white/[0.03]">
                  <div className="rounded-[calc(1rem-1px)] bg-[#0c1120] border border-white/[0.05] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] overflow-hidden">

                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-bold text-white">Notificari</p>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                            {connected
                              ? <Wifi size={10} className="text-emerald-400" />
                              : <WifiOff size={10} className="text-amber-400" />}
                            {connected ? 'Online' : 'Offline, sincronizare locala'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllRead}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold hover:opacity-80 transition-opacity"
                              style={{ color: theme.accent }}
                            >
                              <CheckCheck size={12} />
                              Marcheaza
                            </button>
                          )}
                          <button
                            onClick={() => setNotifOpen(false)}
                            className="text-slate-600 hover:text-slate-300 transition-colors"
                          >
                            <X size={14} strokeWidth={1.75} />
                          </button>
                        </div>
                      </div>

                      {/* Filter tabs */}
                      <div className="mt-3 flex rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
                        {NOTIFICATION_FILTERS.map(filter => (
                          <button
                            key={filter.id}
                            onClick={() => setNotifFilter(filter.id)}
                            className={clsx(
                              'flex-1 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all duration-150',
                              notifFilter === filter.id
                                ? 'bg-white/[0.08] text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-300',
                            )}
                          >
                            {filter.label}
                            {filter.id === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-96 overflow-y-auto">
                      {visible.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <Bell size={20} className="text-slate-800 mx-auto mb-2" strokeWidth={1.5} />
                          <p className="text-[13px] text-slate-600">
                            {notifFilter === 'unread' ? 'Nu ai notificari necitite.' : 'Nu ai notificari noi.'}
                          </p>
                        </div>
                      ) : (
                        visible.map(n => {
                          const Icon = getNotificationIcon(n)
                          const route = getNotificationRoute(n)
                          return (
                            <button
                              key={n.id}
                              onClick={() => openNotification(n)}
                              className={clsx(
                                'w-full text-left px-4 py-3 border-b border-white/[0.04] last:border-b-0 transition-colors group',
                                n.read ? 'hover:bg-white/[0.03]' : 'bg-white/[0.025] hover:bg-white/[0.055]',
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors"
                                  style={{
                                    background: n.read ? 'rgba(255,255,255,0.03)' : theme.accentSoft,
                                    borderColor: n.read ? 'rgba(255,255,255,0.06)' : theme.accentBorder,
                                  }}
                                >
                                  <Icon size={14} style={{ color: n.read ? '#64748b' : theme.accent }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[13px] font-semibold text-slate-200 truncate">
                                      {n.title || 'Notificare'}
                                    </p>
                                    {!n.read && (
                                      <span
                                        className="h-1.5 w-1.5 rounded-full shrink-0"
                                        style={{ background: theme.accent }}
                                      />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 line-clamp-2">
                                    {n.body || n.text}
                                  </p>
                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-mono text-slate-700">
                                      {timeAgo(n.timestamp || n.createdAt)}
                                    </span>
                                    <span
                                      className="inline-flex items-center gap-1 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{ color: theme.accent }}
                                    >
                                      {route.view}
                                      <ArrowRight size={10} />
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>

                    {filteredNotifications.length > visible.length && (
                      <div className="border-t border-white/[0.05] px-4 py-2 text-center text-[11px] text-slate-700">
                        Se afiseaza ultimele {visible.length} din {filteredNotifications.length}.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Settings */}
      <button
        onClick={onSettingsOpen}
        title="Deschide setarile"
        className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.07] transition-all duration-300 active:scale-[0.95] hover:rotate-[30deg]"
      >
        <Settings size={14} className="text-slate-500" strokeWidth={1.75} />
      </button>

      {/* Mobile mode switcher — bottom bar */}
      <div className="fixed inset-x-3 bottom-3 z-[60] flex gap-1 rounded-2xl border border-white/[0.08] bg-[#070b14]/95 p-1 shadow-2xl backdrop-blur-xl sm:hidden">
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

