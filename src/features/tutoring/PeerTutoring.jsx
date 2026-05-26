import { useState, useEffect } from 'react'
import { Search, Star, Calendar, Clock, Check, MessageSquare, ArrowLeftRight, Users, GraduationCap, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getSubjectFilters, getTutors } from '../../shared/data/facultyCatalog'
import SkillSwap from './SkillSwap'
import clsx from 'clsx'
import { useToast } from '../../shared/components/Toast'
import { motion, AnimatePresence } from 'framer-motion'

const TAB_IDS = ['tutors', 'groupSwap']
const TAB_ICONS = [<GraduationCap size={13} />, <ArrowLeftRight size={11} />]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 90, damping: 20 },
  },
}

function TutorSkeleton() {
  return (
    <div className="premium-card animate-pulse">
      <div className="h-0.5 rounded-t-2xl bg-white/[0.05]" />
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-white/[0.06] shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 bg-white/[0.06] rounded w-3/4" />
            <div className="h-2.5 bg-white/[0.03] rounded w-1/2" />
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded bg-white/[0.04]" />
              ))}
            </div>
          </div>
          <div className="text-right shrink-0 space-y-1">
            <div className="h-5 w-12 bg-white/[0.06] rounded" />
            <div className="h-2.5 w-14 bg-white/[0.03] rounded" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 bg-white/[0.03] rounded w-1/3" />
          <div className="flex gap-1.5">
            {[56, 72, 50].map(w => (
              <div key={w} className="h-5 bg-white/[0.04] rounded-full" style={{ width: w }} />
            ))}
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

function TutorCard({ t: tutor }) {
  const { t } = useTranslation()
  const storageKey = 'sc_tutor_actions'
  const [booked, setBooked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}')[tutor.name]?.booked || false } catch { return false }
  })
  const [contacted, setContacted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}')[tutor.name]?.contacted || false } catch { return false }
  })
  const [showSlots, setShowSlots] = useState(false)
  const toast = useToast()

  function saveTutorAction(field, value) {
    try {
      const all = JSON.parse(localStorage.getItem(storageKey) || '{}')
      all[tutor.name] = { ...all[tutor.name], [field]: value }
      localStorage.setItem(storageKey, JSON.stringify(all))
    } catch {}
  }

  function handleBook() {
    setBooked(true)
    saveTutorAction('booked', true)
    toast({ type: 'success', title: t('peerTutoring.toast.booked'), message: t('peerTutoring.toast.bookedMsg', { name: tutor.name }) })
  }

  function handleContact() {
    setContacted(true)
    saveTutorAction('contacted', true)
    toast({ type: 'info', title: t('peerTutoring.toast.contactTitle'), message: t('peerTutoring.toast.contactMsg', { name: tutor.name }) })
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="premium-card flex flex-col group cursor-default"
    >
      {/* Gradient accent bar */}
      <div className={`h-0.5 rounded-t-2xl bg-gradient-to-r ${tutor.color} opacity-80`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${tutor.color} flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/[0.07]`}>
              {tutor.avatar}
            </div>
            {tutor.online && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#080e1c] shadow-sm shadow-emerald-500/40" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">{tutor.name}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{t('peerTutoring.card.yearSessions', { year: tutor.year, sessions: tutor.sessions })}</p>
            <div className="flex items-center gap-0.5 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={i < Math.floor(tutor.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700 fill-slate-700'}
                />
              ))}
              <span className="text-[10px] text-slate-500 ml-1.5">{tutor.rating} <span className="text-slate-700">({tutor.reviews})</span></span>
            </div>
          </div>

          {/* Price */}
          <div className="shrink-0">
            <span className="badge-amber text-[11px] font-bold px-2.5 py-1">{tutor.price} lei</span>
            <p className="text-[9px] text-slate-600 text-right mt-1">{t('peerTutoring.card.perSession')}</p>
          </div>
        </div>

        {/* Subject tags */}
        <div className="mb-4">
          <p className="section-label mb-2">{t('peerTutoring.card.subjects')}</p>
          <div className="flex flex-wrap gap-1.5">
            {tutor.subjects.map(s => (
              <span key={s} className="tag text-[10px] py-0.5 px-2">{s}</span>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 group-hover:border-white/[0.08] transition-colors">
            <p className="text-[9px] text-slate-600 uppercase font-semibold tracking-wide mb-0.5">{t('peerTutoring.card.grade')}</p>
            <p className="text-sm font-bold text-emerald-400 font-mono">{tutor.grade}<span className="text-slate-600 font-normal">/10</span></p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 group-hover:border-white/[0.08] transition-colors">
            <p className="text-[9px] text-slate-600 uppercase font-semibold tracking-wide mb-0.5">{t('peerTutoring.card.style')}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{tutor.style}</p>
          </div>
        </div>

        {/* Availability toggle */}
        <button
          onClick={() => setShowSlots(v => !v)}
          className="flex items-center gap-2 text-[11px] text-slate-500 hover:text-slate-300 transition-colors mb-2 w-fit"
        >
          <Calendar size={11} className="text-slate-600" />
          {t('peerTutoring.card.availability')}
          <span className="badge-blue text-[9px] py-0 px-1.5">{t('peerTutoring.card.slots', { count: tutor.availability.length })}</span>
        </button>

        <AnimatePresence>
          {showSlots && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tutor.availability.map(slot => (
                  <span
                    key={slot}
                    className="px-2.5 py-1 rounded-lg text-[10px] bg-white/[0.03] border border-white/[0.07] text-slate-400 flex items-center gap-1"
                  >
                    <Clock size={9} className="text-slate-600" /> {slot}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-auto pt-1 flex gap-2">
          <button
            onClick={handleContact}
            className={clsx(
              'w-9 h-9 rounded-xl border flex items-center justify-center transition-all shrink-0',
              contacted
                ? 'bg-emerald-600/20 border-emerald-500/30'
                : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.12]',
            )}
            title={contacted ? t('peerTutoring.card.contactRequested') : t('peerTutoring.card.contactRequest')}
          >
            {contacted
              ? <Check size={13} className="text-emerald-400" />
              : <MessageSquare size={13} className="text-slate-500" strokeWidth={1.75} />}
          </button>

          {booked ? (
            <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-600/15 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-semibold">
              <Check size={13} /> {t('peerTutoring.card.booked')}
            </div>
          ) : (
            <button
              onClick={handleBook}
              className="flex-1 btn-primary text-xs flex items-center justify-center gap-2 py-2.5"
            >
              <Calendar size={13} /> {t('peerTutoring.card.book')}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function PeerTutoring({ profile, session }) {
  const { t } = useTranslation()
  const tutors = getTutors(profile, session)
  const SUBJECTS = getSubjectFilters(profile, session)

  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('Toate')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const filtered = tutors.filter(tutor => {
    const matchSearch =
      tutor.name.toLowerCase().includes(search.toLowerCase()) ||
      tutor.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const subjectKey = subject.toLowerCase().replace(' / ', '/').split('/')[0].trim()
    const matchSubject = subject === 'Toate' || (tutor.subjects || []).some(s => s?.toLowerCase().includes(subjectKey))
    return matchSearch && matchSubject
  })

  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── Top bar ── */}
      <div className="px-5 py-3.5 border-b border-white/[0.05] bg-[#070b14]/90 backdrop-blur-xl shrink-0 space-y-3">

        {/* Tab switcher + search */}
        <div className="flex gap-2 items-center">
          {/* Pill switcher */}
          <div className="flex p-[2px] rounded-full bg-white/[0.04] border border-white/[0.07] gap-0.5">
            {TAB_IDS.map((id, i) => (
              <button
                key={id}
                onClick={() => setTab(i)}
                className={clsx(
                  'relative px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5',
                  tab === i
                    ? 'bg-indigo-600/30 text-indigo-300 shadow-sm shadow-indigo-900/40'
                    : 'text-slate-500 hover:text-slate-300',
                )}
              >
                {tab === i && (
                  <motion.span
                    layoutId="tabActive"
                    className="absolute inset-0 rounded-full bg-indigo-600/25 border border-indigo-500/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {TAB_ICONS[i]} {t(`peerTutoring.tabs.${id}`)}
                </span>
              </button>
            ))}
          </div>

          {tab === 0 && (
            <div className="flex-1 flex items-center gap-2 bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] rounded-xl px-3 py-2 transition-colors">
              <Search size={13} className="text-slate-600 shrink-0" strokeWidth={1.75} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('peerTutoring.searchPlaceholder')}
                className="bg-transparent text-[13px] text-slate-300 placeholder-slate-700 outline-none flex-1"
              />
            </div>
          )}
        </div>

        {/* Subject filter chips */}
        {tab === 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="shrink-0 flex items-center text-slate-600 pr-1">
              <SlidersHorizontal size={11} />
            </span>
            {SUBJECTS.map(s => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={clsx(
                  'chip shrink-0 transition-all',
                  subject === s
                    ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-300'
                    : 'text-slate-500 hover:text-slate-300 hover:border-white/[0.12]',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-5">
        {tab === 0 && (
          <>
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/25 flex items-center justify-center">
                  <GraduationCap size={14} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{t('peerTutoring.available')}</p>
                  <p className="text-[11px] text-slate-600">{t('peerTutoring.verified')}</p>
                </div>
              </div>
              {!loading && (
                <span className="badge-blue text-[11px] font-semibold px-2.5 py-1">
                  {t('peerTutoring.count', { count: filtered.length })}
                </span>
              )}
            </div>

            {!loading && filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Users size={28} className="text-slate-700" strokeWidth={1.25} />
                </div>
                <p className="text-slate-400 text-sm font-semibold mb-1">{t('peerTutoring.notFound')}</p>
                <p className="text-slate-700 text-xs">{t('peerTutoring.notFoundText')}</p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <TutorSkeleton key={i} />)
                  : filtered.map(tutor => <TutorCard key={tutor.id} t={tutor} />)
                }
              </motion.div>
            )}
          </>
        )}

        {tab === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          >
            <SkillSwap profile={profile} session={session} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
