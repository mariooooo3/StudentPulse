import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import clsx from 'clsx'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const STYLES = {
  success: 'border-emerald-500/30 text-emerald-400',
  error: 'border-red-500/30 text-red-400',
  info: 'border-indigo-500/30 text-indigo-400',
}

function ToastItem({ toast, onRemove }) {
  const Icon = ICONS[toast.type] || Info

  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), toast.duration || 3500)
    return () => clearTimeout(t)
  }, [toast.id])

  return (
    <div className="animate-slide-up flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] bg-[#0c1120] border border-white/[0.07] rounded-2xl px-4 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <Icon size={15} strokeWidth={1.75} className={clsx('shrink-0 mt-0.5', STYLES[toast.type])} />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-[13px] font-semibold text-white leading-tight">{toast.title}</p>}
        {toast.message && <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 text-slate-700 hover:text-slate-400 transition-colors mt-0.5">
        <X size={13} strokeWidth={1.75} />
      </button>
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
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx.push
}
