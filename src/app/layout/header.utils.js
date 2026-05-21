import { BellRing, CalendarCheck, GraduationCap, MessageSquare } from 'lucide-react'

export function getNotificationRoute(notification) {
  const action = notification?.action || ''
  if (action.startsWith('thesis.')) return { mode: 'academic', view: 'thesis' }
  if (action.startsWith('schedule.') || action.startsWith('recovery.')) return { mode: 'academic', view: 'schedule' }
  if (action.includes('message')) return { mode: 'academic', view: 'messages' }
  return { mode: 'academic', view: 'dashboard' }
}

export function getNotificationIcon(notification) {
  const action = notification?.action || ''
  if (action.startsWith('thesis.')) return GraduationCap
  if (action.startsWith('schedule.') || action.startsWith('recovery.')) return CalendarCheck
  if (action.includes('message')) return MessageSquare
  return BellRing
}

export function timeAgo(value) {
  const date = value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return 'acum'
  const diff = Math.max(0, Date.now() - date.getTime())
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'acum'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  return `${Math.floor(hours / 24)} zile`
}
