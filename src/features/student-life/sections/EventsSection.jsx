import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import {
  Calendar,
  Check,
  ExternalLink,
  MapPin,
  Zap,
} from 'lucide-react'
import { useNow } from '../../../shared/hooks/useNow'
import { eventsData } from '../studentLifeData'
import { SECTION_ACCENTS, SECTION_META, EVENT_CATEGORIES } from '../constants/sectionConfig'
import { containerVariants, itemVariants } from '../utils/motionVariants'
import SectionHeader from '../components/SectionHeader'
import SearchField from '../components/SearchField'
import FilterPills from '../components/FilterPills'
import EmptyState from '../components/EmptyState'

export default function EventsSection({ going, goingOps }) {
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
