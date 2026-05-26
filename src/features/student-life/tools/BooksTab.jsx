import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { BookOpen, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { booksData, carpoolData, getScopedToolsData, roommateData } from '../studentLifeData'
import { SECTION_ACCENTS } from '../constants/sectionConfig'
import { containerVariants, itemVariants } from '../utils/motionVariants'
import SearchField from '../components/SearchField'
import FilterPills from '../components/FilterPills'
import AccentLine from '../components/AccentLine'
import EmptyState from '../components/EmptyState'
import { getScopeLabel } from '../../../shared/utils/tenantScope'

export default function BooksTab({ lifeProfile }) {
  const { t } = useTranslation()
  const accent = SECTION_ACCENTS.discounts
  const [query, setQuery] = useState('')
  const [type, setType]   = useState('Toate')
  const scoped = useMemo(() => getScopedToolsData(lifeProfile, { booksData, carpoolData, roommateData }), [lifeProfile])
  const books = scoped.books.filter(b =>
    (type === 'Toate' || b.type === type) &&
    (!query || b.title.toLowerCase().includes(query.toLowerCase()) || b.subject.toLowerCase().includes(query.toLowerCase()))
  )
  const scopeLabel = getScopeLabel(lifeProfile)
  const noScopedData = scoped.books.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchField value={query} onChange={setQuery} placeholder={t('booksTab.searchPlaceholder')} />
        <FilterPills
          items={['Toate', 'donez', 'vând']}
          labels={[t('booksTab.filterAll'), t('booksTab.filterDonate'), t('booksTab.filterSell')]}
          value={type}
          onChange={setType}
          accent={accent}
        />
      </div>
      {books.length === 0 ? (
        <EmptyState
          icon={noScopedData ? Building2 : BookOpen}
          title={noScopedData ? t('booksTab.noScopedTitle') : t('booksTab.notFound')}
          text={noScopedData
            ? t('booksTab.noScopedText', { scope: scopeLabel || t('booksTab.yourFaculty') })
            : t('booksTab.notFoundText')}
          accent={accent}
        />
      ) : (
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
                <p className="text-xs text-slate-500">{b.subject} · {b.yearNeeded} · {b.condition}</p>
                <p className="font-mono text-xs text-slate-600 mt-0.5">{t('booksTab.offeredBy')} {b.contact}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={clsx('font-mono text-sm font-bold', b.price === 0 ? 'text-emerald-400' : 'text-white')}>
                  {b.price === 0 ? t('booksTab.free') : `${b.price} RON`}
                </p>
                <span className={clsx(
                  'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold',
                  b.type === 'donez' ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/12 text-amber-400 border border-amber-500/20',
                )}>
                  {b.type === 'donez' ? t('booksTab.donate') : t('booksTab.sell')}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
