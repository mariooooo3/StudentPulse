import { Moon, Users2, BookOpen, Apple, Dumbbell, Calendar } from 'lucide-react'

export const PULSE_TYPES = [
  { id: 'quiet', label: 'Loc linistit',      tone: 'emerald', icon: Moon,     ttl: 120 },
  { id: 'crowd', label: 'E aglomerat',        tone: 'amber',   icon: Users2,   ttl: 75  },
  { id: 'study', label: 'Invatam aici',       tone: 'indigo',  icon: BookOpen, ttl: 180 },
  { id: 'coffee', label: 'Cafea rapida',      tone: 'rose',    icon: Apple,    ttl: 90  },
  { id: 'sport', label: 'Sport',              tone: 'cyan',    icon: Dumbbell, ttl: 150 },
  { id: 'event', label: 'Se intampla acum',   tone: 'violet',  icon: Calendar, ttl: 240 },
]

export const PULSE_LOCATIONS = ['Biblioteca', 'Corp A', 'Corp B', 'Cantina', 'Campus', 'Camin', 'Sala de sport']

export const PULSE_TONES = {
  emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  amber:   'border-amber-400/20   bg-amber-400/10   text-amber-200',
  indigo:  'border-indigo-400/20  bg-indigo-400/10  text-indigo-200',
  rose:    'border-rose-400/20    bg-rose-400/10    text-rose-200',
  cyan:    'border-cyan-400/20    bg-cyan-400/10    text-cyan-200',
  violet:  'border-violet-400/20  bg-violet-400/10  text-violet-200',
}

export const PULSE_LOCAL_KEY = 'sc_pulse_local_v1'
