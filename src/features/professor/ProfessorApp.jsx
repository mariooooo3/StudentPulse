import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  BookOpen,
  CalendarClock,
  Check,
  CheckCheck,
  Clock,
  Edit3,
  FileText,
  GraduationCap,
  LogOut,
  MessageSquare,
  Plus,
  Save,
  UserCheck,
  Wifi,
  WifiOff,
  X,
  TrendingUp,
  Layers,
} from 'lucide-react'
import { useAuth } from '../../app/providers/AuthContext'
import { useToast } from '../../shared/components/Toast'
import { useNotifications } from '../../shared/hooks/useNotifications'
import { useSocket } from '../../shared/hooks/useSocket'
import { socketService } from '../../shared/services/socket.service'
import VirtualAssistant from '../../shared/components/VirtualAssistant'
import {
  DEMO_PROFESSOR,
  getProfessorProfile,
  listPortalThreads,
  listRecoveryRequests,
  listThesisRequests,
  saveProfessorProfile,
  sendPortalMessage,
  updateThesisRequestStatus,
  updateRecoveryRequestStatus,
  upsertPortalThread,
} from '../../shared/services/professorPortal.service'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
  { id: 'profile', label: 'Profil academic', icon: UserCheck },
  { id: 'thesis', label: 'Cereri licenta', icon: BookOpen },
  { id: 'recovery', label: 'Recuperari', icon: CalendarClock },
  { id: 'messages', label: 'Mesaje', icon: MessageSquare },
]

function statusLabel(status) {
  return { pending: 'In asteptare', accepted: 'Acceptata', rejected: 'Respinsa' }[status] || status
}

function consultationHoursFor(professor) {
  return professor.consultationHours || professor.officeHours || []
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function ProfessorSidebar({ current, onNavigate, onLogout, profile }) {
  return (
    <aside className="hidden sm:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#070b14]">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-200 font-bold text-base shadow-[0_0_16px_rgba(245,158,11,0.15)]">
              {profile.avatar}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-[#070b14]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white truncate">Portal Profesor</p>
            <p className="text-[11px] text-slate-600 truncate">AC · TUIASI</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={clsx(
              'w-full h-10 rounded-xl px-3 flex items-center gap-3 text-[13px] font-semibold transition-all duration-150 text-left',
              current === id
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]',
            )}
          >
            <Icon size={15} className={current === id ? 'text-amber-400' : ''} />
            {label}
          </button>
        ))}
      </nav>

      {/* Profile card */}
      <div className="p-3">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <p className="text-[13px] font-semibold text-slate-200 truncate">{profile.name}</p>
          <p className="text-[11px] text-slate-600 truncate mt-0.5">{profile.email}</p>
          <div className="gradient-separator mt-3 mb-3" />
          <button
            onClick={onLogout}
            className="h-8 w-full rounded-lg border border-white/[0.07] bg-white/[0.03] text-[12px] font-semibold text-slate-500 hover:text-white hover:bg-white/[0.06] flex items-center justify-center gap-2 transition-all duration-150"
          >
            <LogOut size={12} />
            Iesire
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── Header (professor portal) ─────────────────────────────────────────────────
function Header({ current, pendingCount, profile, requests, recoveryRequests, threads, onNavigate }) {
  const title = NAV.find(item => item.id === current)?.label || 'Dashboard'
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(profile.id)
  const { connected } = useSocket()
  const toast = useToast()
  const seenNotificationIds = useRef(new Set())
  const initializedNotifications = useRef(false)

  const fallbackLatest = [
    ...requests.filter(item => item.status === 'pending').map(item => ({
      id: item.id,
      title: 'Cerere licenta noua',
      body: `${item.studentName}: ${item.idea}`,
      time: item.createdAt,
      target: 'thesis',
    })),
    ...recoveryRequests.filter(item => item.status === 'pending').map(item => ({
      id: item.id,
      title: 'Cerere recuperare noua',
      body: `${item.studentName}: ${item.subject}`,
      time: item.createdAt,
      target: 'recovery',
    })),
    ...threads.filter(thread => thread.messages.at(-1)?.senderRole === 'student').map(thread => ({
      id: thread.id,
      title: `Mesaj de la ${thread.studentName}`,
      body: thread.messages.at(-1)?.text,
      time: thread.updatedAt,
      target: 'messages',
      threadId: thread.id,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6)

  const latest = notifications.length
    ? notifications.slice(0, 8).map(item => ({
        id: item.id,
        title: item.title || 'Notificare profesor',
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
      title: live.title || 'Update profesor',
      message: live.body || live.text || 'Ai un update nou in portal.',
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
          {connected ? 'Live' : 'Offline'}
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
                        <p className="text-[13px] font-semibold text-white">Notificari profesor</p>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                          {connected
                            ? <Wifi size={10} className="text-emerald-400" />
                            : <WifiOff size={10} className="text-amber-400" />}
                          {connected ? 'Live conectat' : 'Offline, sincronizare la refresh'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                          >
                            <CheckCheck size={12} />
                            Marcheaza
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
                        <p className="text-sm text-slate-600">Nu ai notificari noi.</p>
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
                                {new Date(item.time || Date.now()).toLocaleTimeString('ro', { hour: '2-digit', minute: '2-digit' })}
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

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ requests, recoveryRequests, threads, professor, onNavigate }) {
  const pending = requests.filter(r => r.status === 'pending')
  const accepted = requests.filter(r => r.status === 'accepted')
  const pendingRecovery = recoveryRequests.filter(r => r.status === 'pending')

  return (
    <div className="p-6 space-y-5">
      {/* Welcome banner */}
      <section className="relative rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.09] to-amber-600/[0.04] p-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.12),transparent_60%)]" />
        <p className="section-label text-amber-400 mb-2">Buna ziua</p>
        <h2 className="text-2xl font-bold text-white tracking-tight">{professor.name}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{professor.domain}. Ai o vedere rapida asupra cererilor, recuperarilor si mesajelor de la studenti.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {professor.research?.slice(0, 4).map(item => (
            <span key={item} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-300">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Cereri noi', value: pending.length, Icon: BookOpen, target: 'thesis' },
          { label: 'Studenti acceptati', value: accepted.length, Icon: UserCheck, target: null },
          { label: 'Recuperari noi', value: pendingRecovery.length, Icon: CalendarClock, target: 'recovery' },
          { label: 'Conversatii', value: threads.length, Icon: MessageSquare, target: 'messages' },
        ].map(({ label, value, Icon, target }) => (
          <button
            key={label}
            onClick={() => target && onNavigate(target)}
            className={clsx(
              'rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-left transition-all duration-150',
              target ? 'hover:border-amber-500/20 hover:bg-amber-500/[0.04] hover:-translate-y-px cursor-pointer' : 'cursor-default',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Icon size={14} className="text-amber-400" />
              </div>
              {value > 0 && target && (
                <span className="badge-amber text-[9px]">{value} nou</span>
              )}
            </div>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
            <p className="text-[11px] text-slate-600 mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* Courses + Consultations */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <p className="text-sm font-bold text-white">Cursuri active</p>
            <button onClick={() => onNavigate('profile')} className="text-[12px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Editeaza profil
            </button>
          </div>
          {professor.courses?.map(course => (
            <div key={course.id} className="px-4 py-3 border-b border-white/[0.04] last:border-b-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <BookOpen size={14} className="text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200 truncate">{course.name}</p>
                <p className="text-xs text-slate-600 truncate">{course.groups.join(', ')} · {course.room}</p>
              </div>
              <span className="text-xs text-slate-500 shrink-0">{course.next}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05]">
            <p className="text-sm font-bold text-white">Program de consultatii</p>
          </div>
          {consultationHoursFor(professor).map(slot => (
            <div key={slot.id} className="px-4 py-3 border-b border-white/[0.04] last:border-b-0">
              <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Clock size={13} className="text-amber-400 shrink-0" />
                {slot.day}, {slot.time}
              </p>
              <p className="text-xs text-slate-600 mt-1 ml-5">{slot.place} · {slot.mode} · {slot.capacity} locuri</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent requests */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
          <p className="text-sm font-bold text-white">Ultimele cereri</p>
          <button onClick={() => onNavigate('thesis')} className="text-[12px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">
            Vezi toate
          </button>
        </div>
        {requests.slice(0, 4).length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">Nu exista cereri trimise inca.</div>
        ) : (
          requests.slice(0, 4).map(request => (
            <div key={request.id} className="px-4 py-3 border-b border-white/[0.04] last:border-b-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[11px] font-bold text-amber-300">
                {request.studentName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200 truncate">{request.studentName}</p>
                <p className="text-xs text-slate-600 truncate">{request.idea}</p>
              </div>
              <span className={clsx(
                'rounded-full px-2.5 py-1 text-[10px] font-bold',
                request.status === 'pending' ? 'bg-amber-500/15 text-amber-300'
                  : request.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-red-500/15 text-red-300',
              )}>
                {statusLabel(request.status)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Thesis requests ───────────────────────────────────────────────────────────
function ThesisRequests({ requests, onDecision }) {
  const [noteById, setNoteById] = useState({})

  return (
    <div className="p-6 space-y-4">
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <FileText size={32} className="mx-auto text-slate-700 mb-3" />
          <p className="text-sm font-semibold text-slate-400">Nu exista cereri de licenta.</p>
          <p className="text-xs text-slate-700 mt-1">Trimite o cerere din contul de student si va aparea aici.</p>
        </div>
      ) : (
        requests.map(request => (
          <article key={request.id} className="premium-card p-5">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Left: student info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-300">
                    {request.studentName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <h3 className="font-bold text-white">{request.studentName}</h3>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold text-slate-400">
                    {request.facultyName || 'FMIM'}
                  </span>
                  <span className={clsx(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                    request.status === 'pending' ? 'bg-amber-500/15 text-amber-300'
                      : request.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-red-500/15 text-red-300',
                  )}>
                    {statusLabel(request.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4 ml-10">{request.studentEmail}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.05] bg-[#070b14]/60 p-3">
                    <p className="section-label mb-2">Idee tema</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{request.idea}</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-[#070b14]/60 p-3">
                    <p className="section-label mb-2">Motivatie</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{request.motivation}</p>
                  </div>
                </div>

                {request.file && (
                  <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                    <FileText size={12} />
                    {request.file.name} · {(request.file.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>

              {/* Right: action or response */}
              {request.status === 'pending' ? (
                <div className="lg:w-72 space-y-2.5">
                  <textarea
                    value={noteById[request.id] || ''}
                    onChange={e => setNoteById(prev => ({ ...prev, [request.id]: e.target.value }))}
                    placeholder="Nota optionala pentru student..."
                    rows={3}
                    className="input-base w-full resize-none text-sm focus:border-amber-500/40"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onDecision(request.id, 'accepted', noteById[request.id] || 'Te astept la o discutie initiala saptamana aceasta.')}
                      className="h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-600/30 hover:-translate-y-px transition-all duration-150"
                    >
                      <Check size={13} />
                      Accepta
                    </button>
                    <button
                      onClick={() => onDecision(request.id, 'rejected', noteById[request.id] || 'Tema nu se potriveste directiei mele curente de cercetare.')}
                      className="h-10 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-600/30 hover:-translate-y-px transition-all duration-150"
                    >
                      <X size={13} />
                      Respinge
                    </button>
                  </div>
                </div>
              ) : (
                <div className="lg:w-72 rounded-xl border border-white/[0.05] bg-[#070b14]/60 p-3">
                  <p className="section-label mb-2">Raspuns transmis</p>
                  <p className="text-sm text-slate-300">{request.professorNote || 'Fara nota suplimentara.'}</p>
                </div>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  )
}

// ─── Profile ───────────────────────────────────────────────────────────────────
function ProfessorProfile({ professor, onSave }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    domain: professor.domain || '',
    room: professor.room || '',
    phone: professor.phone || '',
    assistant: professor.assistant || '',
    research: (professor.research || []).join(', '),
  })

  useEffect(() => {
    setForm({
      domain: professor.domain || '',
      room: professor.room || '',
      phone: professor.phone || '',
      assistant: professor.assistant || '',
      research: (professor.research || []).join(', '),
    })
  }, [professor])

  function save() {
    onSave({ ...form, research: form.research.split(',').map(item => item.trim()).filter(Boolean) })
    setEditing(false)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Profile hero */}
      <section className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.06),transparent_60%)]" />
        <div className="flex flex-col lg:flex-row lg:items-start gap-5 relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-200 text-xl font-bold shrink-0 shadow-[0_0_24px_rgba(245,158,11,0.12)]">
            {professor.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="section-label text-amber-400 mb-1">{professor.title}</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">{professor.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{professor.facultyName} · {professor.email}</p>
          </div>
          <button
            onClick={() => editing ? save() : setEditing(true)}
            className="btn-primary inline-flex items-center gap-2 text-sm self-start"
          >
            {editing ? <Save size={14} /> : <Edit3 size={14} />}
            {editing ? 'Salveaza' : 'Editeaza'}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        {/* Form fields */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-4">
          {[
            ['domain', 'Domeniu coordonare'],
            ['room', 'Birou'],
            ['phone', 'Telefon secretariat/birou'],
            ['assistant', 'Asistent / colaborator'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="section-label block mb-2">{label}</label>
              {editing ? (
                <input
                  value={form[key]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="input-base w-full text-sm focus:border-amber-500/40"
                />
              ) : (
                <p className="text-sm text-slate-300 rounded-xl border border-white/[0.05] bg-[#070b14]/60 px-3 py-2.5">
                  {professor[key] || <span className="text-slate-600 italic">Necompletat</span>}
                </p>
              )}
            </div>
          ))}
          <div>
            <label className="section-label block mb-2">Directii cercetare</label>
            {editing ? (
              <input
                value={form.research}
                onChange={e => setForm(prev => ({ ...prev, research: e.target.value }))}
                className="input-base w-full text-sm focus:border-amber-500/40"
                placeholder="Separa cu virgula"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {professor.research?.map(item => (
                  <span key={item} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock size={14} className="text-amber-400" />
              Program public de consultatii
            </p>
            {consultationHoursFor(professor).map(slot => (
              <div key={slot.id} className="rounded-xl border border-white/[0.05] bg-[#070b14]/60 px-3 py-2 mb-2 last:mb-0">
                <p className="text-sm font-semibold text-slate-200">{slot.day}, {slot.time}</p>
                <p className="text-xs text-slate-600 mt-0.5">{slot.place} · {slot.mode}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Layers size={14} className="text-amber-400" />
              Cursuri publicate
            </p>
            {professor.courses?.map(course => (
              <div key={course.id} className="rounded-xl border border-white/[0.05] bg-[#070b14]/60 px-3 py-2 mb-2 last:mb-0">
                <p className="text-sm font-semibold text-slate-200">{course.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">{course.groups.join(', ')} · {course.next}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Recovery ─────────────────────────────────────────────────────────────────
function RecoveryView({ requests, onDecision }) {
  const [created, setCreated] = useState(false)

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={() => setCreated(true)}
        className="btn-primary inline-flex items-center gap-2 text-sm"
      >
        <Plus size={14} />
        Adauga slot de recuperare
      </button>

      <AnimatePresence>
        {created && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            Slot publicat: Structuri de Date, Vineri 14:00, sala C210.
          </motion.div>
        )}
      </AnimatePresence>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <CalendarClock size={32} className="mx-auto text-slate-700 mb-3" />
          <p className="text-sm font-semibold text-slate-400">Nu exista cereri de recuperare.</p>
          <p className="text-xs text-slate-700 mt-1">Studentii le trimit din Schedule Hub.</p>
        </div>
      ) : (
        requests.map(item => (
          <div key={item.id} className="premium-card p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="font-bold text-white">{item.studentName}</p>
              <p className="text-sm text-slate-500 mt-0.5">{item.subject} · Gr. {item.group} · {item.room} · {item.start}:00</p>
              <p className="text-xs text-slate-600 mt-1">{item.reason}</p>
            </div>
            {item.status === 'pending' && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onDecision(item.id, 'accepted', 'Cererea de recuperare a fost aprobata.')}
                  className="h-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all duration-150"
                >
                  Accepta
                </button>
                <button
                  onClick={() => onDecision(item.id, 'rejected', 'Nu exista locuri disponibile pentru slotul cerut.')}
                  className="h-9 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all duration-150"
                >
                  Respinge
                </button>
              </div>
            )}
            {item.status !== 'pending' && (
              <span className={clsx(
                'text-xs font-semibold rounded-full px-3 py-1 shrink-0',
                item.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300',
              )}>
                {statusLabel(item.status)}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  )
}

// ─── Messages ──────────────────────────────────────────────────────────────────
function MessagesView({ threads, onSend, selectedThreadId, onThreadSelect, professor }) {
  const [activeId, setActiveId] = useState(threads[0]?.id || null)
  const [text, setText] = useState('')
  const [typingUsers, setTypingUsers] = useState({})
  const [contactSeenAt, setContactSeenAt] = useState(null)
  const typingTimer = useRef(null)
  const messagesEndRef = useRef(null)
  const active = threads.find(thread => thread.id === activeId) || threads[0]
  const currentUserId = professor?.id || active?.professorId || DEMO_PROFESSOR.id
  const currentName = professor?.name || active?.professorName || DEMO_PROFESSOR.name
  const threadChannel = active ? `portal-thread:${active.id}` : null
  const typingChannel = threadChannel ? `typing:${threadChannel}` : null
  const readChannel = threadChannel ? `read:${threadChannel}` : null

  useEffect(() => {
    if (!activeId && threads[0]) setActiveId(threads[0].id)
  }, [threads, activeId])

  useEffect(() => {
    if (selectedThreadId && threads.some(t => t.id === selectedThreadId)) {
      setActiveId(selectedThreadId)
    }
  }, [selectedThreadId, threads])

  useEffect(() => {
    setTypingUsers({})
    setContactSeenAt(null)
  }, [active?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages?.length])

  useEffect(() => {
    if (!typingChannel || !readChannel) return undefined
    const unsubTyping = socketService.subscribe(typingChannel, ({ userId, name, isTyping }) => {
      if (userId === currentUserId) return
      setTypingUsers(prev => {
        const next = { ...prev }
        if (isTyping) next[userId] = name || active?.studentName || 'Student'
        else delete next[userId]
        return next
      })
    })
    const unsubRead = socketService.subscribe(readChannel, ({ userId, seenAt }) => {
      if (userId === currentUserId) return
      setContactSeenAt(seenAt)
    })
    return () => { unsubTyping(); unsubRead() }
  }, [active?.studentName, currentUserId, readChannel, typingChannel])

  useEffect(() => {
    if (!readChannel || !active) return
    socketService.publish(readChannel, { userId: currentUserId, seenAt: new Date().toISOString() }).catch(() => {})
  }, [active, active?.messages?.length, currentUserId, readChannel])

  function handleTextChange(event) {
    setText(event.target.value)
    if (!typingChannel) return
    socketService.publish(typingChannel, { userId: currentUserId, name: currentName, isTyping: true }).catch(() => {})
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socketService.publish(typingChannel, { userId: currentUserId, name: currentName, isTyping: false }).catch(() => {})
    }, 2000)
  }

  function submitMessage() {
    if (!active || !text.trim()) return
    clearTimeout(typingTimer.current)
    if (typingChannel) socketService.publish(typingChannel, { userId: currentUserId, name: currentName, isTyping: false }).catch(() => {})
    onSend(active.id, text.trim())
    setText('')
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 h-full min-h-0">
      {/* Thread list */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-white/[0.05]">
          <p className="text-sm font-bold text-white">Conversatii</p>
          <p className="text-[11px] text-slate-600 mt-0.5">{threads.length} active</p>
        </div>
        <div className="flex-1 overflow-auto">
          {threads.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-600">Nu exista conversatii.</div>
          ) : (
            threads.map(thread => (
              <button
                key={thread.id}
                onClick={() => { setActiveId(thread.id); onThreadSelect?.(thread.id) }}
                className={clsx(
                  'w-full px-4 py-3.5 border-b border-white/[0.04] last:border-b-0 text-left transition-all duration-150',
                  active?.id === thread.id
                    ? 'bg-amber-500/10 border-l-2 border-l-amber-500/60'
                    : 'hover:bg-white/[0.03]',
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0 mt-0.5">
                    {thread.studentName?.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-slate-200 truncate">{thread.studentName}</p>
                    <p className="text-xs text-slate-600 mt-0.5 truncate">{thread.messages.at(-1)?.text || thread.subject}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] flex flex-col min-h-[420px]">
        {active ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">
                {active.studentName?.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{active.studentName}</p>
                <p className="text-xs">
                  {Object.keys(typingUsers).length > 0
                    ? <span className="text-amber-400 italic">{Object.values(typingUsers).join(', ')} scrie...</span>
                    : <span className="text-slate-600">{active.subject}</span>}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {active.messages.length === 0 ? (
                <p className="text-sm text-slate-600 text-center py-10">Incepe conversatia cu studentul.</p>
              ) : (
                active.messages.map(message => {
                  const isMe = message.senderRole === 'professor'
                  const myMessages = active.messages.filter(item => item.senderRole === 'professor')
                  const lastMyMessage = myMessages[myMessages.length - 1]
                  const isSeen = isMe && contactSeenAt && message.id === lastMyMessage?.id && new Date(contactSeenAt) >= new Date(message.timestamp)
                  return (
                    <div key={message.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
                      <div className="max-w-md">
                        <div className={clsx(
                          'rounded-2xl px-4 py-2.5 text-sm',
                          isMe
                            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20'
                            : 'bg-white/[0.06] text-slate-200 border border-white/[0.07]',
                        )}>
                          {message.text}
                        </div>
                        <div className={clsx('mt-1 flex items-center gap-1', isMe ? 'justify-end' : 'justify-start')}>
                          <p className="text-[10px] text-slate-600">
                            {new Date(message.timestamp).toLocaleTimeString('ro', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {isMe && (
                            isSeen
                              ? <CheckCheck size={11} className="text-amber-300" />
                              : <Check size={11} className="text-slate-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              {/* Typing indicator */}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex items-center gap-2 px-1">
                  <div className="flex gap-0.5 items-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-xs text-slate-500 italic">{Object.values(typingUsers).join(', ')} scrie...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="p-3 border-t border-white/[0.05] flex gap-2">
              <input
                value={text}
                onChange={handleTextChange}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage() } }}
                placeholder="Scrie raspuns..."
                className="input-base flex-1 text-sm"
              />
              <button onClick={submitMessage} className="btn-primary px-4 text-sm shrink-0">Trimite</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-600">
            Selecteaza o conversatie
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function ProfessorApp() {
  const { logout, profile } = useAuth()
  const toast = useToast()
  const [professor, setProfessor] = useState(() => ({ ...(profile || DEMO_PROFESSOR) }))
  const [current, setCurrent] = useState('dashboard')
  const [selectedThreadId, setSelectedThreadId] = useState(null)
  const [requests, setRequests] = useState([])
  const [recoveryRequests, setRecoveryRequests] = useState([])
  const [threads, setThreads] = useState([])

  const refreshRequests = async () => { setRequests(await listThesisRequests()) }
  const refreshRecoveryRequests = async () => { setRecoveryRequests(await listRecoveryRequests()) }
  const refreshThreads = async () => { setThreads(await listPortalThreads()) }

  const refreshPortalData = async () => {
    const [nextRequests, nextRecoveryRequests, nextThreads] = await Promise.all([
      listThesisRequests().catch(() => []),
      listRecoveryRequests().catch(() => []),
      listPortalThreads().catch(() => []),
    ])
    setRequests(nextRequests)
    setRecoveryRequests(nextRecoveryRequests)
    setThreads(nextThreads)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [nextProfessor, nextRequests, nextRecoveryRequests, nextThreads] = await Promise.all([
        getProfessorProfile().catch(() => profile || DEMO_PROFESSOR),
        listThesisRequests().catch(() => []),
        listRecoveryRequests().catch(() => []),
        listPortalThreads().catch(() => []),
      ])
      if (cancelled) return
      setProfessor({ ...(profile || DEMO_PROFESSOR), ...nextProfessor })
      setRequests(nextRequests)
      setRecoveryRequests(nextRecoveryRequests)
      setThreads(nextThreads)
    }
    load()
    return () => { cancelled = true }
  }, [profile])

  useEffect(() => {
    if (!professor?.id) return undefined
    const unsub = socketService.subscribe(`portal:${professor.id}`, () => { refreshPortalData() })
    return unsub
  }, [professor?.id])

  useEffect(() => {
    window.addEventListener('sc:thesis-requests', refreshRequests)
    return () => window.removeEventListener('sc:thesis-requests', refreshRequests)
  }, [])

  useEffect(() => {
    async function refreshProfessor(event) {
      const nextProfessor = event?.detail || await getProfessorProfile().catch(() => profile || DEMO_PROFESSOR)
      setProfessor({ ...(profile || DEMO_PROFESSOR), ...nextProfessor })
    }
    window.addEventListener('sc:professor-profile', refreshProfessor)
    return () => window.removeEventListener('sc:professor-profile', refreshProfessor)
  }, [profile])

  useEffect(() => {
    window.addEventListener('sc:recovery-requests', refreshRecoveryRequests)
    return () => window.removeEventListener('sc:recovery-requests', refreshRecoveryRequests)
  }, [])

  useEffect(() => {
    window.addEventListener('sc:portal-messages', refreshThreads)
    return () => window.removeEventListener('sc:portal-messages', refreshThreads)
  }, [])

  const sortedRequests = useMemo(
    () => [...requests].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [requests],
  )
  const pendingCount = sortedRequests.filter(r => r.status === 'pending').length
  const professorNotificationCount =
    pendingCount
    + recoveryRequests.filter(r => r.status === 'pending').length
    + threads.filter(t => t.messages.at(-1)?.senderRole === 'student').length

  function handleNavigate(target, options = {}) {
    if (target === 'messages' && options.threadId) setSelectedThreadId(options.threadId)
    setCurrent(target)
  }

  async function handleDecision(requestId, status, note) {
    const updated = await updateThesisRequestStatus(requestId, status, note)
    if (updated?.studentId) {
      const thread = await upsertPortalThread({
        student: { userId: updated.studentId, name: updated.studentName, email: updated.studentEmail },
        professor,
        subject: `Licenta: ${updated.idea}`,
      })
      await sendPortalMessage(thread.id, {
        senderId: professor.id,
        senderName: professor.name,
        senderRole: 'professor',
        text: status === 'accepted'
          ? `Am acceptat cererea ta pentru licenta. ${note || 'Stabilim detaliile la o discutie initiala.'}`
          : `Am respins cererea ta pentru licenta. ${note || 'Tema nu se potriveste directiei curente.'}`,
      })
      await refreshThreads()
    }
    await refreshRequests()
    toast({
      type: status === 'accepted' ? 'success' : 'info',
      title: status === 'accepted' ? 'Cerere acceptata' : 'Cerere respinsa',
      message: updated?.studentName ? `${updated.studentName} primeste notificare in contul de student.` : 'Status actualizat.',
    })
  }

  async function handleRecoveryDecision(requestId, status, note) {
    const updated = await updateRecoveryRequestStatus(requestId, status, note)
    if (updated?.studentId) {
      const thread = await upsertPortalThread({
        student: { userId: updated.studentId, name: updated.studentName, email: updated.studentEmail },
        professor,
        subject: `Recuperare: ${updated.subject}`,
      })
      await sendPortalMessage(thread.id, {
        senderId: professor.id,
        senderName: professor.name,
        senderRole: 'professor',
        text: status === 'accepted'
          ? `Recuperarea la ${updated.subject} a fost aprobata. ${note}`
          : `Recuperarea la ${updated.subject} a fost respinsa. ${note}`,
      })
    }
    await refreshRecoveryRequests()
    await refreshThreads()
    toast({ type: status === 'accepted' ? 'success' : 'info', title: 'Recuperare actualizata', message: `${updated?.studentName || 'Studentul'} primeste notificare.` })
  }

  async function handleSendMessage(threadId, text) {
    await sendPortalMessage(threadId, {
      senderId: professor.id,
      senderName: professor.name,
      senderRole: 'professor',
      text,
    })
    await refreshThreads()
  }

  async function handleProfessorSave(patch) {
    const updated = await saveProfessorProfile(patch)
    setProfessor({ ...(profile || DEMO_PROFESSOR), ...updated })
    toast({ type: 'success', title: 'Profil actualizat', message: 'Datele publice ale contului de profesor au fost salvate.' })
  }

  return (
    <div className="relative flex h-screen bg-[#050810] text-slate-100 overflow-hidden">
      {/* Top amber accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent z-50" />
      {/* Background glow */}
      <div className="pointer-events-none absolute top-0 left-64 w-96 h-48 bg-amber-500/[0.03] blur-3xl rounded-full" />

      <ProfessorSidebar current={current} onNavigate={handleNavigate} onLogout={logout} profile={professor} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          current={current}
          pendingCount={professorNotificationCount}
          profile={professor}
          requests={sortedRequests}
          recoveryRequests={recoveryRequests}
          threads={threads}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="h-full"
            >
              {current === 'dashboard' && <Dashboard requests={sortedRequests} recoveryRequests={recoveryRequests} threads={threads} professor={professor} onNavigate={handleNavigate} />}
              {current === 'profile' && <ProfessorProfile professor={professor} onSave={handleProfessorSave} />}
              {current === 'thesis' && <ThesisRequests requests={sortedRequests} onDecision={handleDecision} />}
              {current === 'recovery' && <RecoveryView requests={recoveryRequests} onDecision={handleRecoveryDecision} />}
              {current === 'messages' && <MessagesView threads={threads} onSend={handleSendMessage} selectedThreadId={selectedThreadId} onThreadSelect={setSelectedThreadId} professor={professor} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <VirtualAssistant
        session={{ role: 'professor', userId: professor.id, email: professor.email }}
        profile={professor}
        platformMode="professor"
        currentView={current}
        currentLabel={NAV.find(item => item.id === current)?.label || 'Professor Portal'}
        onNavigate={(view) => handleNavigate(view)}
      />
    </div>
  )
}
