import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Send, Bot, Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { askCityAssistant } from '../../shared/services/ai.service'
import clsx from 'clsx'

const SUGGESTIONS = [
  'Ce acte îmi trebuie la secretariat?',
  'Cum obțin abonament CTP student?',
  'Unde pot deschide un cont bancar?',
  'Ce cămine sunt disponibile?',
]

export default function CityChat({ profile, onBack }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Salut! Sunt asistentul tău pentru adaptare în ${profile?.university?.city || 'oraș'}. Te pot ajuta cu acte, transport, cazare, bănci și orice altceva legat de viața de student. Ce vrei să știi?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const question = (text || input).trim()
    if (!question || loading) return

    const history = messages
      .filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
      .map(m => ({ role: m.role, content: m.content }))

    setMessages(prev => [...prev, { role: 'user', content: question }])
    setInput('')
    setLoading(true)

    const result = await askCityAssistant(question, profile, history)

    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: result.answer, suggestedNext: result.suggestedNext },
    ])
    setLoading(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 gap-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 overflow-hidden shrink-0"
      >
        <div className="dot-grid absolute inset-0 opacity-20 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 5% 50%, #6366f140, transparent)' }}
        />
        <div className="relative flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.09] transition-all shrink-0"
          >
            <ChevronLeft size={16} className="text-slate-400" />
          </button>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: '#6366f120', border: '1.5px solid #6366f145' }}>
            <Sparkles size={16} style={{ color: '#818cf8' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white">Asistent AI Oraș</h2>
            <p className="text-xs text-slate-500">
              {profile?.university?.city || 'Oraș'} · {profile?.university?.shortName || 'Universitate'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-400">Online</span>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className={clsx('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#6366f118', border: '1px solid #6366f130' }}>
                  <Bot size={13} style={{ color: '#818cf8' }} />
                </div>
              )}
              <div className={clsx('max-w-[80%] space-y-2')}>
                <div
                  className={clsx(
                    'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-indigo-600/25 border border-indigo-500/30 text-slate-200 rounded-tr-sm'
                      : 'bg-white/[0.04] border border-white/[0.07] text-slate-300 rounded-tl-sm',
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === 'assistant' && msg.suggestedNext?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedNext.map((s, j) => (
                      <button
                        key={j}
                        onClick={() => send(s)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5 justify-start"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: '#6366f118', border: '1px solid #6366f130' }}>
              <Bot size={13} style={{ color: '#818cf8' }} />
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.07]">
              <Loader2 size={14} className="animate-spin text-indigo-400" />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only at start) */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-1.5 shrink-0"
        >
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all"
            >
              {s}
            </button>
          ))}
        </motion.div>
      )}

      {/* Input */}
      <div className="flex gap-2 shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Întreabă ceva despre viața de student..."
          className="flex-1 bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-indigo-600/80 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed border border-indigo-500/40"
        >
          <Send size={15} className="text-white" />
        </button>
      </div>
    </div>
  )
}
