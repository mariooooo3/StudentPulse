import { cn } from '../../shared/utils/cn'

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
  secondary: 'bg-white dark:bg-surface-dark border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800',
  ghost: 'text-text-secondary dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
