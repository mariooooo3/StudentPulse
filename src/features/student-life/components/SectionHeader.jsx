import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function SectionHeader({ section, accent, meta, children }) {
  const { t } = useTranslation()
  const Icon = meta?.icon || Sparkles
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 130, damping: 22 }}
      className="relative overflow-hidden rounded-2xl border p-5 dot-grid"
      style={{ borderColor: accent.border, background: `linear-gradient(135deg, ${accent.bg}, rgba(8,14,28,0.88))` }}
    >
      {/* Top accent line */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent.color}80, transparent)` }}
      />
      {/* Glow orb */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl opacity-25"
           style={{ background: accent.color }} />
      {/* Second subtle orb bottom-left */}
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full blur-2xl opacity-10"
           style={{ background: accent.color }} />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Icon with bezel */}
          <div className="p-[1.5px] rounded-2xl shrink-0"
               style={{ background: `linear-gradient(to bottom, ${accent.color}40, ${accent.color}10)` }}>
            <div className="flex h-11 w-11 items-center justify-center rounded-[calc(1rem-1.5px)]"
                 style={{ background: `linear-gradient(140deg, ${accent.bg}, rgba(8,14,28,0.9))`, border: `1px solid ${accent.border}` }}>
              <Icon size={20} style={{ color: accent.color }} strokeWidth={1.75} />
            </div>
          </div>
          <div>
            <p className="section-label mb-1.5" style={{ color: accent.color + 'aa' }}>{t(`sectionMeta.${section}.kicker`)}</p>
            <h2 className="text-lg font-black leading-tight text-white">{t(`sectionMeta.${section}.title`)}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{t(`sectionMeta.${section}.description`)}</p>
          </div>
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </motion.div>
  )
}
