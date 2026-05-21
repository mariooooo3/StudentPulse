import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import {
  Bookmark,
  Clock,
  ExternalLink,
  Sparkles,
  Tag,
} from 'lucide-react'
import { useNow } from '../../../shared/hooks/useNow'
import { dateInDays, daysUntil, rollingDays } from '../../../shared/utils/dateTime'
import { studentLifeData } from '../studentLifeData'
import { SECTION_ACCENTS, SECTION_META } from '../constants/sectionConfig'
import { containerVariants, itemVariants } from '../utils/motionVariants'
import { offerScore } from '../utils/scoringUtils'
import SectionHeader from '../components/SectionHeader'
import SearchField from '../components/SearchField'
import FilterPills from '../components/FilterPills'
import AccentLine from '../components/AccentLine'
import EmptyState from '../components/EmptyState'

export default function DiscountsSection({ lifeProfile, saved, savedOps }) {
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
