import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import clsx from 'clsx'

const ToastContext = createContext(null)

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    borderClass: 'border-l-emerald-500',
    progressClass: 'bg-emerald-500',
    glowClass: 'shadow-[0_0_12px_rgba(16,185,129,0.12)]',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-400',
    borderClass: 'border-l-amber-500',
    progressClass: 'bg-amber-500',
    glowClass: 'shadow-[0_0_12px_rgba(245,158,11,0.12)]',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-red-400',
    borderClass: 'border-l-red-500',
    progressClass: 'bg-red-500',
    glowClass: 'shadow-[0_0_12px_rgba(239,68,68,0.12)]',
  },
  info: {
    icon: Info,
    iconClass: 'text-indigo-400',
    borderClass: 'border-l-indigo-500',
    progressClass: 'bg-indigo-500',
    glowClass: 'shadow-[0_0_12px_rgba(99,102,241,0.12)]',
  },
}

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const duration = toast.duration || 3500
  const startRef = useRef(null)
  const rafRef = useRef(null)
  const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info
  const Icon = config.icon

  // Slide in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Animated progress bar + auto-dismiss
  useEffect(() => {
    startRef.current = performance.now()

    function tick(now) {
      const elapsed = now - startRef.current
      const remaining = Math.max(0, 1 - elapsed / duration)
      setProgress(remaining * 100)
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        handleRemove()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [toast.id, duration])

  function handleRemove() {
    setVisible(false)
    setTimeout(() => onRemove(toast.id), 250)
  }

  return (
    <div
      className={clsx(
        'relative w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/[0.07] border-l-2 bg-[#0b1020]/98 backdrop-blur-xl transition-all duration-250',
        config.borderClass,
        config.glowClass,
        visible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-8 opacity-0',
      )}
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)' }}
    >
      {/* Content */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        <Icon
          size={15}
          strokeWidth={1.75}
          className={clsx('mt-0.5 shrink-0', config.iconClass)}
        />
        <div className="min-w-0 flex-1">
          {toast.title && (
            <p className="text-[13px] font-semibold leading-tight text-white">{toast.title}</p>
          )}
          {toast.message && (
            <p className={clsx('text-[12px] leading-relaxed text-slate-500', toast.title && 'mt-0.5')}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-white/[0.07] hover:text-slate-400"
        >
          <X size={12} strokeWidth={2} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] w-full bg-white/[0.04]">
        <div
          className={clsx('h-full transition-none', config.progressClass)}
          style={{ width: `${progress}%`, opacity: 0.6 }}
        />
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, ...toast }])
  }, [])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx.push
}
