import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import {
  Award,
  Apple,
  Bookmark,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
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
} from 'lucide-react'
import { eventsData, booksData, carpoolData, roommateData, wellnessData, facultyCareerKeys, studentLifeData } from './studentLifeData'
import { getUniversityTheme } from '../../shared/utils/theme'
import { dateInDays, daysUntil, eventTiming, rollingDays } from '../../shared/utils/dateTime'
import { useNow } from '../../shared/hooks/useNow'
import { PI_DECIMALS } from '../../shared/data/piDigits'

const SECTION_META = {
  discounts: {
    label: 'Reduceri & Beneficii',
    kicker: 'Beneficii Studențești',
    title: 'Oferte adaptate orașului și vieții de campus.',
    description: 'Restaurante, transport, abonamente, librării, săli de sport, cafenele și beneficii locale verificate.',
  },
  career: {
    label: 'Carieră & Internship-uri',
    kicker: 'Oportunități pe Facultate',
    title: 'Internship-uri și roluri pentru profilul tău.',
    description: 'Recomandările folosesc facultatea, anul, orașul, interesele și contextul tău academic.',
  },
  community: {
    label: 'Comunitate',
    kicker: 'Integrare Socială',
    title: 'Găsește grupuri, întâlniri, mentorat și comunități de adaptare.',
    description: 'Alătură-te grupurilor conectate la interesele, facultatea și orașul tău.',
  },
  events: {
    label: 'Evenimente',
    kicker: 'Viața de Campus',
    title: 'Ce se întâmplă în campusul tău.',
    description: 'Concerte, hackathoane, cariere, sport, cultură — toate evenimentele studențești într-un loc.',
  },
  wellness: {
    label: 'Wellness',
    kicker: 'Sănătate & Echilibru',
    title: 'Ai grijă de tine, nu doar de note.',
    description: 'Resurse de sănătate mentală, sfaturi de wellbeing și timer Pomodoro integrat.',
  },
  tools: {
    label: 'Unelte Studențești',
    kicker: 'Tools Practice',
    title: 'Tot ce-ți trebuie ca student.',
    description: 'Budget tracker, schimb de cărți, carpool și găsit colegi de cameră.',
  },
}

const JOB_TYPES = ['Toate', 'Internship', 'Cercetare', 'Voluntariat']
const GROUP_TYPES = ['Toate', 'Sport', 'Tech', 'Social', 'Studiu', 'Gaming', 'Outdoor']

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

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="glass-card border-dashed p-10 text-center">
      <Icon size={30} className="mx-auto mb-3 text-slate-500" />
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{text}</p>
    </div>
  )
}

function SearchField({ value, onChange, placeholder }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{placeholder}</span>
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" strokeWidth={1.75} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-9 pr-3 text-[13px] font-medium text-slate-300 outline-none transition-colors placeholder:text-slate-700 focus:border-white/[0.14] hover:bg-white/[0.05]"
      />
    </label>
  )
}

function FilterPills({ items, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={clsx(
            'h-9 rounded-xl border px-3 text-[11px] font-semibold transition-all active:scale-[0.98]',
            value === item
              ? 'border-indigo-500/40 bg-indigo-600/20 text-indigo-300'
              : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-white/[0.1] hover:text-slate-300',
          )}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

function DiscountsSection({ lifeProfile, saved, savedOps }) {
  const [category, setCategory] = useState('Toate')
  const [query, setQuery] = useState('')
  const now = useNow()

  const offers = useMemo(() => {
    const q = query.toLowerCase()
    return studentLifeData.discounts.offers
      .filter((offer) => category === 'Toate' || offer.category === category)
      .filter((offer) => !q || [offer.brand, offer.category, offer.description].some((field) => field.toLowerCase().includes(q)))
      .map((offer) => {
        const expiryDays = rollingDays(offer.id, 2, 30, now)
        const expiresAt = dateInDays(expiryDays, now)
        return { ...offer, expiryDays: daysUntil(expiresAt, now), score: offerScore(offer, lifeProfile) }
      })
      .sort((a, b) => b.score - a.score)
  }, [category, lifeProfile, now, query])

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Caută oferte, branduri, categorii..." />
        <FilterPills items={studentLifeData.discounts.categories} value={category} onChange={setCategory} />
        <span className="text-xs font-semibold text-slate-500">{offers.length} rezultate</span>
      </div>

      {saved.size > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <Bookmark size={14} />
          {saved.size} {saved.size === 1 ? 'ofertă salvată' : 'oferte salvate'}
        </div>
      )}

      {offers.length === 0 ? (
        <EmptyState icon={Tag} title="Nicio ofertă găsită" text="Încearcă o altă căutare sau categorie." />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {offers.map((offer) => (
            <article key={offer.id} className="glass-card relative p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-600/80">
              {offer.popular && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] font-bold text-amber-300">
                  <Sparkles size={10} /> Popular
                </span>
              )}
              <div className="flex items-start gap-3 pr-20">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-lg" style={{ background: offer.color }}>
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
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock size={12} /> Expiră în {offer.expiryDays} {offer.expiryDays === 1 ? 'zi' : 'zile'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {offer.url && (
                    <button
                      onClick={() => window.open(offer.url, '_blank', 'noopener,noreferrer')}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3 text-xs font-bold text-indigo-300 transition-all hover:bg-indigo-600/30 active:scale-[0.98]"
                    >
                      Accesează →
                    </button>
                  )}
                  <button
                    onClick={() => savedOps.toggle(offer.id)}
                    className={clsx(
                      'inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all active:scale-[0.98]',
                      saved.has(offer.id)
                        ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500',
                    )}
                  >
                    <Bookmark size={13} />
                    {saved.has(offer.id) ? 'Salvat' : 'Salvează'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function CareerSection({ lifeProfile, applied, appliedOps }) {
  const [type, setType] = useState('Toate')
  const [query, setQuery] = useState('')
  const now = useNow()
  const allJobs = studentLifeData.career[lifeProfile.careerKey] || studentLifeData.career.CS

  const jobs = useMemo(() => {
    const q = query.toLowerCase()
    return allJobs
      .filter((job) => type === 'Toate' || job.type === type)
      .filter((job) => !q || [job.role, job.company, ...job.tags].some((field) => field.toLowerCase().includes(q)))
      .map((job) => {
        const cities = job.cities.map(normalizeCity)
        const warnings = []
        if (lifeProfile.year < job.minYear) warnings.push(`Anul ${job.minYear}+`)
        if (!job.remote && !cities.includes('all') && !cities.includes(lifeProfile.city)) warnings.push(job.cities[0])
        const deadlineDays = rollingDays(job.id, 3, 21, now)
        return { ...job, deadlineDays, match: jobMatch(job, lifeProfile), warnings }
      })
      .filter((job) => job.match >= 20)
      .sort((a, b) => b.match - a.match)
  }, [allJobs, lifeProfile, now, query, type])

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] text-slate-500">
        <Award size={14} className="text-slate-400" strokeWidth={1.75} />
        <span><b className="text-slate-300 font-semibold">{lifeProfile.facultyName}</b> · Anul {lifeProfile.year} · {lifeProfile.city}</span>
      </div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Caută poziții, companii, skill-uri..." />
        <FilterPills items={JOB_TYPES} value={type} onChange={setType} />
        <span className="text-xs font-semibold text-slate-500">{jobs.length} poziții</span>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="Nicio poziție găsită" text="Încearcă un alt cuvânt cheie sau tip." />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <article key={job.id} className="glass-card grid grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ background: job.color }}>
                  {job.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white">{job.role}</h3>
                  <p className="text-sm text-slate-500">{job.company}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="tag">{job.remote ? 'Remote' : `Fizic · ${job.cities[0]}`}</span>
                    <span className={clsx('tag', job.paid && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300')}>{job.paid ? 'Plătit' : 'Neplătit'}</span>
                    <span className="tag">{job.type}</span>
                    <span className="tag border-sky-500/30 bg-sky-500/10 text-sky-300">Aplică în {job.deadlineDays} zile</span>
                    {job.warnings.map((warning) => (
                      <span key={warning} className="tag border-amber-500/30 bg-amber-500/10 text-amber-300">{warning}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.tags.map((tag) => (
                      <span key={tag} className="rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-400">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                <span
                  className={clsx(
                    'rounded-full border px-3 py-1 text-xs font-black',
                    job.match >= 80 ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-amber-400/30 bg-amber-400/10 text-amber-300',
                  )}
                >
                  {job.match}% potrivire
                </span>
                <button
                  onClick={() => {
                    if (job.url) window.open(job.url, '_blank', 'noopener,noreferrer')
                    appliedOps.add(job.id)
                  }}
                  disabled={applied.has(job.id)}
                  className={clsx(
                    'inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all active:scale-[0.98] disabled:cursor-default',
                    applied.has(job.id) ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-300' : 'btn-primary',
                  )}
                >
                  {applied.has(job.id) && <Check size={14} />}
                  {applied.has(job.id) ? 'Aplicat' : job.url ? 'Aplică →' : 'Aplică'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function CommunitySection({ lifeProfile, joined, joinedOps }) {
  const [type, setType] = useState('Toate')
  const [query, setQuery] = useState('')
  const now = useNow()

  const groups = useMemo(() => {
    const q = query.toLowerCase()
    return studentLifeData.community.groups
      .filter((group) => type === 'Toate' || group.type === type)
      .filter((group) => !q || [group.name, group.type, group.description, ...group.interests].some((field) => field.toLowerCase().includes(q)))
      .map((group) => {
        const shared = group.interests.filter((interest) => lifeProfile.interests.includes(interest))
        return { ...group, shared, event: eventTiming(group.id, now), score: shared.length * 15 + group.members }
      })
      .sort((a, b) => b.score - a.score)
  }, [lifeProfile.interests, now, query, type])

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
        <p className="mb-2 section-label">Alătură-te rapid după activitate</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {studentLifeData.community.activities.map((activity) => (
            <button
              key={activity}
              onClick={() => setQuery(activity.split(' ')[0].toLowerCase())}
              className="shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] font-semibold text-slate-400 transition-colors hover:border-white/[0.1] hover:text-slate-200"
            >
              {activity}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Caută grupuri, activități, interese..." />
        <FilterPills items={GROUP_TYPES} value={type} onChange={setType} />
        <span className="text-xs font-semibold text-slate-500">{groups.length} grupuri</span>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={Users} title="Niciun grup găsit" text="Încearcă o activitate sau tip mai general." />
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {groups.map((group) => (
            <article key={group.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-400">{group.type}</span>
                  <h3 className="mt-3 font-bold text-white">{group.name}</h3>
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Users size={13} /> {group.members}
                </span>
              </div>
              {group.shared.length > 0 && (
                <p className="mt-2 text-xs font-semibold text-emerald-300">Interese comune: {group.shared.join(', ')}</p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{group.description}</p>
              <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-500">
                <Clock size={12} /> {group.event.label}
              </p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className={clsx('text-xs font-semibold', group.open ? 'text-slate-500' : 'text-amber-300')}>
                  {group.open ? 'Grup deschis' : 'Grup plin'}
                </span>
                <div className="flex items-center gap-2">
                {group.url && (
                  <button
                    onClick={() => window.open(group.url, '_blank', 'noopener,noreferrer')}
                    className="h-9 rounded-xl border border-slate-600 bg-slate-800 px-3 text-[11px] font-bold text-slate-300 transition-all hover:border-slate-500 active:scale-[0.98]"
                  >
                    Site →
                  </button>
                )}
                <button
                  onClick={() => group.open && joinedOps.add(group.id)}
                  disabled={!group.open || joined.has(group.id)}
                  className={clsx(
                    'h-9 rounded-xl border px-3 text-[11px] font-bold transition-all active:scale-[0.98] disabled:cursor-default',
                    joined.has(group.id)
                      ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
                      : !group.open
                        ? 'border-white/[0.06] bg-white/[0.02] text-slate-600'
                        : 'border-indigo-500/40 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30',
                  )}
                >
                  {joined.has(group.id) ? 'Alăturat' : group.open ? 'Cere acces' : 'Indisponibil'}
                </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

const EVENT_CATEGORIES = ['Toate', 'Tech', 'Cariera', 'Stiinta', 'Social', 'Antreprenoriat']

function EventsSection({ going, goingOps }) {
  const [category, setCategory] = useState('Toate')
  const [query, setQuery] = useState('')

  const events = useMemo(() => {
    const q = query.toLowerCase()
    return eventsData
      .filter(e => category === 'Toate' || e.category === category)
      .filter(e => !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [category, query])

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Caută evenimente, locații..." />
        <FilterPills items={EVENT_CATEGORIES} value={category} onChange={setCategory} />
        <span className="text-xs font-semibold text-slate-500">{events.length} evenimente</span>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {events.map(ev => {
          const d = new Date(ev.date)
          const isGoing = going.has(ev.id)
          return (
            <article key={ev.id} className="glass-card p-4 flex gap-4">
              <div className="shrink-0 text-center w-14">
                <div className="text-2xl font-black text-white leading-none">{d.getDate()}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">{d.toLocaleString('ro', { month: 'short' })}</div>
                <div className="mt-1 text-[10px] text-slate-600">{ev.time}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mb-1" style={{ background: ev.color + '22', color: ev.color }}>{ev.category}</span>
                    <h3 className="font-bold text-white text-sm leading-tight">{ev.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{ev.location}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{ev.description}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-600">{ev.going + (isGoing ? 1 : 0)} merg</span>
                  <div className="flex items-center gap-2">
                    {ev.url && (
                      <button
                        onClick={() => window.open(ev.url, '_blank', 'noopener,noreferrer')}
                        className="h-8 rounded-xl border border-slate-600 bg-slate-800 px-3 text-[11px] font-bold text-slate-300 transition-all hover:border-slate-500 active:scale-[0.98]"
                      >
                        Detalii →
                      </button>
                    )}
                    <button
                      onClick={() => goingOps.toggle(ev.id)}
                      className={clsx('h-8 rounded-xl border px-3 text-[11px] font-bold transition-all active:scale-[0.98]',
                        isGoing
                          ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
                          : 'border-indigo-500/40 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30'
                      )}
                    >
                      {isGoing ? '✓ Merg' : 'Merg'}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function PomodoroTimer() {
  const [mode, setMode] = useState('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)

  const DURATIONS = { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 }
  const LABELS = { work: 'Focus', shortBreak: 'Pauză scurtă', longBreak: 'Pauză lungă' }

  const startStop = (shouldRun) => {
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

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const progress = 1 - timeLeft / DURATIONS[mode]

  return (
    <div className="glass-card p-6 text-center">
      <h3 className="text-sm font-bold text-white mb-4">Timer Pomodoro</h3>
      <div className="flex gap-2 justify-center mb-6">
        {Object.entries(LABELS).map(([m, l]) => (
          <button key={m} onClick={() => switchMode(m)}
            className={clsx('px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
              mode === m ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] text-slate-500 hover:text-slate-300')}
          >{l}</button>
        ))}
      </div>
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
            strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white font-mono">{mins}:{secs}</span>
          <span className="text-[10px] text-slate-500 mt-1">{LABELS[mode]}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button onClick={handleReset} className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all">
          <RotateCcw size={16} />
        </button>
        <button onClick={handleToggle}
          className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-all active:scale-95">
          {running ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
        </button>
      </div>
      <p className="text-xs text-slate-600 mt-4">{sessions} sesiuni completate azi</p>
    </div>
  )
}

// Primele 400 de zecimale ale lui π (fără "3.")
// O cifră la fiecare 12 secunde → 25 min = ~125 cifre
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
  const intervalRef = useRef(null)
  const prevDigitsRef = useRef(2)
  const targetSeconds = Math.max(1, minutes) * 60
  const hasTimer = mode === 'timer'
  const progress = hasTimer ? Math.min(1, elapsed / targetSeconds) : (elapsed % SECS_PER_DIGIT) / SECS_PER_DIGIT

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

  const remaining = Math.max(0, targetSeconds - elapsed)
  const displaySeconds = hasTimer ? remaining : elapsed
  const mins = String(Math.floor(displaySeconds / 60)).padStart(2, '0')
  const secs = String(displaySeconds % 60).padStart(2, '0')
  const visibleStr = PI_DECIMALS.slice(0, revealedDecimals)
  const hiddenStr = PI_DECIMALS.slice(revealedDecimals, revealedDecimals + 42)
  const groups = []
  for (let i = 0; i < visibleStr.length; i += 5) groups.push(visibleStr.slice(i, i + 5))

  const maxPossible = hasTimer ? Math.min(PI_DECIMALS.length, 2 + Math.floor(targetSeconds / SECS_PER_DIGIT)) : PI_DECIMALS.length
  const nextDigitIn = SECS_PER_DIGIT - (elapsed % SECS_PER_DIGIT)
  const modeCopy = hasTimer
    ? { eyebrow: 'sesiune cronometrata', title: 'Creste sirul lui pi in reprize clare.', metric: Math.round((elapsed / targetSeconds) * 100) + '% din sesiune' }
    : { eyebrow: 'fara limita', title: 'Stai cat vrei si impinge recordul cat mai departe.', metric: 'urmatoarea cifra in ' + nextDigitIn + 's' }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080d18] shadow-[0_22px_80px_-42px_rgba(0,0,0,0.9)]">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px]">
        <div className="relative min-h-[360px] overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.18),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(124,58,237,0.24),transparent_34%),linear-gradient(135deg,#090f1c,#111827_55%,#07111f)] p-6 xl:border-b-0 xl:border-r">
          <div className="pointer-events-none absolute -right-10 -top-16 select-none text-[210px] font-black leading-none text-white/[0.035]">?</div>
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-label text-teal-200/70">? Focus ? {modeCopy.eyebrow}</p>
              <h3 className="mt-2 max-w-xl text-2xl font-black tracking-tight text-white">{modeCopy.title}</h3>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-right backdrop-blur">
              <p className="font-mono text-2xl font-black tabular-nums text-white">{mins}:{secs}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{hasTimer ? 'ramas' : 'focus total'}</p>
            </div>
          </div>

          <div className="relative z-10 mt-10 rounded-2xl border border-white/[0.08] bg-black/20 p-5 backdrop-blur-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[11px] font-bold text-teal-100">
                <Sparkles size={12} /> {revealedDecimals} zecimale descoperite
              </div>
              <span className="text-xs font-semibold text-slate-500">{modeCopy.metric}</span>
            </div>
            <div className="font-mono leading-loose break-words">
              <span className="text-3xl font-black text-teal-200">3.</span>
              <span className="text-xl font-bold text-white">
                {groups.map((group, groupIndex) => (
                  <span key={groupIndex} className="mr-2 inline-block">
                    {group.split('').map((digit, digitIndex) => {
                      const isLast = groupIndex === groups.length - 1 && digitIndex === group.length - 1
                      return (
                        <span
                          key={digitIndex}
                          className={clsx(
                            'transition-all duration-300',
                            isLast && justRevealed
                              ? 'text-emerald-200 drop-shadow-[0_0_12px_rgba(110,231,183,0.95)]'
                              : isLast
                              ? 'text-teal-200'
                              : 'text-white'
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
            <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-600">
              <span>3.14</span>
              <span>{hasTimer ? Math.round(progress * 100) + '%' : 'cifra urmatoare'}</span>
              <span>{hasTimer ? maxPossible + ' zec. posibile' : 'fara limita practica'}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-300 transition-all duration-1000" style={{ width: (progress * 100) + '%' }} />
            </div>
          </div>
        </div>

        <div className="p-5">
          <p className="section-label">control sesiune</p>
          <div className="mt-3 grid grid-cols-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-1">
            {[
              ['timer', 'Cu timer'],
              ['endless', 'Fara timer'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => switchMode(value)}
                disabled={running}
                className={clsx(
                  'h-9 rounded-xl text-xs font-bold transition-all disabled:cursor-default',
                  mode === value ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {hasTimer && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[15, 25, 45].map(value => (
                <button
                  key={value}
                  onClick={() => !running && setMinutes(value)}
                  disabled={running}
                  className={clsx(
                    'h-10 rounded-xl border text-xs font-bold transition-all active:scale-[0.98] disabled:cursor-default',
                    minutes === value
                      ? 'border-teal-300/30 bg-teal-300/12 text-teal-100'
                      : 'border-white/[0.06] bg-white/[0.03] text-slate-500 hover:text-slate-300',
                  )}
                >
                  {value} min
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs font-semibold leading-relaxed text-slate-400">
              O cifra noua apare la fiecare <span className="font-bold text-teal-200">{SECS_PER_DIGIT}s</span>. Daca schimbi tabul sau pierzi focusul ferestrei, sesiunea se opreste si progresul curent se salveaza doar ca record.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-black/20 p-3">
                <p className="text-slate-600">Record</p>
                <p className="mt-1 font-mono text-lg font-black text-white">{bestDigits}</p>
              </div>
              <div className="rounded-xl bg-black/20 p-3">
                <p className="text-slate-600">Sesiuni</p>
                <p className="mt-1 font-mono text-lg font-black text-white">{completed}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={running ? stop : start}
              className={clsx(
                'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all active:scale-[0.98]',
                running
                  ? 'border border-red-500/30 bg-red-500/10 text-red-300'
                  : 'border border-teal-300/30 bg-teal-400/15 text-teal-100',
              )}
            >
              {running ? <X size={15} /> : <Sprout size={15} />}
              {running ? 'Opreste' : 'Porneste'}
            </button>
            <button onClick={reset} className="h-11 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 text-slate-500 transition-all hover:text-slate-300 active:scale-[0.98]">
              <RotateCcw size={15} />
            </button>
          </div>

          {failed && (
            <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200">
              Sesiunea a fost intrerupta pentru ca fereastra nu a mai fost activa.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const WELLNESS_ICONS = {
  brain: Brain,
  sleep: Moon,
  movement: Dumbbell,
  food: Apple,
  phone: Smartphone,
  support: HandHeart,
}

function WellnessSection() {
  return (
    <section className="space-y-6">
      <FocusForest />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PomodoroTimer />
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-white">Sfaturi de Wellbeing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wellnessData.tips.map(tip => {
              const Icon = WELLNESS_ICONS[tip.icon] || Heart
              return (
              <div key={tip.id} className="glass-card p-4 flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                  <Icon size={16} className="text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{tip.title}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </section>
  )
}

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
  const CATEGORIES = ['Cazare', 'Mâncare', 'Transport', 'Cursuri', 'Distracție', 'Diverse']
  const AVERAGES = { Cazare: 800, Mâncare: 400, Transport: 100, Cursuri: 150, Distracție: 200, Diverse: 100 }
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

  const total = CATEGORIES.reduce((s, c) => s + (budget[c] ?? 0), 0)
  const avgTotal = Object.values(AVERAGES).reduce((s, v) => s + v, 0)
  const diff = total - avgTotal

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 glass-card">
        <div>
          <p className="text-xs text-slate-500">Total lunar</p>
          <p className="text-2xl font-black text-white">{total} RON</p>
          {total > 0 && (
            <p className={clsx('text-xs font-semibold mt-1', diff > 0 ? 'text-red-400' : 'text-emerald-400')}>
              {diff > 0 ? `+${diff} față de medie` : `${diff} față de medie`}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Medie studenți Iași</p>
          <p className="text-lg font-bold text-slate-400">{avgTotal} RON</p>
          <button onClick={resetBudget} className="mt-2 flex items-center gap-1 text-[11px] text-slate-600 hover:text-red-400 transition-colors ml-auto">
            <Trash2 size={11} /> Resetează
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {CATEGORIES.map(cat => {
          const val = budget[cat] ?? null
          const pct = val !== null ? Math.min(100, (val / AVERAGES[cat]) * 100) : 0
          return (
            <div key={cat} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{cat}</span>
                <span className="text-xs text-slate-500">Medie: {AVERAGES[cat]} RON</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={val ?? ''}
                  onChange={e => updateBudget(cat, e.target.value)}
                  placeholder={String(AVERAGES[cat])}
                  className="w-28 h-9 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 text-sm text-slate-300 outline-none focus:border-indigo-500/50"
                />
                <span className="text-xs text-slate-600">RON/lună</span>
                <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all', val > AVERAGES[cat] ? 'bg-red-500' : 'bg-indigo-500')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {val !== null && val !== AVERAGES[cat] && (
                  <span className={clsx('text-[11px] font-semibold shrink-0', val > AVERAGES[cat] ? 'text-red-400' : 'text-emerald-400')}>
                    {val > AVERAGES[cat] ? `+${val - AVERAGES[cat]}` : `-${AVERAGES[cat] - val}`}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BooksTab() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('Toate')
  const books = booksData.filter(b =>
    (type === 'Toate' || b.type === type) &&
    (!query || b.title.toLowerCase().includes(query.toLowerCase()) || b.subject.toLowerCase().includes(query.toLowerCase()))
  )
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchField value={query} onChange={setQuery} placeholder="Caută titlu, materie..." />
        <FilterPills items={['Toate', 'donez', 'vând']} value={type} onChange={setType} />
      </div>
      <div className="space-y-3">
        {books.map(b => (
          <div key={b.id} className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
              <BookOpen size={16} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{b.title}</p>
              <p className="text-xs text-slate-500">{b.subject} · An {b.yearNeeded} · {b.condition}</p>
              <p className="text-xs text-slate-600 mt-0.5">Oferit de {b.contact}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={clsx('text-sm font-bold', b.price === 0 ? 'text-emerald-400' : 'text-white')}>
                {b.price === 0 ? 'Gratuit' : `${b.price} RON`}
              </p>
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full', b.type === 'donez' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400')}>
                {b.type === 'donez' ? 'Donez' : 'Vând'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CarpoolTab() {
  const [query, setQuery] = useState('')
  const rides = carpoolData.filter(r =>
    !query || r.from.toLowerCase().includes(query.toLowerCase()) || r.to.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <div className="space-y-4">
      <SearchField value={query} onChange={setQuery} placeholder="Caută destinație..." />
      <div className="space-y-3">
        {rides.map(r => (
          <div key={r.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{r.from}</span>
                <ChevronRight size={14} className="text-slate-600" />
                <span className="text-sm font-bold text-white">{r.to}</span>
              </div>
              {r.verified && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Verificat</span>}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>{r.date} · {r.time}</span>
              <span>{r.seats} {r.seats === 1 ? 'loc' : 'locuri'} libere</span>
              <span>Șofer: {r.driver}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-black text-white">{r.pricePerPerson} RON <span className="text-xs font-normal text-slate-500">/ persoană</span></span>
              <button
                onClick={() => window.open(`https://t.me/${r.contact.replace('@', '')}`, '_blank', 'noopener,noreferrer')}
                className="h-8 px-4 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold hover:bg-indigo-600/30 transition-all"
              >
                Contactează {r.contact}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoommateTab() {
  const [query, setQuery] = useState('')
  const people = roommateData.filter(r =>
    !query || r.zone.toLowerCase().includes(query.toLowerCase()) || r.faculty.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <div className="space-y-4">
      <SearchField value={query} onChange={setQuery} placeholder="Caută zonă, facultate..." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {people.map(r => (
          <div key={r.id} className="glass-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {r.name.split(' ').map(w => w[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{r.name}</p>
                <p className="text-xs text-slate-500">{r.faculty} · An {r.year}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">{r.bio}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="tag">{r.zone}</span>
              <span className="tag">{r.budget}</span>
              <span className="tag">{r.schedule}</span>
              {!r.smoking && <span className="tag">Non-fumător</span>}
              {r.pets && <span className="tag">Animale ok</span>}
            </div>
            <button
              onClick={() => window.open(`https://t.me/${r.contact.replace('@', '')}`, '_blank', 'noopener,noreferrer')}
              className="mt-3 w-full h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold hover:bg-indigo-600/30 transition-all"
            >
              Contactează {r.contact}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ToolsSection() {
  const [toolTab, setToolTab] = useState('Budget')
  const activeTool = TOOLS_TABS.find(tool => tool.id === toolTab) || TOOLS_TABS[0]
  const ActiveIcon = activeTool.icon

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        {TOOLS_TABS.map(tool => {
          const Icon = tool.icon
          const active = toolTab === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => setToolTab(tool.id)}
              className={clsx(
                'rounded-2xl border p-4 text-left transition-all active:scale-[0.99]',
                active
                  ? 'border-indigo-400/40 bg-indigo-500/15 shadow-[0_18px_45px_-30px_rgba(99,102,241,0.9)]'
                  : 'border-white/[0.06] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.045]',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={clsx('flex h-10 w-10 items-center justify-center rounded-xl border', active ? 'border-indigo-300/30 bg-indigo-400/15 text-indigo-200' : 'border-white/[0.07] bg-white/[0.035] text-slate-500')}>
                  <Icon size={17} />
                </span>
                <span className="rounded-full border border-white/[0.07] bg-black/20 px-2 py-1 text-[10px] font-bold text-slate-500">{tool.stat}</span>
              </div>
              <p className="mt-3 text-sm font-bold text-white">{tool.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{tool.description}</p>
            </button>
          )
        })}
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/25 bg-indigo-400/10 text-indigo-200">
              <ActiveIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{activeTool.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{activeTool.hint}</p>
            </div>
          </div>
          <span className="w-fit rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-[11px] font-bold text-slate-400">
            Datele raman local in browser unde exista input direct.
          </span>
        </div>
      </div>

      {toolTab === 'Budget' && <BudgetTab />}
      {toolTab === 'Carti' && <BooksTab />}
      {toolTab === 'Carpool' && <CarpoolTab />}
      {toolTab === 'Colegi camera' && <RoommateTab />}
    </section>
  )
}

export default function StudentLifeHub({ activeSection = 'discounts', profile, session }) {
  const [saved, savedOps] = useStoredSet('sc_saved_v2')
  const [applied, appliedOps] = useStoredSet('sc_applied_v2')
  const [joined, joinedOps] = useStoredSet('sc_joined_v2')
  const [going, goingOps] = useStoredSet('sc_going_v1')
  const lifeProfile = useMemo(() => buildLifeProfile(profile, session), [profile, session])
  const theme = getUniversityTheme(session?.university)
  const jobCount = (studentLifeData.career[lifeProfile.careerKey] || studentLifeData.career.CS).length
  const section = SECTION_META[activeSection] || SECTION_META.discounts

  return (
    <div key={activeSection} className="p-6 space-y-6 animate-fade-in">
      <section
        className="glass-card relative overflow-hidden p-6"
        style={{
          background: `linear-gradient(135deg, ${theme.accentSoft}, rgba(15, 23, 42, 0.56))`,
          borderColor: theme.accentBorder,
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl opacity-25" style={{ background: theme.accent }} />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold" style={{ color: theme.accent, background: theme.accentSoft, borderColor: theme.accentBorder }}>
              <Sparkles size={12} />
              {section.kicker}
            </div>
            <h2 className="text-2xl font-bold text-white">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {section.description} Pentru {lifeProfile.facultyName}, Anul {lifeProfile.year}, {lifeProfile.city}.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="stat-card">
              <p className="font-mono text-xl font-bold text-white leading-none">{studentLifeData.discounts.offers.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mt-1">Oferte</p>
            </div>
            <div className="stat-card">
              <p className="font-mono text-xl font-bold text-white leading-none">{eventsData.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mt-1">Evenimente</p>
            </div>
            <div className="stat-card">
              <p className="font-mono text-xl font-bold text-white leading-none">{booksData.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mt-1">Cărți</p>
            </div>
          </div>
        </div>
      </section>

      {activeSection === 'discounts' && <DiscountsSection lifeProfile={lifeProfile} saved={saved} savedOps={savedOps} />}
      {activeSection === 'career' && <CareerSection lifeProfile={lifeProfile} applied={applied} appliedOps={appliedOps} />}
      {activeSection === 'community' && <CommunitySection lifeProfile={lifeProfile} joined={joined} joinedOps={joinedOps} />}
      {activeSection === 'events' && <EventsSection going={going} goingOps={goingOps} />}
      {activeSection === 'wellness' && <WellnessSection />}
      {activeSection === 'tools' && <ToolsSection />}
    </div>
  )
}
