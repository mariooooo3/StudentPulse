import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  ChevronRight,
  Compass,
  CornerDownLeft,
  HelpCircle,
  Maximize2,
  MessageSquare,
  Minus,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { askVirtualAssistant, defaultSuggestions } from '../services/virtualAssistant.service'

const VIEW_LABELS = {
  dashboard: 'Dashboard',
  navigator: 'Campus Navigator',
  schedule: 'Schedule Hub',
  thesis: 'Thesis Finder',
  tutoring: 'Peer Tutoring',
  messages: 'Messages',
  discounts: 'Student Life',
  career: 'Career',
  community: 'Community',
  citylife: 'City Adaptation',
  professor: 'Professor Portal',
}

const NAVIGATION_ACTIONS = [
  { match: ['campus navigator', 'harta', 'map', 'navigator'], view: 'navigator', mode: 'academic' },
  { match: ['schedule', 'orar'], view: 'schedule', mode: 'academic' },
  { match: ['thesis', 'licenta'], view: 'thesis', mode: 'academic' },
  { match: ['tutoring', 'tutor'], view: 'tutoring', mode: 'academic' },
  { match: ['messages', 'mesaje'], view: 'messages', mode: 'academic' },
  { match: ['city', 'oras'], view: 'citylife', mode: 'life' },
  { match: ['student life', 'discount'], view: 'discounts', mode: 'life' },
]

const PROFESSOR_NAVIGATION_ACTIONS = [
  { match: ['licenta', 'licente', 'thesis', 'cereri licenta', 'cerere licenta', 'studenti acceptati'], view: 'thesis', mode: 'professor' },
  { match: ['recuperari', 'recuperare', 'recovery'], view: 'recovery', mode: 'professor' },
  { match: ['mesaje', 'messages', 'chat', 'conversatii', 'student'], view: 'messages', mode: 'professor' },
  { match: ['profil', 'profile', 'academic profile', 'date publice'], view: 'profile', mode: 'professor' },
  { match: ['dashboard', 'acasa', 'home', 'overview'], view: 'dashboard', mode: 'professor' },
]

function initialAssistantMessage(role) {
  if (role === 'professor') {
    return 'Salut, sunt asistentul pentru portalul profesorului. Te pot ajuta cu cereri de licenta, recuperari, mesaje, notificari live si profilul academic.'
  }
  return 'Salut, sunt asistentul StudentCompass. Te pot ajuta cu modulele studentului, mesaje, orar, cereri de licenta, navigare in campus si intrebari de cont.'
}

function findNavigationAction(label, role) {
  const normalized = String(label || '').toLowerCase()
  const actions = role === 'professor' ? PROFESSOR_NAVIGATION_ACTIONS : NAVIGATION_ACTIONS
  return actions.find(action => action.match.some(token => normalized.includes(token)))
}

function assistantBrand(role) {
  if (role === 'professor') {
    return {
      title: 'ProfessorCompass Assistant',
      subtitle: 'Cereri, mesaje, profil',
      badge: 'Professor help',
      footer: 'Professor-aware help',
    }
  }
  return {
    title: 'StudentCompass Assistant',
    subtitle: 'Account, modules, quick help',
    badge: 'Live help',
    footer: 'Context-aware help',
  }
}

function AssistantBubble({ onClick, unread, brand }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 18, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className="fixed bottom-5 right-5 z-[90] flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-[#0b1020]/95 px-3.5 py-3 text-left shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_0_1px_rgba(99,102,241,0.08)] backdrop-blur-xl max-w-[calc(100vw-2.5rem)]"
      aria-label="Open virtual assistant"
    >
      {/* Icon with gradient and glow ring */}
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_20px_rgba(99,102,241,0.45)] ring-1 ring-indigo-400/30">
        <Sparkles size={18} strokeWidth={1.75} className="text-white" />
        {/* Online dot */}
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#0b1020] bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
        {/* Pulse animation */}
        <span className="absolute inset-0 animate-ping rounded-xl bg-indigo-500/20 [animation-duration:2.5s]" />
      </span>

      <span className="hidden min-w-0 sm:block">
        <span className="block text-[12px] font-bold text-white">{brand.title}</span>
        <span className="block text-[11px] text-slate-500">{brand.subtitle}</span>
      </span>

      {unread > 0 && (
        <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-1.5 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]">
          {unread}
        </span>
      )}
    </motion.button>
  )
}

function Message({ item }) {
  const isUser = item.role === 'user'
  const now = new Date()
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  return (
    <div className={clsx('flex gap-2.5', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-violet-600/30 ring-1 ring-inset ring-indigo-400/20">
          <Sparkles size={12} strokeWidth={1.75} className="text-indigo-300" />
        </div>
      )}
      <div className="flex max-w-[82%] flex-col gap-1">
        <div
          className={clsx(
            'rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
            isUser
              ? 'rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-medium shadow-[0_4px_16px_rgba(99,102,241,0.35)]'
              : 'rounded-bl-sm border border-white/[0.06] bg-white/[0.06] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
          )}
        >
          {item.text}
        </div>
        <span
          className={clsx(
            'font-mono text-[10px] text-slate-700',
            isUser ? 'text-right' : 'text-left',
          )}
        >
          {timestamp}
        </span>
      </div>
    </div>
  )
}

function SuggestionButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className="chip inline-flex shrink-0 max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-left text-[11px] font-medium text-slate-400 transition-all hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-indigo-200 active:scale-[0.97]"
    >
      <span className="truncate">{label}</span>
      <ChevronRight size={11} strokeWidth={2} className="shrink-0 opacity-60" />
    </button>
  )
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-600/20 ring-1 ring-inset ring-indigo-400/15">
        <Sparkles size={12} strokeWidth={1.75} className="text-indigo-300" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-white/[0.06] bg-white/[0.06] px-4 py-3">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-indigo-400/70"
            style={{
              animation: 'bounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function VirtualAssistant({
  session,
  profile,
  platformMode = 'academic',
  currentView = 'dashboard',
  currentLabel,
  onNavigate,
}) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [suggestions, setSuggestions] = useState(() => defaultSuggestions({ role: session?.role }))
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: initialAssistantMessage(session?.role),
    },
  ])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const context = {
    role: session?.role || 'student',
    email: session?.email || '',
    university: session?.university?.shortName || session?.university?.name || '',
    faculty: profile?.faculty || session?.detectedFaculty?.name || profile?.facultyName || '',
    detectedFaculty: session?.detectedFaculty?.name || '',
    year: profile?.year || '',
    platformMode,
    currentView,
    currentLabel: currentLabel || VIEW_LABELS[currentView] || currentView,
  }
  const brand = assistantBrand(context.role)

  useEffect(() => {
    setSuggestions(defaultSuggestions(context))
    setMessages(prev => {
      if (prev.length > 1) return prev
      return [{ role: 'assistant', text: initialAssistantMessage(context.role) }]
    })
  }, [context.role])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  async function sendMessage(raw) {
    const text = String(raw ?? input).trim()
    if (!text || loading) return

    const navAction = findNavigationAction(text, context.role)
    if (navAction && onNavigate) {
      onNavigate(navAction.view, navAction.mode)
    }

    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    const response = await askVirtualAssistant({
      message: text,
      context,
      history: nextMessages.slice(-8).map(item => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: item.text,
      })),
    })

    setMessages(prev => [...prev, { role: 'assistant', text: response.answer }])
    setSuggestions(response.suggestions?.length ? response.suggestions : defaultSuggestions(context))
    setLoading(false)
    if (!open) setUnread(value => value + 1)
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage()
  }

  if (!open) {
    return <AssistantBubble onClick={() => setOpen(true)} unread={unread} brand={brand} />
  }

  return (
    <AnimatePresence>
      <motion.div
        key="virtual-assistant"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        className="fixed bottom-5 right-5 z-[90] w-[min(380px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.04)]"
      >
        {/* Bezel outer */}
        <div className="rounded-2xl bg-gradient-to-b from-white/[0.09] to-white/[0.02] p-[1px]">
          {/* Bezel inner */}
          <div className="rounded-[calc(1rem-1px)] bg-[#080e1c]/98 backdrop-blur-2xl overflow-hidden">

            {/* Gradient top strip */}
            <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />

            {/* Header */}
            <div className="border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_18px_rgba(99,102,241,0.4)] ring-1 ring-inset ring-white/10">
                  <Sparkles size={17} strokeWidth={1.75} className="text-white" />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#080e1c] bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.7)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-bold text-white">{brand.title}</p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      {brand.badge}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-slate-600">
                    {context.currentLabel} · {context.role === 'professor' ? 'Professor' : 'Student'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-white/[0.07] hover:text-slate-300"
                  aria-label="Minimize assistant"
                >
                  <Minus size={14} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessages([{ role: 'assistant', text: initialAssistantMessage(session?.role) }])
                    setSuggestions(defaultSuggestions(context))
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-white/[0.07] hover:text-slate-300"
                  aria-label="Reset assistant"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="max-h-[min(52dvh,440px)] min-h-[300px] overflow-y-auto px-4 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.06)_transparent]">
              <div className="space-y-4">
                {messages.map((item, index) => (
                  <Message key={`${item.role}-${index}-${item.text.slice(0, 12)}`} item={item} />
                ))}
                {loading && <LoadingDots />}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] px-4 py-3">
              {/* Quick suggestions */}
              <div className="mb-3 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                {suggestions.slice(0, 3).map(label => (
                  <SuggestionButton key={label} label={label} onClick={sendMessage} />
                ))}
              </div>

              {/* Input row */}
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="input-base flex min-h-11 flex-1 items-center gap-2 px-3 py-2 focus-within:border-indigo-400/40 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]">
                  <HelpCircle size={14} strokeWidth={1.75} className="shrink-0 text-slate-700" />
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={event => setInput(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        sendMessage()
                      }
                    }}
                    rows={1}
                    placeholder={
                      context.role === 'professor'
                        ? 'Intreaba despre cereri, mesaje sau profil...'
                        : 'Intreaba despre cont, module sau viata de student...'
                    }
                    className="max-h-24 min-h-7 flex-1 resize-none bg-transparent text-[13px] leading-6 text-slate-200 outline-none placeholder:text-slate-700"
                  />
                  <CornerDownLeft size={12} strokeWidth={1.75} className="hidden shrink-0 text-slate-800 sm:block" />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_4px_20px_rgba(99,102,241,0.5)] hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/[0.05] disabled:shadow-none disabled:text-slate-700 active:scale-[0.96]"
                  aria-label="Send message"
                >
                  <Send size={15} strokeWidth={2} />
                </button>
              </form>

              {/* Footer meta */}
              <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare size={10} strokeWidth={1.75} />
                  {brand.footer}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  {context.role === 'professor' ? (
                    <Maximize2 size={10} strokeWidth={1.75} />
                  ) : (
                    <Compass size={10} strokeWidth={1.75} />
                  )}
                  {context.currentLabel}
                </span>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
