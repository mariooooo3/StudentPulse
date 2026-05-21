let _accentOverride = null

export function setGlobalAccentOverride(color) {
  _accentOverride = color || null
}

function hexToRgb(hex) {
  const value = hex?.replace('#', '')
  if (!value || value.length !== 6) return null
  const int = parseInt(value, 16)
  if (Number.isNaN(int)) return null
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

export function alpha(hex, opacity = 1) {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(99, 102, 241, ${opacity})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

export function getUniversityTheme(university, overrideAccent = null) {
  const accent = overrideAccent || _accentOverride || university?.color || '#6366f1'
  return {
    accent,
    accentSoft: alpha(accent, 0.12),
    accentSurface: alpha(accent, 0.18),
    accentBorder: alpha(accent, 0.36),
    accentStrong: alpha(accent, 0.72),
    shellStyle: {
      '--sc-accent': accent,
      '--sc-accent-soft': alpha(accent, 0.12),
      '--sc-accent-surface': alpha(accent, 0.18),
      '--sc-accent-border': alpha(accent, 0.36),
      '--sc-accent-strong': alpha(accent, 0.72),
    },
  }
}
