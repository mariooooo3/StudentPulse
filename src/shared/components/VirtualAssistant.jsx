import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  ChevronRight,
  Compass,
  CornerDownLeft,
  HelpCircle,
  Loader2,
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
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="group fixed bottom-5 right-5 z-[90] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-2xl border border-white/[0.09] bg-[#0b1020]/94 px-3.5 py-3 text-left shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      aria-label="Open virtual assistant"
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <Bot size={20} strokeWidth={1.75} />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#0b1020] bg-emerald-400" />
      </span>
      <span className="hidden sm:block min-w-0">
        <span className="block text-[12px] font-bold text-white">{brand.title}</span>
        <span className="block text-[11px] text-slate-500">{brand.subtitle}</span>
      </span>
      {unread > 0 && (
        <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1.5 text-[10px] font-bold text-slate-950">
          {unread}
        </span>
      )}
    </motion.button>
  )
}

function Message({ item }) {
  const isUser = item.role === 'user'
  return (
    <div className={clsx('flex gap-2.5', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
          <Bot size={14} strokeWidth={1.75} />
        </div>
      )}
      <div
        className={clsx(
          'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
          isUser
            ? 'rounded-br-md bg-cyan-500 text-slate-950 font-medium'
            : 'rounded-bl-md border border-white/[0.07] bg-white/[0.045] text-slate-300',
        )}
      >
        {item.text}
      </div>
    </div>
  )
}

function SuggestionButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-left text-[11px] font-semibold text-slate-400 transition-colors hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-100 active:scale-[0.98]"
    >
      <span className="truncate">{label}</span>
      <ChevronRight size={12} strokeWidth={1.75} className="shrink-0" />
    </button>
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
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="fixed bottom-5 right-5 z-[90] w-[min(420px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a0f1e]/96 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        <div className="border-b border-white/[0.06] bg-white/[0.035] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
              <Bot size={19} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[13px] font-bold text-white">{brand.title}</p>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <Sparkles size={10} strokeWidth={1.75} />
                  {brand.badge}
                </span>
              </div>
              <p className="truncate text-[11px] text-slate-600">
                {context.currentLabel} - {context.role === 'professor' ? 'Professor' : 'Student'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
              aria-label="Minimize assistant"
            >
              <Minus size={15} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => {
                setMessages([{ role: 'assistant', text: initialAssistantMessage(session?.role) }])
                setSuggestions(defaultSuggestions(context))
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
              aria-label="Reset assistant"
            >
              <X size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="max-h-[min(54dvh,470px)] min-h-[320px] overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {messages.map((item, index) => (
              <Message key={`${item.role}-${index}-${item.text.slice(0, 12)}`} item={item} />
            ))}
            {loading && (
              <div className="flex items-center gap-2.5 text-[12px] text-slate-500">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                  <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
                </div>
                Thinking through the app context...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-white/[0.06] px-4 py-3">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {suggestions.slice(0, 3).map(label => (
              <SuggestionButton key={label} label={label} onClick={sendMessage} />
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 focus-within:border-cyan-400/35">
              <HelpCircle size={15} strokeWidth={1.75} className="shrink-0 text-slate-600" />
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
                placeholder={context.role === 'professor' ? 'Intreaba despre cereri, mesaje sau profil...' : 'Intreaba despre cont, module sau viata de student...'}
                className="max-h-24 min-h-7 flex-1 resize-none bg-transparent text-[13px] leading-6 text-slate-200 outline-none placeholder:text-slate-700"
              />
              <CornerDownLeft size={13} strokeWidth={1.75} className="hidden shrink-0 text-slate-700 sm:block" />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-slate-700 active:scale-[0.97]"
              aria-label="Send message"
            >
              <Send size={16} strokeWidth={1.9} />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare size={11} strokeWidth={1.75} />
              {brand.footer}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {context.role === 'professor' ? <Maximize2 size={11} strokeWidth={1.75} /> : <Compass size={11} strokeWidth={1.75} />}
              {context.currentLabel}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
