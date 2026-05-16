import { cn } from '../../shared/utils/cn'

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_0_1px_rgba(99,102,241,0.3)] active:scale-[0.97]',
  secondary: 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] active:scale-[0.97]',
  ghost: 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] active:scale-[0.97]',
  danger: 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_0_1px_rgba(239,68,68,0.3)] active:scale-[0.97]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4 py-2 text-[13px]',
  lg: 'px-6 py-2.5 text-[14px]',
}

export default function Button({ children, variant = 'primary', size = 'md', className, themeColor, ...props }) {
  const inlineStyle = themeColor && variant === 'primary'
    ? {
        background: themeColor,
        boxShadow: `0 0 0 1px ${themeColor}50`,
      }
    : undefined

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      style={inlineStyle}
      {...props}
    >
      {children}
    </button>
  )
}
