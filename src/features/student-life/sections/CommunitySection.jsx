import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import {
  Check,
  Clock,
  ExternalLink,
  Users,
} from 'lucide-react'
import { useNow } from '../../../shared/hooks/useNow'
import { eventTiming } from '../../../shared/utils/dateTime'
import { studentLifeData } from '../studentLifeData'
import { SECTION_ACCENTS, SECTION_META, GROUP_TYPES } from '../constants/sectionConfig'
import { containerVariants, itemVariants } from '../utils/motionVariants'
import SectionHeader from '../components/SectionHeader'
import SearchField from '../components/SearchField'
import FilterPills from '../components/FilterPills'
import AccentLine from '../components/AccentLine'
import EmptyState from '../components/EmptyState'

export default function CommunitySection({ lifeProfile, joined, joinedOps }) {
  const accent = SECTION_ACCENTS.community
  const [type, setType] = useState('Toate')
  const [query, setQuery] = useState('')
  const now = useNow()

  const universityId = lifeProfile?.universityId

  const groups = useMemo(() => {
    const q = query.toLowerCase()
    return studentLifeData.community.groups
      .filter((group) => !universityId || group.university === 'all' || group.university === universityId)
      .filter((group) => type === 'Toate' || group.type === type)
      .filter((group) => !q || [group.name, group.type, group.description, ...group.interests].some((f) => f.toLowerCase().includes(q)))
      .map((group) => {
        const shared = group.interests.filter((i) => lifeProfile.interests.includes(i))
        return { ...group, shared, event: eventTiming(group.id, now), score: shared.length * 15 + group.members }
      })
      .sort((a, b) => b.score - a.score)
  }, [lifeProfile.interests, now, query, type, universityId])

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
