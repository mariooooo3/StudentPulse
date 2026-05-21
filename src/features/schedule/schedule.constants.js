import { CalendarDays, Users, RefreshCw, Repeat2, CalendarClock, GraduationCap } from 'lucide-react'

export const TABS = [
  { label: 'Orarul Meu', icon: CalendarDays },
  { label: 'Toate Grupele', icon: Users },
  { label: 'Recuperări', icon: RefreshCw },
  { label: 'Slot Swap', icon: Repeat2 },
  { label: 'Sesiune', icon: CalendarClock },
  { label: 'Medie', icon: GraduationCap },
]

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 90, damping: 20 } },
}

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 80, damping: 18 },
}
