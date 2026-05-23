import { motion } from 'framer-motion'
import clsx from 'clsx'
import { DAYS, HOURS } from '../../../shared/data/mockData'

export const ROW_H = 52

export const COURSE_TYPE_BORDER = {
  'Curs': 'border-l-indigo-500',
  'Seminar': 'border-l-emerald-500',
  'Laborator': 'border-l-amber-500',
  'Practică': 'border-l-rose-500',
}

export default function WeeklyView({ schedule }) {
  return (
    <motion.div className="flex overflow-x-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <div className="shrink-0 w-14 border-r border-white/[0.06]">
        <div className="h-10 border-b border-white/[0.05]" />
        {HOURS.map(h => (
          <div
            key={h}
            className="border-b border-white/[0.03] text-right pr-2 text-[10px] text-slate-600 font-mono flex items-start justify-end pt-1"
            style={{ height: ROW_H }}
          >
            {h}:00
          </div>
        ))}
      </div>

      {DAYS.map((day, di) => {
        const dayCourses = schedule.filter(c => c.day === di + 1)
        return (
          <div key={day} className="flex-1 min-w-[120px] relative border-r border-white/[0.04] last:border-r-0">
            <div className="h-10 border-b border-white/[0.05] flex items-center justify-center sticky top-0 bg-[#070b14] z-10">
              <span className={clsx('text-xs font-semibold tracking-wide', di === 0 ? 'text-indigo-400' : 'text-slate-400')}>
                {day}
              </span>
            </div>

            <div className="relative" style={{ height: HOURS.length * ROW_H }}>
              {HOURS.map(h => (
                <div
                  key={h}
                  className="border-b border-white/[0.03] absolute left-0 right-0"
                  style={{ top: (h - 8) * ROW_H, height: ROW_H }}
                />
              ))}

              {dayCourses.map(c => {
                const borderClass = COURSE_TYPE_BORDER[c.type] || 'border-l-indigo-500'
                return (
                  <motion.div
                    key={c.id}
                    whileHover={{ scale: 1.02, y: -1 }}
                    className={clsx(
                      'absolute left-1 right-1 rounded-lg border-l-2 px-2 py-1.5 overflow-hidden cursor-pointer transition-all',
                      borderClass,
                      c.color,
                    )}
                    style={{ top: (c.start - 8) * ROW_H + 2, height: (c.end - c.start) * ROW_H - 4 }}
                  >
                    <p className="text-[10px] font-bold text-white truncate">{c.short}</p>
                    <p className="text-[9px] text-white/70 truncate font-mono">{c.room}</p>
                    {(c.end - c.start) > 1 && (
                      <p className="text-[9px] text-white/50 truncate mt-0.5">{c.type}</p>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}
