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
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '../providers/SettingsContext'
import { getUniversityTheme } from '../../shared/utils/theme'

const ACCENT_COLORS = [
  { id: 'indigo',  label: 'Indigo',     color: '#6366f1' },
  { id: 'violet',  label: 'Violet',     color: '#8b5cf6' },
  { id: 'blue',    label: 'Albastru',   color: '#3b82f6' },
  { id: 'cyan',    label: 'Cyan',       color: '#06b6d4' },
  { id: 'emerald', label: 'Verde',      color: '#10b981' },
  { id: 'rose',    label: 'Roz',        color: '#f43f5e' },
  { id: 'orange',  label: 'Portocaliu', color: '#f97316' },
  { id: 'amber',   label: 'Auriu',      color: '#f59e0b' },
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

  const customAccent = settings.customAccentColor || null
  const theme = getUniversityTheme(session?.university, customAccent)

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
                <h2 className="text-[15px] font-bold text-white tracking-tight">Setari</h2>
                <p className="text-[11px] text-slate-600 mt-0.5">Personalizeaza StudentCompass</p>
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

              {/* ─── Aparenta ─── */}
              <section>
                <SectionHeader icon={Palette} label="Aparenta" theme={theme} />

                {/* Theme toggle */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3 mb-2.5">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-200">Tema</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Alege aspectul general al interfetei</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'dark',  label: 'Întunecat', Icon: Moon },
                      { id: 'light', label: 'Deschis',   Icon: Sun  },
                    ].map(({ id, label, Icon }) => {
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
                            {label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Color picker */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-200">Culoare accent</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Schimba culoarea principala a intregii interfete</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {ACCENT_COLORS.map(({ id, label, color }) => {
                      const isActive = customAccent === color
                      return (
                        <button
                          key={id}
                          title={label}
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
                            {label}
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
                      Reseteaza la culoarea universitatii
                    </button>
                  ) : session?.university?.color && (
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded shrink-0" style={{ background: session.university.color }} />
                      <span className="text-[11px] text-slate-600">
                        Culoarea {session.university.shortName || 'universitatii tale'} este activa
                      </span>
                    </div>
                  )}
                </div>

              </section>

              {/* ─── Afisaj ─── */}
              <section>
                <SectionHeader icon={Monitor} label="Afisaj" theme={theme} />
                <div className="space-y-2.5">

                  {/* Font size selector */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-[13px] font-semibold text-slate-200 mb-1">Dimensiune text</p>
                    <p className="text-[11px] text-slate-500 mb-3">Scaleza tot textul si spatiile din aplicatie</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'small',  label: 'Mic',    previewSize: '12px' },
                        { id: 'normal', label: 'Normal', previewSize: '17px' },
                        { id: 'large',  label: 'Marit',  previewSize: '22px' },
                      ].map(({ id, label, previewSize }) => {
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
                              {label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <SettingRow
                    label="Reducere animatii"
                    description="Dezactiveaza toate tranzitiile si animatiile din interfata"
                    checked={settings.reducedMotion}
                    onChange={(v) => updateSetting('reducedMotion', v)}
                    theme={theme}
                  />
                </div>
              </section>

              {/* ─── Notificari ─── */}
              <section>
                <SectionHeader icon={Bell} label="Notificari" theme={theme} />
                <div className="space-y-2.5">
                  <SettingRow
                    label="Notificari in aplicatie"
                    description="Afiseaza alerte in timp real (toast-uri) pentru activitate noua"
                    checked={settings.appNotifications !== false}
                    onChange={(v) => updateSetting('appNotifications', v)}
                    theme={theme}
                  />
                  <SettingRow
                    label="Digest email zilnic"
                    description="Primeste un rezumat zilnic al activitatii academice pe email"
                    checked={!!settings.emailDigest}
                    onChange={(v) => updateSetting('emailDigest', v)}
                    theme={theme}
                  />
                </div>
              </section>

              {/* ─── Accesibilitate ─── */}
              <section>
                <SectionHeader icon={Accessibility} label="Accesibilitate" theme={theme} />
                <SettingRow
                  label="Contrast ridicat"
                  description="Creste contrastul interfetei pentru o citire mai usoara"
                  checked={!!settings.highContrast}
                  onChange={(v) => updateSetting('highContrast', v)}
                  theme={theme}
                />
              </section>

              {/* ─── Despre ─── */}
              <section>
                <SectionHeader icon={Info} label="Despre" theme={theme} />
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-500 font-medium">Versiune</span>
                    <span className="text-[12px] text-slate-300 font-semibold">StudentCompass v1.0</span>
                  </div>
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-white/[0.06]">
              <p className="text-[11px] text-slate-700 text-center">
                Setarile se salveaza automat in browser
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
