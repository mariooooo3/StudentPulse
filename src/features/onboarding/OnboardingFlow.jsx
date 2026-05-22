import { ChevronRight, ChevronLeft, Compass } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { ProgressBar, SelectOption, CardOption, TagOptions, FacultyStep } from './components/OnboardingStepParts'
import OnboardingDoneScreen from './components/OnboardingDoneScreen'
import { useOnboardingFlow } from './hooks/useOnboardingFlow'

// ─── Progress bar ─────────────────────────────────────────────────────────────
export default function OnboardingFlow({ onComplete, session }) {
  const {
    step,
    direction,
    answers,
    done,
    aiProfile,
    aiLoading,
    university,
    universityFaculties,
    total,
    q,
    answer,
    canProceed,
    setAnswer,
    setFaculty,
    toggleTag,
    next,
    prev,
  } = useOnboardingFlow(session)

  // ─── Done screen ─────────────────────────────────────────────────────────────
  if (done) {
    return (
      <OnboardingDoneScreen
        aiLoading={aiLoading}
        aiProfile={aiProfile}
        answers={answers}
        university={university}
        onComplete={onComplete}
      />
    )
  }

  // ─── Step card variants ─────────────────────────────────────────────────────── ───────────────────────────────────────────────────────
  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
  }

  // ─── Main flow ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050810] dot-grid flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Top glow orb */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-500/10 via-indigo-500/[0.03] to-transparent" />
      <div className="pointer-events-none absolute top-[-8rem] left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] rounded-full bg-indigo-500/[0.07] blur-3xl" />

      {/* Logo */}
      <motion.div
        className="flex items-center gap-3 mb-10 relative"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      >
        <div className="p-[1.5px] rounded-[0.85rem] bg-gradient-to-b from-white/[0.12] to-white/[0.03]">
          <div className="w-10 h-10 rounded-[0.75rem] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Compass size={20} className="text-white" />
          </div>
        </div>
        <div>
          <p className="font-bold text-white text-[14px] tracking-tight">StudentCompass</p>
          <p className="text-xs text-slate-600">Setup profil · pas {step + 1} din {total}</p>
        </div>
      </motion.div>

      <div className="w-full max-w-md relative">
        <ProgressBar step={step} total={total} />

        {/* Step card with slide transition */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={q.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* bezel-card */}
            <div className="bezel-card">
              <div className="bezel-inner p-8">
                {/* Emoji */}
                <div className="text-4xl mb-5 select-none">{q.emoji}</div>

                {/* Title + subtitle */}
                <h2 className="text-[1.35rem] font-bold text-white mb-1.5 tracking-tight leading-snug">
                  {q.question}
                </h2>
                <p className="text-slate-500 mb-7 text-sm leading-relaxed">{q.subtitle}</p>

                {/* Step body */}
                {q.type === 'faculty' && (
                  <FacultyStep
                    value={answers.faculty}
                    onChange={setFaculty}
                    universityFaculties={universityFaculties}
                  />
                )}
                {q.type === 'select' && (
                  <div className="space-y-2">
                    {q.options.map(opt => (
                      <SelectOption key={opt} label={opt} selected={answer === opt} onClick={() => setAnswer(opt)} />
                    ))}
                  </div>
                )}
                {q.type === 'cards' && (
                  <div className="space-y-2">
                    {q.options.map(opt => (
                      <CardOption
                        key={opt.label}
                        opt={opt}
                        selected={answer?.label === opt.label}
                        onClick={() => setAnswer(opt)}
                      />
                    ))}
                  </div>
                )}
                {q.type === 'tags' && (
                  <TagOptions
                    options={q.options}
                    selected={answers[q.id] || []}
                    onToggle={toggleTag}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={17} />
            Înapoi
          </button>

          <span className="text-[11px] font-mono text-slate-700">
            {step + 1} / {total}
          </span>

          <button
            onClick={next}
            disabled={!canProceed()}
            className={clsx(
              'flex items-center gap-2 btn-primary text-sm transition-opacity',
              !canProceed() && 'opacity-35 cursor-not-allowed',
            )}
          >
            {step === total - 1 ? 'Finalizează' : 'Continuă'}
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}






