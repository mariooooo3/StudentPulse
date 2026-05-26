import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Map,
  Calendar,
  BookOpen,
  Users,
  MessageSquare,
  Tag,
  Briefcase,
  MapPin,
  Trophy,
  X,
  ArrowRight,
  GraduationCap,
  Radio,
  Sparkles,
  Clock,
} from 'lucide-react'
import { getProfessors, getTutors } from '../data/facultyCatalog'
import clsx from 'clsx'

const MODULES = [
  { id: 'dashboard',  icon: Map,           mode: 'academic' },
  { id: 'navigator',  icon: Map,           mode: 'academic' },
  { id: 'schedule',   icon: Calendar,      mode: 'academic' },
  { id: 'thesis',     icon: BookOpen,      mode: 'academic' },
  { id: 'tutoring',   icon: Users,         mode: 'academic' },
  { id: 'messages',   icon: MessageSquare, mode: 'academic' },
  { id: 'pulse',      icon: Radio,         mode: 'life' },
  { id: 'discounts',  icon: Tag,           mode: 'life' },
  { id: 'career',     icon: Briefcase,     mode: 'life' },
  { id: 'citylife',   icon: MapPin,        mode: 'life' },
  { id: 'challenges', icon: Trophy,        mode: 'life' },
]

const RECENT_SEARCHES_KEY = 'sc_recent_searches'
const MAX_RECENT = 5

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]') } catch { return [] }
}
function saveRecent(query) {
  if (!query.trim()) return
  const prev = getRecent()
  const next = [query, ...prev.filter(q => q !== query)].slice(0, MAX_RECENT)
  try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)) } catch {}
}

function ResultRow({ result, isActive, onMouseEnter, onClick }) {
  const Icon = result.icon
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={clsx(
        'group relative w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all',
        isActive
          ? 'bg-indigo-500/10'
          : 'hover:bg-white/[0.03]',
      )}
    >
      {/* Active left accent */}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-indigo-400" />
      )}
      <div
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all',
          isActive
            ? 'border-indigo-400/25 bg-indigo-500/15 text-indigo-300'
            : 'border-white/[0.06] bg-white/[0.04] text-slate-500 group-hover:border-white/[0.09] group-hover:text-slate-400',
        )}
      >
        <Icon size={14} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={clsx('truncate text-[13px] font-semibold', isActive ? 'text-white' : 'text-slate-300')}>
          {result.label}
        </p>
        <p className="truncate text-[11px] text-slate-600">{result.sub}</p>
      </div>
      {result.path && (
        <span className="hidden shrink-0 rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-slate-600 sm:block">
          {result.path}
        </span>
      )}
      <ArrowRight
        size={13}
        strokeWidth={1.75}
        className={clsx('shrink-0 transition-all', isActive ? 'text-indigo-400' : 'text-slate-800 group-hover:text-slate-600')}
      />
    </button>
  )
}

export default function GlobalSearch({ profile, onNavigate, onClose }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [recent, setRecent] = useState(getRecent)
  const inputRef = useRef(null)
  const professors = getProfessors(profile)
  const tutors = getTutors(profile)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { setActive(0) }, [query])

  const q = query.toLowerCase().trim()

  const results = q.length < 1 ? [] : [
    ...MODULES
      .filter(m => t(`nav.${m.id}`).toLowerCase().includes(q))
      .map(m => ({
        type: 'module',
        label: t(`nav.${m.id}`),
        sub: m.mode === 'academic' ? t('search.academic') : t('search.studentLife'),
        path: m.mode === 'academic' ? t('search.academic') : t('search.studentLife'),
        icon: m.icon,
        action: () => onNavigate(m.id, m.mode),
      })),
    ...professors
      .filter(p => p.name.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q) || p.tags.some(tag => tag.toLowerCase().includes(q)))
      .slice(0, 4)
      .map(p => ({
        type: 'professor',
        label: p.name,
        sub: p.domain,
        path: t('search.professorGroup'),
        icon: GraduationCap,
        action: () => onNavigate('thesis', 'academic'),
      })),
    ...tutors
      .filter(tutor => tutor.name.toLowerCase().includes(q) || tutor.subjects.some(s => s.toLowerCase().includes(q)))
      .slice(0, 3)
      .map(tutor => ({
        type: 'tutor',
        label: tutor.name,
        sub: tutor.subjects.join(', '),
        path: t('search.tutorGroup'),
        icon: Users,
        action: () => onNavigate('tutoring', 'academic'),
      })),
  ]

  // Group results by type
  const grouped = results.reduce((acc, r) => {
    const key = r.type === 'module' ? t('search.moduleGroup') : r.type === 'professor' ? t('search.professorGroup') : t('search.tutorGroup')
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const showDefault = q.length < 1

  function handleKey(e) {
    if (e.key === 'Escape') { onClose(); return }
    if (results.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[active]) {
      saveRecent(query)
      setRecent(getRecent())
      results[active].action()
      onClose()
    }
  }

  function handleResultClick(result) {
    if (query.trim()) {
      saveRecent(query)
      setRecent(getRecent())
    }
    result.action()
    onClose()
  }

  // Compute flattened index offset per group for isActive check
  let flatIndex = 0
  const groupOffsets = {}
  for (const key of Object.keys(grouped)) {
    groupOffsets[key] = flatIndex
    flatIndex += grouped[key].length
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl animate-slide-up">
        {/* Bezel outer */}
        <div className="rounded-2xl bg-gradient-to-b from-white/[0.1] to-white/[0.025] p-[1px] shadow-[0_40px_80px_-16px_rgba(0,0,0,0.9),0_0_0_1px_rgba(99,102,241,0.06)]">
          {/* Bezel inner */}
          <div className="overflow-hidden rounded-[calc(1rem-1px)] bg-[#080e1c]">

            {/* Gradient top strip */}
            <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600" />

            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
              <Search size={17} strokeWidth={1.75} className="shrink-0 text-indigo-400/70" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder={t('search.placeholder')}
                className="flex-1 bg-transparent text-[15px] font-medium text-slate-200 outline-none placeholder:text-slate-700"
              />
              {query ? (
                <button
                  onClick={() => setQuery('')}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.08] text-slate-600 transition-all hover:border-white/[0.14] hover:text-slate-300"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              ) : (
                <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-white/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-slate-700 sm:flex">
                  ESC
                </kbd>
              )}
            </div>

            {/* Results area */}
            <div className="max-h-[min(60vh,420px)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.06)_transparent]">

              {/* Default state: quick modules grid + recent */}
              {showDefault && (
                <div className="p-4 space-y-4">
                  <div>
                    <p className="section-label mb-2.5">{t('search.quickModules')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {MODULES.slice(0, 6).map(m => {
                        const Icon = m.icon
                        return (
                          <button
                            key={m.id}
                            onClick={() => { onNavigate(m.id, m.mode); onClose() }}
                            className="group flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center transition-all hover:border-indigo-400/20 hover:bg-indigo-500/08"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] transition-all group-hover:border-indigo-400/20 group-hover:bg-indigo-500/15">
                              <Icon size={15} strokeWidth={1.75} className="text-slate-500 transition-colors group-hover:text-indigo-300" />
                            </div>
                            <span className="text-[11px] font-medium leading-tight text-slate-500 transition-colors group-hover:text-slate-300">{t(`nav.${m.id}`)}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {recent.length > 0 && (
                    <div>
                      <p className="section-label mb-2">{t('search.recentSearches')}</p>
                      <div className="space-y-0.5">
                        {recent.map(r => (
                          <button
                            key={r}
                            onClick={() => setQuery(r)}
                            className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.04]"
                          >
                            <Clock size={13} strokeWidth={1.75} className="shrink-0 text-slate-700 transition-colors group-hover:text-slate-500" />
                            <span className="text-[13px] text-slate-500 transition-colors group-hover:text-slate-300">{r}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!showDefault && results.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                    <Sparkles size={20} strokeWidth={1.5} className="text-slate-700" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-500">{t('search.noResults')}</p>
                    <p className="mt-0.5 text-[12px] text-slate-700">{t('search.noResultsFor', { query })}</p>
                  </div>
                </div>
              )}

              {/* Grouped results */}
              {!showDefault && results.length > 0 && (
                <div className="py-2">
                  {Object.entries(grouped).map(([groupLabel, items]) => {
                    const offset = groupOffsets[groupLabel]
                    return (
                      <div key={groupLabel}>
                        <p className="section-label mx-4 my-1.5">{groupLabel}</p>
                        {items.map((r, i) => (
                          <ResultRow
                            key={`${r.type}-${r.label}`}
                            result={r}
                            isActive={active === offset + i}
                            onMouseEnter={() => setActive(offset + i)}
                            onClick={() => handleResultClick(r)}
                          />
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer shortcuts */}
            <div className="flex items-center gap-4 border-t border-white/[0.04] px-4 py-2">
              <span className="flex items-center gap-1 text-[10px] text-slate-700">
                <kbd className="rounded border border-white/[0.07] px-1.5 py-0.5 font-mono text-[9px]">↑↓</kbd>
                {t('search.navigate')}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-700">
                <kbd className="rounded border border-white/[0.07] px-1.5 py-0.5 font-mono text-[9px]">↵</kbd>
                {t('search.open')}
              </span>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-700">
                <kbd className="rounded border border-white/[0.07] px-1.5 py-0.5 font-mono text-[9px]">ESC</kbd>
                {t('search.close')}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
