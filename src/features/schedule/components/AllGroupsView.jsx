import { useState } from 'react'
import { Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { DAYS } from '../../../shared/data/mockData'
import { staggerContainer, staggerItem } from '../schedule.constants'

export default function AllGroupsView({ schedule }) {
  const [search, setSearch] = useState('')

  const groupMap = {}
  schedule.forEach(c => {
    const grp = c.group || 'A1'
    if (!groupMap[grp]) groupMap[grp] = []
    groupMap[grp].push({ name: c.short, day: DAYS[c.day - 1], time: `${c.start}:00–${c.end}:00`, room: c.room })
  })
  const ALL_GROUPS = Object.entries(groupMap).map(([group, courses]) => ({ group, courses }))

  const filtered = ALL_GROUPS.filter(g =>
    g.group.toLowerCase().includes(search.toLowerCase()) ||
    g.courses.some(c => c.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <motion.div className="p-5 sm:p-6 space-y-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 80, damping: 18 }}>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Caută materie sau grupă..."
        className="input-base w-full"
      />

      {filtered.length === 0 ? (
        <div className="glass-card p-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
            <Users size={20} className="text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-400">Nicio grupă găsită</p>
          <p className="text-xs text-slate-600 mt-1">Încearcă alt termen de căutare.</p>
        </div>
      ) : (
        <motion.div className="grid gap-4 sm:grid-cols-2" variants={staggerContainer} initial="hidden" animate="show">
          {filtered.map(g => (
            <motion.div key={g.group} variants={staggerItem} whileHover={{ y: -2 }} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-300">{g.group}</span>
                </div>
                <span className="text-sm font-semibold text-slate-200">Grupa {g.group}</span>
                <span className="chip ml-auto">{g.courses.length}</span>
              </div>
              <div className="space-y-1.5">
                {g.courses.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.04] rounded-lg px-3 py-2 hover:border-white/[0.07] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-200 w-12 shrink-0">{c.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{c.day} {c.time}</span>
                    <span className="text-[11px] text-slate-600 ml-auto font-mono">{c.room}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
