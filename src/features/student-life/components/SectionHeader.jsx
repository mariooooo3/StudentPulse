import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function SectionHeader({ section, accent, meta, children }) {
  const Icon = meta?.icon || Sparkles
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="relative overflow-hidden rounded-2xl border p-5 dot-grid"
      style={{ borderColor: accent.border, background: `linear-gradient(135deg, ${accent.bg}, rgba(8,14,28,0.85))` }}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl opacity-30"
           style={{ background: accent.color }} />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
               style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
            <Icon size={22} style={{ color: accent.color }} strokeWidth={1.7} />
          </div>
          <div>
            <p className="section-label mb-1.5" style={{ color: accent.color + 'aa' }}>{meta?.kicker}</p>
            <h2 className="text-lg font-black leading-tight text-white">{meta?.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{meta?.description}</p>
          </div>
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </motion.div>
  )
}
