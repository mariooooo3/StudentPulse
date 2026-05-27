import {
  BookOpen,
  CalendarClock,
  GraduationCap,
  MessageSquare,
  UserCheck,
} from 'lucide-react'

export const NAV = [
  { id: 'dashboard', label: 'Dashboard',         labelKey: 'professor.nav.dashboard', icon: GraduationCap },
  { id: 'profile',   label: 'Profil academic',   labelKey: 'professor.nav.profile',   icon: UserCheck },
  { id: 'thesis',    label: 'Cereri licență',     labelKey: 'professor.nav.thesis',    icon: BookOpen },
  { id: 'recovery',  label: 'Recuperări',         labelKey: 'professor.nav.recovery',  icon: CalendarClock },
  { id: 'messages',  label: 'Mesaje',             labelKey: 'professor.nav.messages',  icon: MessageSquare },
]
