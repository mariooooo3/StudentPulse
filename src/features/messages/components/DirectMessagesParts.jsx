import { useState, useEffect, useRef } from 'react'
import { Send, Wifi, WifiOff, ShieldCheck, Paperclip, X, FileText, ArrowLeft, Hash, Check, CheckCheck, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMessages } from '../../../shared/hooks/useMessages'
import { socketService } from '../../../shared/services/socket.service'
import { listPortalThreadsForUser, sendPortalMessage } from '../../../shared/services/professorPortal.service'
import { useNotifications } from '../../../shared/hooks/useNotifications'
import { avatarLetters, colorFor, nameFromEmail } from '../messages.utils'
import clsx from 'clsx'

export function TypingDots({ names, single }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2 px-6 py-2 animate-fade-in">
      <div className="flex gap-[3px] items-end">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="font-mono text-[11px] text-slate-500 italic">
        {names} {single ? t('messages.typing') : t('messages.typingPlural')}
      </p>
    </div>
  )
}

/* ─── Message input bar ──────────────────────────────────────────────────── */
export function MessageInputBar({ value, onChange, onKeyDown, onSend, canSend, placeholder, children }) {
  return (
    <div className="p-4 border-t border-white/[0.05] bg-[#080e1c]/95 backdrop-blur-xl shrink-0">
      {children}
      <div className="flex items-center gap-3 bg-[#080e1c] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-indigo-500/40 transition-colors">
        {/* slot for extra left buttons injected via children fallthrough — handled per caller */}
        <input
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none font-[Plus_Jakarta_Sans,sans-serif]"
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          className={clsx(
            'w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0',
            canSend
              ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/20'
              : 'bg-white/[0.05]',
          )}
        >
          <Send size={14} className={canSend ? 'text-white' : 'text-slate-600'} />
        </button>
      </div>
    </div>
  )
}

/* ─── Chat header ────────────────────────────────────────────────────────── */
export function ChatHeader({ onBack, avatar, name, subtitle, subtitleClass = 'text-slate-500', badge, connected }) {
  const { t } = useTranslation()
  return (
    <div className="h-16 border-b border-white/[0.05] flex items-center px-5 gap-3 bg-[#070b14]/95 backdrop-blur-xl shrink-0">
      {onBack && (
        <button
          onClick={onBack}
          className="sm:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
        >
          <ArrowLeft size={16} />
        </button>
      )}
      {avatar}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate leading-tight">{name}</p>
        <p className={clsx('text-[11px] truncate mt-0.5', subtitleClass)}>{subtitle}</p>
      </div>
      {badge && (
        <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-slate-500 font-mono shrink-0">
          {badge}
        </span>
      )}
      <span
        className={clsx(
          'flex items-center gap-1 font-mono text-[10px] shrink-0',
          connected ? 'text-emerald-400' : 'text-slate-600',
        )}
      >
        {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
        {connected ? t('notifications.connected') : t('notifications.offline')}
      </span>
    </div>
  )
}

/* ─── Date separator ─────────────────────────────────────────────────────── */
export function DateSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 my-4 px-2">
      <div className="flex-1 h-px bg-white/[0.05]" />
      <span className="font-mono text-[10px] text-slate-700 tracking-wider uppercase shrink-0">{label}</span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  )
}

/* ─── Message bubble ─────────────────────────────────────────────────────── */
export function Bubble({ isMe, content, attachment, timestamp, isSeen, showSeen, senderAvatar, senderName }) {
  const time = new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return (
    <div className={clsx('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
      {!isMe && (
        <div className="shrink-0 mb-1">
          {senderAvatar}
        </div>
      )}
      <div className={clsx('max-w-[70%] sm:max-w-sm', isMe ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
        {!isMe && senderName && (
          <p className="text-[10px] text-slate-500 ml-1 font-medium">{senderName}</p>
        )}
        <div
          className={clsx(
            'rounded-2xl text-sm leading-relaxed overflow-hidden',
            isMe
              ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-br-sm shadow-lg shadow-indigo-500/15'
              : 'bg-white/[0.06] border border-white/[0.06] text-slate-200 rounded-bl-sm',
          )}
        >
          {attachment?.mimeType?.startsWith('image/') && (
            <img
              src={`data:${attachment.mimeType};base64,${attachment.base64}`}
              alt={attachment.name}
              className="max-w-full max-h-64 object-contain"
            />
          )}
          {attachment && !attachment.mimeType?.startsWith('image/') && (
            <a
              href={`data:${attachment.mimeType};base64,${attachment.base64}`}
              download={attachment.name}
              className="flex items-center gap-2 px-4 py-3 hover:opacity-80 transition-opacity"
            >
              <FileText size={16} className="shrink-0" />
              <span className="truncate text-xs font-medium">{attachment.name}</span>
              <span className="font-mono text-[10px] opacity-60 shrink-0">{(attachment.size / 1024).toFixed(0)}KB</span>
            </a>
          )}
          {content && <p className="px-4 py-2.5">{content}</p>}
        </div>
        <div className={clsx('flex items-center gap-1', isMe ? 'flex-row-reverse' : 'flex-row')}>
          <span className="font-mono text-[10px] text-slate-700">{time}</span>
          {showSeen && (
            isSeen
              ? <CheckCheck size={11} className="text-indigo-400" />
              : <Check size={11} className="text-slate-600" />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Empty messages placeholder ─────────────────────────────────────────── */
export function EmptyChat({ text }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 px-6">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
        <MessageSquare size={20} className="text-slate-600" />
      </div>
      <p className="text-slate-600 text-sm text-center leading-relaxed max-w-xs">{text}</p>
    </div>
  )
}

/* ─── GroupThread ────────────────────────────────────────────────────────── */
export function GroupThread({ groupId, groupLabel, scope, currentUserId, currentName, onBack }) {
  const { t } = useTranslation()
  const channel = `group:${scope}:${groupId}`
  const { messages, sendMessage, connected, typingUsers, sendTyping } = useMessages(channel, currentUserId)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  useEffect(() => {
    return () => clearTimeout(typingTimer.current)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleInput(e) {
    setInput(e.target.value)
    sendTyping(true, currentName)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => sendTyping(false, currentName), 2000)
  }

  function send() {
    if (!input.trim()) return
    clearTimeout(typingTimer.current)
    sendTyping(false, currentName)
    sendMessage(input.trim(), currentName)
    setInput('')
  }

  const typingNames = Object.values(typingUsers).join(', ')
  const typingCount = Object.keys(typingUsers).length

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#050810]">
      <ChatHeader
        onBack={onBack}
        avatar={
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
            <Hash size={16} className="text-indigo-400" />
          </div>
        }
        name={`#${groupLabel}`}
        subtitle={t('messages.facultyChannel')}
        badge={t('messages.channelBadge')}
        connected={connected}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {messages.length === 0 && (
          <EmptyChat text={t('messages.emptyGroup')} />
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === currentUserId
          return (
            <Bubble
              key={msg.id}
              isMe={isMe}
              content={msg.content}
              timestamp={msg.timestamp}
              isSeen={false}
              showSeen={false}
              senderName={!isMe ? msg.senderName : null}
              senderAvatar={
                !isMe
                  ? (
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorFor(msg.senderId)} flex items-center justify-center text-white text-[10px] font-bold`}>
                      {(msg.senderName || 'U').slice(0, 2).toUpperCase()}
                    </div>
                  )
                  : null
              }
            />
          )
        })}
        <div ref={bottomRef} />
      </div>

      {typingCount > 0 && <TypingDots names={typingNames} single={typingCount === 1} />}

      <MessageInputBar
        value={input}
        onChange={handleInput}
        onKeyDown={e => e.key === 'Enter' && send()}
        onSend={send}
        canSend={!!input.trim()}
        placeholder={t('messages.groupPlaceholder', { label: groupLabel })}
      />
    </div>
  )
}

/* ─── ChatThread ─────────────────────────────────────────────────────────── */
export function ChatThread({ contact, currentUserId, currentName, scope, onBack }) {
  const { t } = useTranslation()
  const isSelfConversation = contact.userId === currentUserId
  const channel = `dm:${scope}:${[currentUserId, contact.userId].sort().join(':')}`
  const { messages, sendMessage, connected, typingUsers, sendTyping, contactSeenAt, sendRead } = useMessages(channel, currentUserId)
  const [input, setInput] = useState('')
  const [attachment, setAttachment] = useState(null)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)
  const typingTimer = useRef(null)

  useEffect(() => {
    return () => clearTimeout(typingTimer.current)
  }, [])

  // Trimite read receipt doar când cresc mesajele primite de la contact (nu cele trimise de noi)
  const contactMsgCount = messages.filter(m => m.senderId !== currentUserId).length
  useEffect(() => {
    if (!isSelfConversation && contactMsgCount > 0) sendRead()
  }, [channel, contactMsgCount, isSelfConversation, sendRead])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert(t('messages.fileTooLarge')); return }
    const reader = new FileReader()
    reader.onload = ev => { const r = ev.target.result; setAttachment({ base64: r?.includes(',') ? r.split(',')[1] : r, mimeType: file.type, name: file.name, size: file.size }) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleInput(e) {
    setInput(e.target.value)
    if (!isSelfConversation) {
      sendTyping(true, currentName)
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => sendTyping(false, currentName), 2000)
    }
  }

  function send() {
    if (isSelfConversation) return
    if (!input.trim() && !attachment) return
    clearTimeout(typingTimer.current)
    sendTyping(false, currentName)
    sendMessage(input.trim(), currentName, attachment)
    setInput('')
    setAttachment(null)
    if (currentUserId && !currentUserId.startsWith('guest-')) {
      fetch('/api/challenges/in-app-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, actionType: 'message-sent', userName: currentName }),
      }).catch(() => {})
    }
  }

  const myMsgs = messages.filter(m => m.senderId === currentUserId)
  const lastMyMsg = myMsgs[myMsgs.length - 1]

  const typingNames = Object.values(typingUsers).join(', ')
  const typingCount = Object.keys(typingUsers).length

  const isTyping = typingCount > 0

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#050810]">
      <ChatHeader
        onBack={onBack}
        avatar={
          <div className="relative shrink-0">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colorFor(contact.userId)} flex items-center justify-center text-white text-xs font-bold`}>
              {avatarLetters(contact.name)}
            </div>
            <span className="status-online absolute -bottom-0.5 -right-0.5 border-2 border-[#050810]" />
          </div>
        }
        name={contact.name}
        subtitle={
          isTyping
            ? t('messages.typing')
            : t('messages.onlineStatus')
        }
        subtitleClass={isTyping ? 'text-indigo-400 italic' : 'text-emerald-400'}
        badge={contact.facultyName || t('messages.sameFaculty')}
        connected={connected}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {messages.length === 0 && (
          <EmptyChat text={t('messages.emptyDM')} />
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === currentUserId
          const isSeen = isMe && contactSeenAt && msg.id === lastMyMsg?.id && new Date(contactSeenAt) >= new Date(msg.timestamp)

          return (
            <Bubble
              key={msg.id}
              isMe={isMe}
              content={msg.content}
              attachment={msg.attachment}
              timestamp={msg.timestamp}
              isSeen={isSeen}
              showSeen={isMe}
              senderAvatar={
                !isMe
                  ? (
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorFor(contact.userId)} flex items-center justify-center text-white text-[10px] font-bold`}>
                      {avatarLetters(contact.name)}
                    </div>
                  )
                  : null
              }
            />
          )
        })}
        <div ref={bottomRef} />
      </div>

      {typingCount > 0 && <TypingDots names={typingNames} single={typingCount === 1} />}

      <div className="p-4 border-t border-white/[0.05] bg-[#080e1c]/95 backdrop-blur-xl shrink-0">
        {attachment && (
          <div className="mb-3 flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 animate-fade-in">
            {attachment.mimeType.startsWith('image/') ? (
              <img src={`data:${attachment.mimeType};base64,${attachment.base64}`} className="h-10 w-10 object-cover rounded-lg shrink-0" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                <FileText size={18} className="text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 font-medium truncate">{attachment.name}</p>
              <p className="font-mono text-[10px] text-slate-600 mt-0.5">{(attachment.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              onClick={() => setAttachment(null)}
              className="text-slate-600 hover:text-slate-400 transition-colors p-1 rounded-lg hover:bg-white/[0.05]"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3 bg-[#080e1c] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-indigo-500/40 transition-colors">
          <input ref={fileRef} type="file" className="hidden" onChange={onFile} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={isSelfConversation}
            className="text-slate-600 hover:text-slate-400 transition-colors disabled:opacity-30"
          >
            <Paperclip size={15} />
          </button>
          <input
            value={input}
            onChange={handleInput}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={isSelfConversation ? t('messages.selfConversation') : t('messages.messagePlaceholder')}
            disabled={isSelfConversation}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none disabled:opacity-40"
          />
          <button
            onClick={send}
            disabled={(!input.trim() && !attachment) || isSelfConversation}
            className={clsx(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0',
              (input.trim() || attachment) && !isSelfConversation
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/20'
                : 'bg-white/[0.05]',
            )}
          >
            <Send size={14} className={(input.trim() || attachment) && !isSelfConversation ? 'text-white' : 'text-slate-600'} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── PortalThread ───────────────────────────────────────────────────────── */
export function PortalThread({ thread, currentUserId, currentName }) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [localThread, setLocalThread] = useState(thread)
  const [typingUsers, setTypingUsers] = useState({})
  const [contactSeenAt, setContactSeenAt] = useState(null)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)
  const threadChannel = `portal-thread:${thread.id}`
  const typingChannel = `typing:${threadChannel}`
  const readChannel = `read:${threadChannel}`

  useEffect(() => {
    setLocalThread(thread)
  }, [thread])

  useEffect(() => {
    setTypingUsers({})
    setContactSeenAt(null)
  }, [thread.id])

  useEffect(() => {
    const unsubTyping = socketService.subscribe(typingChannel, ({ userId, name, isTyping }) => {
      if (userId === currentUserId) return
      setTypingUsers(prev => {
        const next = { ...prev }
        if (isTyping) next[userId] = name || localThread.professorName
        else delete next[userId]
        return next
      })
    })
    const unsubRead = socketService.subscribe(readChannel, ({ userId, seenAt }) => {
      if (userId === currentUserId) return
      setContactSeenAt(seenAt)
    })
    return () => {
      unsubTyping()
      unsubRead()
    }
  }, [currentUserId, localThread.professorName, readChannel, typingChannel])

  // Trimite read receipt doar când contact adaugă mesaje noi (nu când noi trimitem)
  const portalContactMsgCount = (localThread?.messages || []).filter(m => m.senderId !== currentUserId).length
  useEffect(() => {
    if (!portalContactMsgCount) return
    let alive = true
    socketService.publish(readChannel, { userId: currentUserId, seenAt: new Date().toISOString() })
      .catch(() => { if (!alive) return })
    return () => { alive = false }
  }, [currentUserId, portalContactMsgCount, readChannel])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localThread?.messages])

  function handleInput(e) {
    setInput(e.target.value)
    socketService.publish(typingChannel, { userId: currentUserId, name: currentName, isTyping: true }).catch(() => {})
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socketService.publish(typingChannel, { userId: currentUserId, name: currentName, isTyping: false }).catch(() => {})
    }, 2000)
  }

  async function send() {
    if (!input.trim()) return
    clearTimeout(typingTimer.current)
    socketService.publish(typingChannel, { userId: currentUserId, name: currentName, isTyping: false }).catch(() => {})
    const updated = await sendPortalMessage(localThread.id, {
      senderId: currentUserId,
      senderName: currentName,
      senderRole: 'student',
      text: input.trim(),
    })
    setLocalThread(updated)
    setInput('')
  }

  const myMessages = localThread.messages.filter(item => item.senderRole === 'student')
  const lastMyMessage = myMessages.length > 0 ? myMessages[myMessages.length - 1] : null
  const typingCount = Object.keys(typingUsers).length
  const typingNames = Object.values(typingUsers).join(', ')
  const isTyping = typingCount > 0

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#050810]">
      <ChatHeader
        avatar={
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {avatarLetters(localThread.professorName || 'AM')}
          </div>
        }
        name={localThread.professorName}
        subtitle={isTyping ? t('messages.typing') : localThread.subject}
        subtitleClass={isTyping ? 'text-amber-300 italic' : 'text-slate-500'}
        badge={t('messages.portalBadge')}
        connected={true}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {localThread.messages.length === 0 && (
          <EmptyChat text={t('messages.emptyPortal')} />
        )}
        {localThread.messages.map(msg => {
          const isMe = msg.senderRole === 'student'
          const isSeen = isMe && !!lastMyMessage && !!contactSeenAt && msg.id === lastMyMessage.id && new Date(contactSeenAt) >= new Date(msg.timestamp)
          return (
            <Bubble
              key={msg.id}
              isMe={isMe}
              content={msg.text}
              timestamp={msg.timestamp}
              isSeen={isSeen}
              showSeen={isMe}
            />
          )
        })}
        <div ref={bottomRef} />
      </div>

      {typingCount > 0 && <TypingDots names={typingNames} single={typingCount === 1} />}

      <MessageInputBar
        value={input}
        onChange={handleInput}
        onKeyDown={e => e.key === 'Enter' && send()}
        onSend={send}
        canSend={!!input.trim()}
        placeholder={t('messages.replyPlaceholder')}
      />
    </div>
  )
}

/* ─── Contact row ────────────────────────────────────────────────────────── */
export function ContactRow({ user, isActive, onClick }) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative w-full flex items-center gap-3 px-4 py-3 text-left transition-all group',
        isActive
          ? 'bg-white/[0.05]'
          : 'hover:bg-white/[0.03]',
      )}
    >
      {/* active accent bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-indigo-500 rounded-r-full" />
      )}
      <div className="relative shrink-0">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colorFor(user.userId)} flex items-center justify-center text-white text-xs font-bold`}>
          {avatarLetters(user.name)}
        </div>
        <span className="status-online absolute -bottom-0.5 -right-0.5 border-2 border-[#060a15]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-semibold truncate', isActive ? 'text-white' : 'text-slate-200 group-hover:text-white transition-colors')}>
          {user.name}
        </p>
        <p className="text-[11px] text-slate-500 truncate">{user.facultyName || t('messages.sameFaculty')}</p>
      </div>
    </button>
  )
}

/* ─── Channel row ────────────────────────────────────────────────────────── */
export function ChannelRow({ channel, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all group rounded-none',
        isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 bg-indigo-500 rounded-r-full" />
      )}
      <div className={clsx(
        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
        isActive ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/[0.04] border border-white/[0.06] group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20',
      )}>
        <Hash size={13} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={clsx('text-sm font-semibold truncate', isActive ? 'text-white' : 'text-slate-300 group-hover:text-white transition-colors')}>
          {channel.label}
        </p>
        <p className="text-[11px] text-slate-600 truncate">{channel.description}</p>
      </div>
    </button>
  )
}

/* ─── Portal row ─────────────────────────────────────────────────────────── */
export function PortalRow({ thread, isActive, onClick }) {
  const lastMsg = thread.messages?.at(-1)
  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative w-full flex items-center gap-3 px-4 py-3 text-left transition-all group',
        isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-amber-500 rounded-r-full" />
      )}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
        {avatarLetters(thread.professorName || 'AM')}
      </div>
      <div className="min-w-0 flex-1">
        <p className={clsx('text-sm font-semibold truncate', isActive ? 'text-white' : 'text-slate-200 group-hover:text-white transition-colors')}>
          {thread.professorName}
        </p>
        <p className="text-[11px] text-slate-600 truncate">{lastMsg?.text || thread.subject}</p>
      </div>
    </button>
  )
}
