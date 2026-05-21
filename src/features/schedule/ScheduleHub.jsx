import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getScheduleData } from '../../shared/data/facultyCatalog'
import { useNotifications } from '../../shared/hooks/useNotifications'
import { TABS } from './schedule.constants'
import { WeeklyView, AllGroupsView, RecoveryGrid, SlotSwapView } from './components/ScheduleHubParts'
import clsx from 'clsx'

export default function ScheduleHub({ profile, session }) {
  const [tab,  setTab]  = useState(0)
  const [week, setWeek] = useState(0)
  const { pushNotification } = useNotifications(session?.userId)

  const facultyData = getScheduleData(profile) || { schedule: [], recoverySlots: [], swapRequests: [] }
  const { schedule, recoverySlots, swapRequests } = facultyData

  const weekLabel = week === 0 ? 'Săptămâna curentă' : week > 0 ? `+${week} săpt.` : `${week} săpt.`

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* ── Top bar ── */}
      <div className="relative shrink-0 border-b border-white/[0.06] bg-[#070b14]/90 backdrop-blur-xl overflow-hidden">
        {/* Dot-grid texture */}
        <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" />

        <div className="relative px-5 sm:px-6 py-4 flex flex-wrap items-center gap-x-4 gap-y-3">
          {/* Page title */}
          <div className="mr-2">
            <p className="section-label">Orar</p>
            <h1 className="text-base font-bold text-gradient-indigo leading-tight">
              Schedule Hub
            </h1>
          </div>

          <div className="gradient-separator hidden sm:block h-8 w-px" />

          {/* Week navigator */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setWeek(w => w - 1)}
              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.07] text-slate-400 transition-all"
            >
              <ChevronLeft size={15} />
            </motion.button>
            <span className="text-sm text-slate-300 w-40 text-center font-medium">{weekLabel}</span>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setWeek(w => w + 1)}
              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.07] text-slate-400 transition-all"
            >
              <ChevronRight size={15} />
            </motion.button>
          </div>

          {/* Tab pill switcher */}
          <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-xl ml-auto">
            {TABS.map(({ label, icon: Icon }, i) => (
              <motion.button
                key={label}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTab(i)}
                className={clsx(
                  'relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5',
                  tab === i
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300',
                )}
              >
                {tab === i && (
                  <motion.span
                    layoutId="tab-active-pill"
                    className="absolute inset-0 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/20"
                    transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={12} />
                  {label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {tab === 0 && (
            <motion.div key="orar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
              <WeeklyView schedule={schedule} />
            </motion.div>
          )}
          {tab === 1 && (
            <motion.div key="grupe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <AllGroupsView schedule={schedule} />
            </motion.div>
          )}
          {tab === 2 && (
            <motion.div key="recuperari" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <RecoveryGrid recoverySlots={recoverySlots} onNotify={pushNotification} session={session} />
            </motion.div>
          )}
          {tab === 3 && (
            <motion.div key="swap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <SlotSwapView
                recoverySlots={recoverySlots}
                swapRequests={swapRequests}
                userId={session?.userId}
                onNotify={pushNotification}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

