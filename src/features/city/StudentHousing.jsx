import { useState } from 'react'
import { ChevronLeft, Home, MapPin, Wifi, Users, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { housingListings, SCAM_WARNINGS } from '../../shared/data/cityData'
import clsx from 'clsx'

const TYPE_TABS = ['Toate', 'Cămin', 'Chirie', 'Coabitare']

export default function StudentHousing({ onBack }) {
  const [tab, setTab] = useState('Toate')
  const [showScams, setShowScams] = useState(false)

  const filtered = tab === 'Toate' ? housingListings : housingListings.filter(h => h.type === tab)

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.07] transition-colors">
          <ChevronLeft size={16} className="text-slate-400" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Cazare Studenți</h2>
          <p className="text-xs text-slate-500">Cămine și chirii verificate în Iași</p>
        </div>
      </div>

      {/* Scam warning accordion */}
      <button
        onClick={() => setShowScams(s => !s)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-left hover:border-red-500/40 transition-colors"
      >
        <AlertTriangle size={16} className="text-red-400 shrink-0" />
        <span className="flex-1 text-sm font-medium text-red-300">Atenție: Escrocherii frecvente</span>
        {showScams ? <ChevronUp size={15} className="text-red-400" /> : <ChevronDown size={15} className="text-red-400" />}
      </button>
      {showScams && (
        <div className="space-y-2 -mt-3">
          {SCAM_WARNINGS.map((w) => (
            <div key={w} className="flex items-start gap-2 px-4 py-2.5 rounded-xl bg-red-500/8 border border-red-500/20">
              <span className="text-red-400 text-xs mt-0.5">⚠</span>
              <p className="text-xs text-red-300/80 leading-relaxed">{w}</p>
            </div>
          ))}
        </div>
      )}

      {/* Type tabs */}
      <div className="flex gap-1.5">
        {TYPE_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              tab === t ? 'bg-indigo-600 text-white' : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.07]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="space-y-3">
        {filtered.map((h) => (
          <div key={h.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.09] transition-all space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">{h.name}</span>
                  <span className={clsx(
                    'text-[9px] font-bold px-2 py-0.5 rounded-full',
                    h.type === 'Cămin' ? 'bg-blue-500/20 text-blue-400' :
                    h.type === 'Chirie' ? 'bg-violet-500/20 text-violet-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  )}>
                    {h.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-600">
                  <MapPin size={9} /> {h.zone} · {h.distance}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold text-indigo-400">{h.price}</p>
                <p className="text-[10px] text-slate-600">/lună</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex gap-1.5 flex-wrap">
              {h.amenities?.map((a, ai) => (
                <span key={ai} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400">
                  {a}
                </span>
              ))}
            </div>

            {h.note && (
              <p className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                💡 {h.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-600">
          <Home size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nicio ofertă în această categorie</p>
        </div>
      )}
    </div>
  )
}
