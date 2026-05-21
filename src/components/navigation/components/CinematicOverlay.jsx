import { motion, AnimatePresence } from 'framer-motion'
import { Play, ChevronLeft, ChevronRight, CheckCircle, X, Volume2, VolumeX } from 'lucide-react'
import { speak } from '../utils/navigationHelpers'

export default function CinematicOverlay({
  cinematicMode,
  cinematicStep,
  cinematicSteps,
  voiceEnabled,
  setVoiceEnabled,
  onNext,
  onPrev,
  onExit,
}) {
  return (
    <AnimatePresence>
      {cinematicMode && (() => {
        const currentStep = cinematicSteps[cinematicStep]
        const isLast = cinematicStep === cinematicSteps.length - 1
        return (
          <motion.div
            key="cinematic-overlay"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-[9998] px-3 pb-5 pt-2"
          >
            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl bg-[#080d1a]/96 backdrop-blur-2xl border border-white/[0.12] shadow-2xl overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-white/[0.06]">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    animate={{ width: `${((cinematicStep + 1) / cinematicSteps.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>

                <div className="p-4">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <Play size={10} fill="white" className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                        Guided Tour
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {cinematicStep + 1} / {cinematicSteps.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const next = !voiceEnabled
                          setVoiceEnabled(next)
                          if (!next) window.speechSynthesis?.cancel()
                          else speak(currentStep?.instruction, true)
                        }}
                        className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
                      >
                        {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      </button>
                      <button
                        onClick={onExit}
                        className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                        title="Exit tour"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Step content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={cinematicStep}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.22 }}
                      className="flex items-start gap-3 mb-4"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                        currentStep?.isFinal
                          ? 'bg-green-500/15 border border-green-500/25'
                          : 'bg-indigo-500/15 border border-indigo-500/20'
                      }`}>
                        {currentStep?.icon}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm font-semibold text-white leading-relaxed whitespace-pre-line">
                          {currentStep?.instruction}
                        </p>
                        {currentStep?.isFinal && (
                          <p className="text-xs text-green-400 mt-1 flex items-center gap-1.5">
                            <CheckCircle size={11} /> Destination reached
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onPrev}
                      disabled={cinematicStep === 0}
                      className="flex-1 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-25 border border-white/[0.07] text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ChevronLeft size={15} /> Back
                    </button>
                    {!isLast ? (
                      <button
                        onClick={onNext}
                        className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
                      >
                        Next <ChevronRight size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={onExit}
                        className="flex-1 h-9 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
                      >
                        <CheckCircle size={14} /> Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })()}
    </AnimatePresence>
  )
}
