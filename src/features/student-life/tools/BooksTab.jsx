import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { BookOpen } from 'lucide-react'
import { booksData } from '../studentLifeData'
import { SECTION_ACCENTS } from '../constants/sectionConfig'
import { containerVariants, itemVariants } from '../utils/motionVariants'
import SearchField from '../components/SearchField'
import FilterPills from '../components/FilterPills'
import AccentLine from '../components/AccentLine'

export default function BooksTab() {
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
