import { useState } from 'react'
import { MapPin, CheckSquare, Tag, Lightbulb, Bus, Shield, Home, ChevronRight, Star, Zap } from 'lucide-react'
import ArrivalAssistant from './ArrivalAssistant'
import StudentDiscounts from './StudentDiscounts'
import LocalTips from './LocalTips'
import StudentTransport from './StudentTransport'
import SafeZones from './SafeZones'
import StudentHousing from './StudentHousing'

const MODULES = [
  {
    id: 'arrival',
    icon: CheckSquare,
    label: 'Asistent Sosire',
    desc: 'Checklist prioritizat pentru primele zile',
    color: '#6366f1',
    bg: '#6366f115',
    badge: 'URGENT',
    badgeColor: '#ef4444',
  },
  {
    id: 'housing',
    icon: Home,
    label: 'Cazare',
    desc: 'Cămine, chirii și avertismente despre escrocherii',
    color: '#8b5cf6',
    bg: '#8b5cf615',
    badge: null,
  },
  {
    id: 'discounts',
    icon: Tag,
    label: 'Reduceri Studenți',
    desc: '12+ locuri cu reduceri verificate',
    color: '#10b981',
    bg: '#10b98115',
    badge: 'NOU',
    badgeColor: '#10b981',
  },
  {
    id: 'tips',
    icon: Lightbulb,
    label: 'Sfaturi Locale',
    desc: 'Sfaturi de la studenți pentru studenți',
    color: '#f59e0b',
    bg: '#f59e0b15',
    badge: null,
  },
  {
    id: 'transport',
    icon: Bus,
    label: 'Transport',
    desc: 'Linii CTP, abonament student, rute',
    color: '#3b82f6',
    bg: '#3b82f615',
    badge: null,
  },
  {
    id: 'safety',
    icon: Shield,
    label: 'Zone Sigure',
    desc: 'Harta cartierelor + contacte de urgență',
    color: '#06b6d4',
    bg: '#06b6d415',
    badge: null,
  },
]

function ModuleCard({ mod, onClick }) {
  const Icon = mod.icon
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.09] text-left transition-all duration-200 group w-full"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: mod.bg, border: `1.5px solid ${mod.color}40` }}>
        <Icon size={20} style={{ color: mod.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{mod.label}</span>
          {mod.badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: mod.badgeColor + '25', color: mod.badgeColor }}>
              {mod.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">{mod.desc}</p>
      </div>
      <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
    </button>
  )
}

export default function CityAdaptation({ profile }) {
  const [activeModule, setActiveModule] = useState(null)

  if (activeModule) {
    const props = { profile, onBack: () => setActiveModule(null) }
    if (activeModule === 'arrival') return <ArrivalAssistant {...props} />
    if (activeModule === 'discounts') return <StudentDiscounts {...props} />
    if (activeModule === 'tips') return <LocalTips {...props} />
    if (activeModule === 'transport') return <StudentTransport {...props} />
    if (activeModule === 'safety') return <SafeZones {...props} />
    if (activeModule === 'housing') return <StudentHousing {...props} />
  }

  const city = profile?.university?.city || 'Iași'

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <MapPin size={22} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Viața în {city}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Tot ce ai nevoie pentru a te adapta rapid</p>
        </div>
      </div>

      {/* Quick stat chips */}
      <div className="flex gap-2 flex-wrap">
        {[
          { icon: Zap, label: '3 sarcini urgente', color: '#ef4444' },
          { icon: Tag, label: '12 reduceri active', color: '#10b981' },
          { icon: Star, label: '10 sfaturi verificate', color: '#f59e0b' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400">
            <Icon size={11} style={{ color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Module grid */}
      <div className="space-y-2">
        {MODULES.map(mod => (
          <ModuleCard key={mod.id} mod={mod} onClick={() => setActiveModule(mod.id)} />
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-700 text-center pb-2">
        Date actualizate de studenți · {city}, România
      </p>
    </div>
  )
}
