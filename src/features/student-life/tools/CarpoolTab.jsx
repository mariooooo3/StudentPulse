import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'
import { booksData, carpoolData, getScopedToolsData, roommateData } from '../studentLifeData'
import { SECTION_ACCENTS } from '../constants/sectionConfig'
import { containerVariants, itemVariants } from '../utils/motionVariants'
import SearchField from '../components/SearchField'
import AccentLine from '../components/AccentLine'

export default function CarpoolTab({ lifeProfile }) {
  const accent = SECTION_ACCENTS.tools
  const [query, setQuery] = useState('')
  const scoped = getScopedToolsData(lifeProfile, { booksData, carpoolData, roommateData })
  const rides = scoped.rides.filter(r =>
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
