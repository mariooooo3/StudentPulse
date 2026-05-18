import { useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  Award,
  Bookmark,
  Briefcase,
  Check,
  Clock,
  Search,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react'
import { facultyCareerKeys, studentLifeData } from './studentLifeData'
import { getUniversityTheme } from '../../shared/utils/theme'
import { dateInDays, daysUntil, eventTiming, rollingDays } from '../../shared/utils/dateTime'
import { useNow } from '../../shared/hooks/useNow'

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
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <span className="text-2xl font-black text-white">-{offer.discount}%</span>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock size={12} /> Expiră în {offer.expiryDays} {offer.expiryDays === 1 ? 'zi' : 'zile'}
                  </p>
                </div>
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
                  onClick={() => appliedOps.add(job.id)}
                  disabled={applied.has(job.id)}
                  className={clsx(
                    'inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all active:scale-[0.98] disabled:cursor-default',
                    applied.has(job.id) ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-300' : 'btn-primary',
                  )}
                >
                  {applied.has(job.id) && <Check size={14} />}
                  {applied.has(job.id) ? 'Aplicat' : 'Aplică'}
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
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className={clsx('text-xs font-semibold', group.open ? 'text-slate-500' : 'text-amber-300')}>
                  {group.open ? 'Grup deschis' : 'Grup plin'}
                </span>
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
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default function StudentLifeHub({ activeSection = 'discounts', profile, session }) {
  const [saved, savedOps] = useStoredSet('sc_saved_v2')
  const [applied, appliedOps] = useStoredSet('sc_applied_v2')
  const [joined, joinedOps] = useStoredSet('sc_joined_v2')
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
              <p className="font-mono text-xl font-bold text-white leading-none">{jobCount}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mt-1">Roluri</p>
            </div>
            <div className="stat-card">
              <p className="font-mono text-xl font-bold text-white leading-none">{studentLifeData.community.groups.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mt-1">Grupuri</p>
            </div>
          </div>
        </div>
      </section>

      {activeSection === 'discounts' && <DiscountsSection lifeProfile={lifeProfile} saved={saved} savedOps={savedOps} />}
      {activeSection === 'career' && <CareerSection lifeProfile={lifeProfile} applied={applied} appliedOps={appliedOps} />}
      {activeSection === 'community' && <CommunitySection lifeProfile={lifeProfile} joined={joined} joinedOps={joinedOps} />}
    </div>
  )
}
