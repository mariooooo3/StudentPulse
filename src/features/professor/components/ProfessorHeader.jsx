import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Check, CheckCheck, Wifi, WifiOff, X } from 'lucide-react'
import { useToast } from '../../../shared/components/Toast'
import { useNotifications } from '../../../shared/hooks/useNotifications'
import { useSocket } from '../../../shared/hooks/useSocket'
import { NAV } from '../constants/nav'

export default function ProfessorHeader({ current, pendingCount, profile, requests, recoveryRequests, threads, onNavigate }) {
  const { t, i18n } = useTranslation()
  const navItem = NAV.find(item => item.id === current)
  const title = navItem ? (navItem.labelKey ? t(navItem.labelKey) : navItem.label) : 'Dashboard'
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(profile.id)
  const { connected } = useSocket()
  const toast = useToast()
  const seenNotificationIds = useRef(new Set())
  const initializedNotifications = useRef(false)

  const fallbackLatest = [
    ...requests.filter(item => item.status === 'pending').map(item => ({
      id: item.id,
      title: t('professor.notifications.newThesisRequest'),
      body: `${item.studentName}: ${item.idea}`,
      time: item.createdAt,
      target: 'thesis',
    })),
    ...recoveryRequests.filter(item => item.status === 'pending').map(item => ({
      id: item.id,
      title: t('professor.notifications.newRecoveryRequest'),
      body: `${item.studentName}: ${item.subject}`,
      time: item.createdAt,
      target: 'recovery',
    })),
    ...threads.filter(thread => thread.messages.at(-1)?.senderRole === 'student').map(thread => ({
      id: thread.id,
      title: t('professor.notifications.messageFrom', { name: thread.studentName }),
      body: thread.messages.at(-1)?.text,
      time: thread.updatedAt,
      target: 'messages',
      threadId: thread.id,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6)

  const latest = notifications.length
    ? notifications.slice(0, 8).map(item => ({
        id: item.id,
        title: item.title || t('professor.notifications.defaultTitle'),
        body: item.body || item.text,
        time: item.timestamp || item.createdAt,
        target: item.action?.includes('recovery') ? 'recovery' : item.action?.includes('message') ? 'messages' : 'thesis',
        threadId: item.meta?.threadId,
        read: item.read,
      }))
    : fallbackLatest

  useEffect(() => {
    if (!notifications.length) return
    const known = seenNotificationIds.current
    const newest = notifications.filter(item => !known.has(item.id))
    notifications.forEach(item => known.add(item.id))
    if (!initializedNotifications.current) {
      initializedNotifications.current = true
      return
    }
    const live = newest.find(item => !item.read)
    if (!live) return
    toast({
      type: live.type === 'warning' ? 'error' : live.type || 'info',
      title: live.title || t('professor.notifications.toastUpdate'),
      message: live.body || live.text || t('professor.notifications.toastDefault'),
      duration: 4500,
    })
  }, [notifications, toast])

  function openNotification(item) {
    if (item.id?.startsWith('notif-')) markRead(item.id)
    onNavigate(item.target, item.threadId ? { threadId: item.threadId } : undefined)
    setOpen(false)
  }

  const totalBadge = unreadCount || pendingCount
  const hasBadge = totalBadge > 0

  return (
    <header className="h-[3.75rem] border-b border-white/[0.06] bg-[#060a15]/95 backdrop-blur-xl px-5 flex items-center gap-4 shrink-0">
      {/* Title */}
      <div className="min-w-0 flex-1">
        <h1 className="text-[15px] font-bold text-white tracking-tight leading-none">{title}</h1>
        <p className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">{profile.facultyName}</p>
      </div>

      {/* Connection status */}
      <div className="hidden md:flex items-center gap-1.5">
        <div className={clsx('w-1.5 h-1.5 rounded-full', connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400')} />
        <span className={clsx('text-[11px] font-semibold', connected ? 'text-emerald-500' : 'text-amber-500')}>
          {connected ? t('professor.notifications.liveConnected') : t('professor.notifications.offlineSync')}
        </span>
      </div>

      {/* Bell */}
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className={clsx(
            'relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-[0.95]',
            hasBadge
              ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15'
              : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]',
          )}
        >
          <Bell
            size={15}
            className={hasBadge ? 'text-amber-400' : 'text-slate-500'}
            strokeWidth={hasBadge ? 2.25 : 1.75}
          />
          {hasBadge && (
            <>
              {/* glow pulse ring */}
              <span className="absolute inset-0 rounded-xl animate-glow-pulse border border-amber-500/30" />
              <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-[#060a15]">
                {totalBadge > 9 ? '9+' : totalBadge}
              </span>
            </>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <motion.div
                className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)]"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <div className="p-[1px] rounded-2xl bg-gradient-to-b from-amber-500/20 to-white/[0.04]">
                  <div className="rounded-[calc(1rem-1px)] bg-[#0c1120] border border-white/[0.05] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-white">{t('professor.notifications.title')}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                          {connected
                            ? <Wifi size={10} className="text-emerald-400" />
                            : <WifiOff size={10} className="text-amber-400" />}
                          {connected ? t('professor.notifications.liveConnected') : t('professor.notifications.offlineSync')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                          >
                            <CheckCheck size={12} />
                            {t('professor.notifications.markAll')}
                          </button>
                        )}
                        <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-300 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* List */}
                    {latest.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell size={20} className="text-slate-800 mx-auto mb-2" strokeWidth={1.5} />
                        <p className="text-sm text-slate-600">{t('professor.notifications.noNew')}</p>
                      </div>
                    ) : (
                      latest.map(item => (
                        <button
                          key={item.id}
                          onClick={() => openNotification(item)}
                          className={clsx(
                            'w-full text-left px-4 py-3 border-b border-white/[0.04] last:border-b-0 transition-colors',
                            item.read ? 'hover:bg-white/[0.03]' : 'bg-amber-500/[0.04] hover:bg-amber-500/[0.07]',
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
                              <Bell size={12} className="text-amber-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-[13px] font-semibold text-slate-200 truncate">{item.title}</p>
                                {!item.read && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />}
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{item.body}</p>
                              <p className="text-[10px] font-mono text-slate-700 mt-1">
                                {new Date(item.time || Date.now()).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
