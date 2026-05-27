import { CalendarClock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { staggerContainer, staggerItem } from '../schedule.constants'

export default function ExamMapView({ exams }) {
  const { t } = useTranslation()
  const now = new Date()
  const sorted = [...exams].sort((a, b) => a.date - b.date)

  if (!sorted.length) {
    return (
      <motion.div className="flex flex-col items-center justify-center py-24 text-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
          <CalendarClock size={24} className="text-indigo-400" strokeWidth={1.75} />
        </div>
        <p className="text-white font-bold mb-1">{t('schedule.examMap.noExams')}</p>
        <p className="text-slate-500 text-sm">{t('schedule.examMap.noExamsText')}</p>
      </motion.div>
    )
  }

  return (
    <motion.div className="p-4 sm:p-6 space-y-3" variants={staggerContainer} initial="hidden" animate="show">
      <div className="flex items-center gap-2 mb-1">
        <CalendarClock size={14} className="text-indigo-400" strokeWidth={1.75} />
        <p className="section-label">{(() => {
          const MONTHS = t('schedule.examMap.months').split('_')
          const first = sorted[0].date, last = sorted[sorted.length - 1].date
          const label = first.getMonth() === last.getMonth()
            ? `${MONTHS[first.getMonth()]} ${first.getFullYear()}`
            : `${MONTHS[first.getMonth()]}–${MONTHS[last.getMonth()]} ${last.getFullYear()}`
          return `${t('schedule.examMap.sessionLabel')} · ${label}`
        })()}</p>
      </div>
      {sorted.map(exam => {
        const daysLeft = Math.ceil((exam.date - now) / 86400000)
        const isPast = daysLeft < 0
        const urgency = isPast ? 'past' : daysLeft <= 2 ? 'urgent' : daysLeft <= 7 ? 'soon' : 'ok'
        const cardCls = {
          past: 'border-white/[0.04] bg-white/[0.01] opacity-50',
          urgent: 'border-rose-500/25 bg-rose-500/[0.04]',
          soon: 'border-amber-500/25 bg-amber-500/[0.04]',
          ok: 'border-white/[0.06] bg-white/[0.02]',
        }[urgency]
        const pillCls = {
          past: 'text-slate-500 bg-slate-800/60',
          urgent: 'text-rose-300 bg-rose-500/15 border border-rose-500/30',
          soon: 'text-amber-300 bg-amber-500/15 border border-amber-500/30',
          ok: 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30',
        }[urgency]
        const pillLabel = isPast
          ? t('schedule.examMap.past')
          : daysLeft === 0 ? t('schedule.examMap.today')
          : daysLeft === 1 ? t('schedule.examMap.tomorrow')
          : t('schedule.examMap.daysLeft', { count: daysLeft })

        return (
          <motion.div key={exam.id} variants={staggerItem} className={`relative rounded-xl border p-4 transition-all ${cardCls}`}>
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: exam.accent }} />
            <div className="pl-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-sm">{exam.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400">{exam.type}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-slate-500">
                  <span>{exam.date.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  <span>{t('schedule.examMap.timePrefix')} {exam.time}</span>
                  <span>{exam.room}</span>
                  <span className="hidden sm:inline">{exam.professor}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${pillCls}`}>{pillLabel}</span>
                <span className="text-[10px] text-slate-600">{exam.credits} ECTS</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
