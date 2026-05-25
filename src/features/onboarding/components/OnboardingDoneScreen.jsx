import { Check, Loader2, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { ONBOARDING_MODULES } from '../onboarding.constants'

export default function OnboardingDoneScreen({ aiLoading, aiProfile, answers, university, onComplete }) {
  return (
    <div className="min-h-screen bg-[#050810] dot-grid flex items-center justify-center p-8 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />

      <motion.div
        className="text-center max-w-md relative"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      >
        <div className="mx-auto w-fit mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl scale-150" />
          <div className="p-[1.5px] rounded-full bg-gradient-to-b from-emerald-400/40 to-emerald-500/10 relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Check size={36} className="text-white" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Profilul tău este gata!</h2>

        <AnimatePresence mode="wait">
          {aiLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-6"
            >
              <Loader2 size={14} className="animate-spin text-emerald-400" />
              <span>Se generează profilul tău personalizat...</span>
            </motion.div>
          ) : aiProfile ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
              className="mb-6 space-y-3"
            >
              <p className="text-slate-300 leading-relaxed text-sm">{aiProfile.welcomeMessage}</p>
              {aiProfile.personalityTag && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  {aiProfile.personalityTag}
                </span>
              )}
              {aiProfile.urgentTasks?.length > 0 && (
                <div className="text-left rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 space-y-1">
                  <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Primii pași</p>
                  {aiProfile.urgentTasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-amber-400 mt-0.5 shrink-0">→</span> {task}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.p key="default" className="text-slate-400 mb-6 leading-relaxed text-sm">
              StudentPulse a personalizat toate modulele în funcție de facultatea, anul și interesele tale.
              De acum, nu te mai pierzi.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-2.5 mb-8">
          {ONBOARDING_MODULES.map(([e, l], i) => (
            <motion.div
              key={l}
              className="glass-card p-3 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, type: 'spring', stiffness: 80, damping: 18 }}
            >
              <div className="text-2xl mb-1">{e}</div>
              <div className="text-[11px] text-slate-400 font-semibold">{l}</div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => onComplete({
            faculty: answers.faculty?.name || university?.shortName || 'FII',
            facultyCode: answers.faculty?.code || '',
            facultyType: answers.faculty?.type || 'CS',
            specialization: answers.specialization?.label || null,
            year: answers.year?.label || 'Anul 1',
            interests: answers.interests || [],
            learningStyle: answers.learning_style?.label,
            housing: answers.housing?.label,
          })}
          className="btn-primary w-full text-base py-3 gap-2"
        >
          <Sparkles size={16} />
          Intră în StudentPulse
        </button>
      </motion.div>
    </div>
  )
}
