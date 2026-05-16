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
    label: 'Discounts & Benefits',
    kicker: 'Student Benefits',
    title: 'Student offers matched to your city and campus life.',
    description: 'Restaurants, transport, subscriptions, bookstores, gyms, cafes, and verified local student benefits.',
  },
  career: {
    label: 'Career & Internships',
    kicker: 'Faculty-Aware Opportunities',
    title: 'Internships and early-career roles ranked for your profile.',
    description: 'Recommendations use your faculty, year, city, interests, and study context from StudentAcademic.',
  },
  community: {
    label: 'Community',
    kicker: 'Social Integration',
    title: 'Find student groups, meetups, mentoring, and adaptation communities.',
    description: 'Join groups connected to your interests, faculty, and city so StudentLife feels personal.',
  },
}

const JOB_TYPES = ['All', 'Internship', 'Research', 'Volunteer']
const GROUP_TYPES = ['All', 'Sport', 'Tech', 'Social', 'Study', 'Gaming', 'Outdoor']

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
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 pl-9 pr-3 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-slate-500"
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
            'h-9 rounded-xl border px-3 text-xs font-semibold transition-all active:scale-[0.98]',
            value === item
              ? 'border-slate-400 bg-slate-100 text-slate-950'
              : 'border-slate-700/60 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200',
          )}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

function DiscountsSection({ lifeProfile, saved, savedOps }) {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const now = useNow()

  const offers = useMemo(() => {
    const q = query.toLowerCase()
    return studentLifeData.discounts.offers
      .filter((offer) => category === 'All' || offer.category === category)
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
        <SearchField value={query} onChange={setQuery} placeholder="Search offers, brands, categories..." />
        <FilterPills items={studentLifeData.discounts.categories} value={category} onChange={setCategory} />
        <span className="text-xs font-semibold text-slate-500">{offers.length} results</span>
      </div>

      {saved.size > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <Bookmark size={14} />
          {saved.size} offer{saved.size > 1 ? 's' : ''} saved to your collection
        </div>
      )}

      {offers.length === 0 ? (
        <EmptyState icon={Tag} title="No offers found" text="Try a different search or category." />
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
                  <p className="text-xs text-slate-500">{offer.category} · {offer.city === 'all' ? 'All cities' : offer.city}</p>
                </div>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-relaxed text-slate-400">{offer.description}</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <span className="text-2xl font-black text-white">-{offer.discount}%</span>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock size={12} /> Expires in {offer.expiryDays} day{offer.expiryDays === 1 ? '' : 's'}
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
                  {saved.has(offer.id) ? 'Saved' : 'Save'}
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
  const [type, setType] = useState('All')
  const [query, setQuery] = useState('')
  const now = useNow()
  const allJobs = studentLifeData.career[lifeProfile.careerKey] || studentLifeData.career.CS

  const jobs = useMemo(() => {
    const q = query.toLowerCase()
    return allJobs
      .filter((job) => type === 'All' || job.type === type)
      .filter((job) => !q || [job.role, job.company, ...job.tags].some((field) => field.toLowerCase().includes(q)))
      .map((job) => {
        const cities = job.cities.map(normalizeCity)
        const warnings = []
        if (lifeProfile.year < job.minYear) warnings.push(`Year ${job.minYear}+`)
        if (!job.remote && !cities.includes('all') && !cities.includes(lifeProfile.city)) warnings.push(job.cities[0])
        const deadlineDays = rollingDays(job.id, 3, 21, now)
        return { ...job, deadlineDays, match: jobMatch(job, lifeProfile), warnings }
      })
      .filter((job) => job.match >= 20)
      .sort((a, b) => b.match - a.match)
  }, [allJobs, lifeProfile, now, query, type])

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
        <Award size={15} className="text-slate-300" />
        <span><b className="text-slate-200">{lifeProfile.facultyName}</b> · Year {lifeProfile.year} · {lifeProfile.city}</span>
      </div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Search positions, companies, skills..." />
        <FilterPills items={JOB_TYPES} value={type} onChange={setType} />
        <span className="text-xs font-semibold text-slate-500">{jobs.length} positions</span>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No positions found" text="Try a different keyword or position type." />
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
                    <span className="tag">{job.remote ? 'Remote' : `On-site · ${job.cities[0]}`}</span>
                    <span className={clsx('tag', job.paid && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300')}>{job.paid ? 'Paid' : 'Unpaid'}</span>
                    <span className="tag">{job.type}</span>
                    <span className="tag border-sky-500/30 bg-sky-500/10 text-sky-300">Apply in {job.deadlineDays} days</span>
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
                  {job.match}% match
                </span>
                <button
                  onClick={() => appliedOps.add(job.id)}
                  disabled={applied.has(job.id)}
                  className={clsx(
                    'inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all active:scale-[0.98] disabled:cursor-default',
                    applied.has(job.id) ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-100 text-slate-950 hover:bg-white',
                  )}
                >
                  {applied.has(job.id) && <Check size={14} />}
                  {applied.has(job.id) ? 'Applied' : 'Apply'}
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
  const [type, setType] = useState('All')
  const [query, setQuery] = useState('')
  const now = useNow()

  const groups = useMemo(() => {
    const q = query.toLowerCase()
    return studentLifeData.community.groups
      .filter((group) => type === 'All' || group.type === type)
      .filter((group) => !q || [group.name, group.type, group.description, ...group.interests].some((field) => field.toLowerCase().includes(q)))
      .map((group) => {
        const shared = group.interests.filter((interest) => lifeProfile.interests.includes(interest))
        return { ...group, shared, event: eventTiming(group.id, now), score: shared.length * 15 + group.members }
      })
      .sort((a, b) => b.score - a.score)
  }, [lifeProfile.interests, now, query, type])

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Quick join by activity</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {studentLifeData.community.activities.map((activity) => (
            <button
              key={activity}
              onClick={() => setQuery(activity.split(' ')[0].toLowerCase())}
              className="shrink-0 rounded-xl border border-slate-700/60 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-500"
            >
              {activity}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Search groups, activities, interests..." />
        <FilterPills items={GROUP_TYPES} value={type} onChange={setType} />
        <span className="text-xs font-semibold text-slate-500">{groups.length} groups</span>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={Users} title="No groups found" text="Try a broader activity or type." />
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
                <p className="mt-2 text-xs font-semibold text-emerald-300">Shared interests: {group.shared.join(', ')}</p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{group.description}</p>
              <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-500">
                <Clock size={12} /> {group.event.label}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className={clsx('text-xs font-semibold', group.open ? 'text-slate-500' : 'text-amber-300')}>
                  {group.open ? 'Open group' : 'Group full'}
                </span>
                <button
                  onClick={() => group.open && joinedOps.add(group.id)}
                  disabled={!group.open || joined.has(group.id)}
                  className={clsx(
                    'h-9 rounded-xl border px-3 text-xs font-bold transition-all active:scale-[0.98] disabled:cursor-default',
                    joined.has(group.id)
                      ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
                      : !group.open
                        ? 'border-slate-700 bg-slate-900 text-slate-600'
                        : 'border-slate-600 bg-slate-100 text-slate-950 hover:bg-white',
                  )}
                >
                  {joined.has(group.id) ? 'Joined' : group.open ? 'Request to join' : 'Unavailable'}
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
              {section.description} Built for {lifeProfile.facultyName}, Year {lifeProfile.year}, {lifeProfile.city}.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 px-4 py-3">
              <p className="text-lg font-black text-white">{studentLifeData.discounts.offers.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Offers</p>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 px-4 py-3">
              <p className="text-lg font-black text-white">{jobCount}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Roles</p>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 px-4 py-3">
              <p className="text-lg font-black text-white">{studentLifeData.community.groups.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Groups</p>
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
