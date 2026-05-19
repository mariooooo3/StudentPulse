import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
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
  return {
    pending: 'In asteptare',
    accepted: 'Acceptata',
    rejected: 'Respinsa',
  }[status] || status
}

function consultationHoursFor(professor) {
  return professor.consultationHours || professor.officeHours || []
}

function ProfessorSidebar({ current, onNavigate, onLogout, profile }) {
  return (
    <aside className="hidden sm:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#070b14]">
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-200 font-bold">
            {profile.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">Portal Profesor</p>
            <p className="text-[11px] text-slate-600 truncate">FMIM · UAIC</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={clsx(
              'w-full h-10 rounded-xl px-3 flex items-center gap-3 text-[13px] font-semibold transition-colors text-left',
              current === id
                ? 'bg-amber-500/15 text-amber-200 border border-amber-500/25'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]',
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <p className="text-[13px] font-semibold text-slate-200 truncate">{profile.name}</p>
          <p className="text-[11px] text-slate-600 truncate mt-0.5">{profile.email}</p>
          <button onClick={onLogout} className="mt-3 h-8 w-full rounded-lg border border-white/[0.07] bg-white/[0.03] text-[12px] font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center gap-2">
            <LogOut size={13} />
            Iesire
          </button>
        </div>
      </div>
    </aside>
  )
}

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

  return (
    <header className="h-[3.75rem] border-b border-white/[0.06] bg-[#070b14]/90 backdrop-blur-xl px-5 flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-[15px] font-bold text-white">{title}</h1>
        <p className="text-[11px] text-slate-600 truncate">{profile.facultyName}</p>
      </div>
      <div className="relative">
        <button onClick={() => setOpen(v => !v)} className="relative w-9 h-9 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.06] transition-colors">
          <Bell size={15} className="text-slate-500" />
          {(unreadCount || pendingCount) > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center">{(unreadCount || pendingCount) > 9 ? '9+' : (unreadCount || pendingCount)}</span>}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/[0.07] bg-[#0c1120] shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-white">Notificari profesor</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
                    {connected ? <Wifi size={11} className="text-emerald-400" /> : <WifiOff size={11} className="text-amber-400" />}
                    {connected ? 'Live conectat' : 'Offline, sincronizare la refresh'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                      <CheckCheck size={13} />
                      Marcheaza
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-300"><X size={14} /></button>
                </div>
              </div>
              {latest.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-600">Nu ai notificari noi.</div>
              ) : latest.map(item => (
                <button
                  key={item.id}
                  onClick={() => openNotification(item)}
                  className="w-full text-left px-4 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] transition-colors"
                >
                  <p className="text-[13px] font-semibold text-slate-200 truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{item.body}</p>
                  <p className="text-[10px] text-slate-700 mt-1">{new Date(item.time || Date.now()).toLocaleTimeString('ro', { hour: '2-digit', minute: '2-digit' })}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </header>
  )
}

function Dashboard({ requests, recoveryRequests, threads, professor, onNavigate }) {
  const pending = requests.filter(request => request.status === 'pending')
  const accepted = requests.filter(request => request.status === 'accepted')
  const pendingRecovery = recoveryRequests.filter(request => request.status === 'pending')
  return (
    <div className="p-6 space-y-5">
      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] p-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">Buna ziua</p>
        <h2 className="mt-2 text-2xl font-bold text-white">{professor.name}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          {professor.domain}. Ai o vedere rapida asupra cererilor, recuperarilor si mesajelor de la studenti.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {professor.research?.slice(0, 4).map(item => (
            <span key={item} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-200">{item}</span>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          ['Cereri noi', pending.length, BookOpen],
          ['Studenti acceptati', accepted.length, UserCheck],
          ['Recuperari noi', pendingRecovery.length, CalendarClock],
          ['Conversatii', threads.length, MessageSquare],
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <Icon size={16} className="text-slate-500 mb-3" />
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
            <p className="text-[11px] text-slate-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <p className="text-sm font-bold text-white">Cursuri active</p>
            <button onClick={() => onNavigate('profile')} className="text-[12px] font-semibold text-amber-300 hover:text-amber-200">Editeaza profil</button>
          </div>
          {professor.courses?.map(course => (
            <div key={course.id} className="px-4 py-3 border-b border-white/[0.04] last:border-b-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center">
                <BookOpen size={15} className="text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200 truncate">{course.name}</p>
                <p className="text-xs text-slate-600 truncate">{course.groups.join(', ')} · {course.room}</p>
              </div>
              <span className="text-xs text-slate-500">{course.next}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05]">
            <p className="text-sm font-bold text-white">Program de consultatii</p>
          </div>
          {consultationHoursFor(professor).map(slot => (
            <div key={slot.id} className="px-4 py-3 border-b border-white/[0.04] last:border-b-0">
              <p className="text-sm font-semibold text-slate-200 flex items-center gap-2"><Clock size={13} className="text-amber-300" /> {slot.day}, {slot.time}</p>
              <p className="text-xs text-slate-600 mt-1">{slot.place} · {slot.mode} · {slot.capacity} locuri</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
          <p className="text-sm font-bold text-white">Ultimele cereri</p>
          <button onClick={() => onNavigate('thesis')} className="text-[12px] font-semibold text-amber-300 hover:text-amber-200">Vezi toate</button>
        </div>
        {requests.slice(0, 4).length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">Nu exista cereri trimise inca.</div>
        ) : requests.slice(0, 4).map(request => (
          <div key={request.id} className="px-4 py-3 border-b border-white/[0.04] last:border-b-0 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-[11px] font-bold text-slate-300">
              {request.studentName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-200 truncate">{request.studentName}</p>
              <p className="text-xs text-slate-600 truncate">{request.idea}</p>
            </div>
            <span className={clsx('rounded-full px-2 py-1 text-[10px] font-bold', request.status === 'pending' ? 'bg-amber-500/15 text-amber-300' : request.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300')}>
              {statusLabel(request.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

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
      ) : requests.map(request => (
        <article key={request.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white">{request.studentName}</h3>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-slate-400">{request.facultyName || 'FMIM'}</span>
                <span className={clsx('rounded-full px-2 py-1 text-[10px] font-bold', request.status === 'pending' ? 'bg-amber-500/15 text-amber-300' : request.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300')}>
                  {statusLabel(request.status)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">{request.studentEmail}</p>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.05] bg-[#070b14]/60 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Idee tema</p>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{request.idea}</p>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-[#070b14]/60 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Motivatie</p>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{request.motivation}</p>
                </div>
              </div>
              {request.file && (
                <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                  <FileText size={13} />
                  {request.file.name} · {(request.file.size / 1024).toFixed(0)} KB
                </p>
              )}
            </div>

            {request.status === 'pending' ? (
              <div className="lg:w-72 space-y-2">
                <textarea
                  value={noteById[request.id] || ''}
                  onChange={e => setNoteById(prev => ({ ...prev, [request.id]: e.target.value }))}
                  placeholder="Nota optionala pentru student..."
                  rows={3}
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-700 outline-none focus:border-amber-500/40 resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => onDecision(request.id, 'accepted', noteById[request.id] || 'Te astept la o discutie initiala saptamana aceasta.')} className="h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-600/30">
                    <Check size={14} />
                    Accepta
                  </button>
                  <button onClick={() => onDecision(request.id, 'rejected', noteById[request.id] || 'Tema nu se potriveste directiei mele curente de cercetare.')} className="h-10 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-600/30">
                    <X size={14} />
                    Respinge
                  </button>
                </div>
              </div>
            ) : (
              <div className="lg:w-72 rounded-xl border border-white/[0.05] bg-[#070b14]/60 p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Raspuns transmis</p>
                <p className="mt-2 text-sm text-slate-300">{request.professorNote || 'Fara nota suplimentara.'}</p>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

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
    onSave({
      ...form,
      research: form.research.split(',').map(item => item.trim()).filter(Boolean),
    })
    setEditing(false)
  }

  return (
    <div className="p-6 space-y-5">
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-200 text-xl font-bold shrink-0">
            {professor.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">{professor.title}</p>
            <h2 className="mt-1 text-2xl font-bold text-white">{professor.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{professor.facultyName} · {professor.email}</p>
          </div>
          <button onClick={() => editing ? save() : setEditing(true)} className="btn-primary inline-flex items-center gap-2 text-sm">
            {editing ? <Save size={15} /> : <Edit3 size={15} />}
            {editing ? 'Salveaza' : 'Editeaza'}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-4">
          {[
            ['domain', 'Domeniu coordonare'],
            ['room', 'Birou'],
            ['phone', 'Telefon secretariat/birou'],
            ['assistant', 'Asistent / colaborator'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-[10px] uppercase tracking-widest text-slate-600 font-bold block mb-2">{label}</label>
              {editing ? (
                <input value={form[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500/40" />
              ) : (
                <p className="text-sm text-slate-300 rounded-xl border border-white/[0.05] bg-[#070b14]/60 px-3 py-2">{professor[key]}</p>
              )}
            </div>
          ))}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-600 font-bold block mb-2">Directii cercetare</label>
            {editing ? (
              <input value={form.research} onChange={e => setForm(prev => ({ ...prev, research: e.target.value }))} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500/40" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {professor.research?.map(item => <span key={item} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{item}</span>)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-sm font-bold text-white mb-3">Program public de consultatii</p>
            {consultationHoursFor(professor).map(slot => (
              <div key={slot.id} className="rounded-xl border border-white/[0.05] bg-[#070b14]/60 px-3 py-2 mb-2 last:mb-0">
                <p className="text-sm font-semibold text-slate-200">{slot.day}, {slot.time}</p>
                <p className="text-xs text-slate-600 mt-0.5">{slot.place} · {slot.mode}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-sm font-bold text-white mb-3">Cursuri publicate</p>
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

function RecoveryView({ requests, onDecision }) {
  const [created, setCreated] = useState(false)
  return (
    <div className="p-6 space-y-4">
      <button
        onClick={() => setCreated(true)}
        className="btn-primary inline-flex items-center gap-2 text-sm"
      >
        <Plus size={15} />
        Adauga slot de recuperare
      </button>
      {created && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Slot publicat: Structuri de Date, Vineri 14:00, sala C210.
        </div>
      )}
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <CalendarClock size={32} className="mx-auto text-slate-700 mb-3" />
          <p className="text-sm font-semibold text-slate-400">Nu exista cereri de recuperare.</p>
          <p className="text-xs text-slate-700 mt-1">Studentii le trimit din Schedule Hub.</p>
        </div>
      ) : requests.map(item => (
        <div key={item.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <p className="font-bold text-white">{item.studentName}</p>
            <p className="text-sm text-slate-500">{item.subject} · Gr. {item.group} · {item.room} · {item.start}:00</p>
            <p className="text-xs text-slate-600 mt-1">{item.reason}</p>
          </div>
          {item.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => onDecision(item.id, 'accepted', 'Cererea de recuperare a fost aprobata.')} className="h-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-300">Accepta</button>
              <button onClick={() => onDecision(item.id, 'rejected', 'Nu exista locuri disponibile pentru slotul cerut.')} className="h-9 rounded-xl border border-red-500/30 bg-red-500/10 px-3 text-xs font-bold text-red-300">Respinge</button>
            </div>
          )}
          <span className="text-xs text-slate-500 min-w-24">{statusLabel(item.status)}</span>
        </div>
      ))}
    </div>
  )
}

function MessagesView({ threads, onSend, selectedThreadId, onThreadSelect }) {
  const [activeId, setActiveId] = useState(threads[0]?.id || null)
  const [text, setText] = useState('')
  const active = threads.find(thread => thread.id === activeId) || threads[0]
  useEffect(() => {
    if (!activeId && threads[0]) setActiveId(threads[0].id)
  }, [threads, activeId])

  useEffect(() => {
    if (selectedThreadId && threads.some(thread => thread.id === selectedThreadId)) {
      setActiveId(selectedThreadId)
    }
  }, [selectedThreadId, threads])

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 h-full">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        {threads.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">Nu exista conversatii.</div>
        ) : threads.map(thread => (
          <button
            key={thread.id}
            onClick={() => {
              setActiveId(thread.id)
              onThreadSelect?.(thread.id)
            }}
            className={clsx('w-full px-4 py-4 border-b border-white/[0.04] last:border-b-0 text-left hover:bg-white/[0.03] transition-colors', active?.id === thread.id && 'bg-amber-500/10')}
          >
            <p className="font-semibold text-slate-200">{thread.studentName}</p>
            <p className="text-xs text-slate-600 mt-1 truncate">{thread.messages.at(-1)?.text || thread.subject}</p>
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] flex flex-col min-h-[420px]">
        {active ? (
          <>
            <div className="px-4 py-3 border-b border-white/[0.05]">
              <p className="font-bold text-white">{active.studentName}</p>
              <p className="text-xs text-slate-600">{active.subject}</p>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {active.messages.length === 0 ? (
                <p className="text-sm text-slate-600 text-center py-10">Incepe conversatia cu studentul.</p>
              ) : active.messages.map(message => (
                <div key={message.id} className={clsx('flex', message.senderRole === 'professor' ? 'justify-end' : 'justify-start')}>
                  <div className={clsx('max-w-md rounded-2xl px-4 py-2 text-sm', message.senderRole === 'professor' ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-slate-200 border border-white/[0.07]')}>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/[0.05] flex gap-2">
              <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => {
                if (e.key === 'Enter' && text.trim()) {
                  onSend(active.id, text.trim())
                  setText('')
                }
              }} placeholder="Scrie raspuns..." className="flex-1 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm text-slate-200 outline-none" />
              <button onClick={() => { if (text.trim()) { onSend(active.id, text.trim()); setText('') } }} className="btn-primary px-4 text-sm">Trimite</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-600">Selecteaza o conversatie</div>
        )}
      </div>
    </div>
  )
}

export default function ProfessorApp() {
  const { logout, profile } = useAuth()
  const toast = useToast()
  const [professor, setProfessor] = useState(() => ({ ...(profile || DEMO_PROFESSOR) }))
  const [current, setCurrent] = useState('dashboard')
  const [selectedThreadId, setSelectedThreadId] = useState(null)
  const [requests, setRequests] = useState([])
  const [recoveryRequests, setRecoveryRequests] = useState([])
  const [threads, setThreads] = useState([])

  const refreshRequests = async () => {
    setRequests(await listThesisRequests())
  }

  const refreshRecoveryRequests = async () => {
    setRecoveryRequests(await listRecoveryRequests())
  }

  const refreshThreads = async () => {
    setThreads(await listPortalThreads())
  }

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
    const unsub = socketService.subscribe(`portal:${professor.id}`, () => {
      refreshPortalData()
    })
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

  const sortedRequests = useMemo(() => [...requests].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), [requests])
  const pendingCount = sortedRequests.filter(request => request.status === 'pending').length
  const professorNotificationCount = pendingCount
    + recoveryRequests.filter(request => request.status === 'pending').length
    + threads.filter(thread => thread.messages.at(-1)?.senderRole === 'student').length

  function handleNavigate(target, options = {}) {
    if (target === 'messages' && options.threadId) {
      setSelectedThreadId(options.threadId)
    }
    setCurrent(target)
  }

  async function handleDecision(requestId, status, note) {
    const updated = await updateThesisRequestStatus(requestId, status, note)
    if (updated?.studentId) {
      const thread = await upsertPortalThread({
        student: {
          userId: updated.studentId,
          name: updated.studentName,
          email: updated.studentEmail,
        },
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
        student: {
          userId: updated.studentId,
          name: updated.studentName,
          email: updated.studentEmail,
        },
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500/80 to-transparent" />
      <ProfessorSidebar current={current} onNavigate={handleNavigate} onLogout={logout} profile={professor} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header current={current} pendingCount={professorNotificationCount} profile={professor} requests={sortedRequests} recoveryRequests={recoveryRequests} threads={threads} onNavigate={handleNavigate} />
        <main className="flex-1 overflow-auto">
          {current === 'dashboard' && <Dashboard requests={sortedRequests} recoveryRequests={recoveryRequests} threads={threads} professor={professor} onNavigate={handleNavigate} />}
          {current === 'profile' && <ProfessorProfile professor={professor} onSave={handleProfessorSave} />}
          {current === 'thesis' && <ThesisRequests requests={sortedRequests} onDecision={handleDecision} />}
          {current === 'recovery' && <RecoveryView requests={recoveryRequests} onDecision={handleRecoveryDecision} />}
          {current === 'messages' && <MessagesView threads={threads} onSend={handleSendMessage} selectedThreadId={selectedThreadId} onThreadSelect={setSelectedThreadId} />}
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
