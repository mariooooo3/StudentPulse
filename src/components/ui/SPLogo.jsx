import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

export default function SPLogo({ accent = '#6366f1', accentStrong, size = 'sm' }) {
  const cfg = {
    sm: { container: 36, icon: 16, borderRadius: '0.75rem', bezelRadius: '0.85rem' },
    md: { container: 48, icon: 21, borderRadius: '1rem',    bezelRadius: '1.1rem'  },
    lg: { container: 64, icon: 28, borderRadius: '1.25rem', bezelRadius: '1.4rem'  },
  }[size] || { container: 36, icon: 16, borderRadius: '0.75rem', bezelRadius: '0.85rem' }

  const strong = accentStrong || accent

  return (
    <div className="relative shrink-0" style={{ width: cfg.container, height: cfg.container }}>
      {/* Pulse ring 1 */}
      <motion.div
        animate={{ scale: [1, 1.9], opacity: [0.35, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', repeatDelay: 1.6 }}
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: cfg.bezelRadius, border: `1px solid ${accent}70` }}
      />
      {/* Pulse ring 2 */}
      <motion.div
        animate={{ scale: [1, 1.5], opacity: [0.2, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: 1.0, repeatDelay: 1.6 }}
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: cfg.bezelRadius, border: `1px solid ${accent}40` }}
      />

      {/* Bezel wrapper */}
      <div
        className="absolute inset-0 p-[1.5px]"
        style={{
          borderRadius: cfg.bezelRadius,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.16), rgba(255,255,255,0.03))',
        }}
      >
        {/* Inner button */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            borderRadius: cfg.borderRadius,
            background: `linear-gradient(140deg, ${accent}ee, ${strong}aa)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12), 0 3px 10px ${accent}35`,
          }}
        >
          {/* Activity pulse animation */}
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.4 }}
          >
            <Activity size={cfg.icon} className="text-white drop-shadow-sm" strokeWidth={2} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
