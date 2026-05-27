import {
  X,
  Palette,
  Bell,
  Accessibility,
  Monitor,
  RotateCcw,
  Info,
  Moon,
  Sun,
  Languages,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../providers/SettingsContext'
import { getUniversityTheme } from '../../shared/utils/theme'

const ACCENT_COLORS = [
  { id: 'indigo',  labelKey: 'settings.colors.indigo',  color: '#6366f1' },
  { id: 'violet',  labelKey: 'settings.colors.violet',  color: '#8b5cf6' },
  { id: 'blue',    labelKey: 'settings.colors.blue',    color: '#3b82f6' },
  { id: 'cyan',    labelKey: 'settings.colors.cyan',    color: '#06b6d4' },
  { id: 'emerald', labelKey: 'settings.colors.emerald', color: '#10b981' },
  { id: 'rose',    labelKey: 'settings.colors.rose',    color: '#f43f5e' },
  { id: 'orange',  labelKey: 'settings.colors.orange',  color: '#f97316' },
  { id: 'amber',   labelKey: 'settings.colors.amber',   color: '#f59e0b' },
]

const LANGUAGES = [
  { id: 'ro', label: 'Română',   flag: '🇷🇴' },
  { id: 'en', label: 'English',  flag: '🇬🇧' },
  { id: 'es', label: 'Español',  flag: '🇪🇸' },
  { id: 'it', label: 'Italiano', flag: '🇮🇹' },
]

function Toggle({ checked, onChange, theme }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!checked)
      }}
      className="relative h-6 w-11 rounded-full border-2 transition-all duration-250 shrink-0 focus:outline-none"
      style={{
        background: checked ? theme.accent : 'rgba(255,255,255,0.06)',
        borderColor: checked ? theme.accent : 'rgba(255,255,255,0.12)',
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0px)' }}
      />
    </button>
  )
}

function SettingRow({ label, description, checked, onChange, theme }) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-colors duration-150"
      onClick={() => onChange(!checked)}
    >
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-slate-200 leading-snug">{label}</p>
        {description && <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{description}</p>}
      </div>
      <Toggle checked={!!checked} onChange={onChange} theme={theme} />
    </div>
  )
}

function SectionHeader({ icon: Icon, label, theme }) {
  return (
    <div className="flex items-center gap-2 mb-3 px-1">
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: theme.accentSoft }}
      >
        <Icon size={12} style={{ color: theme.accent }} />
      </div>
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">{label}</h3>
    </div>
  )
}

export default function SettingsPanel({ open, onClose, session }) {
  const { settings, updateSetting } = useSettings()
  const { t } = useTranslation()

  const customAccent = settings.customAccentColor || null
  const theme = getUniversityTheme(session?.university, customAccent)
  const currentLang = settings.language || 'ro'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
          />

          <motion.div
            key="settings-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 38 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[460px] z-[90] flex flex-col"
            style={{
              background: '#080d1a',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '-20px 0 60px -8px rgba(0,0,0,0.75)',
            }}
          >
            {/* accent top line */}
            <div
              className="absolute top-0 inset-x-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent 0%, ${theme.accent} 50%, transparent 100%)` }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] shrink-0">
              <div>
                <h2 className="text-[15px] font-bold text-white tracking-tight">{t('settings.title')}</h2>
                <p className="text-[11px] text-slate-600 mt-0.5">{t('settings.subtitle')}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.07] transition-colors"
              >
                <X size={14} className="text-slate-400" strokeWidth={1.75} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

              {/* ─── Limba ─── */}
              <section>
                <SectionHeader icon={Languages} label={t('settings.sections.language')} theme={theme} />
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-200">{t('settings.language.label')}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t('settings.language.description')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map(({ id, label, flag }) => {
                      const active = currentLang === id
                      return (
                        <button
                          key={id}
                          onClick={() => updateSetting('language', id)}
                          className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-150"
                          style={{
                            background: active ? theme.accentSoft : 'rgba(255,255,255,0.02)',
                            borderColor: active ? theme.accentBorder : 'rgba(255,255,255,0.06)',
                          }}
                        >
                          <span className="text-base leading-none">{flag}</span>
                          <span className="text-[13px] font-semibold" style={{ color: active ? theme.accent : '#94a3b8' }}>
                            {label}
                          </span>
                          {active && (
                            <span className="ml-auto">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l2.5 2.5 5.5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme.accent }} />
                              </svg>
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>

              {/* ─── Aparenta ─── */}
              <section>
                <SectionHeader icon={Palette} label={t('settings.sections.appearance')} theme={theme} />

                {/* Theme toggle */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3 mb-2.5">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-200">{t('settings.theme.label')}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t('settings.theme.description')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'dark',  labelKey: 'settings.theme.dark',  Icon: Moon },
                      { id: 'light', labelKey: 'settings.theme.light', Icon: Sun  },
                    ].map(({ id, labelKey, Icon }) => {
                      const active = (settings.colorTheme || 'dark') === id
                      return (
                        <button
                          key={id}
                          onClick={() => updateSetting('colorTheme', id)}
                          className="flex items-center gap-2.5 rounded-xl border px-3 py-3 transition-all duration-150"
                          style={{
                            background: active ? theme.accentSoft : 'rgba(255,255,255,0.02)',
                            borderColor: active ? theme.accentBorder : 'rgba(255,255,255,0.06)',
                          }}
                        >
                          <Icon size={15} style={{ color: active ? theme.accent : '#64748b' }} />
                          <span className="text-[13px] font-semibold" style={{ color: active ? theme.accent : '#94a3b8' }}>
                            {t(labelKey)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Color picker */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-200">{t('settings.accent.label')}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t('settings.accent.description')}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {ACCENT_COLORS.map(({ id, labelKey, color }) => {
                      const isActive = customAccent === color
                      return (
                        <button
                          key={id}
                          title={t(labelKey)}
                          onClick={() => updateSetting('customAccentColor', isActive ? null : color)}
                          className="flex flex-col items-center gap-1.5 group focus:outline-none"
                        >
                          <span
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-110"
                            style={{
                              background: color,
                              outline: isActive ? `3px solid ${color}` : 'none',
                              outlineOffset: '3px',
                              transform: isActive ? 'scale(1.1)' : undefined,
                            }}
                          >
                            {isActive && (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span className={`text-[10px] font-medium ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                            {t(labelKey)}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {customAccent ? (
                    <button
                      onClick={() => updateSetting('customAccentColor', null)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      <RotateCcw size={11} />
                      {t('settings.accent.reset')}
                    </button>
                  ) : session?.university?.color && (
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded shrink-0" style={{ background: session.university.color }} />
                      <span className="text-[11px] text-slate-600">
                        {t('settings.accent.active', { name: session.university.shortName || 'universitatii tale' })}
                      </span>
                    </div>
                  )}
                </div>

              </section>

              {/* ─── Afisaj ─── */}
              <section>
                <SectionHeader icon={Monitor} label={t('settings.sections.display')} theme={theme} />
                <div className="space-y-2.5">

                  {/* Font size selector */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-[13px] font-semibold text-slate-200 mb-1">{t('settings.fontSize.label')}</p>
                    <p className="text-[11px] text-slate-500 mb-3">{t('settings.fontSize.description')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'small',  labelKey: 'settings.fontSize.small',  previewSize: '12px' },
                        { id: 'normal', labelKey: 'settings.fontSize.normal', previewSize: '17px' },
                        { id: 'large',  labelKey: 'settings.fontSize.large',  previewSize: '22px' },
                      ].map(({ id, labelKey, previewSize }) => {
                        const active = (settings.fontSize || 'normal') === id
                        return (
                          <button
                            key={id}
                            onClick={() => updateSetting('fontSize', id)}
                            className="flex flex-col items-center gap-1 rounded-xl border px-2 py-3 transition-all duration-150"
                            style={{
                              background: active ? theme.accentSoft : 'rgba(255,255,255,0.02)',
                              borderColor: active ? theme.accentBorder : 'rgba(255,255,255,0.06)',
                            }}
                          >
                            <span
                              className="font-bold leading-none"
                              style={{
                                fontSize: previewSize,
                                color: active ? theme.accent : '#64748b',
                              }}
                            >
                              Aa
                            </span>
                            <span
                              className="text-[11px] font-semibold mt-1"
                              style={{ color: active ? theme.accent : '#64748b' }}
                            >
                              {t(labelKey)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <SettingRow
                    label={t('settings.reducedMotion.label')}
                    description={t('settings.reducedMotion.description')}
                    checked={settings.reducedMotion}
                    onChange={(v) => updateSetting('reducedMotion', v)}
                    theme={theme}
                  />
                </div>
              </section>

              {/* ─── Notificari ─── */}
              <section>
                <SectionHeader icon={Bell} label={t('settings.sections.notifications')} theme={theme} />
                <div className="space-y-2.5">
                  <SettingRow
                    label={t('settings.appNotifications.label')}
                    description={t('settings.appNotifications.description')}
                    checked={settings.appNotifications !== false}
                    onChange={(v) => updateSetting('appNotifications', v)}
                    theme={theme}
                  />
                  <SettingRow
                    label={t('settings.emailDigest.label')}
                    description={t('settings.emailDigest.description')}
                    checked={!!settings.emailDigest}
                    onChange={(v) => updateSetting('emailDigest', v)}
                    theme={theme}
                  />
                </div>
              </section>

              {/* ─── Accesibilitate ─── */}
              <section>
                <SectionHeader icon={Accessibility} label={t('settings.sections.accessibility')} theme={theme} />
                <SettingRow
                  label={t('settings.highContrast.label')}
                  description={t('settings.highContrast.description')}
                  checked={!!settings.highContrast}
                  onChange={(v) => updateSetting('highContrast', v)}
                  theme={theme}
                />
              </section>

              {/* ─── Despre ─── */}
              <section>
                <SectionHeader icon={Info} label={t('settings.sections.about')} theme={theme} />
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-500 font-medium">{t('settings.version')}</span>
                    <span className="text-[12px] text-slate-300 font-semibold">StudentPulse v1.0</span>
                  </div>
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-white/[0.06]">
              <p className="text-[11px] text-slate-700 text-center">
                {t('settings.savedAuto')}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
