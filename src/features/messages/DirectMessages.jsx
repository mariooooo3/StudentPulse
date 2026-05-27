import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Search, Users, Compass, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useOnlineCount } from '../../shared/hooks/useOnlineCount'
import { createUserId } from '../../shared/services/auth.service'
import { listPortalThreadsForUser } from '../../shared/services/professorPortal.service'
import { useNotifications } from '../../shared/hooks/useNotifications'
import { socketService } from '../../shared/services/socket.service'
import { GROUP_CHANNELS, avatarLetters, colorFor, nameFromEmail } from './messages.utils'
import { GroupThread, ChatThread, PortalThread, ContactRow, ChannelRow, PortalRow } from './components/DirectMessagesParts'
import clsx from 'clsx'

export default function DirectMessages({ session, profile }) {
  const { t } = useTranslation()
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

  const scopeLabel = `${meta.universityName || t('messages.universityFallback')} · ${meta.facultyName || t('messages.facultyFallback')}`

  const [onlineUsers, setOnlineUsers] = useState([])
  const [active, setActive] = useState(null)
  const [activePortal, setActivePortal] = useState(null)
  const [activeGroup, setActiveGroup] = useState(null)
  const [portalThreads, setPortalThreads] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('dm') // 'dm' | 'channels'
  const [mobileView, setMobileView] = useState('list') // 'list' | 'chat'
  const [threadRemovedWarning, setThreadRemovedWarning] = useState(false)
  const portalReqId = useRef(0)
  const { report: reportOnlineCount } = useOnlineCount()
  const { notifications } = useNotifications(currentUserId)

  const eligibleUsers = useCallback((users) => {
    return (users || []).filter(u => u.userId !== currentUserId && u.scope === scope)
  }, [currentUserId, scope])

  useEffect(() => {
    let timer = null
    function onThreadRemoved() {
      setThreadRemovedWarning(true)
      clearTimeout(timer)
      timer = setTimeout(() => setThreadRemovedWarning(false), 4000)
    }
    window.addEventListener('sc:thread-removed', onThreadRemoved)
    return () => {
      window.removeEventListener('sc:thread-removed', onThreadRemoved)
      clearTimeout(timer)
    }
  }, [])

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

  const refreshPortal = useCallback(async (checkDeleted = false) => {
    const id = ++portalReqId.current
    try {
      const threads = await listPortalThreadsForUser(currentUserId)
      if (id !== portalReqId.current) return
      setPortalThreads(threads)
      setActivePortal(prev => {
        if (!prev) return prev
        const stillExists = threads.find(t => t.id === prev.id)
        if (checkDeleted && !stillExists) {
          setTimeout(() => window.dispatchEvent(new CustomEvent('sc:thread-removed')), 0)
          return null
        }
        return stillExists || (checkDeleted ? null : prev)
      })
    } catch {}
  }, [currentUserId])

  useEffect(() => {
    refreshPortal()
    window.addEventListener('sc:portal-messages', refreshPortal)
    return () => window.removeEventListener('sc:portal-messages', refreshPortal)
  }, [refreshPortal])

  useEffect(() => {
    const unsub = socketService.subscribe(`portal:${currentUserId}`, () => refreshPortal(true))
    return unsub
  }, [currentUserId, refreshPortal])

  useEffect(() => {
    if (!notifications.length) return
    const hasPortalUpdate = notifications.some(item => item.action?.startsWith('portal.') || item.meta?.threadId)
    if (hasPortalUpdate) refreshPortal()
  }, [notifications, refreshPortal])

  const contacts = onlineUsers.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase())
  )

  function openChat(contact) {
    setActive(contact); setActivePortal(null); setActiveGroup(null); setMobileView('chat')
  }
  function openGroup(g) {
    setActiveGroup(g); setActive(null); setActivePortal(null); setMobileView('chat')
  }
  function openPortal(thread) {
    setActivePortal(thread); setActive(null); setActiveGroup(null); setMobileView('chat')
  }
  function goBack() { setMobileView('list') }

  const hasActiveConversation = activeGroup || activePortal || active

  return (
    <div className="flex h-full animate-fade-in bg-[#050810]">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className={clsx(
        'border-r border-white/[0.05] flex flex-col bg-[#060a15] shrink-0 overflow-hidden',
        'w-full sm:w-72',
        mobileView === 'chat' ? 'hidden sm:flex' : 'flex',
      )}>

        {/* Tab bar */}
        <div className="flex border-b border-white/[0.05] shrink-0">
          <button
            onClick={() => setTab('dm')}
            className={clsx(
              'flex-1 py-3 text-xs font-semibold transition-all relative',
              tab === 'dm' ? 'text-white' : 'text-slate-600 hover:text-slate-400',
            )}
          >
            {t('messages.tabDirect')}
            {tab === 'dm' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab('channels')}
            className={clsx(
              'flex-1 py-3 text-xs font-semibold transition-all relative',
              tab === 'channels' ? 'text-white' : 'text-slate-600 hover:text-slate-400',
            )}
          >
            {t('messages.tabChannels')}
            {tab === 'channels' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        </div>

        {/* ── Channels tab ────────────────────────────────────────────── */}
        {tab === 'channels' ? (
          <div className="flex-1 overflow-y-auto py-3">
            <p className="section-label px-5 mb-2">{t('messages.facultyChannels')}</p>
            {GROUP_CHANNELS.map(g => (
              <ChannelRow
                key={g.id}
                channel={g}
                isActive={activeGroup?.id === g.id}
                onClick={() => openGroup(g)}
              />
            ))}
          </div>
        ) : (
          /* ── DM tab ───────────────────────────────────────────────── */
          <>
            {/* Search + info */}
            <div className="p-4 border-b border-white/[0.05] shrink-0 space-y-3">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('messages.searchPlaceholder')}
                  className="input-base w-full pl-8 py-2 text-sm"
                />
              </div>
              <div className="flex items-start gap-2 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.06] px-3 py-2.5">
                <ShieldCheck size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {t('messages.scopeNote')}
                </p>
              </div>
            </div>

            {/* Current user identity */}
            <div className="px-4 py-3 border-b border-white/[0.04] shrink-0">
              <p className="section-label mb-2">{t('messages.youAre')}</p>
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorFor(currentUserId)} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {avatarLetters(currentName)}
                  </div>
                  <span className="status-online absolute -bottom-0.5 -right-0.5 border-2 border-[#060a15]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-200 font-semibold truncate leading-tight">{currentName}</p>
                  <p className="font-mono text-[10px] text-slate-600 truncate mt-0.5">{scopeLabel}</p>
                </div>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto">

              {/* Professor portal threads */}
              {portalThreads.length > 0 && (
                <div className="pt-3 pb-1">
                  <p className="section-label px-5 mb-1">{t('messages.professors')}</p>
                  {portalThreads.map(thread => (
                    <PortalRow
                      key={thread.id}
                      thread={thread}
                      isActive={activePortal?.id === thread.id}
                      onClick={() => openPortal(thread)}
                    />
                  ))}
                </div>
              )}

              {/* DM contacts */}
              <div className="pt-3">
                <p className="section-label px-5 mb-1">
                  {t('messages.direct')}
                  {contacts.length > 0 && (
                    <span className="ml-2 font-mono text-slate-700 normal-case tracking-normal">{t('messages.online', { count: contacts.length })}</span>
                  )}
                </p>
                {contacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                      <Users size={18} className="text-slate-700" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t('messages.noContacts')}<br />
                      <span className="text-slate-700">{t('messages.noContactsHint')}</span>
                    </p>
                  </div>
                ) : (
                  contacts.map(u => (
                    <ContactRow
                      key={u.userId}
                      user={u}
                      isActive={active?.userId === u.userId}
                      onClick={() => openChat(u)}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Chat area ───────────────────────────────────────────────────── */}
      <div className={clsx(
        'flex-1 min-w-0 bg-[#050810]',
        mobileView === 'list' ? 'hidden sm:flex flex-col' : 'flex flex-col',
      )}>
        {activeGroup ? (
          <GroupThread
            key={activeGroup.id}
            groupId={activeGroup.id}
            groupLabel={activeGroup.label}
            scope={scope}
            currentUserId={currentUserId}
            currentName={currentName}
            onBack={goBack}
          />
        ) : activePortal ? (
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
            onBack={goBack}
          />
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center animate-fade-in-up">
            <div className="text-center max-w-xs px-6">
              {threadRemovedWarning ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                    <AlertTriangle size={28} className="text-amber-400" />
                  </div>
                  <p className="text-slate-300 font-semibold text-base mb-1">{t('messages.unavailable')}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {t('messages.unavailableText')}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
                    <Compass size={28} className="text-slate-600" />
                  </div>
                  <p className="text-slate-300 font-semibold text-base mb-1">{t('messages.selectConversation')}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {t('messages.selectHint')}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
