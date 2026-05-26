import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bus, CheckSquare, Home, Shield, Lightbulb, MessageSquare } from 'lucide-react'
import clsx from 'clsx'
import StudentTransport from './StudentTransport'
import ArrivalAssistant from './ArrivalAssistant'
import StudentHousing from './StudentHousing'
import SafeZones from './SafeZones'
import LocalTips from './LocalTips'
import CityChat from './CityChat'

const TABS = [
  { id: 'transport', label: 'Transport',  icon: Bus,           desc: 'Linii, abonamente și rute' },
  { id: 'arrival',   label: 'Checklist',  icon: CheckSquare,   desc: 'Ce trebuie făcut la sosire' },
  { id: 'housing',   label: 'Cazare',     icon: Home,          desc: 'Cămine, chirii, coabitare' },
  { id: 'safety',    label: 'Siguranță',  icon: Shield,        desc: 'Zone și contacte urgență' },
  { id: 'tips',      label: 'Ponturi',    icon: Lightbulb,     desc: 'Sfaturi practice de la studenți' },
  { id: 'chat',      label: 'AI Chat',    icon: MessageSquare, desc: 'Întreabă orice despre oraș' },
]

export default function CityAdaptation({ profile, session, onNavigate }) {
  const [active, setActive] = useState('transport')
  const current = TABS.find(t => t.id === active)

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="shrink-0 border-b border-white/[0.06] bg-[#050810]/80 backdrop-blur-sm px-4 pt-4 pb-0">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={clsx(
                  'flex shrink-0 items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 text-[13px] font-semibold transition-all',
                  isActive
                    ? 'border-indigo-500 bg-white/[0.04] text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]',
                )}
              >
                <Icon size={14} strokeWidth={isActive ? 2.2 : 1.75} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {active === 'transport' && (
              <StudentTransport
                profile={profile}
                session={session}
                onBack={() => onNavigate('discounts', 'life')}
                onNavigate={onNavigate}
              />
            )}
            {active === 'arrival'   && <ArrivalAssistant onBack={() => setActive('transport')} />}
            {active === 'housing'   && <StudentHousing   onBack={() => setActive('transport')} />}
            {active === 'safety'    && <SafeZones        onBack={() => setActive('transport')} />}
            {active === 'tips'      && <LocalTips        onBack={() => setActive('transport')} />}
            {active === 'chat'      && <CityChat         profile={profile} onBack={() => setActive('transport')} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
