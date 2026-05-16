import { cn } from '../../shared/utils/cn'

const variants = {
  default: 'bg-white/[0.05] text-slate-400 border border-white/[0.08]',
  primary: 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  danger: 'bg-red-500/15 text-red-400 border border-red-500/25',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
