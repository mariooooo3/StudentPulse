import { PULSE_TYPES, PULSE_LOCAL_KEY } from './pulseConstants'

export function pulseTypeMeta(type) {
  return PULSE_TYPES.find(item => item.id === type) || PULSE_TYPES[2]
}

export function minutesUntil(value, now) {
  const end = new Date(value).getTime()
  const diff = Math.max(0, end - now.getTime())
  return Math.max(1, Math.ceil(diff / 60000))
}

export function cleanPulseEvents(items) {
  const now = Date.now()
  return (items || [])
    .filter(event => event?.expiresAt && new Date(event.expiresAt).getTime() > now)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function readLocalPulseEvents() {
  try {
    return cleanPulseEvents(JSON.parse(localStorage.getItem(PULSE_LOCAL_KEY) || '[]'))
  } catch {
    return []
  }
}

export function writeLocalPulseEvents(items) {
  const cleaned = cleanPulseEvents(items).slice(0, 60)
  localStorage.setItem(PULSE_LOCAL_KEY, JSON.stringify(cleaned))
  return cleaned
}
