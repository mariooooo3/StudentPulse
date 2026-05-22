import { useState } from 'react'
import { Mail } from 'lucide-react'
import { UNIVERSITIES } from '../../../shared/config/universities'

export default function UniversityGrid({ onSelect }) {
  const [search, setSearch] = useState('')
  const filtered = UNIVERSITIES.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.city.toLowerCase().includes(search.toLowerCase()) ||
    u.shortName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2.5 focus-within:border-white/[0.14] transition-colors">
        <Mail size={13} className="text-slate-600 shrink-0" strokeWidth={1.75} />
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="CautÄƒ universitatea ta..."
          className="bg-transparent text-[13px] text-slate-300 placeholder-slate-700 outline-none flex-1 font-medium"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
        {filtered.map(u => (
          <button
            key={u.id}
            onClick={() => onSelect(u)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] text-left transition-all duration-150 group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: u.color + '22', border: `1.5px solid ${u.color}40` }}
            >
              <span style={{ color: u.color }}>{u.avatar}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-slate-300 group-hover:text-white truncate transition-colors">{u.shortName}</p>
              <p className="text-[10px] text-slate-600 truncate">{u.city}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
