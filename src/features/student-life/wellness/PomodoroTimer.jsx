import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Flame, Pause, Play, RotateCcw } from 'lucide-react'
import { SECTION_ACCENTS } from '../constants/sectionConfig'
import AccentLine from '../components/AccentLine'
import { useStreaksContext } from '../../../app/providers/StreaksContext'

export default function PomodoroTimer() {
  const { focusStreak, incrementFocus } = useStreaksContext()
  const accent = SECTION_ACCENTS.wellness
  const [mode, setMode] = useState('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)

  const DURATIONS = { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 }
  const LABELS    = { work: 'Focus', shortBreak: 'Pauză scurtă', longBreak: 'Pauză lungă' }

  function startStop(shouldRun) {
    if (shouldRun) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setRunning(false)
            clearInterval(intervalRef.current)
            if (mode === 'work') { setSessions(s => s + 1); incrementFocus() }
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  function switchMode(m) {
    clearInterval(intervalRef.current)
    setMode(m)
    setTimeLeft(DURATIONS[m])
    setRunning(false)
  }

  function handleToggle() {
    const next = !running
    setRunning(next)
    startStop(next)
  }

  function handleReset() {
    clearInterval(intervalRef.current)
    setTimeLeft(DURATIONS[mode])
    setRunning(false)
  }

  const mins     = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs     = String(timeLeft % 60).padStart(2, '0')
  const progress = 1 - timeLeft / DURATIONS[mode]
  const circumference = 2 * Math.PI * 45

  return (
    <div className="premium-card p-6 text-center">
      <AccentLine color={accent.color} />
      <h3 className="text-sm font-bold text-white mb-4">Timer Pomodoro</h3>

      {/* Mode selector */}
      <div className="flex justify-center gap-1 mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {Object.entries(LABELS).map(([m, l]) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={clsx(
              'flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all',
              mode === m ? 'text-white' : 'text-slate-500 hover:text-slate-300',
            )}
            style={mode === m ? { background: accent.bg, color: accent.color } : undefined}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative w-36 h-36 mx-auto mb-6">
        {/* Glow behind the progress arc */}
        {running && (
          <div
            className="absolute inset-2 rounded-full blur-xl opacity-20 animate-glow-pulse"
            style={{ background: accent.color }}
          />
        )}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          {/* Track shadow */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="6"
            style={{ filter: 'blur(1px)' }} />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={accent.color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            className="transition-all duration-1000"
            style={{ filter: `drop-shadow(0 0 6px ${accent.color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-black tabular-nums text-white">{mins}:{secs}</span>
          <span className="mt-0.5 text-[10px] font-semibold text-slate-500">{LABELS[mode]}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={handleReset} className="btn-ghost p-2">
          <RotateCcw size={15} />
        </button>
        <button
          onClick={handleToggle}
          className="flex h-12 w-12 items-center justify-center rounded-full transition-all active:scale-95"
          style={{ background: accent.color, boxShadow: `0 0 20px ${accent.color}50` }}
        >
          {running
            ? <Pause size={18} className="text-white" />
            : <Play size={18} className="text-white ml-0.5" />
          }
        </button>
      </div>

      <p className="font-mono text-xs text-slate-600 mt-4">{sessions} sesiuni completate azi</p>
      <div className={clsx(
        'mt-3 flex items-center justify-center gap-2 rounded-xl border px-3 py-2 transition-colors duration-300',
        focusStreak > 0
          ? 'border-orange-400/20 bg-orange-400/10'
          : 'border-white/[0.05] bg-white/[0.02]',
      )}>
        <Flame size={15} className={focusStreak > 0 ? 'text-orange-300' : 'text-slate-700'} />
        <span className={clsx('font-mono text-sm font-black', focusStreak > 0 ? 'text-orange-200' : 'text-slate-600')}>
          {focusStreak}
        </span>
        <span className={clsx('text-[11px] font-semibold', focusStreak > 0 ? 'text-orange-400/80' : 'text-slate-700')}>
          {focusStreak === 0 ? 'Pornește prima sesiune!' : focusStreak === 1 ? 'zi la rând' : 'zile la rând'}
        </span>
      </div>
    </div>
  )
}
