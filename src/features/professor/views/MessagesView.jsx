import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { Check, CheckCheck } from 'lucide-react'
import { socketService } from '../../../shared/services/socket.service'
import { DEMO_PROFESSOR } from '../../../shared/services/professorPortal.service'

export default function MessagesView({ threads, onSend, selectedThreadId, onThreadSelect, professor }) {
  const { t } = useTranslation()
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
          <p className="text-sm font-bold text-white">{t('professor.messages.conversations')}</p>
          <p className="text-[11px] text-slate-600 mt-0.5">{t('professor.messages.activeCount', { count: threads.length })}</p>
        </div>
        <div className="flex-1 overflow-auto">
          {threads.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-600">{t('professor.messages.noConversations')}</div>
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
                    ? <span className="text-amber-400 italic">{Object.values(typingUsers).join(', ')} {t('professor.messages.typing')}</span>
                    : <span className="text-slate-600">{active.subject}</span>}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {active.messages.length === 0 ? (
                <p className="text-sm text-slate-600 text-center py-10">{t('professor.messages.startConversation')}</p>
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
                  <p className="text-xs text-slate-500 italic">{Object.values(typingUsers).join(', ')} {t('professor.messages.typing')}</p>
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
                placeholder={t('professor.messages.inputPlaceholder')}
                className="input-base flex-1 text-sm"
              />
              <button onClick={submitMessage} className="btn-primary px-4 text-sm shrink-0">{t('professor.messages.send')}</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-600">
            {t('professor.messages.selectConversation')}
          </div>
        )}
      </div>
    </div>
  )
}
