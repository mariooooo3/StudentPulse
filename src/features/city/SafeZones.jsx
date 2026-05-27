import { ChevronLeft, Phone, Shield, AlertTriangle, CheckCircle, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { safetyZones, emergencyContacts } from '../../shared/data/cityData'
import clsx from 'clsx'

const LEVEL_META = {
  safe:     { icon: CheckCircle,    color: '#10b981' },
  moderate: { icon: Shield,         color: '#f59e0b' },
  caution:  { icon: AlertTriangle,  color: '#ef4444' },
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
}
const itemVar = {
  hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 20 } },
}

export default function SafeZones({ onBack }) {
  const { t } = useTranslation()
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 overflow-hidden"
      >
        <div className="dot-grid absolute inset-0 opacity-25 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 90% at 0% 50%, #f43f5e40, transparent)' }}
        />

        <div className="relative flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.09] hover:border-white/[0.14] transition-all shrink-0"
          >
            <ChevronLeft size={16} className="text-slate-400" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: '#f43f5e20', border: '1.5px solid #f43f5e45' }}>
                <Shield size={14} style={{ color: '#f43f5e' }} />
              </div>
              <h2 className="text-lg font-bold text-white">{t('cityContent.safety.title')}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-9">{t('cityContent.safety.subtitle')}</p>
          </div>
        </div>

        {/* Safety legend */}
        <div className="relative flex gap-4 mt-4">
          {Object.entries(LEVEL_META).map(([key, meta]) => {
            const Icon = meta.icon
            return (
              <div key={key} className="flex items-center gap-1.5 text-xs text-slate-400">
                <Icon size={12} style={{ color: meta.color }} />
                <span>{t(`cityContent.safety.levels.${key}`)}</span>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Zones */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {safetyZones.map((zone) => {
          const meta = LEVEL_META[zone.level]
          const Icon = meta.icon
          return (
            <motion.div key={zone.id} variants={itemVar}>
              <div className="group relative flex items-start gap-3 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.11] transition-all duration-200 overflow-hidden">
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                  style={{ background: zone.color + '80' }}
                />

                {/* Zone icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                  style={{ background: zone.color + '20', border: `1.5px solid ${zone.color}40` }}
                >
                  <Icon size={16} style={{ color: zone.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {zone.name || zone.neighborhood}
                    </span>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: zone.color + '20', color: zone.color }}
                    >
                      {t(`cityContent.safety.levels.${zone.level}`)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{zone.desc}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Emergency contacts */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 80, damping: 18 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="section-label">{t('cityContent.safety.emergency')}</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {emergencyContacts.map((c) => (
            <a
              key={`${c.name}-${c.number}`}
              href={`tel:${c.number}`}
              className="group flex items-center gap-3 p-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-rose-500/30 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                style={{ background: '#f43f5e18', border: '1.5px solid #f43f5e40' }}>
                <Phone size={14} style={{ color: '#f43f5e' }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-300 group-hover:text-white truncate transition-colors">
                  {c.name}
                </p>
                <p className="text-sm font-bold" style={{ color: '#f43f5e' }}>{c.number}</p>
              </div>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
