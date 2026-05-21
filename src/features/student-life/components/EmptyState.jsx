import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, text, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card border-dashed p-14 text-center"
    >
      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: accent?.bg || 'rgba(99,102,241,0.12)', border: `1px solid ${accent?.border || 'rgba(99,102,241,0.2)'}` }}
      >
        <Icon size={24} style={{ color: accent?.color || '#6366f1' }} strokeWidth={1.6} />
      </div>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{text}</p>
    </motion.div>
  )
}
