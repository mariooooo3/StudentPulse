import { useEffect, useState } from 'react'
import { BookOpen, GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function GradeCalculatorView({ exams, session }) {
  const { t } = useTranslation()
  const storageKey = `sc_grades_${session?.email || 'guest'}`

  const [grades, setGrades] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') }
    catch { return {} }
  })

  useEffect(() => {
    try { setGrades(JSON.parse(localStorage.getItem(storageKey) || '{}')) }
    catch { setGrades({}) }
  }, [storageKey])

  function updateGrade(name, raw) {
    const next = { ...grades, [name]: raw }
    setGrades(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const subjects = exams.map(e => ({ ...e, grade: parseFloat(grades[e.name]) || null }))
  const graded = subjects.filter(s => s.grade !== null && s.grade >= 1 && s.grade <= 10)
  const totalEcts = subjects.reduce((sum, s) => sum + s.credits, 0)
  const gradedEcts = graded.reduce((sum, s) => sum + s.credits, 0)
  const average = graded.length ? graded.reduce((sum, s) => sum + s.grade * s.credits, 0) / gradedEcts : null
  const avgColor = average === null ? 'text-slate-500' : average >= 8.5 ? 'text-emerald-300' : average >= 5 ? 'text-amber-300' : 'text-rose-300'

  if (!subjects.length) {
    return (
      <motion.div className="flex flex-col items-center justify-center py-24 text-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
          <GraduationCap size={24} className="text-indigo-400" strokeWidth={1.75} />
        </div>
        <p className="text-white font-bold mb-1">{t('schedule.gradeCalc.noSubjects')}</p>
        <p className="text-slate-500 text-sm">{t('schedule.gradeCalc.noSubjectsText')}</p>
      </motion.div>
    )
  }

  return (
    <motion.div className="p-4 sm:p-6 space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className={`text-2xl font-black ${avgColor}`}>{average ? average.toFixed(2) : '—'}</p>
          <p className="text-[11px] text-slate-500 mt-1">{t('schedule.gradeCalc.weightedAvg')}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-2xl font-black text-white">
            {gradedEcts}<span className="text-sm font-semibold text-slate-500">/{totalEcts}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{t('schedule.gradeCalc.ectsCompleted')}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-2xl font-black text-white">
            {graded.length}<span className="text-sm font-semibold text-slate-500">/{subjects.length}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{t('schedule.gradeCalc.gradesEntered')}</p>
        </div>
      </div>

      {graded.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{t('schedule.gradeCalc.sessionProgress')}</span>
            <span>{Math.round(gradedEcts / totalEcts * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${gradedEcts / totalEcts * 100}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 18 }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={13} className="text-slate-500" strokeWidth={1.75} />
          <p className="section-label">{t('schedule.gradeCalc.gradesPerSubject')}</p>
        </div>
        {subjects.map(s => {
          const g = s.grade
          const inputCls = g === null ? 'text-slate-300' : g >= 5 ? 'text-emerald-300' : 'text-rose-300'
          return (
            <div key={s.name} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: s.accent }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                <p className="text-xs text-slate-500">{s.type} · {s.credits} ECTS</p>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={grades[s.name] || ''}
                onChange={e => updateGrade(s.name, e.target.value)}
                placeholder="—"
                className={`w-16 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm font-bold text-center outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-600 ${inputCls}`}
              />
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
