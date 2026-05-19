import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Send, Search, Wifi, WifiOff, Users, ShieldCheck, Paperclip, X, FileText } from 'lucide-react'
import { useMessages } from '../../shared/hooks/useMessages'
import { socketService } from '../../shared/services/socket.service'
import { useOnlineCount } from '../../shared/hooks/useOnlineCount'
import { createUserId } from '../../shared/services/auth.service'
import { listPortalThreadsForUser, sendPortalMessage } from '../../shared/services/professorPortal.service'
import { useNotifications } from '../../shared/hooks/useNotifications'
import clsx from 'clsx'

function nameFromEmail(email) {
  if (!email) return 'Utilizator'
  const local = email.split('@')[0]
  return local.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function avatarLetters(name) {
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2).toUpperCase()
}

const COLORS = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-yellow-500 to-orange-500',
]

function colorFor(userId) {
  let hash = 0
  for (const c of (userId || '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return COLORS[Math.abs(hash) % COLORS.length]
}

function ChatThread({ contact, currentUserId, currentName, scope }) {
  const isSelfConversation = contact.userId === currentUserId
  const channel = `dm:${scope}:${[currentUserId, contact.userId].sort().join(':')}`
  const { messages, sendMessage, connected } = useMessages(channel, currentUserId)
  const [input, setInput] = useState('')
  const [attachment, setAttachment] = useState(null)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Fișierul e prea mare. Maxim 5MB.'); return }
    const reader = new FileReader()
    reader.onload = ev => setAttachment({ base64: ev.target.result.split(',')[1], mimeType: file.type, name: file.name, size: file.size })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function send() {
    if (isSelfConversation) return
    if (!input.trim() && !attachment) return
    sendMessage(input.trim(), currentName, attachment)
    setInput('')
    setAttachment(null)
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="h-16 border-b border-white/[0.05] flex items-center px-6 gap-4 bg-[#070b14]/90 backdrop-blur-xl shrink-0">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colorFor(contact.userId)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {avatarLetters(contact.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{contact.name}</p>
          <p className="text-xs text-slate-500 truncate">{contact.facultyName || 'Aceeasi facultate'}</p>
        </div>
        <span className={clsx('flex items-center gap-1 text-[10px]', connected ? 'text-emerald-400' : 'text-slate-500')}>
          {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
          {connected ? 'Live' : 'Offline'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-slate-600 text-sm py-8">
            Niciun mesaj inca. Poti discuta doar cu studenti din aceeasi universitate si facultate.
          </p>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === currentUserId
          return (
            <div key={msg.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
              {!isMe && (
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorFor(contact.userId)} flex items-center justify-center text-white text-[10px] font-bold mr-2 shrink-0 mt-1`}>
                  {avatarLetters(contact.name)}
                </div>
              )}
              <div className="max-w-sm">
                <div className={clsx(
                  'rounded-2xl text-sm leading-relaxed overflow-hidden',
                  isMe
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-white/[0.05] border border-white/[0.06] text-slate-200 rounded-tl-sm',
                )}>
                  {msg.attachment?.mimeType?.startsWith('image/') && (
                    <img
                      src={`data:${msg.attachment.mimeType};base64,${msg.attachment.base64}`}
                      alt={msg.attachment.name}
                      className="max-w-full max-h-64 object-contain"
                    />
                  )}
                  {msg.attachment && !msg.attachment.mimeType?.startsWith('image/') && (
                    <a
                      href={`data:${msg.attachment.mimeType};base64,${msg.attachment.base64}`}
                      download={msg.attachment.name}
                      className="flex items-center gap-2 px-4 py-2.5 hover:opacity-80 transition-opacity"
                    >
                      <FileText size={16} className="shrink-0" />
                      <span className="truncate text-xs">{msg.attachment.name}</span>
                      <span className="text-[10px] opacity-60 shrink-0">{(msg.attachment.size / 1024).toFixed(0)}KB</span>
                    </a>
                  )}
                  {msg.content && <p className="px-4 py-2.5">{msg.content}</p>}
                </div>
                <p className={clsx('text-[10px] text-slate-600 mt-1', isMe ? 'text-right' : 'text-left')}>
                  {new Date(msg.timestamp).toLocaleTimeString('ro', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/[0.05] bg-[#070b14]/90">
        {attachment && (
          <div className="mb-2 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
            {attachment.mimeType.startsWith('image/') ? (
              <img src={`data:${attachment.mimeType};base64,${attachment.base64}`} className="h-10 w-10 object-cover rounded-lg" alt="" />
            ) : (
              <FileText size={20} className="text-slate-400 shrink-0" />
            )}
            <span className="text-xs text-slate-300 truncate flex-1">{attachment.name}</span>
            <span className="text-[10px] text-slate-600 shrink-0">{(attachment.size / 1024).toFixed(0)}KB</span>
            <button onClick={() => setAttachment(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3">
          <input ref={fileRef} type="file" className="hidden" onChange={onFile} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={isSelfConversation}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Paperclip size={16} />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Scrie un mesaj..."
            disabled={isSelfConversation}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
          />
          <button
            onClick={send}
            disabled={(!input.trim() && !attachment) || isSelfConversation}
            className={clsx('w-8 h-8 rounded-xl flex items-center justify-center transition-all',
              (input.trim() || attachment) && !isSelfConversation ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-white/[0.06]')}
          >
            <Send size={14} className={(input.trim() || attachment) && !isSelfConversation ? 'text-white' : 'text-slate-500'} />
          </button>
        </div>
      </div>
    </div>
  )
}

function PortalThread({ thread, currentUserId, currentName }) {
  const [input, setInput] = useState('')
  const [localThread, setLocalThread] = useState(thread)
  const bottomRef = useRef(null)

  useEffect(() => {
    setLocalThread(thread)
  }, [thread])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localThread?.messages])

  async function send() {
    if (!input.trim()) return
    const updated = await sendPortalMessage(localThread.id, {
      senderId: currentUserId,
      senderName: currentName,
      senderRole: 'student',
      text: input.trim(),
    })
    setLocalThread(updated)
    setInput('')
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="h-16 border-b border-white/[0.05] flex items-center px-6 gap-4 bg-[#070b14]/90 backdrop-blur-xl shrink-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">AM</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{localThread.professorName}</p>
          <p className="text-xs text-slate-500 truncate">{localThread.subject}</p>
        </div>
        <span className="text-[10px] text-amber-300">Portal profesor</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {localThread.messages.length === 0 && (
          <p className="text-center text-slate-600 text-sm py-8">Nu exista mesaje inca.</p>
        )}
        {localThread.messages.map(msg => {
          const isMe = msg.senderRole === 'student'
          return (
            <div key={msg.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div className={clsx(
                'max-w-sm rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white/[0.05] border border-white/[0.06] text-slate-200 rounded-tl-sm',
              )}>
                {msg.text}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/[0.05] bg-[#070b14]/90">
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Raspunde profesorului..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className={clsx('w-8 h-8 rounded-xl flex items-center justify-center transition-all', input.trim() ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-white/[0.06]')}
          >
            <Send size={14} className={input.trim() ? 'text-white' : 'text-slate-500'} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DirectMessages({ session, profile }) {
  // Stabilize currentUserId — generate guest ID once, never regenerate
  const currentUserId = useMemo(
    () => session?.userId || createUserId('guest'),
    [session?.userId]
  )
  const currentName = nameFromEmail(session?.email)

  const scope = useMemo(() => {
    const universityId = profile?.university?.id || session?.university?.id || 'unknown-university'
    const facultyCode = profile?.facultyCode || session?.detectedFaculty?.code || 'unknown-faculty'
    return `${universityId}:${facultyCode}`
  }, [profile?.university?.id, profile?.facultyCode, session?.university?.id, session?.detectedFaculty?.code])

  // Stabilize meta — prevent infinite useEffect re-runs
  const meta = useMemo(() => ({
    universityId: profile?.university?.id || session?.university?.id || '',
    universityName: profile?.university?.shortName || session?.university?.shortName || '',
    facultyCode: profile?.facultyCode || session?.detectedFaculty?.code || '',
    facultyName: profile?.faculty || session?.detectedFaculty?.name || '',
    scope,
  }), [scope, profile?.university?.id, profile?.university?.shortName, profile?.facultyCode, profile?.faculty,
      session?.university?.id, session?.university?.shortName, session?.detectedFaculty?.code, session?.detectedFaculty?.name])

  const scopeLabel = `${meta.universityName || 'Universitate'} · ${meta.facultyName || 'Facultate'}`

  const [onlineUsers, setOnlineUsers] = useState([])
  const [active, setActive] = useState(null)
  const [activePortal, setActivePortal] = useState(null)
  const [portalThreads, setPortalThreads] = useState([])
  const [search, setSearch] = useState('')
  const { report: reportOnlineCount } = useOnlineCount()
  const { notifications } = useNotifications(currentUserId)

  const eligibleUsers = useCallback((users) => {
    return (users || []).filter(u => u.userId !== currentUserId && u.scope === scope)
  }, [currentUserId, scope])

  // Auth + initial presence fetch — runs only when stable deps change
  useEffect(() => {
    socketService.auth(currentUserId, currentName, meta)

    socketService.presenceList()
      .then(({ users }) => {
        const others = eligibleUsers(users)
        setOnlineUsers(others)
        reportOnlineCount(others.length)
        setActive(prev => (prev && others.some(u => u.userId === prev.userId)) ? prev : (others[0] || null))
      })
      .catch(() => {})
  }, [currentUserId, currentName, meta, eligibleUsers])

  // Subscribe to live presence updates
  useEffect(() => {
    const unsub = socketService.subscribe('presence:online', (users) => {
      const others = eligibleUsers(users)
      setOnlineUsers(others)
      reportOnlineCount(others.length)
      setActive(prev => (prev && others.some(u => u.userId === prev.userId)) ? prev : (others[0] || null))
    })
    return unsub
  }, [eligibleUsers])

  useEffect(() => {
    async function refresh() {
      const threads = await listPortalThreadsForUser(currentUserId)
      setPortalThreads(threads)
      setActivePortal(prev => prev ? threads.find(thread => thread.id === prev.id) || null : null)
    }
    refresh()
    window.addEventListener('sc:portal-messages', refresh)
    return () => window.removeEventListener('sc:portal-messages', refresh)
  }, [currentUserId])

  useEffect(() => {
    const unsub = socketService.subscribe(`portal:${currentUserId}`, async () => {
      const threads = await listPortalThreadsForUser(currentUserId)
      setPortalThreads(threads)
      setActivePortal(prev => prev ? threads.find(thread => thread.id === prev.id) || null : prev)
    })
    return unsub
  }, [currentUserId])

  useEffect(() => {
    if (!notifications.length) return
    async function refreshFromNotification() {
      const hasPortalUpdate = notifications.some(item => item.action?.startsWith('portal.') || item.meta?.threadId)
      if (!hasPortalUpdate) return
      const threads = await listPortalThreadsForUser(currentUserId)
      setPortalThreads(threads)
      setActivePortal(prev => prev ? threads.find(thread => thread.id === prev.id) || null : prev)
    }
    refreshFromNotification()
  }, [notifications, currentUserId])

  const contacts = onlineUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-full animate-fade-in">
      <div className="w-72 border-r border-white/[0.05] flex flex-col bg-[#070b14] shrink-0">
        <div className="p-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2">
            <Search size={14} className="text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cauta colegi online..."
              className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none flex-1"
            />
          </div>
          <div className="mt-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">
            <p className="text-[10px] text-indigo-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck size={11} /> DM filtrat academic
            </p>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              Poti comunica doar cu studenti din aceeasi universitate si facultate.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-white/[0.04]">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Tu esti</p>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${colorFor(currentUserId)} flex items-center justify-center text-white text-[9px] font-bold`}>
              {avatarLetters(currentName)}
            </div>
            <span className="text-xs text-slate-300 font-medium truncate">{currentName}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto" />
          </div>
          <p className="text-[10px] text-slate-600 truncate mt-1">{scopeLabel}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {portalThreads.length > 0 && (
            <div className="px-4 pb-3">
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Profesori</p>
              <div className="space-y-1">
                {portalThreads.map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => { setActivePortal(thread); setActive(null) }}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/[0.04] transition-colors',
                      activePortal?.id === thread.id && 'bg-amber-500/10 border border-amber-500/20',
                    )}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">AM</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-200 truncate">{thread.professorName}</p>
                      <p className="text-xs text-slate-600 truncate">{thread.messages.at(-1)?.text || thread.subject}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Users size={28} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-600">Niciun coleg eligibil online</p>
              <p className="text-xs text-slate-700 mt-1">
                Deschide aplicatia in alt tab cu acelasi profil de facultate.
              </p>
            </div>
          ) : (
            contacts.map(u => (
              <button
                key={u.userId}
                onClick={() => { setActive(u); setActivePortal(null) }}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left',
                  active?.userId === u.userId && 'bg-white/[0.05] border-r-2 border-indigo-500',
                )}
              >
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorFor(u.userId)} flex items-center justify-center text-white text-xs font-bold`}>
                    {avatarLetters(u.name)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#070b14]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{u.name}</p>
                  <p className="text-xs text-emerald-500 truncate">{u.facultyName || 'Aceeasi facultate'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {activePortal ? (
        <PortalThread
          key={activePortal.id}
          thread={activePortal}
          currentUserId={currentUserId}
          currentName={currentName}
        />
      ) : active ? (
        <ChatThread
          key={active.userId}
          contact={active}
          currentUserId={currentUserId}
          currentName={currentName}
          scope={scope}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <Users size={40} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Selecteaza un coleg eligibil din stanga</p>
            <p className="text-slate-700 text-xs mt-1">
              Studentii din alte facultati sau universitati nu apar in lista si nu pot accesa canalul tau DM.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
