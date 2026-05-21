import { createContext, useContext, useState } from 'react'
import { setGlobalAccentOverride, alpha } from '../../shared/utils/theme'

const SettingsContext = createContext(null)

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('sc_settings') || '{}')
    return { colorTheme: 'dark', ...saved }
  }
  catch { return { colorTheme: 'dark' } }
}

function applyEffect(key, value) {
  switch (key) {
    case 'customAccentColor': {
      setGlobalAccentOverride(value || null)
      const accent = value || '#6366f1'
      document.documentElement.style.setProperty('--sc-accent', accent)
      document.documentElement.style.setProperty('--sc-accent-soft', alpha(accent, 0.12))
      document.documentElement.style.setProperty('--sc-accent-surface', alpha(accent, 0.18))
      document.documentElement.style.setProperty('--sc-accent-border', alpha(accent, 0.36))
      document.documentElement.style.setProperty('--sc-accent-strong', alpha(accent, 0.72))
      break
    }
    case 'fontSize':
      document.body.style.removeProperty('zoom')
      document.documentElement.classList.remove('sc-font-small', 'sc-font-large')
      if (value === 'small') document.documentElement.classList.add('sc-font-small')
      else if (value === 'large') document.documentElement.classList.add('sc-font-large')
      break
    case 'reducedMotion':
      document.documentElement.classList.toggle('sc-reduced-motion', !!value)
      break
    case 'highContrast':
      document.documentElement.classList.toggle('sc-high-contrast', !!value)
      break
    case 'colorTheme':
      document.documentElement.classList.toggle('sc-theme-light', value === 'light')
      break
    default:
      break
  }
}

function applyAllEffects(settings) {
  applyEffect('customAccentColor', settings.customAccentColor)
  applyEffect('fontSize', settings.fontSize)
  applyEffect('reducedMotion', settings.reducedMotion)
  applyEffect('highContrast', settings.highContrast)
  applyEffect('colorTheme', settings.colorTheme)
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const s = loadSettings()
    applyAllEffects(s)
    return s
  })

  function updateSetting(key, value) {
    const next = { ...settings, [key]: value }
    setSettings(next)
    localStorage.setItem('sc_settings', JSON.stringify(next))
    applyEffect(key, value)
  }

  function resetSettings() {
    localStorage.removeItem('sc_settings')
    const empty = {}
    setSettings(empty)
    applyAllEffects(empty)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
