const DAY_MS = 24 * 60 * 60 * 1000

export function getNow() {
  return new Date()
}

export function formatLiveDate(date = getNow(), locale = 'ro') {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatClock(date = getNow(), locale = 'ro') {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function minutesUntil(target, now = getNow()) {
  return Math.ceil((target.getTime() - now.getTime()) / 60000)
}

export function formatRelativeFromMinutes(minutes) {
  if (minutes <= 0) return '~0 min'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours < 24) return mins ? `${hours}h ${mins}m` : `${hours}h`
  const days = Math.floor(hours / 24)
  const restHours = hours % 24
  return restHours ? `${days}d ${restHours}h` : `${days}d`
}

export function labelUntil(target, now = getNow()) {
  return formatRelativeFromMinutes(minutesUntil(target, now))
}

export function daysUntil(target, now = getNow()) {
  return Math.max(0, Math.ceil((startOfDay(target).getTime() - startOfDay(now).getTime()) / DAY_MS))
}

export function startOfDay(date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function dateInDays(days, now = getNow()) {
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  return date
}

export function rollingDays(seed, min = 2, max = 30, now = getNow()) {
  const span = max - min + 1
  const daySeed = Math.floor(startOfDay(now).getTime() / DAY_MS)
  return min + ((seed * 17 + daySeed) % span)
}

export function nextWeekdayDate(dayNumber, hour, minute = 0, now = getNow()) {
  const target = new Date(now)
  const currentDay = now.getDay() === 0 ? 7 : now.getDay()
  let dayOffset = dayNumber - currentDay
  target.setHours(hour, minute, 0, 0)
  if (dayOffset < 0 || (dayOffset === 0 && target <= now)) dayOffset += 7
  target.setDate(now.getDate() + dayOffset)
  return target
}

export function getUpcomingScheduleItems(schedule = [], now = getNow(), limit = 3) {
  return schedule
    .map((item, index) => {
      const start = nextWeekdayDate(item.day, item.start, 0, now)
      return {
        ...item,
        startDate: start,
        time: `${String(item.start).padStart(2, '0')}:00`,
        in: labelUntil(start, now),
        color: item.color || ['bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'][index % 4],
      }
    })
    .sort((a, b) => a.startDate - b.startDate)
    .slice(0, limit)
}

export function getNextScheduleItem(schedule = [], now = getNow()) {
  return getUpcomingScheduleItems(schedule, now, 1)[0] || null
}

export function eventTiming(seed, now = getNow()) {
  const days = rollingDays(seed, 0, 6, now)
  const hour = [10, 14, 17, 19][seed % 4]
  const date = dateInDays(days, now)
  date.setHours(hour, 0, 0, 0)
  return { date, days, hour }
}
