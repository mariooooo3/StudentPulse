import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Flame, RotateCcw, Sparkles, Sprout, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PI_DECIMALS } from '../../../shared/data/piDigits'
import { SECS_PER_DIGIT } from '../constants/sectionConfig'
import { useAuth } from '../../../app/providers/AuthContext'
import { useStreaks } from '../../../shared/hooks/useStreaks'

export default function FocusForest() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const { focusStreak, incrementFocus } = useStreaks(session?.userId)
  const [mode, setMode] = useState('timer')
  const [minutes, setMinutes] = useState(25)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [failed, setFailed] = useState(false)
  const [justRevealed, setJustRevealed] = useState(false)
  const [completed, setCompleted] = useState(() => {
    try { return Number(localStorage.getItem('sp_focus_trees') || 0) } catch { return 0 }
  })
  const [bestDigits, setBestDigits] = useState(() => {
    try { return Number(localStorage.getItem('sp_pi_best') || 2) } catch { return 2 }
  })
  const intervalRef    = useRef(null)
  const prevDigitsRef  = useRef(2)
  const targetSeconds  = Math.max(1, minutes) * 60
  const hasTimer       = mode === 'timer'
  const progress       = hasTimer ? Math.min(1, elapsed / targetSeconds) : (elapsed % SECS_PER_DIGIT) / SECS_PER_DIGIT

  const revealedDecimals = Math.min(PI_DECIMALS.length, 2 + Math.floor(elapsed / SECS_PER_DIGIT))

  useEffect(() => {
    if (revealedDecimals > prevDigitsRef.current) {
      prevDigitsRef.current = revealedDecimals
      setJustRevealed(true)
      const t = setTimeout(() => setJustRevealed(false), 800)
      return () => clearTimeout(t)
    }
  }, [revealedDecimals])

  function saveBest(value) {
    if (value > bestDigits) {
      setBestDigits(value)
      localStorage.setItem('sp_pi_best', String(value))
    }
  }

  useEffect(() => {
    if (!running) return undefined
    intervalRef.current = setInterval(() => {
      setElapsed(value => {
        const next = value + 1
        if (hasTimer && next >= targetSeconds) {
          clearInterval(intervalRef.current)
          setRunning(false)
          setCompleted(total => {
            const saved = total + 1
            localStorage.setItem('sp_focus_trees', String(saved))
            return saved
          })
          incrementFocus()
          return targetSeconds
        }
        return next
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, hasTimer, targetSeconds])

  useEffect(() => {
    function failSession() {
      if (!running) return
      clearInterval(intervalRef.current)
      setRunning(false)
      setFailed(true)
      saveBest(revealedDecimals)
      setElapsed(0)
      prevDigitsRef.current = 2
    }
    function handleVisibility() { if (document.hidden) failSession() }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', failSession)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', failSession)
    }
  }, [running, revealedDecimals])

  function switchMode(nextMode) {
    if (running) return
    setMode(nextMode)
    setElapsed(0)
    setFailed(false)
    prevDigitsRef.current = 2
  }

  function start() {
    setElapsed(0)
    setFailed(false)
    setRunning(true)
    prevDigitsRef.current = 2
  }

  function stop() {
    clearInterval(intervalRef.current)
    setRunning(false)
    saveBest(revealedDecimals)
  }

  function reset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setFailed(false)
    saveBest(revealedDecimals)
    setElapsed(0)
    prevDigitsRef.current = 2
  }

  const remaining       = Math.max(0, targetSeconds - elapsed)
  const displaySeconds  = hasTimer ? remaining : elapsed
  const mins            = String(Math.floor(displaySeconds / 60)).padStart(2, '0')
  const secs            = String(displaySeconds % 60).padStart(2, '0')
  const visibleStr      = PI_DECIMALS.slice(0, revealedDecimals)
  const hiddenStr       = PI_DECIMALS.slice(revealedDecimals, revealedDecimals + 42)
  const groups          = []
  for (let i = 0; i < visibleStr.length; i += 5) groups.push(visibleStr.slice(i, i + 5))

  const maxPossible  = hasTimer ? Math.min(PI_DECIMALS.length, 2 + Math.floor(targetSeconds / SECS_PER_DIGIT)) : PI_DECIMALS.length
  const nextDigitIn  = SECS_PER_DIGIT - (elapsed % SECS_PER_DIGIT)
  const modeCopy     = hasTimer
    ? { eyebrow: t('focusForest.eyebrowTimer'), title: t('focusForest.titleTimer'), metric: Math.round((elapsed / targetSeconds) * 100) + t('focusForest.metricTimer') }
    : { eyebrow: t('focusForest.eyebrowEndless'), title: t('focusForest.titleEndless'), metric: t('focusForest.metricEndless', { n: nextDigitIn }) }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080d18] shadow-[0_22px_80px_-42px_rgba(0,0,0,0.9)]">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px]">
        {/* ── Main pi panel ─────────────────────────────────────── */}
        <div className="relative min-h-[360px] overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.18),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(124,58,237,0.24),transparent_34%),linear-gradient(135deg,#090f1c,#111827_55%,#07111f)] p-6 xl:border-b-0 xl:border-r dot-grid">
          <div className="pointer-events-none absolute -right-10 -top-16 select-none text-[210px] font-black leading-none text-white/[0.035]">π</div>
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-label text-teal-200/70">π Focus · {modeCopy.eyebrow}</p>
              <h3 className="mt-2 max-w-xl text-2xl font-black tracking-tight text-white">{modeCopy.title}</h3>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-right backdrop-blur">
              <p className="font-mono text-2xl font-black tabular-nums text-white">{mins}:{secs}</p>
              <p className="mt-0.5 section-label">{hasTimer ? t('focusForest.labelRemaining') : t('focusForest.labelTotal')}</p>
            </div>
          </div>

          <div className="relative z-10 mt-10 rounded-2xl border border-white/[0.08] bg-black/20 p-5 backdrop-blur-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-[11px] font-bold text-teal-100">
                <Sparkles size={12} /> {revealedDecimals} {t('focusForest.decimalsRevealed')}
              </div>
              <span className="font-mono text-xs font-semibold text-slate-500">{modeCopy.metric}</span>
            </div>
            <div className="font-mono leading-loose break-words">
              <span className="text-3xl font-black text-teal-200">3.</span>
              <span className="text-xl font-bold text-white">
                {groups.map((group, gi) => (
                  <span key={`g-${gi}`} className="mr-2 inline-block">
                    {group.split('').map((digit, di) => {
                      const isLast = gi === groups.length - 1 && di === group.length - 1
                      return (
                        <span
                          key={`${gi}-${di}`}
                          className={clsx(
                            'transition-all duration-300',
                            isLast && justRevealed
                              ? 'text-emerald-200 drop-shadow-[0_0_12px_rgba(110,231,183,0.95)]'
                              : isLast
                              ? 'text-teal-200'
                              : 'text-white',
                          )}
                        >
                          {digit}
                        </span>
                      )
                    })}
                  </span>
                ))}
              </span>
              {hiddenStr && <span className="text-base text-slate-700 select-none">{'?'.repeat(hiddenStr.length)}...</span>}
            </div>
          </div>

          <div className="relative z-10 mt-6">
            <div className="mb-2 flex justify-between section-label">
              <span>3.14</span>
              <span>{hasTimer ? Math.round(progress * 100) + '%' : t('focusForest.nextDigit')}</span>
              <span>{hasTimer ? t('focusForest.maxPossible', { n: maxPossible }) : t('focusForest.unlimited')}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-300 transition-all duration-1000"
                style={{ width: (progress * 100) + '%' }}
              />
            </div>
          </div>
        </div>

        {/* ── Control panel ─────────────────────────────────────── */}
        <div className="p-5 space-y-4">
          <p className="section-label">{t('focusForest.sessionControl')}</p>

          {/* Timer / endless toggle */}
          <div className="grid grid-cols-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-1">
            {[['timer', t('focusForest.withTimer')], ['endless', t('focusForest.withoutTimer')]].map(([value, label]) => (
              <button
                key={value}
                onClick={() => switchMode(value)}
                disabled={running}
                className={clsx(
                  'h-9 rounded-xl text-xs font-bold transition-all disabled:cursor-default',
                  mode === value ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Duration presets */}
          {hasTimer && (
            <div className="grid grid-cols-3 gap-2">
              {[15, 25, 45].map(v => (
                <button
                  key={v}
                  onClick={() => !running && setMinutes(v)}
                  disabled={running}
                  className={clsx(
                    'h-10 rounded-xl border text-xs font-bold transition-all active:scale-[0.97] disabled:cursor-default',
                    minutes === v
                      ? 'border-teal-300/30 bg-teal-300/12 text-teal-100'
                      : 'border-white/[0.06] bg-white/[0.03] text-slate-500 hover:text-slate-300',
                  )}
                >
                  {v} min
                </button>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3">
            <p className="text-xs font-semibold leading-relaxed text-slate-400"
              dangerouslySetInnerHTML={{ __html: t('focusForest.infoText', { n: SECS_PER_DIGIT })
                .replace('<b>', '<span class="font-bold text-teal-200">')
                .replace('</b>', '</span>') }}
            />
            <div className={clsx('grid gap-2', focusStreak > 0 ? 'grid-cols-3' : 'grid-cols-2')}>
              <div className="rounded-xl bg-black/20 p-3">
                <p className="section-label">{t('focusForest.record')}</p>
                <p className="mt-1 font-mono text-xl font-black text-white">{bestDigits}</p>
              </div>
              <div className="rounded-xl bg-black/20 p-3">
                <p className="section-label">{t('focusForest.sessions')}</p>
                <p className="mt-1 font-mono text-xl font-black text-white">{completed}</p>
              </div>
              {focusStreak > 0 && (
                <div className="rounded-xl bg-orange-400/10 border border-orange-400/20 p-3">
                  <p className="section-label text-orange-300/60">{t('focusForest.streak')}</p>
                  <p className="mt-1 font-mono text-xl font-black text-orange-300 flex items-center gap-1">
                    <Flame size={14} /> {focusStreak}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={running ? stop : start}
              className={clsx(
                'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all active:scale-[0.97]',
                running
                  ? 'border border-red-500/30 bg-red-500/10 text-red-300'
                  : 'border border-teal-300/30 bg-teal-400/15 text-teal-100',
              )}
            >
              {running ? <X size={15} /> : <Sprout size={15} />}
              {running ? t('focusForest.stop') : t('focusForest.start')}
            </button>
            <button onClick={reset} className="btn-ghost h-11 px-3">
              <RotateCcw size={15} />
            </button>
          </div>

          {failed && (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200">
              {t('focusForest.interrupted')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
