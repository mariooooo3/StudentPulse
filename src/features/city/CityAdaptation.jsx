import { useState } from 'react'
import { MapPin, CheckSquare, Tag, Lightbulb, Bus, Shield, Home, ChevronRight, Star, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
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
    color: '#10b981',
    badge: 'URGENT',
    badgeColor: '#ef4444',
  },
  {
    id: 'housing',
    icon: Home,
    label: 'Cazare',
    desc: 'Cămine, chirii și avertismente despre escrocherii',
    color: '#3b82f6',
    badge: null,
  },
  {
    id: 'discounts',
    icon: Tag,
    label: 'Reduceri Studenți',
    desc: '12+ locuri cu reduceri verificate',
    color: '#6366f1',
    badge: 'NOU',
    badgeColor: '#10b981',
  },
  {
    id: 'tips',
    icon: Lightbulb,
    label: 'Sfaturi Locale',
    desc: 'Sfaturi de la studenți pentru studenți',
    color: '#f59e0b',
    badge: null,
  },
  {
    id: 'transport',
    icon: Bus,
    label: 'Transport',
    desc: 'Linii CTP, abonament student, rute',
    color: '#06b6d4',
    badge: null,
  },
  {
    id: 'safety',
    icon: Shield,
    label: 'Zone Sigure',
    desc: 'Harta cartierelor + contacte de urgență',
    color: '#f43f5e',
    badge: null,
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
}
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 20 } },
}

function ModuleCard({ mod, onClick }) {
  const Icon = mod.icon
  return (
    <motion.div variants={item}>
      <button
        onClick={onClick}
        className="group relative flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] text-left transition-all duration-200 w-full overflow-hidden"
        style={{ '--accent': mod.color }}
      >
        {/* Left color accent bar */}
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: mod.color }}
        />

        {/* Icon container */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{ background: mod.color + '18', border: `1.5px solid ${mod.color}40` }}
        >
          <Icon size={20} style={{ color: mod.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
              {mod.label}
            </span>
            {mod.badge && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide"
                style={{ background: mod.badgeColor + '22', color: mod.badgeColor }}
              >
                {mod.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">
            {mod.desc}
          </p>
        </div>

        <ChevronRight
          size={16}
          className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
        />
      </button>
    </motion.div>
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

  const city = profile?.university?.city || profile?.universityCity || 'orașul tău'

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className="relative rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.02] p-5"
      >
        {/* dot-grid texture */}
        <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 10% 50%, #8b5cf640, transparent)' }}
        />

        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 animate-float"
            style={{ background: 'linear-gradient(135deg, #8b5cf630, #6d28d930)', border: '1.5px solid #8b5cf650' }}>
            <MapPin size={22} style={{ color: '#8b5cf6' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white leading-tight">
              Viața în{' '}
              <span className="text-gradient-indigo">{city}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Tot ce ai nevoie pentru a te adapta rapid</p>
          </div>
          <Sparkles size={18} className="text-violet-400/60 shrink-0" />
        </div>

        {/* Quick stat chips */}
        <div className="flex gap-2 flex-wrap mt-4">
          {[
            { icon: CheckSquare, label: 'Checklist sosire', color: '#10b981' },
            { icon: Tag, label: 'Reduceri studenți', color: '#6366f1' },
            { icon: Star, label: 'Sfaturi locale', color: '#f59e0b' },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] text-xs text-slate-400"
            >
              <Icon size={11} style={{ color }} />
              {label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section label */}
      <div className="flex items-center gap-3">
        <span className="section-label">Module</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-xs text-slate-600">{MODULES.length} secțiuni</span>
      </div>

      {/* Module grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {MODULES.map(mod => (
          <ModuleCard key={mod.id} mod={mod} onClick={() => setActiveModule(mod.id)} />
        ))}
      </motion.div>

      {/* Footer note */}
      <p className="text-xs text-slate-700 text-center pb-2">
        Date actualizate de studenți · {city}, România
      </p>
    </div>
  )
}
