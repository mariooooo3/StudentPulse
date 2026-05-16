import { useState } from 'react'
import { Search, Filter, BookOpen, Star, Users, ChevronDown, Globe, Check, AlertCircle } from 'lucide-react'
import { getProfessors, getThesisDomains } from '../../shared/data/facultyCatalog'
import BookingModal from './BookingModal'
import clsx from 'clsx'

function SlotBar({ left, total }) {
  const pct = (left / total) * 100
  const color = pct === 0 ? 'bg-red-500' : pct <= 40 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-1">
      <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function ProfessorCard({ p, onBook }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="glass-card flex flex-col hover:border-slate-600 transition-all duration-200">
      {/* Top gradient bar */}
      <div className={`h-1.5 rounded-t-2xl bg-gradient-to-r ${p.color}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg`}>
            {p.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-white text-sm leading-tight">{p.name}</p>
                <p className="text-xs text-slate-500">{p.title}</p>
              </div>
              {p.available ? (
                <span className="badge-green shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                  {p.slotsLeft} locuri
                </span>
              ) : (
                <span className="badge-red shrink-0">Rezervat</span>
              )}
            </div>
          </div>
        </div>

        {/* Domain */}
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={13} className="text-slate-500 shrink-0" />
          <span className="text-xs font-semibold text-slate-300">{p.domain}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {p.tags.map(t => <span key={t} className="tag text-[10px] py-0.5">{t}</span>)}
        </div>

        {/* Slots bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Locuri disponibile</span>
            <span className="font-semibold">{p.slotsLeft}/{p.totalSlots}</span>
          </div>
          <SlotBar left={p.slotsLeft} total={p.totalSlots} />
        </div>

        {/* Criteria */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-800/60 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-600 uppercase font-semibold">Medie minimă</p>
            <p className="text-sm font-bold text-slate-200">{p.minGrade}</p>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-600 uppercase font-semibold">Limbă</p>
            <p className="text-xs font-semibold text-slate-200 truncate">{p.language}</p>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-600 uppercase font-semibold">Alte specializări</p>
            <p className="text-xs font-semibold text-slate-200">{p.acceptsOther ? '✓ Acceptă' : '✗ Nu acceptă'}</p>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-600 uppercase font-semibold">Contact</p>
            <p className="text-xs font-semibold text-slate-200 truncate">{p.contact}</p>
          </div>
        </div>

        {/* Previous theses toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-3"
        >
          <ChevronDown size={14} className={clsx('transition-transform', expanded && 'rotate-180')} />
          Teme licență anterioare ({p.previousTheses.length})
        </button>

        {expanded && (
          <div className="space-y-2 mb-4">
            {p.previousTheses.map((t, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-300 leading-relaxed">{t.title}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{t.year}</p>
              </div>
            ))}
          </div>
        )}

        {/* Book button */}
        <div className="mt-auto">
          <button
            onClick={() => p.available && onBook(p)}
            disabled={!p.available}
            className={clsx('w-full btn-primary flex items-center justify-center gap-2 text-sm', !p.available && 'opacity-40 cursor-not-allowed bg-slate-700')}
          >
            {p.available ? (
              <><Star size={14} /> Rezervă loc</>
            ) : (
              <><AlertCircle size={14} /> Rezervat complet</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ThesisFinder({ profile, session }) {
  const professors = getProfessors(profile)
  const DOMAINS = getThesisDomains(profile)

  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('Toate')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [booking, setBooking] = useState(null)

  const filtered = professors.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.domain.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchDomain = domain === 'Toate' || p.domain === domain
    const matchAvail = !onlyAvailable || p.available
    return matchSearch && matchDomain && matchAvail
  })

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Filter bar */}
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900 shrink-0 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2.5">
            <Search size={15} className="text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Caută profesor, domeniu, tag..."
              className="bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none flex-1"
            />
          </div>
          <label className="flex items-center gap-2 bg-slate-800 border border-slate-700/50 rounded-xl px-4 cursor-pointer hover:bg-slate-700 transition-colors">
            <div
              onClick={() => setOnlyAvailable(v => !v)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${onlyAvailable ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600'}`}
            >
              {onlyAvailable && <Check size={10} className="text-white" />}
            </div>
            <span className="text-sm text-slate-400 whitespace-nowrap">Doar disponibili</span>
          </label>
        </div>

        {/* Domain filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {DOMAINS.map(d => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className={clsx(
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                domain === d ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600',
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">{filtered.length} profesori găsiți</p>
          <p className="text-xs text-slate-600">{filtered.filter(p => p.available).length} cu locuri disponibile</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProfessorCard key={p.id} p={p} onBook={setBooking} />
          ))}
        </div>
      </div>

      {booking && <BookingModal professor={booking} session={session} onClose={() => setBooking(null)} />}
    </div>
  )
}
