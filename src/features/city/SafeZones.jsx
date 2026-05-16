import { ChevronLeft, Phone, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { safetyZones, emergencyContacts } from '../../shared/data/cityData'
import clsx from 'clsx'

const LEVEL_META = {
  safe:     { icon: CheckCircle, label: 'Sigur', color: '#10b981' },
  moderate: { icon: Shield, label: 'Moderat', color: '#f59e0b' },
  caution:  { icon: AlertTriangle, label: 'Atenție', color: '#ef4444' },
}

export default function SafeZones({ onBack }) {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors">
          <ChevronLeft size={16} className="text-slate-400" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Zone Sigure · Iași</h2>
          <p className="text-xs text-slate-500">Ghid de siguranță pentru studenți</p>
        </div>
      </div>

      {/* Safety legend */}
      <div className="flex gap-3">
        {Object.entries(LEVEL_META).map(([key, meta]) => {
          const Icon = meta.icon
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs text-slate-400">
              <Icon size={12} style={{ color: meta.color }} />
              {meta.label}
            </div>
          )
        })}
      </div>

      {/* Zones */}
      <div className="space-y-2">
        {safetyZones.map((zone, i) => {
          const meta = LEVEL_META[zone.level]
          const Icon = meta.icon
          return (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/40">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: zone.color + '20', border: `1.5px solid ${zone.color}40` }}
              >
                <Icon size={16} style={{ color: zone.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">{zone.name || zone.neighborhood}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: zone.color + '20', color: zone.color }}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{zone.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Emergency contacts */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Contacte urgență</h3>
        <div className="grid grid-cols-2 gap-2">
          {emergencyContacts.map((c, i) => (
            <a
              key={i}
              href={`tel:${c.number}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/40 hover:border-slate-600 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <Phone size={14} className="text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-300 group-hover:text-white truncate transition-colors">{c.name}</p>
                <p className="text-sm font-bold text-red-400">{c.number}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
