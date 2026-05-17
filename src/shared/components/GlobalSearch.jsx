import { useState, useEffect, useRef } from 'react'
import { Search, Map, Calendar, BookOpen, Users, MessageSquare, Tag, Briefcase, MapPin, X, ArrowRight, GraduationCap } from 'lucide-react'
import { getProfessors, getTutors } from '../data/facultyCatalog'
import clsx from 'clsx'

const MODULES = [
  { id: 'dashboard',  label: 'Dashboard',            icon: Map,          mode: 'academic' },
  { id: 'navigator',  label: 'Campus Navigator',      icon: Map,          mode: 'academic' },
  { id: 'schedule',   label: 'Schedule Hub',          icon: Calendar,     mode: 'academic' },
  { id: 'thesis',     label: 'Thesis Finder',         icon: BookOpen,     mode: 'academic' },
  { id: 'tutoring',   label: 'Peer Tutoring',         icon: Users,        mode: 'academic' },
  { id: 'messages',   label: 'Mesaje',                icon: MessageSquare,mode: 'academic' },
  { id: 'discounts',  label: 'Discounts & Benefits',  icon: Tag,          mode: 'life' },
  { id: 'career',     label: 'Career & Internships',  icon: Briefcase,    mode: 'life' },
  { id: 'citylife',   label: 'Viața în Oraș',         icon: MapPin,       mode: 'life' },
]

export default function GlobalSearch({ profile, onNavigate, onClose }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const professors = getProfessors(profile)
  const tutors = getTutors(profile)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => { setActive(0) }, [query])

  const q = query.toLowerCase().trim()

  const results = q.length < 1 ? [] : [
    ...MODULES
      .filter(m => m.label.toLowerCase().includes(q))
      .map(m => ({ type: 'module', label: m.label, sub: m.mode === 'academic' ? 'Academic' : 'Student Life', icon: m.icon, action: () => onNavigate(m.id, m.mode) })),
    ...professors
      .filter(p => p.name.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)))
      .slice(0, 4)
      .map(p => ({ type: 'professor', label: p.name, sub: p.domain, icon: GraduationCap, action: () => onNavigate('thesis', 'academic') })),
    ...tutors
      .filter(t => t.name.toLowerCase().includes(q) || t.subjects.some(s => s.toLowerCase().includes(q)))
      .slice(0, 3)
      .map(t => ({ type: 'tutor', label: t.name, sub: t.subjects.join(', '), icon: Users, action: () => onNavigate('tutoring', 'academic') })),
  ]

  const showDefault = q.length < 1

  function handleKey(e) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[active]) { results[active].action(); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl animate-slide-up">
        <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.03]">
          <div className="rounded-[calc(1rem-1px)] bg-[#0c1120] border border-white/[0.05] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.9)] overflow-hidden">

            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <Search size={16} className="text-slate-500 shrink-0" strokeWidth={1.75} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Caută module, profesori, tutori..."
                className="flex-1 bg-transparent text-[14px] text-slate-200 placeholder-slate-600 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-slate-600 hover:text-slate-400 transition-colors">
                  <X size={14} strokeWidth={1.75} />
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-slate-700 border border-white/[0.07] rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {showDefault ? (
                <div className="p-4">
                  <p className="text-[10px] text-slate-600 uppercase font-semibold tracking-wider mb-2">Module rapide</p>
                  <div className="grid grid-cols-3 gap-2">
                    {MODULES.slice(0, 6).map(m => {
                      const Icon = m.icon
                      return (
                        <button
                          key={m.id}
                          onClick={() => { onNavigate(m.id, m.mode); onClose() }}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-center"
                        >
                          <Icon size={16} className="text-slate-400" strokeWidth={1.75} />
                          <span className="text-[11px] text-slate-400 font-medium leading-tight">{m.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-slate-600 text-sm">Niciun rezultat pentru „{query}"</p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((r, i) => {
                    const Icon = r.icon
                    return (
                      <button
                        key={i}
                        onClick={() => { r.action(); onClose() }}
                        onMouseEnter={() => setActive(i)}
                        className={clsx(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          active === i ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                          <Icon size={14} className="text-slate-400" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-200 truncate">{r.label}</p>
                          <p className="text-[11px] text-slate-600 truncate">{r.sub}</p>
                        </div>
                        <ArrowRight size={13} className="text-slate-700 shrink-0" strokeWidth={1.75} />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/[0.04] flex items-center gap-4">
              <span className="text-[10px] text-slate-700 flex items-center gap-1"><kbd className="border border-white/[0.07] rounded px-1">↑↓</kbd> navighează</span>
              <span className="text-[10px] text-slate-700 flex items-center gap-1"><kbd className="border border-white/[0.07] rounded px-1">↵</kbd> deschide</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
