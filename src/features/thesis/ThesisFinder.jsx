import { useState, useEffect } from 'react'
import { Search, BookOpen, Star, Users, ChevronDown, Check, AlertCircle, X, GraduationCap, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProfessors, getThesisDomains } from '../../shared/data/facultyCatalog'
import BookingModal from './BookingModal'
import clsx from 'clsx'
import { DEMO_PROFESSOR, getThesisRequestsForUser } from '../../shared/services/professorPortal.service'
import { getTenantScope } from '../../shared/utils/tenantScope.js'

const DEMO_THESIS_PROFESSOR = {
  id: DEMO_PROFESSOR.id,
  name: DEMO_PROFESSOR.name,
  title: DEMO_PROFESSOR.title,
  domain: DEMO_PROFESSOR.domain,
  tags: ['Algoritmica', 'Structuri discrete', 'AI aplicat', 'FMIM'],
  available: true,
  slotsLeft: 3,
  totalSlots: 6,
  minGrade: 8.0,
  language: 'Romana / Engleza',
  acceptsOther: true,
  previousTheses: [
    { title: 'Modele graf pentru recomandari academice', year: 2025 },
    { title: 'Optimizari euristice pentru orare universitare', year: 2024 },
  ],
  contact: 'Email / Teams',
  avatar: DEMO_PROFESSOR.avatar,
  color: 'from-amber-600 to-orange-600',
  requirementsNote: 'Pentru demo, acest profesor este conectat cu portalul Profesor. Cererile trimise aici apar direct in contul lui.',
}

/* ── Animation variants ──────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 90, damping: 20 },
  },
}

/* ── Slot bar ────────────────────────────────────────────── */
function SlotBar({ left, total }) {
  const pct = (left / total) * 100
  const color = pct === 0 ? 'bg-red-500' : pct <= 40 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="w-full bg-white/[0.05] rounded-full h-1 mt-1 overflow-hidden">
      <motion.div
        className={`h-1 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
      />
    </div>
  )
}

/* ── Skeleton ────────────────────────────────────────────── */
function ProfessorSkeleton() {
  return (
    <div className="premium-card animate-pulse">
      <div className="h-1 rounded-t-2xl bg-white/[0.05]" />
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/[0.06] shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 bg-white/[0.06] rounded w-3/4" />
            <div className="h-2.5 bg-white/[0.03] rounded w-1/2" />
          </div>
          <div className="h-5 w-16 bg-white/[0.04] rounded-full shrink-0" />
        </div>
        <div className="h-2.5 bg-white/[0.04] rounded w-2/3" />
        <div className="flex gap-1.5">
          {[48, 60, 40].map(w => <div key={w} className="h-5 bg-white/[0.04] rounded-full" style={{ width: w }} />)}
        </div>
        <div className="h-1 bg-white/[0.04] rounded-full" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-12 bg-white/[0.03] rounded-xl" />)}
        </div>
        <div className="h-9 bg-white/[0.04] rounded-xl" />
      </div>
    </div>
  )
}

/* ── Rating stars ────────────────────────────────────────── */
function RatingStars({ rating = 4.5 }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={i < full ? 'text-amber-400 fill-amber-400' : half && i === full ? 'text-amber-400 fill-amber-400/40' : 'text-white/[0.1] fill-white/[0.05]'}
          strokeWidth={0}
        />
      ))}
      <span className="text-[10px] text-slate-500 ml-1 font-mono">{rating}</span>
    </div>
  )
}

/* ── Professor card ──────────────────────────────────────── */
function ProfessorCard({ p, onBook }) {
  const [expanded, setExpanded] = useState(false)

  const initials = p.avatar || p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="premium-card flex flex-col"
    >
      {/* Accent top bar */}
      <div className={`h-[3px] rounded-t-2xl bg-gradient-to-r ${p.color} opacity-80`} />

      <div className="p-5 flex-1 flex flex-col">

        {/* ── Header row ── */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg`}>
            {initials}
          </div>

          {/* Name + title */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-[14px] leading-snug truncate">{p.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{p.title}</p>
            <RatingStars rating={p.rating ?? 4.5} />
          </div>

          {/* Availability badge */}
          {p.available ? (
            <span className="badge-green shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {p.slotsLeft} locuri
            </span>
          ) : (
            <span className="badge-red shrink-0">Rezervat</span>
          )}
        </div>

        {/* ── Department tag + domain ── */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="chip text-[10px] py-0.5">{p.domain}</span>
          {p.tags.slice(0, 1).map(t => (
            <span key={t} className="tag text-[10px] py-0.5">{t}</span>
          ))}
        </div>

        {p.requirementsNote && (
          <div className="flex gap-2 bg-indigo-500/[0.07] border border-indigo-500/20 rounded-xl px-3 py-2.5 mb-3">
            <Sparkles size={12} className="text-indigo-400 shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-[11px] text-indigo-200/70 leading-relaxed">{p.requirementsNote}</p>
          </div>
        )}

        {/* ── Expectation tags ── */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {p.tags.map(t => <span key={t} className="tag text-[10px] py-0.5">{t}</span>)}
        </div>

        {/* ── Slot bar ── */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-slate-500 font-medium">Locuri disponibile</span>
            <span className="text-slate-400 font-mono font-semibold">{p.slotsLeft}/{p.totalSlots}</span>
          </div>
          <SlotBar left={p.slotsLeft} total={p.totalSlots} />
        </div>

        {/* ── Criteria grid ── */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 hover:border-white/[0.08] transition-colors">
            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-1">Medie minimă</p>
            <p className="text-[13px] font-bold text-slate-200 font-mono">{p.minGrade}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 hover:border-white/[0.08] transition-colors">
            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-1">Limbă</p>
            <p className="text-[11px] font-semibold text-slate-200 truncate">{p.language}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 hover:border-white/[0.08] transition-colors">
            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-1">Alte specializări</p>
            <p className="text-[11px] font-semibold flex items-center gap-1" style={{ color: p.acceptsOther ? '#34d399' : '#f87171' }}>
              {p.acceptsOther ? <Check size={11} /> : <X size={11} />}
              {p.acceptsOther ? 'Acceptă' : 'Nu acceptă'}
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 hover:border-white/[0.08] transition-colors">
            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-1">Contact</p>
            <p className="text-[11px] font-semibold text-slate-200 truncate">{p.contact}</p>
          </div>
        </div>

        {/* ── Previous theses toggle ── */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors mb-3 group"
        >
          <ChevronDown size={13} className={clsx('transition-transform duration-200 group-hover:text-indigo-400', expanded && 'rotate-180')} />
          Teme licență anterioare
          <span className="badge-blue ml-0.5">{p.previousTheses.length}</span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 mb-4">
                {p.previousTheses.map((t, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2.5">
                    <p className="text-[11px] text-slate-400 leading-relaxed">{t.title}</p>
                    <p className="text-[10px] text-slate-700 mt-0.5 font-mono">{t.year}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA button ── */}
        <div className="mt-auto">
          <button
            onClick={() => p.available && onBook(p)}
            disabled={!p.available}
            className={clsx(
              'w-full btn-primary text-[13px] flex items-center justify-center gap-2',
              !p.available && 'opacity-40 cursor-not-allowed !bg-slate-700 !shadow-none',
            )}
          >
            {p.available ? (
              <><GraduationCap size={14} /> Contactează</>
            ) : (
              <><AlertCircle size={14} /> Rezervat complet</>
            )}
          </button>
        </div>

      </div>
    </motion.div>
  )
}

/* ── Main component ──────────────────────────────────────── */
export default function ThesisFinder({ profile, session }) {
  const baseProfessors = getProfessors(profile, session)
  const { universityId, facultyCode } = getTenantScope(profile, session)
  const canUseDemoProfessor = universityId === 'tuiasi' && facultyCode === 'AC'
  const professors = (!canUseDemoProfessor || baseProfessors.some(p => p.id === DEMO_THESIS_PROFESSOR.id))
    ? baseProfessors
    : [DEMO_THESIS_PROFESSOR, ...baseProfessors]
  const DOMAINS = getThesisDomains(profile, session)

  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('Toate')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myRequests, setMyRequests] = useState([])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    async function refresh() {
      setMyRequests(await getThesisRequestsForUser(session?.userId))
    }
    refresh()
    window.addEventListener('sc:thesis-requests', refresh)
    return () => window.removeEventListener('sc:thesis-requests', refresh)
  }, [session?.userId])

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

      {/* ── Page header ── */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[22px] font-extrabold text-gradient-indigo tracking-tight">Găsește coordonator</h1>
          <span className="badge-blue">
            <Users size={10} />
            {professors.length} profesori
          </span>
        </div>
        <p className="text-[13px] text-slate-500">Explorează profesorii disponibili și trimite o cerere de coordonare a lucrării de licență.</p>
      </div>

      {/* ── Filter bar ── */}
      <div className="px-5 pb-3.5 border-b border-white/[0.05] bg-[#070b14]/90 backdrop-blur-xl shrink-0 space-y-3">

        {/* Search + checkbox */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 shrink-0 pointer-events-none" strokeWidth={2} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Caută profesor, domeniu, tag..."
              className="input-base pl-9 text-[13px]"
            />
          </div>

          <label className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 cursor-pointer hover:bg-white/[0.05] transition-colors shrink-0">
            <div
              onClick={() => setOnlyAvailable(v => !v)}
              className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${onlyAvailable ? 'bg-indigo-600 border-indigo-600 glow-indigo-sm' : 'border-white/[0.15]'}`}
            >
              {onlyAvailable && <Check size={10} className="text-white" />}
            </div>
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap select-none">Doar disponibili</span>
          </label>
        </div>

        {/* Domain chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          {DOMAINS.map(d => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className={clsx(
                'chip shrink-0 text-[11px]',
                domain === d && '!bg-indigo-600/20 !border-indigo-500/40 !text-indigo-300',
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 overflow-auto p-5">

        {/* My requests panel */}
        {myRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            className="mb-5 elevated-card p-4"
          >
            <p className="section-label mb-3">Cererile tale</p>
            <div className="space-y-2">
              {myRequests.slice(0, 3).map(request => (
                <div key={request.id} className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-slate-200 truncate">{request.professorName}</p>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">{request.idea}</p>
                  </div>
                  <span className={clsx(
                    'rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0',
                    request.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' :
                    request.status === 'rejected' ? 'bg-red-500/15 text-red-300 border border-red-500/20' :
                    'bg-amber-500/15 text-amber-300 border border-amber-500/20',
                  )}>
                    {request.status === 'accepted' ? 'Acceptata' : request.status === 'rejected' ? 'Respinsa' : 'In asteptare'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Count row */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-[12px] text-slate-500 font-medium">
            <span className="text-slate-300 font-bold">{filtered.length}</span> profesori găsiți
          </p>
          <p className="text-[11px] text-slate-600">
            <span className="text-emerald-500/80 font-semibold">{filtered.filter(p => p.available).length}</span> cu locuri disponibile
          </p>
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <GraduationCap size={28} className="text-slate-700" strokeWidth={1.5} />
            </div>
            <p className="text-slate-400 text-[14px] font-semibold">Niciun profesor găsit</p>
            <p className="text-slate-600 text-[12px] mt-1.5">Încearcă un alt domeniu sau șterge filtrele</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProfessorSkeleton key={i} />)
              : filtered.map(p => <ProfessorCard key={p.id} p={p} onBook={setBooking} />)
            }
          </motion.div>
        )}
      </div>

      {booking && <BookingModal professor={booking} session={session} onClose={() => setBooking(null)} />}
    </div>
  )
}
