import { useState } from 'react'
import { Search, Star, Calendar, Clock, Check, MessageSquare, ArrowLeftRight } from 'lucide-react'
import { getSubjectFilters, getTutors } from '../../shared/data/facultyCatalog'
import SkillSwap from './SkillSwap'
import clsx from 'clsx'

const TABS = ['Tutori disponibili', 'Skill Swap & Grupuri']

function TutorCard({ t }) {
  const [booked, setBooked] = useState(false)
  const [showSlots, setShowSlots] = useState(false)

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

        {/* Nota & stil */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-800/60 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-600 uppercase font-semibold">Nota obținută</p>
            <p className="text-sm font-bold text-emerald-400">{t.grade}/10</p>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-600 uppercase font-semibold">Stil</p>
            <p className="text-[10px] text-slate-300 leading-tight">{t.style}</p>
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
              <span key={slot} className="px-2.5 py-1 rounded-lg text-[10px] bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1">
                <Clock size={9} /> {slot}
              </span>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="mt-auto flex gap-2">
          <button className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors shrink-0">
            <MessageSquare size={15} className="text-slate-400" />
          </button>
          {booked ? (
            <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-semibold">
              <Check size={15} /> Rezervat!
            </div>
          ) : (
            <button
              onClick={() => setBooked(true)}
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

  const filtered = tutors.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchSubject = subject === 'Toate' || t.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase().replace(' / ', '/').split('/')[0].trim().toLowerCase()))
    return matchSearch && matchSubject
  })

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Filter bar */}
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900 shrink-0 space-y-3">
        <div className="flex gap-2">
          <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5', tab === i ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200')}
              >
                {i === 1 && <ArrowLeftRight size={11} />}
                {t}
              </button>
            ))}
          </div>
          {tab === 0 && (
            <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2">
              <Search size={14} className="text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Caută tutor sau materie..."
                className="bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none flex-1"
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
                className={clsx('shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border', subject === s ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600')}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {tab === 0 && (
          <>
            <p className="text-sm text-slate-400 mb-4">{filtered.length} tutori disponibili</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(t => <TutorCard key={t.id} t={t} />)}
            </div>
          </>
        )}
        {tab === 1 && <SkillSwap profile={profile} />}
      </div>
    </div>
  )
}
