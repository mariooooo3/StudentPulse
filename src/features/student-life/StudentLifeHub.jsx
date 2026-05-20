import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import {
  Award,
  Activity,
  AlertCircle,
  Apple,
  Bookmark,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Calendar,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Radio,
  Send,
  Upload,
  Car,
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  Heart,
  HandHeart,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Search,
  Smartphone,
  Sprout,
  Sparkles,
  Tag,
  Timer,
  Trash2,
  Dumbbell,
  Users,
  Users2,
  Wallet,
  Wrench,
  X,
  Zap,
  TrendingUp,
  Star,
} from 'lucide-react'
import { eventsData, booksData, carpoolData, roommateData, wellnessData, facultyCareerKeys, studentLifeData } from './studentLifeData'
import { getUniversityTheme } from '../../shared/utils/theme'
import { dateInDays, daysUntil, eventTiming, rollingDays } from '../../shared/utils/dateTime'
import { useNow } from '../../shared/hooks/useNow'
import { PI_DECIMALS } from '../../shared/data/piDigits'
import { socketService } from '../../shared/services/socket.service'

// ─── Accent palette per section ───────────────────────────────────────────────
const SECTION_ACCENTS = {
  pulse:     { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.2)'  },
  discounts: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' },
  career:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)' },
  community: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)' },
  events:    { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.2)'  },
  wellness:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)' },
  tools:     { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.2)' },
}

const SECTION_META = {
  pulse: {
    icon: Radio,
    label: 'Campus Pulse',
    kicker: 'Live Campus',
    title: 'Pulsul campusului, actualizat de studenti in timp real.',
    description: 'Check-in-uri anonime, locuri linistite, invitatii rapide si activitate din campus fara continut inventat.',
  },
  discounts: {
    icon: Tag,
    label: 'Reduceri & Beneficii',
    kicker: 'Beneficii Studențești',
    title: 'Oferte adaptate orașului și vieții de campus.',
    description: 'Restaurante, transport, abonamente, librării, săli de sport, cafenele și beneficii locale verificate.',
  },
  career: {
    icon: Briefcase,
    label: 'Carieră & Internship-uri',
    kicker: 'Oportunități pe Facultate',
    title: 'Internship-uri și roluri pentru profilul tău.',
    description: 'Recomandările folosesc facultatea, anul, orașul, interesele și contextul tău academic.',
  },
  community: {
    icon: Users,
    label: 'Comunitate',
    kicker: 'Integrare Socială',
    title: 'Găsește grupuri, întâlniri, mentorat și comunități de adaptare.',
    description: 'Alătură-te grupurilor conectate la interesele, facultatea și orașul tău.',
  },
  events: {
    icon: Calendar,
    label: 'Evenimente',
    kicker: 'Viața de Campus',
    title: 'Ce se întâmplă în campusul tău.',
    description: 'Concerte, hackathoane, cariere, sport, cultură — toate evenimentele studențești într-un loc.',
  },
  wellness: {
    icon: Heart,
    label: 'Focus',
    kicker: 'Sănătate & Echilibru',
    title: 'Ai grijă de tine, nu doar de note.',
    description: 'Resurse de sănătate mentală, sfaturi de wellbeing și timer Pomodoro integrat.',
  },
  tools: {
    icon: Wrench,
    label: 'Unelte Studențești',
    kicker: 'Tools Practice',
    title: 'Tot ce-ți trebuie ca student.',
    description: 'Budget tracker, schimb de cărți, carpool și găsit colegi de cameră.',
  },
}

const JOB_TYPES = ['Toate', 'Internship', 'Cercetare', 'Voluntariat']
const GROUP_TYPES = ['Toate', 'Sport', 'Tech', 'Social', 'Studiu', 'Gaming', 'Outdoor']

// ─── Framer Motion variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 20 } },
}
const entryVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0  },
  transition: { type: 'spring', stiffness: 80, damping: 18 },
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useStoredSet(key) {
  const [items, setItems] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(key) || '[]'))
    } catch {
      return new Set()
    }
  })

  const commit = (next) => {
    setItems(next)
    localStorage.setItem(key, JSON.stringify([...next]))
  }

  return [
    items,
    {
      add: (id) => commit(new Set([...items, id])),
      toggle: (id) => {
        const next = new Set(items)
        next.has(id) ? next.delete(id) : next.add(id)
        commit(next)
      },
    },
  ]
}

// ─── Profile helpers ──────────────────────────────────────────────────────────
function parseStudyYear(value) {
  const match = String(value || '').match(/\d+/)
  return match ? Number(match[0]) : 2
}

function normalizeCity(value) {
  return String(value || 'Iasi')
    .replace('Iași', 'Iasi')
    .replace('Timișoara', 'Timisoara')
    .replace('Brașov', 'Brasov')
}

function buildLifeProfile(profile, session) {
  const facultyType = profile?.facultyType || session?.detectedFaculty?.type || 'CS'
  const careerKey = facultyCareerKeys[facultyType] || 'CS'
  const interests = (profile?.interests || []).map((interest) => String(interest).toLowerCase())

  return {
    name: profile?.name || session?.email?.split('@')[0] || 'Student',
    facultyName: profile?.faculty || session?.detectedFaculty?.name || 'Computer Science',
    careerKey,
    year: parseStudyYear(profile?.year),
    city: normalizeCity(profile?.university?.city || session?.university?.city),
    interests: interests.length ? interests : ['coding', 'coffee', 'study'],
    experience: profile?.experience ? 'projects' : 'projects',
    gpa: 'above',
    workPref: 'hybrid',
  }
}

function offerScore(offer, lifeProfile) {
  return (
    (offer.city === 'all' || normalizeCity(offer.city) === lifeProfile.city ? 10 : 0) +
    (offer.verified ? 5 : 0) +
    (offer.popular ? 4 : 0) +
    (rollingDays(offer.id, 2, 30) < 20 ? 3 : 0) +
    (offer.discount >= 40 ? 6 : offer.discount >= 20 ? 3 : 1)
  )
}

function jobMatch(job, lifeProfile) {
  let score = job.baseMatch

  if (lifeProfile.year < job.minYear) score -= (job.minYear - lifeProfile.year) * 14
  else if (lifeProfile.year >= 4) score += 6
  else if (lifeProfile.year === 3) score += 3
  else if (lifeProfile.year === 1) score -= 8

  const cities = job.cities.map(normalizeCity)
  if (!job.remote && !cities.includes('all') && !cities.includes(lifeProfile.city)) score -= 24
  if (lifeProfile.workPref === 'remote' && !job.remote) score -= 8
  if (lifeProfile.workPref === 'onsite' && job.remote) score -= 4

  score += { none: 0, projects: 5, internship: 11, multi: 17 }[lifeProfile.experience] || 0
  score += { below: -9, average: 0, above: 4, excellent: 9 }[lifeProfile.gpa] || 0

  return Math.min(99, Math.max(8, Math.round(score)))
}

// ─── Shared UI components ──────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, text, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card border-dashed p-14 text-center"
    >
      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: accent?.bg || 'rgba(99,102,241,0.12)', border: `1px solid ${accent?.border || 'rgba(99,102,241,0.2)'}` }}
      >
        <Icon size={24} style={{ color: accent?.color || '#6366f1' }} strokeWidth={1.6} />
      </div>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{text}</p>
    </motion.div>
  )
}

function SearchField({ value, onChange, placeholder }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{placeholder}</span>
      <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" strokeWidth={1.75} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base h-10 pl-9"
      />
    </label>
  )
}

function FilterPills({ items, value, onChange, accent }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={clsx(
            'h-8 rounded-xl border px-3 text-[11px] font-semibold transition-all active:scale-[0.97]',
            value === item
              ? 'text-white'
              : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-white/[0.1] hover:text-slate-300',
          )}
          style={value === item ? {
            background: accent?.bg || 'rgba(99,102,241,0.18)',
            borderColor: accent?.border || 'rgba(99,102,241,0.35)',
            color: accent?.color || '#a5b4fc',
          } : undefined}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ section, accent, meta, children }) {
  const Icon = meta?.icon || Sparkles
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="relative overflow-hidden rounded-2xl border p-5 dot-grid"
      style={{ borderColor: accent.border, background: `linear-gradient(135deg, ${accent.bg}, rgba(8,14,28,0.85))` }}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl opacity-30"
           style={{ background: accent.color }} />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
               style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
            <Icon size={22} style={{ color: accent.color }} strokeWidth={1.7} />
          </div>
          <div>
            <p className="section-label mb-1.5" style={{ color: accent.color + 'aa' }}>{meta?.kicker}</p>
            <h2 className="text-lg font-black leading-tight text-white">{meta?.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{meta?.description}</p>
          </div>
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </motion.div>
  )
}

// ─── Top-border accent line on cards ──────────────────────────────────────────
function AccentLine({ color }) {
  return (
    <div
      className="absolute left-0 right-0 top-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }}
    />
  )
}

// ─── Campus Pulse ─────────────────────────────────────────────────────────────
const PULSE_TYPES = [
  { id: 'quiet', label: 'Loc linistit',      tone: 'emerald', icon: Moon,     ttl: 120 },
  { id: 'crowd', label: 'E aglomerat',        tone: 'amber',   icon: Users2,   ttl: 75  },
  { id: 'study', label: 'Invatam aici',       tone: 'indigo',  icon: BookOpen, ttl: 180 },
  { id: 'coffee', label: 'Cafea rapida',      tone: 'rose',    icon: Apple,    ttl: 90  },
  { id: 'sport', label: 'Sport',              tone: 'cyan',    icon: Dumbbell, ttl: 150 },
  { id: 'event', label: 'Se intampla acum',   tone: 'violet',  icon: Calendar, ttl: 240 },
]

const PULSE_LOCATIONS = ['Biblioteca', 'Corp A', 'Corp B', 'Cantina', 'Campus', 'Camin', 'Sala de sport']

const PULSE_TONES = {
  emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  amber:   'border-amber-400/20   bg-amber-400/10   text-amber-200',
  indigo:  'border-indigo-400/20  bg-indigo-400/10  text-indigo-200',
  rose:    'border-rose-400/20    bg-rose-400/10    text-rose-200',
  cyan:    'border-cyan-400/20    bg-cyan-400/10    text-cyan-200',
  violet:  'border-violet-400/20  bg-violet-400/10  text-violet-200',
}

function pulseTypeMeta(type) {
  return PULSE_TYPES.find(item => item.id === type) || PULSE_TYPES[2]
}

function minutesUntil(value, now) {
  const end = new Date(value).getTime()
  const diff = Math.max(0, end - now.getTime())
  return Math.max(1, Math.ceil(diff / 60000))
}

const PULSE_LOCAL_KEY = 'sc_pulse_local_v1'

function cleanPulseEvents(items) {
  const now = Date.now()
  return (items || [])
    .filter(event => event?.expiresAt && new Date(event.expiresAt).getTime() > now)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

function readLocalPulseEvents() {
  try {
    return cleanPulseEvents(JSON.parse(localStorage.getItem(PULSE_LOCAL_KEY) || '[]'))
  } catch {
    return []
  }
}

function writeLocalPulseEvents(items) {
  const cleaned = cleanPulseEvents(items).slice(0, 60)
  localStorage.setItem(PULSE_LOCAL_KEY, JSON.stringify(cleaned))
  return cleaned
}

function PulseSection({ lifeProfile }) {
  const now = useNow()
  const accent = SECTION_ACCENTS.pulse
  const [events, setEvents] = useState([])
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [localMode, setLocalMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ type: 'quiet', location: PULSE_LOCATIONS[0], note: '' })

  const selectedType = pulseTypeMeta(form.type)
  const liveEvents = useMemo(() => {
    return events
      .filter(event => new Date(event.expiresAt).getTime() > now.getTime())
      .sort((a, b) => (b.confirmations || 0) - (a.confirmations || 0) || new Date(b.createdAt) - new Date(a.createdAt))
  }, [events, now])

  const topLocations = useMemo(() => {
    const counts = new Map()
    liveEvents.forEach(event => counts.set(event.location, (counts.get(event.location) || 0) + 1))
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
  }, [liveEvents])

  const loadPulse = useCallback(() => {
    setLoading(true)
    socketService.getPulseList()
      .then((response) => {
        setEvents(response.events || [])
        setChannel(response.channel)
        setError('')
      })
      .catch(() => {
        setEvents(readLocalPulseEvents())
        setChannel(null)
        setLocalMode(true)
        setError('')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadPulse()
    socketService.addEventListener('connect', loadPulse)
    socketService.addEventListener('auth', loadPulse)
    return () => {
      socketService.removeEventListener('connect', loadPulse)
      socketService.removeEventListener('auth', loadPulse)
    }
  }, [loadPulse])

  useEffect(() => {
    if (!channel) return undefined
    return socketService.subscribe(channel, (payload) => {
      if (payload?.kind === 'snapshot') setEvents(payload.events || [])
    })
  }, [channel])

  function submitPulse(event) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    socketService.createPulse({
      type: form.type,
      location: form.location,
      note: form.note.trim(),
      ttlMinutes: selectedType.ttl,
    })
      .then((response) => {
        setEvents(response.events || [])
        setChannel(response.channel)
        setForm(current => ({ ...current, note: '' }))
        setError('')
      })
      .catch(() => {
        const createdAt = new Date()
        const localEvent = {
          id: `local-pulse-${createdAt.getTime()}`,
          type: form.type,
          location: form.location,
          note: form.note.trim(),
          createdAt: createdAt.toISOString(),
          expiresAt: new Date(createdAt.getTime() + selectedType.ttl * 60_000).toISOString(),
          authorName: lifeProfile.name || 'Student',
          confirmations: 1,
        }
        setEvents(current => writeLocalPulseEvents([localEvent, ...current]))
        setForm(current => ({ ...current, note: '' }))
        setLocalMode(true)
        setError('')
      })
      .finally(() => setSubmitting(false))
  }

  function confirmPulse(id) {
    if (localMode) {
      setEvents(current => writeLocalPulseEvents(current.map(item => (
        item.id === id ? { ...item, confirmations: (item.confirmations || 0) + 1 } : item
      ))))
      return
    }
    socketService.reactPulse(id, 'confirm')
      .then((response) => setEvents(response.events || []))
      .catch(() => {
        setEvents(current => writeLocalPulseEvents(current.map(item => (
          item.id === id ? { ...item, confirmations: (item.confirmations || 0) + 1 } : item
        ))))
        setLocalMode(true)
        setError('')
      })
  }

  return (
    <section className="space-y-5 pb-24 lg:pb-6">
      <SectionHeader section="pulse" accent={accent} meta={SECTION_META.pulse} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        {/* ── Live feed card ─────────────────────────────────────── */}
        <div className="premium-card overflow-hidden p-0">
          <AccentLine color={accent.color} />

          {/* Header */}
          <div className="border-b border-white/[0.06] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {!localMode && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-40" />}
                  <span className={clsx('relative inline-flex h-2.5 w-2.5 rounded-full', localMode ? 'bg-amber-300' : 'bg-cyan-300')} />
                </span>
                <p className="section-label">Campus Pulse live</p>
                <span className={clsx(
                  'rounded-full border px-2 py-0.5 text-[10px] font-bold',
                  localMode ? 'border-amber-400/20 bg-amber-400/10 text-amber-200' : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
                )}>
                  {localMode ? 'Mod local' : 'Live'}
                </span>
              </div>
              <div className="grid w-full max-w-[300px] grid-cols-3 gap-1.5 rounded-2xl bg-white/[0.025] p-1.5 text-center">
                {[
                  { val: liveEvents.length, label: 'Live' },
                  { val: liveEvents.reduce((s, e) => s + (e.confirmations || 0), 0), label: 'Stats' },
                  { val: topLocations.length, label: 'Zone' },
                ].map(({ val, label }) => (
                  <div key={label} className="rounded-xl px-3 py-2">
                    <p className="font-mono text-lg font-black leading-none text-white">{val}</p>
                    <p className="mt-1 section-label">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feed */}
          {loading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.03]" />
              ))}
            </div>
          ) : liveEvents.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Radio} title="Campusul e tacut momentan" text="Adauga primul semnal live: loc linistit, aglomeratie, studiu, cafea sau sport." accent={accent} />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-white/[0.05]"
            >
              {liveEvents.map((item) => {
                const meta = pulseTypeMeta(item.type)
                const Icon = meta.icon
                return (
                  <motion.article key={item.id} variants={itemVariants} className="p-5 transition-colors hover:bg-white/[0.02]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-3.5">
                        <span className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border', PULSE_TONES[meta.tone])}>
                          <Icon size={18} strokeWidth={1.9} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{meta.label}</h3>
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              <MapPin size={10} /> {item.location}
                            </span>
                          </div>
                          {item.note && <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.note}</p>}
                          <p className="mt-2 font-mono text-xs font-semibold text-slate-600">
                            {item.authorName || 'Student'} · expira in {minutesUntil(item.expiresAt, now)} min
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => confirmPulse(item.id)}
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 text-[11px] font-bold text-emerald-200 transition-all hover:bg-emerald-400/18 active:scale-[0.97]"
                      >
                        <Check size={13} /> Confirm
                        <span className="font-mono text-emerald-100">{item.confirmations || 0}</span>
                      </button>
                    </div>
                  </motion.article>
                )
              })}
            </motion.div>
          )}

          {/* Active zones footer */}
          <div className="border-t border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} style={{ color: accent.color }} />
              <p className="text-sm font-bold text-white">Zone active</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {topLocations.length === 0 ? (
                <p className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-3 text-xs leading-relaxed text-slate-400 sm:col-span-3">
                  Aici vor aparea locurile confirmate de colegi in ultimele ore.
                </p>
              ) : topLocations.map(([location, count]) => (
                <div key={location} className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5">
                  <span className="block truncate text-xs font-bold text-slate-200">{location}</span>
                  <span className="mt-1 block font-mono text-xs font-bold text-slate-400">{count} semnale</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Post form ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <form onSubmit={submitPulse} className="premium-card p-5">
            <AccentLine color={accent.color} />
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
                  <Plus size={16} style={{ color: accent.color }} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Adauga semnal live</p>
                  <p className="text-xs text-slate-500">{localMode ? 'Merge local acum.' : 'Apare instant.'}</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-[12px] font-bold transition-all active:scale-[0.97] disabled:opacity-60"
                style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Publica
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="section-label mb-2 block">Tip semnal</label>
                <div className="grid grid-cols-2 gap-2">
                  {PULSE_TYPES.map((type) => {
                    const Icon = type.icon
                    const active = form.type === type.id
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setForm(c => ({ ...c, type: type.id }))}
                        className={clsx(
                          'flex min-h-9 items-center gap-2 rounded-xl border px-2.5 text-left text-[11px] font-bold transition-all active:scale-[0.97]',
                          active ? PULSE_TONES[type.tone] : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-slate-300',
                        )}
                      >
                        <Icon size={13} /> {type.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <label className="block">
                <span className="section-label mb-2 block">Locatie</span>
                <select
                  value={form.location}
                  onChange={(e) => setForm(c => ({ ...c, location: e.target.value }))}
                  className="input-base h-9"
                >
                  {PULSE_LOCATIONS.map(loc => <option key={loc}>{loc}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="section-label mb-2 block">Detaliu optional</span>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm(c => ({ ...c, note: e.target.value }))}
                  maxLength={160}
                  rows={2}
                  placeholder="Ex: masa mare libera langa geam..."
                  className="input-base resize-none"
                />
              </label>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs font-semibold text-amber-200">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

// ─── Discounts ────────────────────────────────────────────────────────────────
function DiscountsSection({ lifeProfile, saved, savedOps }) {
  const accent = SECTION_ACCENTS.discounts
  const [category, setCategory] = useState('Toate')
  const [query, setQuery] = useState('')
  const now = useNow()

  const offers = useMemo(() => {
    const q = query.toLowerCase()
    return studentLifeData.discounts.offers
      .filter((offer) => category === 'Toate' || offer.category === category)
      .filter((offer) => !q || [offer.brand, offer.category, offer.description].some((f) => f.toLowerCase().includes(q)))
      .map((offer) => {
        const expiryDays = rollingDays(offer.id, 2, 30, now)
        const expiresAt = dateInDays(expiryDays, now)
        return { ...offer, expiryDays: daysUntil(expiresAt, now), score: offerScore(offer, lifeProfile) }
      })
      .sort((a, b) => b.score - a.score)
  }, [category, lifeProfile, now, query])

  return (
    <section className="space-y-5">
      <SectionHeader section="discounts" accent={accent} meta={SECTION_META.discounts} />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Caută oferte, branduri, categorii..." />
        <FilterPills items={studentLifeData.discounts.categories} value={category} onChange={setCategory} accent={accent} />
        <span className="shrink-0 font-mono text-xs font-semibold text-slate-500">{offers.length} rezultate</span>
      </div>

      {saved.size > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-300">
          <Bookmark size={14} />
          {saved.size} {saved.size === 1 ? 'ofertă salvată' : 'oferte salvate'}
        </div>
      )}

      {offers.length === 0 ? (
        <EmptyState icon={Tag} title="Nicio ofertă găsită" text="Încearcă o altă căutare sau categorie." accent={accent} />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3"
        >
          {offers.map((offer) => (
            <motion.article key={offer.id} variants={itemVariants} className="premium-card relative p-5">
              <AccentLine color={accent.color} />
              {offer.popular && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] font-bold text-amber-300">
                  <Sparkles size={10} /> Popular
                </span>
              )}
              <div className="flex items-start gap-3 pr-20">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-lg"
                  style={{ background: offer.color }}
                >
                  {offer.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-white">{offer.brand}</h3>
                  <p className="text-xs text-slate-500">{offer.category} · {offer.city === 'all' ? 'Toate orașele' : offer.city}</p>
                </div>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-relaxed text-slate-400">{offer.description}</p>
              <div className="mt-4 flex items-end justify-between gap-2">
                <div>
                  <span className="text-2xl font-black text-white">-{offer.discount}%</span>
                  <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-slate-500">
                    <Clock size={11} /> Expiră în {offer.expiryDays} {offer.expiryDays === 1 ? 'zi' : 'zile'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {offer.url && (
                    <button
                      onClick={() => window.open(offer.url, '_blank', 'noopener,noreferrer')}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all active:scale-[0.97]"
                      style={{ background: accent.bg, borderColor: accent.border, color: accent.color }}
                    >
                      Accesează <ExternalLink size={11} />
                    </button>
                  )}
                  <button
                    onClick={() => savedOps.toggle(offer.id)}
                    className={clsx(
                      'inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all active:scale-[0.97]',
                      saved.has(offer.id)
                        ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-300'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.14] hover:text-slate-200',
                    )}
                  >
                    <Bookmark size={13} />
                    {saved.has(offer.id) ? 'Salvat' : 'Salvează'}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  )
}

// ─── Career ───────────────────────────────────────────────────────────────────
const CV_API_URL = '/api/career/cv-analyze'

async function extractTextFromPDF(arrayBuffer) {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map(item => item.str).join(' '))
  }
  return pages.join('\n').trim()
}

function CVAnalysisPanel({ allJobs, onAnalysis, cvAnalysis }) {
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const fileRef = useRef(null)

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Fișierul e prea mare. Maxim 5MB.'); return }
    setError('')
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (isPDF) {
      setExtracting(true)
      try {
        const arrayBuffer = await file.arrayBuffer()
        const text = await extractTextFromPDF(arrayBuffer)
        if (text.length > 30) {
          setCvText(text)
        } else {
          setError('Nu am putut extrage text din PDF. Încearcă să copiezi conținutul manual.')
        }
      } catch {
        setError('Eroare la citirea PDF-ului. Încearcă să copiezi conținutul manual.')
      } finally {
        setExtracting(false)
      }
    } else {
      const reader = new FileReader()
      reader.onload = ev => {
        const text = ev.target.result
        if (text && text.trim().length > 30) {
          setCvText(text.trim())
        } else {
          setError('Nu am putut citi textul din fișier.')
        }
      }
      reader.onerror = () => setError('Eroare la citirea fișierului.')
      reader.readAsText(file)
    }
    e.target.value = ''
  }

  const analyze = useCallback(async () => {
    if (cvText.trim().length < 30) { setError('CV-ul e prea scurt. Adaugă mai mult conținut.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(CV_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: cvText.trim(),
          jobs: allJobs.map(j => ({ id: j.id, role: j.role, company: j.company, tags: j.tags, type: j.type })),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Eroare server ${res.status}`)
      }
      const data = await res.json()
      onAnalysis(data)
      setOpen(false)
    } catch (err) {
      setError(err.message || 'Eroare la analiză. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }, [cvText, allJobs, onAnalysis])

  if (cvAnalysis) {
    return (
      <div className="premium-card p-5 space-y-3">
        <AccentLine color="#3b82f6" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/12 border border-blue-500/20">
              <Bot size={14} className="text-blue-400" strokeWidth={1.75} />
            </div>
            <span className="text-sm font-bold text-blue-300">Analiză CV</span>
            <span className="badge-blue">{cvAnalysis.experienceLevel}</span>
          </div>
          <button onClick={() => { onAnalysis(null); setOpen(false) }} className="btn-ghost p-1.5">
            <X size={14} />
          </button>
        </div>
        {cvAnalysis.summary && (
          <p className="text-sm text-slate-400 leading-relaxed">{cvAnalysis.summary}</p>
        )}
        {cvAnalysis.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cvAnalysis.skills.map(skill => (
              <span key={skill} className="badge-blue">{skill}</span>
            ))}
          </div>
        )}
        <button onClick={() => setOpen(true)} className="text-[11px] text-slate-600 hover:text-blue-400 transition-colors underline underline-offset-2">
          Actualizează CV-ul
        </button>
        {open && (
          <div className="pt-3 space-y-3 border-t border-white/[0.06]">
            <textarea
              value={cvText}
              onChange={e => setCvText(e.target.value)}
              rows={5}
              placeholder="Lipește conținutul CV-ului..."
              className="input-base resize-none"
            />
            {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
            <button onClick={analyze} disabled={loading || cvText.trim().length < 30}
              className="btn-primary text-sm h-9 px-4 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Analizez...</> : 'Actualizează'}
            </button>
          </div>
        )}
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="premium-card w-full flex items-center gap-4 p-4 text-left"
      >
        <AccentLine color="#3b82f6" />
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/12 border border-blue-500/20 shrink-0">
          <Bot size={17} className="text-blue-400" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">Analizează CV-ul cu AI</p>
          <p className="text-xs text-slate-500">Potrivire personalizată bazată pe experiența ta reală</p>
        </div>
        <Sparkles size={14} className="text-blue-400 shrink-0" strokeWidth={1.75} />
      </button>
    )
  }

  return (
    <div className="premium-card p-5 space-y-3">
      <AccentLine color="#3b82f6" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/12 border border-blue-500/20">
            <Bot size={14} className="text-blue-400" strokeWidth={1.75} />
          </div>
          <span className="text-sm font-bold text-blue-300">Analizează CV-ul cu AI</span>
        </div>
        <button onClick={() => setOpen(false)} className="btn-ghost p-1.5"><X size={14} /></button>
      </div>
      <p className="text-xs text-slate-500">Încarcă CV-ul ca <span className="text-slate-400">.pdf</span> sau <span className="text-slate-400">.txt</span>, sau lipește textul direct.</p>
      <textarea
        value={cvText}
        onChange={e => { setCvText(e.target.value); setError('') }}
        rows={6}
        placeholder="Lipește conținutul CV-ului tău: educație, experiență, skill-uri, proiecte..."
        className="input-base resize-none"
      />
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={onFile} />
        <button onClick={() => fileRef.current?.click()} disabled={extracting}
          className="btn-secondary text-xs h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed">
          {extracting ? <><Loader2 size={12} className="animate-spin" /> Se citește PDF...</> : <><Upload size={12} /> Încarcă PDF / TXT</>}
        </button>
        <button onClick={analyze} disabled={loading || cvText.trim().length < 30}
          className="btn-primary text-sm h-9 px-4 ml-auto disabled:opacity-50 disabled:cursor-not-allowed">
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Analizez...</>
            : <><FileText size={14} /> Analizează</>}
        </button>
      </div>
    </div>
  )
}

function CareerSection({ lifeProfile, applied, appliedOps }) {
  const accent = SECTION_ACCENTS.career
  const [type, setType] = useState('Toate')
  const [query, setQuery] = useState('')
  const [cvAnalysis, setCvAnalysis] = useState(null)
  const now = useNow()
  const allJobs = studentLifeData.career[lifeProfile.careerKey] || studentLifeData.career.CS

  const cvAdjMap = useMemo(() => {
    if (!cvAnalysis?.jobAdjustments?.length) return {}
    return Object.fromEntries(cvAnalysis.jobAdjustments.map(a => [a.jobId, a]))
  }, [cvAnalysis])

  const jobs = useMemo(() => {
    const q = query.toLowerCase()
    return allJobs
      .filter((job) => type === 'Toate' || job.type === type)
      .filter((job) => !q || [job.role, job.company, ...job.tags].some((f) => f.toLowerCase().includes(q)))
      .map((job) => {
        const cities = job.cities.map(normalizeCity)
        const warnings = []
        if (lifeProfile.year < job.minYear) warnings.push(`Anul ${job.minYear}+`)
        if (!job.remote && !cities.includes('all') && !cities.includes(lifeProfile.city)) warnings.push(job.cities[0])
        const deadlineDays = rollingDays(job.id, 3, 21, now)
        const baseScore = jobMatch(job, lifeProfile)
        const adj = cvAdjMap[job.id]
        const match = adj ? Math.min(99, Math.max(8, baseScore + adj.adjustment)) : baseScore
        return { ...job, deadlineDays, match, cvReason: adj?.reason || null, warnings }
      })
      .filter((job) => job.match >= 20)
      .sort((a, b) => b.match - a.match)
  }, [allJobs, lifeProfile, now, query, type, cvAdjMap])

  return (
    <section className="space-y-5">
      <SectionHeader section="career" accent={accent} meta={SECTION_META.career} />

      <CVAnalysisPanel allJobs={allJobs} onAnalysis={setCvAnalysis} cvAnalysis={cvAnalysis} />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] text-slate-500">
        <Award size={14} className="text-slate-400 shrink-0" strokeWidth={1.75} />
        <span><b className="text-slate-300 font-semibold">{lifeProfile.facultyName}</b> · Anul {lifeProfile.year} · {lifeProfile.city}</span>
        {cvAnalysis && (
          <span className="ml-auto flex items-center gap-1 text-blue-400 text-[11px] font-semibold">
            <Bot size={11} /> Potrivire bazată pe CV
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Caută poziții, companii, skill-uri..." />
        <FilterPills items={JOB_TYPES} value={type} onChange={setType} accent={accent} />
        <span className="shrink-0 font-mono text-xs font-semibold text-slate-500">{jobs.length} poziții</span>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="Nicio poziție găsită" text="Încearcă un alt cuvânt cheie sau tip." accent={accent} />
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          {jobs.map((job) => (
            <motion.article
              key={job.id}
              variants={itemVariants}
              className="premium-card grid grid-cols-1 gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <AccentLine color={accent.color} />
              <div className="flex gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-lg"
                  style={{ background: job.color }}
                >
                  {job.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white">{job.role}</h3>
                  <p className="text-sm text-slate-500">{job.company}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="tag">{job.remote ? 'Remote' : `Fizic · ${job.cities[0]}`}</span>
                    <span className={clsx('tag', job.paid && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300')}>
                      {job.paid ? 'Plătit' : 'Neplătit'}
                    </span>
                    <span className="tag">{job.type}</span>
                    <span className="tag border-sky-500/30 bg-sky-500/10 text-sky-300">
                      Aplică în {job.deadlineDays} zile
                    </span>
                    {job.warnings.map((w) => (
                      <span key={w} className="tag border-amber-500/30 bg-amber-500/10 text-amber-300">{w}</span>
                    ))}
                    {job.cvReason && (
                      <span className="tag border-blue-500/30 bg-blue-500/10 text-blue-300 flex items-center gap-1">
                        <Bot size={10} strokeWidth={1.75} />{job.cvReason}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.tags.map((t) => (
                      <span key={t} className="rounded-lg bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-slate-500">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                <span className={clsx(
                  'rounded-full border px-3 py-1 text-xs font-black',
                  job.match >= 80
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                    : 'border-amber-400/30 bg-amber-400/10 text-amber-300',
                )}>
                  {job.match}% potrivire
                </span>
                <button
                  onClick={() => {
                    if (job.url) window.open(job.url, '_blank', 'noopener,noreferrer')
                    appliedOps.add(job.id)
                  }}
                  disabled={applied.has(job.id)}
                  className={clsx(
                    'inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all active:scale-[0.97] disabled:cursor-default',
                    applied.has(job.id)
                      ? 'bg-emerald-500/12 border border-emerald-500/25 text-emerald-300'
                      : 'btn-primary',
                  )}
                >
                  {applied.has(job.id) && <Check size={14} />}
                  {applied.has(job.id) ? 'Aplicat' : job.url ? 'Aplică →' : 'Aplică'}
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  )
}

// ─── Community ────────────────────────────────────────────────────────────────
function CommunitySection({ lifeProfile, joined, joinedOps }) {
  const accent = SECTION_ACCENTS.community
  const [type, setType] = useState('Toate')
  const [query, setQuery] = useState('')
  const now = useNow()

  const groups = useMemo(() => {
    const q = query.toLowerCase()
    return studentLifeData.community.groups
      .filter((group) => type === 'Toate' || group.type === type)
      .filter((group) => !q || [group.name, group.type, group.description, ...group.interests].some((f) => f.toLowerCase().includes(q)))
      .map((group) => {
        const shared = group.interests.filter((i) => lifeProfile.interests.includes(i))
        return { ...group, shared, event: eventTiming(group.id, now), score: shared.length * 15 + group.members }
      })
      .sort((a, b) => b.score - a.score)
  }, [lifeProfile.interests, now, query, type])

  return (
    <section className="space-y-5">
      <SectionHeader section="community" accent={accent} meta={SECTION_META.community} />

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="section-label mb-3">Alătură-te rapid după activitate</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {studentLifeData.community.activities.map((activity) => (
            <button
              key={activity}
              onClick={() => setQuery(activity.split(' ')[0].toLowerCase())}
              className="chip shrink-0"
            >
              {activity}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Caută grupuri, activități, interese..." />
        <FilterPills items={GROUP_TYPES} value={type} onChange={setType} accent={accent} />
        <span className="shrink-0 font-mono text-xs font-semibold text-slate-500">{groups.length} grupuri</span>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={Users} title="Niciun grup găsit" text="Încearcă o activitate sau tip mai general." accent={accent} />
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {groups.map((group) => (
            <motion.article key={group.id} variants={itemVariants} className="premium-card p-5">
              <AccentLine color={accent.color} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="rounded-lg border px-2 py-0.5 text-[11px] font-bold"
                      style={{ background: accent.bg, borderColor: accent.border, color: accent.color }}
                    >
                      {group.type}
                    </span>
                    {group.shared.length > 0 && (
                      <span className="badge-green">
                        <Check size={10} /> {group.shared.length} interese comune
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white">{group.name}</h3>
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                  <Users size={12} /> {group.members}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{group.description}</p>
              <p className="mt-3 flex items-center gap-1 font-mono text-xs font-semibold text-slate-600">
                <Clock size={11} /> {group.event.label}
              </p>
              <div className="gradient-separator mt-4 mb-4" />
              <div className="flex items-center justify-between gap-2">
                <span className={clsx('text-xs font-semibold', group.open ? 'text-slate-500' : 'text-amber-400')}>
                  {group.open ? 'Grup deschis' : 'Grup plin'}
                </span>
                <div className="flex items-center gap-2">
                  {group.url && (
                    <button
                      onClick={() => window.open(group.url, '_blank', 'noopener,noreferrer')}
                      className="btn-secondary h-8 px-3 text-[11px]"
                    >
                      Site <ExternalLink size={11} />
                    </button>
                  )}
                  <button
                    onClick={() => group.open && joinedOps.add(group.id)}
                    disabled={!group.open || joined.has(group.id)}
                    className={clsx(
                      'h-8 rounded-xl border px-3 text-[11px] font-bold transition-all active:scale-[0.97] disabled:cursor-default',
                      joined.has(group.id)
                        ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-300'
                        : !group.open
                          ? 'border-white/[0.05] bg-white/[0.02] text-slate-600'
                          : 'text-white',
                    )}
                    style={!joined.has(group.id) && group.open ? {
                      background: accent.bg,
                      borderColor: accent.border,
                      color: accent.color,
                    } : undefined}
                  >
                    {joined.has(group.id) ? 'Alăturat' : group.open ? 'Cere acces' : 'Indisponibil'}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  )
}

// ─── Events ───────────────────────────────────────────────────────────────────
const EVENT_CATEGORIES = ['Toate', 'Tech', 'Cariera', 'Stiinta', 'Social', 'Antreprenoriat']

function EventsSection({ going, goingOps }) {
  const accent = SECTION_ACCENTS.events
  const [category, setCategory] = useState('Toate')
  const [query, setQuery] = useState('')
  const now = useNow()

  const events = useMemo(() => {
    const q = query.toLowerCase()
    return eventsData
      .filter(e => category === 'Toate' || e.category === category)
      .filter(e => !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [category, query])

  return (
    <section className="space-y-5">
      <SectionHeader section="events" accent={accent} meta={SECTION_META.events} />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Caută evenimente, locații..." />
        <FilterPills items={EVENT_CATEGORIES} value={category} onChange={setCategory} accent={accent} />
        <span className="shrink-0 font-mono text-xs font-semibold text-slate-500">{events.length} evenimente</span>
      </div>

      {events.length === 0 ? (
        <EmptyState icon={Calendar} title="Niciun eveniment găsit" text="Încearcă o altă categorie sau cuvânt cheie." accent={accent} />
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {events.map(ev => {
            const d = new Date(ev.date)
            const isGoing = going.has(ev.id)
            const daysLeft = Math.ceil((d - now) / 86400000)
            const isUpcoming = daysLeft >= 0 && daysLeft <= 7

            return (
              <motion.article key={ev.id} variants={itemVariants} className="premium-card overflow-hidden">
                {/* Color top border matching event color */}
                <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${ev.color}80, transparent)` }} />

                <div className="flex gap-4 p-5">
                  {/* Date block */}
                  <div
                    className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-center"
                    style={{ background: ev.color + '18', border: `1px solid ${ev.color}30` }}
                  >
                    <span className="font-mono text-2xl font-black leading-none text-white">{d.getDate()}</span>
                    <span className="mt-0.5 text-[10px] font-bold uppercase" style={{ color: ev.color }}>
                      {d.toLocaleString('ro', { month: 'short' })}
                    </span>
                    <span className="mt-0.5 font-mono text-[10px] text-slate-500">{ev.time}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: ev.color + '22', color: ev.color }}
                        >
                          {ev.category}
                        </span>
                        {isUpcoming && (
                          <span className="badge-amber">
                            <Zap size={9} /> {daysLeft === 0 ? 'Azi' : `${daysLeft}z`}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-sm leading-tight">{ev.title}</h3>
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <MapPin size={10} /> {ev.location}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{ev.description}</p>

                    <div className="gradient-separator mt-3 mb-3" />

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-600">{ev.going + (isGoing ? 1 : 0)} merg</span>
                      <div className="flex items-center gap-2">
                        {ev.url && (
                          <button
                            onClick={() => window.open(ev.url, '_blank', 'noopener,noreferrer')}
                            className="btn-secondary h-8 px-3 text-[11px]"
                          >
                            Detalii <ExternalLink size={10} />
                          </button>
                        )}
                        <button
                          onClick={() => goingOps.toggle(ev.id)}
                          className={clsx(
                            'h-8 rounded-xl border px-3 text-[11px] font-bold transition-all active:scale-[0.97]',
                            isGoing
                              ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-300'
                              : 'text-white',
                          )}
                          style={!isGoing ? {
                            background: accent.bg,
                            borderColor: accent.border,
                            color: accent.color,
                          } : undefined}
                        >
                          {isGoing ? <><Check size={11} className="inline mr-1" />Merg</> : 'Merg'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      )}
    </section>
  )
}

// ─── Wellness — Pomodoro ───────────────────────────────────────────────────────
function PomodoroTimer() {
  const accent = SECTION_ACCENTS.wellness
  const [mode, setMode] = useState('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)

  const DURATIONS = { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 }
  const LABELS    = { work: 'Focus', shortBreak: 'Pauză scurtă', longBreak: 'Pauză lungă' }

  function startStop(shouldRun) {
    if (shouldRun) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setRunning(false)
            clearInterval(intervalRef.current)
            if (mode === 'work') setSessions(s => s + 1)
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
  }

  function switchMode(m) {
    clearInterval(intervalRef.current)
    setMode(m)
    setTimeLeft(DURATIONS[m])
    setRunning(false)
  }

  function handleToggle() {
    const next = !running
    setRunning(next)
    startStop(next)
  }

  function handleReset() {
    clearInterval(intervalRef.current)
    setTimeLeft(DURATIONS[mode])
    setRunning(false)
  }

  const mins     = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs     = String(timeLeft % 60).padStart(2, '0')
  const progress = 1 - timeLeft / DURATIONS[mode]
  const circumference = 2 * Math.PI * 45

  return (
    <div className="premium-card p-6 text-center">
      <AccentLine color={accent.color} />
      <h3 className="text-sm font-bold text-white mb-4">Timer Pomodoro</h3>

      {/* Mode selector */}
      <div className="flex justify-center gap-1 mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {Object.entries(LABELS).map(([m, l]) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={clsx(
              'flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all',
              mode === m ? 'text-white' : 'text-slate-500 hover:text-slate-300',
            )}
            style={mode === m ? { background: accent.bg, color: accent.color } : undefined}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative w-36 h-36 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={accent.color} strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-black tabular-nums text-white">{mins}:{secs}</span>
          <span className="mt-0.5 text-[10px] font-semibold text-slate-500">{LABELS[mode]}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={handleReset} className="btn-ghost p-2">
          <RotateCcw size={15} />
        </button>
        <button
          onClick={handleToggle}
          className="flex h-12 w-12 items-center justify-center rounded-full transition-all active:scale-95"
          style={{ background: accent.color, boxShadow: `0 0 20px ${accent.color}50` }}
        >
          {running
            ? <Pause size={18} className="text-white" />
            : <Play size={18} className="text-white ml-0.5" />
          }
        </button>
      </div>

      <p className="font-mono text-xs text-slate-600 mt-4">{sessions} sesiuni completate azi</p>
    </div>
  )
}

// ─── Wellness — Focus Forest ───────────────────────────────────────────────────
const SECS_PER_DIGIT = 12

function FocusForest() {
  const [mode, setMode] = useState('timer')
  const [minutes, setMinutes] = useState(25)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [failed, setFailed] = useState(false)
  const [justRevealed, setJustRevealed] = useState(false)
  const [completed, setCompleted] = useState(() => {
    try { return Number(localStorage.getItem('sc_focus_trees') || 0) } catch { return 0 }
  })
  const [bestDigits, setBestDigits] = useState(() => {
    try { return Number(localStorage.getItem('sc_pi_best') || 2) } catch { return 2 }
  })
  const intervalRef    = useRef(null)
  const prevDigitsRef  = useRef(2)
  const targetSeconds  = Math.max(1, minutes) * 60
  const hasTimer       = mode === 'timer'
  const progress       = hasTimer ? Math.min(1, elapsed / targetSeconds) : (elapsed % SECS_PER_DIGIT) / SECS_PER_DIGIT

  const revealedDecimals = Math.min(PI_DECIMALS.length, 2 + Math.floor(elapsed / SECS_PER_DIGIT))

  useEffect(() => {
    if (revealedDecimals > prevDigitsRef.current) {
      prevDigitsRef.current = revealedDecimals
      setJustRevealed(true)
      const t = setTimeout(() => setJustRevealed(false), 800)
      return () => clearTimeout(t)
    }
  }, [revealedDecimals])

  function saveBest(value) {
    if (value > bestDigits) {
      setBestDigits(value)
      localStorage.setItem('sc_pi_best', String(value))
    }
  }

  useEffect(() => {
    if (!running) return undefined
    intervalRef.current = setInterval(() => {
      setElapsed(value => {
        const next = value + 1
        if (hasTimer && next >= targetSeconds) {
          clearInterval(intervalRef.current)
          setRunning(false)
          setCompleted(total => {
            const saved = total + 1
            localStorage.setItem('sc_focus_trees', String(saved))
            return saved
          })
          return targetSeconds
        }
        return next
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, hasTimer, targetSeconds])

  useEffect(() => {
    function failSession() {
      if (!running) return
      clearInterval(intervalRef.current)
      setRunning(false)
      setFailed(true)
      saveBest(revealedDecimals)
      setElapsed(0)
      prevDigitsRef.current = 2
    }
    function handleVisibility() { if (document.hidden) failSession() }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', failSession)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', failSession)
    }
  }, [running, revealedDecimals])

  function switchMode(nextMode) {
    if (running) return
    setMode(nextMode)
    setElapsed(0)
    setFailed(false)
    prevDigitsRef.current = 2
  }

  function start() {
    setElapsed(0)
    setFailed(false)
    setRunning(true)
    prevDigitsRef.current = 2
  }

  function stop() {
    clearInterval(intervalRef.current)
    setRunning(false)
    saveBest(revealedDecimals)
  }

  function reset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setFailed(false)
    saveBest(revealedDecimals)
    setElapsed(0)
    prevDigitsRef.current = 2
  }

  const remaining       = Math.max(0, targetSeconds - elapsed)
  const displaySeconds  = hasTimer ? remaining : elapsed
  const mins            = String(Math.floor(displaySeconds / 60)).padStart(2, '0')
  const secs            = String(displaySeconds % 60).padStart(2, '0')
  const visibleStr      = PI_DECIMALS.slice(0, revealedDecimals)
  const hiddenStr       = PI_DECIMALS.slice(revealedDecimals, revealedDecimals + 42)
  const groups          = []
  for (let i = 0; i < visibleStr.length; i += 5) groups.push(visibleStr.slice(i, i + 5))

  const maxPossible  = hasTimer ? Math.min(PI_DECIMALS.length, 2 + Math.floor(targetSeconds / SECS_PER_DIGIT)) : PI_DECIMALS.length
  const nextDigitIn  = SECS_PER_DIGIT - (elapsed % SECS_PER_DIGIT)
  const modeCopy     = hasTimer
    ? { eyebrow: 'sesiune cronometrata', title: 'Creste sirul lui pi in reprize clare.', metric: Math.round((elapsed / targetSeconds) * 100) + '% din sesiune' }
    : { eyebrow: 'fara limita', title: 'Stai cat vrei si impinge recordul cat mai departe.', metric: 'urmatoarea cifra in ' + nextDigitIn + 's' }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080d18] shadow-[0_22px_80px_-42px_rgba(0,0,0,0.9)]">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px]">
        {/* ── Main pi panel ─────────────────────────────────────── */}
        <div className="relative min-h-[360px] overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.18),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(124,58,237,0.24),transparent_34%),linear-gradient(135deg,#090f1c,#111827_55%,#07111f)] p-6 xl:border-b-0 xl:border-r dot-grid">
          <div className="pointer-events-none absolute -right-10 -top-16 select-none text-[210px] font-black leading-none text-white/[0.035]">π</div>
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-label text-teal-200/70">π Focus · {modeCopy.eyebrow}</p>
              <h3 className="mt-2 max-w-xl text-2xl font-black tracking-tight text-white">{modeCopy.title}</h3>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-right backdrop-blur">
              <p className="font-mono text-2xl font-black tabular-nums text-white">{mins}:{secs}</p>
              <p className="mt-0.5 section-label">{hasTimer ? 'ramas' : 'focus total'}</p>
            </div>
          </div>

          <div className="relative z-10 mt-10 rounded-2xl border border-white/[0.08] bg-black/20 p-5 backdrop-blur-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[11px] font-bold text-teal-100">
                <Sparkles size={12} /> {revealedDecimals} zecimale descoperite
              </div>
              <span className="font-mono text-xs font-semibold text-slate-500">{modeCopy.metric}</span>
            </div>
            <div className="font-mono leading-loose break-words">
              <span className="text-3xl font-black text-teal-200">3.</span>
              <span className="text-xl font-bold text-white">
                {groups.map((group, gi) => (
                  <span key={gi} className="mr-2 inline-block">
                    {group.split('').map((digit, di) => {
                      const isLast = gi === groups.length - 1 && di === group.length - 1
                      return (
                        <span
                          key={di}
                          className={clsx(
                            'transition-all duration-300',
                            isLast && justRevealed
                              ? 'text-emerald-200 drop-shadow-[0_0_12px_rgba(110,231,183,0.95)]'
                              : isLast
                              ? 'text-teal-200'
                              : 'text-white',
                          )}
                        >
                          {digit}
                        </span>
                      )
                    })}
                  </span>
                ))}
              </span>
              {hiddenStr && <span className="text-base text-slate-700 select-none">{'?'.repeat(hiddenStr.length)}...</span>}
            </div>
          </div>

          <div className="relative z-10 mt-6">
            <div className="mb-2 flex justify-between section-label">
              <span>3.14</span>
              <span>{hasTimer ? Math.round(progress * 100) + '%' : 'cifra urmatoare'}</span>
              <span>{hasTimer ? maxPossible + ' zec. posibile' : 'fara limita practica'}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-300 transition-all duration-1000"
                style={{ width: (progress * 100) + '%' }}
              />
            </div>
          </div>
        </div>

        {/* ── Control panel ─────────────────────────────────────── */}
        <div className="p-5 space-y-4">
          <p className="section-label">control sesiune</p>

          {/* Timer / endless toggle */}
          <div className="grid grid-cols-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-1">
            {[['timer', 'Cu timer'], ['endless', 'Fara timer']].map(([value, label]) => (
              <button
                key={value}
                onClick={() => switchMode(value)}
                disabled={running}
                className={clsx(
                  'h-9 rounded-xl text-xs font-bold transition-all disabled:cursor-default',
                  mode === value ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Duration presets */}
          {hasTimer && (
            <div className="grid grid-cols-3 gap-2">
              {[15, 25, 45].map(v => (
                <button
                  key={v}
                  onClick={() => !running && setMinutes(v)}
                  disabled={running}
                  className={clsx(
                    'h-10 rounded-xl border text-xs font-bold transition-all active:scale-[0.97] disabled:cursor-default',
                    minutes === v
                      ? 'border-teal-300/30 bg-teal-300/12 text-teal-100'
                      : 'border-white/[0.06] bg-white/[0.03] text-slate-500 hover:text-slate-300',
                  )}
                >
                  {v} min
                </button>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3">
            <p className="text-xs font-semibold leading-relaxed text-slate-400">
              O cifra noua apare la fiecare <span className="font-bold text-teal-200">{SECS_PER_DIGIT}s</span>. Daca schimbi tabul sau pierzi focusul ferestrei, sesiunea se opreste.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-black/20 p-3">
                <p className="section-label">Record</p>
                <p className="mt-1 font-mono text-xl font-black text-white">{bestDigits}</p>
              </div>
              <div className="rounded-xl bg-black/20 p-3">
                <p className="section-label">Sesiuni</p>
                <p className="mt-1 font-mono text-xl font-black text-white">{completed}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={running ? stop : start}
              className={clsx(
                'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all active:scale-[0.97]',
                running
                  ? 'border border-red-500/30 bg-red-500/10 text-red-300'
                  : 'border border-teal-300/30 bg-teal-400/15 text-teal-100',
              )}
            >
              {running ? <X size={15} /> : <Sprout size={15} />}
              {running ? 'Opreste' : 'Porneste'}
            </button>
            <button onClick={reset} className="btn-ghost h-11 px-3">
              <RotateCcw size={15} />
            </button>
          </div>

          {failed && (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200">
              Sesiunea a fost intrerupta — fereastra nu a mai fost activa.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Wellness section ─────────────────────────────────────────────────────────
const WELLNESS_ICONS = {
  brain:    Brain,
  sleep:    Moon,
  movement: Dumbbell,
  food:     Apple,
  phone:    Smartphone,
  support:  HandHeart,
}

function WellnessSection() {
  const accent = SECTION_ACCENTS.wellness
  return (
    <section className="space-y-6">
      <SectionHeader section="wellness" accent={accent} meta={SECTION_META.wellness} />
      <FocusForest />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <PomodoroTimer />
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                 style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
              <Heart size={13} style={{ color: accent.color }} strokeWidth={1.8} />
            </div>
            <h3 className="text-sm font-bold text-white">Sfaturi de Wellbeing</h3>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {wellnessData.tips.map(tip => {
              const Icon = WELLNESS_ICONS[tip.icon] || Heart
              return (
                <motion.div key={tip.id} variants={itemVariants} className="premium-card flex gap-3.5 p-4">
                  <AccentLine color={accent.color} />
                  <div
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
                  >
                    <Icon size={15} style={{ color: accent.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{tip.title}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tip.body}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Tools ────────────────────────────────────────────────────────────────────
const TOOLS_TABS = [
  {
    id: 'Budget',
    label: 'Budget',
    icon: Wallet,
    title: 'Plan lunar',
    description: 'Completezi cheltuielile pe categorii si vezi imediat abaterea fata de media studentilor.',
    hint: 'Introdu sume in RON/luna. Bara rosie inseamna peste medie, bara indigo inseamna in zona normala.',
    stat: '6 categorii',
  },
  {
    id: 'Carti',
    label: 'Carti',
    icon: BookOpen,
    title: 'Schimb de carti',
    description: 'Cauti cursuri, manuale sau culegeri disponibile la colegi.',
    hint: 'Filtreaza dupa titlu, materie sau tip: donatie ori vanzare.',
    stat: `${booksData.length} anunturi`,
  },
  {
    id: 'Carpool',
    label: 'Carpool',
    icon: Car,
    title: 'Drumuri comune',
    description: 'Gasesti curse intre oras, campus si localitati apropiate.',
    hint: 'Cauta destinatia, verifica locurile libere si contacteaza soferul pe Telegram.',
    stat: `${carpoolData.length} curse`,
  },
  {
    id: 'Colegi camera',
    label: 'Colegi camera',
    icon: Users2,
    title: 'Coleg de camera',
    description: 'Compari buget, zona, program si preferinte inainte sa contactezi persoana.',
    hint: 'Cauta dupa zona sau facultate, apoi foloseste tag-urile pentru compatibilitate rapida.',
    stat: `${roommateData.length} profiluri`,
  },
]

function BudgetTab() {
  const accent = SECTION_ACCENTS.tools
  const CATEGORIES = ['Cazare', 'Mâncare', 'Transport', 'Cursuri', 'Distracție', 'Diverse']
  const AVERAGES   = { Cazare: 800, Mâncare: 400, Transport: 100, Cursuri: 150, Distracție: 200, Diverse: 100 }

  const [budget, setBudget] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('sc_budget') || '{}')
      const sanitized = {}
      for (const [k, v] of Object.entries(raw)) {
        const n = Number(v)
        if (!isNaN(n) && n >= 0) sanitized[k] = n
      }
      return sanitized
    } catch { return {} }
  })

  function updateBudget(cat, val) {
    const parsed = Number(val)
    const num = val === '' ? null : isNaN(parsed) ? null : Math.max(0, parsed)
    const next = { ...budget, [cat]: num }
    setBudget(next)
    localStorage.setItem('sc_budget', JSON.stringify(next))
  }

  function resetBudget() {
    setBudget({})
    localStorage.removeItem('sc_budget')
  }

  const total    = CATEGORIES.reduce((s, c) => s + (budget[c] ?? 0), 0)
  const avgTotal = Object.values(AVERAGES).reduce((s, v) => s + v, 0)
  const diff     = total - avgTotal

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="premium-card flex items-center justify-between p-5">
        <AccentLine color={accent.color} />
        <div>
          <p className="section-label mb-1">Total lunar</p>
          <p className="font-mono text-3xl font-black text-white">{total} <span className="text-lg text-slate-400">RON</span></p>
          {total > 0 && (
            <p className={clsx('mt-1 text-xs font-semibold', diff > 0 ? 'text-red-400' : 'text-emerald-400')}>
              {diff > 0 ? `+${diff} față de medie` : `${diff} față de medie`}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="section-label mb-1">Medie studenți Iași</p>
          <p className="font-mono text-xl font-bold text-slate-400">{avgTotal} RON</p>
          <button onClick={resetBudget} className="mt-2 flex items-center gap-1 text-[11px] text-slate-600 hover:text-red-400 transition-colors ml-auto">
            <Trash2 size={11} /> Resetează
          </button>
        </div>
      </div>

      {/* Categories */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
        {CATEGORIES.map(cat => {
          const val = budget[cat] ?? null
          const pct = val !== null ? Math.min(100, (val / AVERAGES[cat]) * 100) : 0
          const over = val !== null && val > AVERAGES[cat]
          return (
            <motion.div key={cat} variants={itemVariants} className="premium-card p-4">
              <AccentLine color={over ? '#f43f5e' : accent.color} />
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">{cat}</span>
                <span className="font-mono text-xs text-slate-500">Medie: {AVERAGES[cat]} RON</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={val ?? ''}
                  onChange={e => updateBudget(cat, e.target.value)}
                  placeholder={String(AVERAGES[cat])}
                  className="input-base h-9 w-28 text-sm"
                />
                <span className="font-mono text-xs text-slate-600">RON/lună</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.05]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: over ? '#f43f5e' : accent.color,
                    }}
                  />
                </div>
                {val !== null && val !== AVERAGES[cat] && (
                  <span className={clsx('font-mono text-[11px] font-semibold shrink-0', over ? 'text-red-400' : 'text-emerald-400')}>
                    {over ? `+${val - AVERAGES[cat]}` : `-${AVERAGES[cat] - val}`}
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

function BooksTab() {
  const accent = SECTION_ACCENTS.discounts
  const [query, setQuery] = useState('')
  const [type, setType]   = useState('Toate')
  const books = booksData.filter(b =>
    (type === 'Toate' || b.type === type) &&
    (!query || b.title.toLowerCase().includes(query.toLowerCase()) || b.subject.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchField value={query} onChange={setQuery} placeholder="Caută titlu, materie..." />
        <FilterPills items={['Toate', 'donez', 'vând']} value={type} onChange={setType} accent={accent} />
      </div>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
        {books.map(b => (
          <motion.div key={b.id} variants={itemVariants} className="premium-card flex items-center gap-4 p-4">
            <AccentLine color={accent.color} />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                 style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
              <BookOpen size={16} style={{ color: accent.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{b.title}</p>
              <p className="text-xs text-slate-500">{b.subject} · An {b.yearNeeded} · {b.condition}</p>
              <p className="font-mono text-xs text-slate-600 mt-0.5">Oferit de {b.contact}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={clsx('font-mono text-sm font-bold', b.price === 0 ? 'text-emerald-400' : 'text-white')}>
                {b.price === 0 ? 'Gratuit' : `${b.price} RON`}
              </p>
              <span className={clsx(
                'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold',
                b.type === 'donez' ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/12 text-amber-400 border border-amber-500/20',
              )}>
                {b.type === 'donez' ? 'Donez' : 'Vând'}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function CarpoolTab() {
  const accent = SECTION_ACCENTS.tools
  const [query, setQuery] = useState('')
  const rides = carpoolData.filter(r =>
    !query || r.from.toLowerCase().includes(query.toLowerCase()) || r.to.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <div className="space-y-4">
      <SearchField value={query} onChange={setQuery} placeholder="Caută destinație..." />
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
        {rides.map(r => (
          <motion.div key={r.id} variants={itemVariants} className="premium-card p-5">
            <AccentLine color={accent.color} />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{r.from}</span>
                <ChevronRight size={14} className="text-slate-600" />
                <span className="text-sm font-bold text-white">{r.to}</span>
              </div>
              {r.verified && <span className="badge-green"><Check size={9} /> Verificat</span>}
            </div>
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-slate-500 mb-3">
              <span>{r.date} · {r.time}</span>
              <span>{r.seats} {r.seats === 1 ? 'loc' : 'locuri'} libere</span>
              <span>Șofer: {r.driver}</span>
            </div>
            <div className="gradient-separator mb-3" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-xl font-black text-white">
                {r.pricePerPerson} RON <span className="text-xs font-normal text-slate-500">/ persoană</span>
              </span>
              <button
                onClick={() => window.open(`https://t.me/${r.contact.replace('@', '')}`, '_blank', 'noopener,noreferrer')}
                className="h-9 px-4 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
                style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
              >
                Contactează {r.contact}
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function RoommateTab() {
  const accent = SECTION_ACCENTS.community
  const [query, setQuery] = useState('')
  const people = roommateData.filter(r =>
    !query || r.zone.toLowerCase().includes(query.toLowerCase()) || r.faculty.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <div className="space-y-4">
      <SearchField value={query} onChange={setQuery} placeholder="Caută zonă, facultate..." />
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {people.map(r => (
          <motion.div key={r.id} variants={itemVariants} className="premium-card p-5">
            <AccentLine color={accent.color} />
            <div className="flex items-start gap-3 mb-3">
              <div
                className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${accent.color}, #8b5cf6)` }}
              >
                {r.name.split(' ').map(w => w[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{r.name}</p>
                <p className="text-xs text-slate-500">{r.faculty} · An {r.year}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{r.bio}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="tag">{r.zone}</span>
              <span className="tag">{r.budget}</span>
              <span className="tag">{r.schedule}</span>
              {!r.smoking && <span className="tag">Non-fumător</span>}
              {r.pets && <span className="tag">Animale ok</span>}
            </div>
            <div className="gradient-separator mt-4 mb-4" />
            <button
              onClick={() => window.open(`https://t.me/${r.contact.replace('@', '')}`, '_blank', 'noopener,noreferrer')}
              className="w-full h-9 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
              style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
            >
              Contactează {r.contact}
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function ToolsSection() {
  const accent = SECTION_ACCENTS.tools
  const [toolTab, setToolTab] = useState('Budget')
  const activeTool = TOOLS_TABS.find(t => t.id === toolTab) || TOOLS_TABS[0]
  const ActiveIcon = activeTool.icon

  return (
    <section className="space-y-5">
      <SectionHeader section="tools" accent={accent} meta={SECTION_META.tools} />

      {/* Tool selector grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS_TABS.map(tool => {
          const Icon   = tool.icon
          const active = toolTab === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => setToolTab(tool.id)}
              className={clsx(
                'rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]',
                active
                  ? 'shadow-[0_18px_45px_-30px_rgba(99,102,241,0.8)]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]',
              )}
              style={active ? {
                background: accent.bg,
                borderColor: accent.border,
              } : undefined}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: active ? accent.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? accent.border : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <Icon size={16} style={{ color: active ? accent.color : undefined }} className={!active ? 'text-slate-500' : undefined} />
                </span>
                <span className="rounded-full border border-white/[0.07] bg-black/20 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500">
                  {tool.stat}
                </span>
              </div>
              <p className="text-sm font-bold text-white">{tool.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{tool.description}</p>
            </button>
          )
        })}
      </div>

      {/* Active tool hint bar */}
      <div className="premium-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <AccentLine color={accent.color} />
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
          >
            <ActiveIcon size={17} style={{ color: accent.color }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{activeTool.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{activeTool.hint}</p>
          </div>
        </div>
        <span className="w-fit rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-[11px] font-bold text-slate-500 shrink-0">
          Date locale în browser
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={toolTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        >
          {toolTab === 'Budget'       && <BudgetTab />}
          {toolTab === 'Carti'        && <BooksTab />}
          {toolTab === 'Carpool'      && <CarpoolTab />}
          {toolTab === 'Colegi camera' && <RoommateTab />}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function StudentLifeHub({ activeSection = 'discounts', profile, session }) {
  const [saved,  savedOps]  = useStoredSet('sc_saved_v2')
  const [applied, appliedOps] = useStoredSet('sc_applied_v2')
  const [joined, joinedOps] = useStoredSet('sc_joined_v2')
  const [going,  goingOps]  = useStoredSet('sc_going_v1')
  const lifeProfile = useMemo(() => buildLifeProfile(profile, session), [profile, session])
  const theme = getUniversityTheme(session?.university)

  return (
    <motion.div
      key={activeSection}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="space-y-6 p-4 sm:p-6"
    >
      {activeSection === 'pulse'     && <PulseSection     lifeProfile={lifeProfile} />}
      {activeSection === 'discounts' && <DiscountsSection lifeProfile={lifeProfile} saved={saved} savedOps={savedOps} />}
      {activeSection === 'career'    && <CareerSection    lifeProfile={lifeProfile} applied={applied} appliedOps={appliedOps} />}
      {activeSection === 'community' && <CommunitySection lifeProfile={lifeProfile} joined={joined} joinedOps={joinedOps} />}
      {activeSection === 'events'    && <EventsSection    going={going} goingOps={goingOps} />}
      {activeSection === 'wellness'  && <WellnessSection />}
      {activeSection === 'tools'     && <ToolsSection />}
    </motion.div>
  )
}
