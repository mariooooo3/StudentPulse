import { useState, useEffect } from 'react'
import { Search, Star, Calendar, Clock, Check, MessageSquare, ArrowLeftRight, Users } from 'lucide-react'
import { getSubjectFilters, getTutors } from '../../shared/data/facultyCatalog'
import SkillSwap from './SkillSwap'
import clsx from 'clsx'
import { useToast } from '../../shared/components/Toast'

const TABS = ['Tutori disponibili', 'Skill Swap & Grupuri']

function TutorSkeleton() {
  return (
    <div className="glass-card animate-pulse">
      <div className="h-1 rounded-t-2xl bg-white/[0.05]" />
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-white/[0.06] shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 bg-white/[0.06] rounded w-3/4" />
            <div className="h-2.5 bg-white/[0.03] rounded w-1/2" />
            <div className="flex gap-0.5">
              {[0,1,2,3,4].map(i => <div key={i} className="w-2.5 h-2.5 rounded bg-white/[0.04]" />)}
            </div>
          </div>
          <div className="text-right shrink-0 space-y-1">
            <div className="h-5 w-10 bg-white/[0.06] rounded" />
            <div className="h-2.5 w-14 bg-white/[0.03] rounded" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 bg-white/[0.03] rounded w-1/3" />
          <div className="flex gap-1.5">
            {[56, 72, 50].map(w => <div key={w} className="h-5 bg-white/[0.04] rounded-full" style={{ width: w }} />)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 bg-white/[0.03] rounded-lg" />
          <div className="h-12 bg-white/[0.03] rounded-lg" />
        </div>
        <div className="h-9 bg-white/[0.04] rounded-xl" />
      </div>
    </div>
  )
}

function TutorCard({ t }) {
  const [booked, setBooked] = useState(false)
  const [contacted, setContacted] = useState(false)
  const [showSlots, setShowSlots] = useState(false)
  const toast = useToast()

  function handleBook() {
    setBooked(true)
    toast({ type: 'success', title: 'Sesiune rezervată!', message: `${t.name} te va contacta pentru confirmare.` })
  }

  function handleContact() {
    setContacted(true)
    toast({ type: 'info', title: 'Contact cerut', message: `Ai cerut contact cu ${t.name}. Cand este online, il gasesti in Mesaje.` })
  }

  return (
    <div className="glass-card flex flex-col hover:border-slate-600 transition-all duration-200">
      <div className={`h-1 rounded-t-2xl bg-gradient-to-r ${t.color}`} />
      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg relative`}>
            {t.avatar}
            {t.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">{t.name}</p>
            <p className="text-xs text-slate-500">Anul {t.year} · {t.sessions} sesiuni efectuate</p>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} className={i < Math.floor(t.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
              ))}
              <span className="text-[10px] text-slate-500 ml-1">{t.rating} ({t.reviews} recenzii)</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-white">{t.price}</p>
            <p className="text-[10px] text-slate-500">lei/sesiune</p>
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-4">
          <p className="text-[10px] text-slate-600 uppercase font-semibold mb-2">Materii disponibile</p>
          <div className="flex flex-wrap gap-1.5">
            {t.subjects.map(s => <span key={s} className="tag text-[10px] py-0.5">{s}</span>)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-2.5">
            <p className="text-[9px] text-slate-600 uppercase font-semibold tracking-wide">Nota obținută</p>
            <p className="text-[13px] font-bold text-emerald-400 font-mono">{t.grade}/10</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-2.5">
            <p className="text-[9px] text-slate-600 uppercase font-semibold tracking-wide">Stil</p>
            <p className="text-[10px] text-slate-400 leading-tight">{t.style}</p>
          </div>
        </div>

        {/* Availability */}
        <button
          onClick={() => setShowSlots(v => !v)}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-3"
        >
          <Calendar size={12} /> Disponibilitate ({t.availability.length} sloturi)
        </button>
        {showSlots && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {t.availability.map(slot => (
              <span key={slot} className="px-2.5 py-1 rounded-lg text-[10px] bg-white/[0.03] border border-white/[0.07] text-slate-400 flex items-center gap-1">
                <Clock size={9} /> {slot}
              </span>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="mt-auto flex gap-2">
          <button
            onClick={handleContact}
            className={clsx(
              'w-9 h-9 rounded-xl border flex items-center justify-center transition-colors shrink-0',
              contacted
                ? 'bg-emerald-600/20 border-emerald-500/30'
                : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07]',
            )}
            title={contacted ? 'Contact cerut' : 'Cere contact'}
          >
            {contacted ? <Check size={14} className="text-emerald-400" /> : <MessageSquare size={14} className="text-slate-500" strokeWidth={1.75} />}
          </button>
          {booked ? (
            <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-semibold">
              <Check size={15} /> Rezervat!
            </div>
          ) : (
            <button
              onClick={handleBook}
              className="flex-1 btn-primary text-sm flex items-center justify-center gap-2"
            >
              <Calendar size={14} /> Rezervă sesiune
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PeerTutoring({ profile }) {
  const tutors = getTutors(profile)
  const SUBJECTS = getSubjectFilters(profile)

  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('Toate')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  const filtered = tutors.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const subjectKey = subject.toLowerCase().replace(' / ', '/').split('/')[0].trim()
    const matchSubject = subject === 'Toate' || (t.subjects || []).some(s => s?.toLowerCase().includes(subjectKey))
    return matchSearch && matchSubject
  })

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Filter bar */}
      <div className="px-5 py-3.5 border-b border-white/[0.05] bg-[#070b14]/90 backdrop-blur-xl shrink-0 space-y-3">
        <div className="flex gap-2">
          <div className="flex p-[1px] rounded-full bg-white/[0.05] border border-white/[0.07]">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={clsx('px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5',
                  tab === i ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300')}
              >
                {i === 1 && <ArrowLeftRight size={10} />}
                {t}
              </button>
            ))}
          </div>
          {tab === 0 && (
            <div className="flex-1 flex items-center gap-2 bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] rounded-xl px-3 py-2 transition-colors">
              <Search size={13} className="text-slate-600 shrink-0" strokeWidth={1.75} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Caută tutor sau materie..."
                className="bg-transparent text-[13px] text-slate-300 placeholder-slate-700 outline-none flex-1 font-medium"
              />
            </div>
          )}
        </div>

        {tab === 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SUBJECTS.map(s => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={clsx('shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border',
                  subject === s ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'bg-white/[0.02] border-white/[0.06] text-slate-500 hover:border-white/[0.1] hover:text-slate-300')}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {tab === 0 && (
          <>
            <p className="text-[12px] text-slate-500 font-medium mb-4">{loading ? '...' : `${filtered.length} tutori disponibili`}</p>
            {!loading && filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users size={36} className="text-slate-800 mb-4" strokeWidth={1.5} />
                <p className="text-slate-500 text-sm font-semibold">Niciun tutor găsit</p>
                <p className="text-slate-700 text-xs mt-1">Încearcă alt filtru sau terge căutarea</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <TutorSkeleton key={i} />)
                  : filtered.map(t => <TutorCard key={t.id} t={t} />)
                }
              </div>
            )}
          </>
        )}
        {tab === 1 && <SkillSwap profile={profile} />}
      </div>
    </div>
  )
}
