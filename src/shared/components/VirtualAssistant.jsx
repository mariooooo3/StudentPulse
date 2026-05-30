import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Bot,
  Check,
  ChevronRight,
  Compass,
  Copy,
  CornerDownLeft,
  HelpCircle,
  Maximize2,
  MessageSquare,
  Minus,
  Send,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { streamVirtualAssistant, localVirtualAssistantAnswer, defaultSuggestions } from '../services/virtualAssistant.service'

const VIEW_LABELS = {
  dashboard:  'Dashboard',
  navigator:  'Campus Navigator',
  schedule:   'Schedule Hub',
  thesis:     'Thesis Finder',
  tutoring:   'Peer Tutoring',
  messages:   'Messages',
  discounts:  'Student Life',
  career:     'Career',
  community:  'Community',
  citylife:   'City Adaptation',
  challenges: 'Challenges',
  professor:  'Professor Portal',
}

const NAVIGATION_ACTIONS = [
  { match: ['campus navigator', 'harta', 'map', 'navigator'], view: 'navigator', mode: 'academic' },
  { match: ['schedule', 'orar'], view: 'schedule', mode: 'academic' },
  { match: ['thesis', 'licenta'], view: 'thesis', mode: 'academic' },
  { match: ['tutoring', 'tutor'], view: 'tutoring', mode: 'academic' },
  { match: ['messages', 'mesaje'], view: 'messages', mode: 'academic' },
  { match: ['academic', 'modul academic', 'sectiunea academica', 'dashboard', 'acasa', 'home'], view: 'dashboard', mode: 'academic' },
  { match: ['city', 'oras', 'adaptare', 'adaptez', 'city adaptation'], view: 'citylife', mode: 'life' },
  { match: ['cariera', 'career', 'job', 'internship', 'cv', 'angajare'], view: 'career', mode: 'life' },
  { match: ['comunitate', 'community', 'grupuri', 'grup', 'activitati'], view: 'community', mode: 'life' },
  { match: ['evenimente', 'events', 'calendar', 'event'], view: 'events', mode: 'life' },
  { match: ['wellness', 'sanatate', 'pomodoro', 'focus', 'meditatie', 'sport'], view: 'wellness', mode: 'life' },
  { match: ['tools', 'unelte', 'buget', 'budget', 'carpool', 'masina', 'carti', 'colegi', 'roommate'], view: 'tools', mode: 'life' },
  { match: ['pulse', 'campus pulse', 'activitate campus', 'check-in'], view: 'pulse', mode: 'life' },
  { match: ['provocari', 'challenges', 'provocare', 'task', 'taskuri', 'misiuni', 'quest', 'daily challenge', 'puncte'], view: 'challenges', mode: 'life' },
  { match: ['student life', 'viata studenteasca', 'viata de student', 'discount', 'reduceri', 'oferte', 'beneficii'], view: 'discounts', mode: 'life' },
  { match: ['viata', 'modul viata', 'modul life', 'sectiunea life'], view: 'discounts', mode: 'life' },
]

const SLASH_COMMANDS_STUDENT = [
  { cmd: '/harta',      label: 'Hartă campus',       labelKey: 'assistant.slashLabels.campusMap',        icon: '🗺️', view: 'navigator',  mode: 'academic' },
  { cmd: '/orar',       label: 'Orar',               labelKey: 'assistant.slashLabels.schedule',          icon: '📅', view: 'schedule',   mode: 'academic' },
  { cmd: '/licenta',    label: 'Thesis Finder',      icon: '🎓', view: 'thesis',     mode: 'academic' },
  { cmd: '/tutoring',   label: 'Peer Tutoring',      icon: '🧑‍🏫', view: 'tutoring',  mode: 'academic' },
  { cmd: '/mesaje',     label: 'Mesaje',             labelKey: 'assistant.slashLabels.messages',          icon: '💬', view: 'messages',   mode: 'academic' },
  { cmd: '/dashboard',  label: 'Dashboard',          icon: '🏠', view: 'dashboard',  mode: 'academic' },
  { cmd: '/viata',      label: 'Student Life',       icon: '✨', view: 'discounts',  mode: 'life' },
  { cmd: '/cariera',    label: 'Carieră & CV',       labelKey: 'assistant.slashLabels.careerCv',          icon: '💼', view: 'career',     mode: 'life' },
  { cmd: '/wellness',   label: 'Wellness & Focus',   icon: '🌿', view: 'wellness',   mode: 'life' },
  { cmd: '/oras',       label: 'City Adaptation',    icon: '🏙️', view: 'citylife',   mode: 'life' },
  { cmd: '/comunitate', label: 'Comunitate',         labelKey: 'assistant.slashLabels.community',         icon: '👥', view: 'community',  mode: 'life' },
  { cmd: '/evenimente', label: 'Evenimente',         labelKey: 'assistant.slashLabels.events',            icon: '📆', view: 'events',     mode: 'life' },
  { cmd: '/tools',      label: 'Tools & Buget',      labelKey: 'assistant.slashLabels.toolsBudget',       icon: '🛠️', view: 'tools',      mode: 'life' },
]

const SLASH_COMMANDS_PROFESSOR = [
  { cmd: '/licente',    label: 'Cereri licență',     labelKey: 'assistant.slashLabels.thesisRequests',    icon: '🎓', view: 'thesis',     mode: 'professor' },
  { cmd: '/recuperari', label: 'Recuperări',         labelKey: 'assistant.slashLabels.recovery',          icon: '📋', view: 'recovery',   mode: 'professor' },
  { cmd: '/mesaje',     label: 'Mesaje studenți',    labelKey: 'assistant.slashLabels.studentMessages',   icon: '💬', view: 'messages',   mode: 'professor' },
  { cmd: '/profil',     label: 'Profil academic',    labelKey: 'assistant.slashLabels.academicProfile',   icon: '👤', view: 'profile',    mode: 'professor' },
  { cmd: '/dashboard',  label: 'Dashboard',          icon: '🏠', view: 'dashboard',  mode: 'professor' },
]

function getSlashCommands(role) {
  return role === 'professor' ? SLASH_COMMANDS_PROFESSOR : SLASH_COMMANDS_STUDENT
}

const PROFESSOR_NAVIGATION_ACTIONS = [
  { match: ['licenta', 'licente', 'thesis', 'cereri licenta', 'cerere licenta', 'studenti acceptati'], view: 'thesis', mode: 'professor' },
  { match: ['recuperari', 'recuperare', 'recovery'], view: 'recovery', mode: 'professor' },
  { match: ['mesaje', 'messages', 'chat', 'conversatii', 'student'], view: 'messages', mode: 'professor' },
  { match: ['profil', 'profile', 'academic profile', 'date publice'], view: 'profile', mode: 'professor' },
  { match: ['dashboard', 'acasa', 'home', 'overview'], view: 'dashboard', mode: 'professor' },
]

function findNavigationAction(label, role) {
  const normalized = String(label || '').toLowerCase()
  const actions = role === 'professor' ? PROFESSOR_NAVIGATION_ACTIONS : NAVIGATION_ACTIONS
  return actions.find(action => action.match.some(token => normalized.includes(token)))
}

function assistantBrand(role, t) {
  if (role === 'professor') {
    return {
      title: 'ProfessorPulse Assistant',
      subtitle: t('assistant.brandProfessorSubtitle'),
      badge: t('assistant.brandProfessorBadge'),
      footer: t('assistant.brandProfessorFooter'),
    }
  }
  return {
    title: 'StudentPulse Assistant',
    subtitle: t('assistant.brandStudentSubtitle'),
    badge: t('assistant.brandStudentBadge'),
    footer: t('assistant.brandStudentFooter'),
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
        <Activity size={18} strokeWidth={2} className="text-white" />
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

function CodeBlock({ lang, code }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="my-2 overflow-hidden rounded-lg border border-white/10 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3 py-1.5">
        <span className="font-mono text-[10px] text-slate-400">{lang || 'code'}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
          <span>{copied ? t('assistant.copied') : t('assistant.copy')}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
      return <code key={i} className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11px] text-violet-300">{part.slice(1, -1)}</code>
    return part
  })
}

function renderMessageContent(text) {
  const segments = String(text || '').split(/(```[\s\S]*?```)/g)
  return segments.map((seg, i) => {
    const m = seg.match(/^```(\w*)\n?([\s\S]*?)```$/)
    if (m) return <CodeBlock key={i} lang={m[1]} code={m[2].trimEnd()} />
    // plain text: split on newlines and render inline formatting
    return (
      <span key={i}>
        {seg.split('\n').map((line, j, arr) => (
          <span key={j}>
            {renderInline(line)}
            {j < arr.length - 1 && <br />}
          </span>
        ))}
      </span>
    )
  })
}

function Message({ item }) {
  const isUser = item.role === 'user'
  const now = new Date()
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  return (
    <div className={clsx('flex gap-2.5', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-violet-600/30 ring-1 ring-inset ring-indigo-400/20">
          <Activity size={12} strokeWidth={2} className="text-indigo-300" />
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
          {renderMessageContent(item.text)}
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
        <Activity size={12} strokeWidth={2} className="text-indigo-300" />
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
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [suggestions, setSuggestions] = useState(() => defaultSuggestions({ role: session?.role }))
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: session?.role === 'professor' ? t('assistant.initialProfessor') : t('assistant.initialStudent'),
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
    currentLabel: currentLabel || t('nav.' + currentView, { defaultValue: VIEW_LABELS[currentView] || currentView }),
  }
  const brand = assistantBrand(context.role, t)

  useEffect(() => {
    setSuggestions(defaultSuggestions(context))
    setMessages([{ role: 'assistant', text: context.role === 'professor' ? t('assistant.initialProfessor') : t('assistant.initialStudent') }])
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

    // ── Slash commands: navigate instantly, no AI call ──────────────────────
    if (text.startsWith('/')) {
      const cmds = getSlashCommands(context.role)
      const matched = cmds.find(c => text.toLowerCase() === c.cmd || text.toLowerCase().startsWith(c.cmd + ' '))
      if (matched && onNavigate) {
        setMessages(prev => [
          ...prev,
          { role: 'user', text },
          { role: 'assistant', text: t('assistant.navigatedTo', { icon: matched.icon, label: matched.labelKey ? t(matched.labelKey) : matched.label }) },
        ])
        setInput('')
        onNavigate(matched.view, matched.mode)
        return
      }
    }

    const navAction = findNavigationAction(text, context.role)

    const nextMessages = [...messages, { role: 'user', text }]
    setMessages(nextMessages)
    setInput('')

    if (navAction && onNavigate) {
      onNavigate(navAction.view, navAction.mode)
      const label = t('nav.' + navAction.view, { defaultValue: VIEW_LABELS[navAction.view] || navAction.view })
      const confirmMsg = t('assistant.arrivedAt', { label })
      setMessages(prev => [...prev, { role: 'assistant', text: confirmMsg }])
      setSuggestions(defaultSuggestions(context))
      if (!open) setUnread(value => value + 1)
      return
    }

    setLoading(true)
    setMessages(prev => [...prev, { role: 'assistant', text: '', streaming: true }])

    try {
      for await (const event of streamVirtualAssistant({
        message: text,
        context,
        history: nextMessages.slice(-8).map(item => ({
          role: item.role === 'assistant' ? 'assistant' : 'user',
          content: item.text,
        })),
      })) {
        if (event.t === 'c') {
          setLoading(false)
          setMessages(prev => {
            const msgs = [...prev]
            const last = msgs[msgs.length - 1]
            if (last?.streaming) msgs[msgs.length - 1] = { ...last, text: last.text + event.v }
            return msgs
          })
        } else if (event.t === 'd') {
          setMessages(prev => {
            const msgs = [...prev]
            const last = msgs[msgs.length - 1]
            if (last?.streaming) msgs[msgs.length - 1] = { ...last, streaming: false }
            return msgs
          })
          setSuggestions(event.meta?.suggestions?.length ? event.meta.suggestions : defaultSuggestions(context))
          setLoading(false)
          if (!open) setUnread(value => value + 1)
        } else if (event.t === 'e') {
          setMessages(prev => {
            const msgs = [...prev]
            const last = msgs[msgs.length - 1]
            if (last?.streaming) msgs[msgs.length - 1] = { ...last, streaming: false, text: event.msg || localVirtualAssistantAnswer(text, context).answer }
            return msgs
          })
          setSuggestions(defaultSuggestions(context))
          setLoading(false)
          if (!open) setUnread(value => value + 1)
        }
      }
    } catch {
      const fallback = localVirtualAssistantAnswer(text, context)
      setMessages(prev => {
        const msgs = [...prev]
        const last = msgs[msgs.length - 1]
        if (last?.streaming) msgs[msgs.length - 1] = { ...last, streaming: false, text: fallback.answer }
        return msgs
      })
      setSuggestions(fallback.suggestions || defaultSuggestions(context))
      setLoading(false)
      if (!open) setUnread(value => value + 1)
    }
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
                  <Activity size={17} strokeWidth={2} className="text-white" />
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
                    {context.currentLabel} · {context.role === 'professor' ? t('assistant.roleProfessor') : t('assistant.roleStudent')}
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
                    setMessages([{ role: 'assistant', text: session?.role === 'professor' ? t('assistant.initialProfessor') : t('assistant.initialStudent') }])
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

              {/* Slash command picker */}
              {input.startsWith('/') && (() => {
                const cmds = getSlashCommands(context.role)
                const filtered = cmds.filter(c => c.cmd.startsWith(input.toLowerCase().split(' ')[0]))
                if (!filtered.length) return null
                return (
                  <div className="mb-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b1221] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
                    <div className="border-b border-white/[0.06] px-3 py-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">{t('assistant.navLabel')}</span>
                    </div>
                    {filtered.map(c => (
                      <button
                        key={c.cmd}
                        type="button"
                        onMouseDown={e => { e.preventDefault(); sendMessage(c.cmd) }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/[0.05] active:bg-white/[0.08]"
                      >
                        <span className="text-base leading-none">{c.icon}</span>
                        <span className="font-mono text-[12px] text-violet-400">{c.cmd}</span>
                        <span className="text-[12px] text-slate-400">{c.labelKey ? t(c.labelKey) : c.label}</span>
                      </button>
                    ))}
                  </div>
                )
              })()}

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
                        ? t('assistant.placeholderProfessor')
                        : t('assistant.placeholderStudent')
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
