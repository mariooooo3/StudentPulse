import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { booksData, carpoolData, getScopedToolsData, roommateData } from '../studentLifeData'
import { SECTION_ACCENTS } from '../constants/sectionConfig'
import { containerVariants, itemVariants } from '../utils/motionVariants'
import SearchField from '../components/SearchField'
import AccentLine from '../components/AccentLine'
import EmptyState from '../components/EmptyState'
import { getScopeLabel } from '../../../shared/utils/tenantScope'

export default function RoommateTab({ lifeProfile }) {
  const { t } = useTranslation()
  const accent = SECTION_ACCENTS.community
  const [query, setQuery] = useState('')
  const scoped = useMemo(() => getScopedToolsData(lifeProfile, { booksData, carpoolData, roommateData }), [lifeProfile])
  const people = scoped.roommates.filter(r =>
    !query || r.zone.toLowerCase().includes(query.toLowerCase()) || r.faculty.toLowerCase().includes(query.toLowerCase())
  )
  const scopeLabel = getScopeLabel(lifeProfile)
  const noScopedData = scoped.roommates.length === 0

  return (
    <div className="space-y-4">
      <SearchField value={query} onChange={setQuery} placeholder={t('roommateTab.searchPlaceholder')} />
      {people.length === 0 ? (
        <EmptyState
          icon={noScopedData ? Building2 : Users}
          title={noScopedData ? t('roommateTab.noScopedTitle') : t('roommateTab.noRoommates')}
          text={noScopedData
            ? t('roommateTab.noScopedText', { scope: scopeLabel || t('roommateTab.defaultScope') })
            : t('roommateTab.noRoommatesText')}
          accent={accent}
        />
      ) : (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {people.map(r => (
          <motion.div key={r.id} variants={itemVariants} className="premium-card p-5">
            <AccentLine color={accent.color} />
            <div className="flex items-start gap-3 mb-3">
              <div
                className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: `linear-gradient(135deg, ${accent.color}, #8b5cf6)` }}
              >
                {(r.name || '').split(' ').map(w => w[0]).join('')}
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
              {!r.smoking && <span className="tag">{t('roommateTab.nonSmoker')}</span>}
              {r.pets && <span className="tag">{t('roommateTab.petsOk')}</span>}
            </div>
            <div className="gradient-separator mt-4 mb-4" />
            <button
              onClick={() => window.open(`https://t.me/${r.contact.replace('@', '')}`, '_blank', 'noopener,noreferrer')}
              className="w-full h-9 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
              style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
            >
              {t('roommateTab.contact')} {r.contact}
            </button>
          </motion.div>
        ))}
      </motion.div>
      )}
    </div>
  )
}
