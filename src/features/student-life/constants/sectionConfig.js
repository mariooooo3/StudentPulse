import {
  Radio,
  Tag,
  Briefcase,
  Users,
  Calendar,
  Heart,
  Wrench,
  Wallet,
  BookOpen,
  Car,
  Users2,
  Brain,
  Moon,
  Dumbbell,
  Apple,
  Smartphone,
  HandHeart,
} from 'lucide-react'
import { booksData, carpoolData, roommateData } from '../studentLifeData'

export const SECTION_ACCENTS = {
  pulse:     { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.2)'  },
  discounts: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' },
  career:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)' },
  community: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)' },
  events:    { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.2)'  },
  wellness:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)' },
  tools:     { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.2)' },
}

export const SECTION_META = {
  pulse: {
    icon: Radio,
    label: 'Campus Pulse',
    kicker: 'Live Campus',
    title: 'Pulsul campusului, actualizat de studenti in timp real.',
    description: 'Check-in-uri anonime, locuri linistite, invitatii rapide si activitate din campus fara continut inventat.',
  },
  discounts: {
    icon: Tag,
    label: 'Reduceri & Beneficii',
    kicker: 'Beneficii Studențești',
    title: 'Oferte adaptate orașului și vieții de campus.',
    description: 'Restaurante, transport, abonamente, librării, săli de sport, cafenele și beneficii locale verificate.',
  },
  career: {
    icon: Briefcase,
    label: 'Carieră & Internship-uri',
    kicker: 'Oportunități pe Facultate',
    title: 'Internship-uri și roluri pentru profilul tău.',
    description: 'Recomandările folosesc facultatea, anul, orașul, interesele și contextul tău academic.',
  },
  community: {
    icon: Users,
    label: 'Comunitate',
    kicker: 'Integrare Socială',
    title: 'Găsește grupuri, întâlniri, mentorat și comunități de adaptare.',
    description: 'Alătură-te grupurilor conectate la interesele, facultatea și orașul tău.',
  },
  events: {
    icon: Calendar,
    label: 'Evenimente',
    kicker: 'Viața de Campus',
    title: 'Ce se întâmplă în campusul tău.',
    description: 'Concerte, hackathoane, cariere, sport, cultură — toate evenimentele studențești într-un loc.',
  },
  wellness: {
    icon: Heart,
    label: 'Focus',
    kicker: 'Sănătate & Echilibru',
    title: 'Ai grijă de tine, nu doar de note.',
    description: 'Resurse de sănătate mentală, sfaturi de wellbeing și timer Pomodoro integrat.',
  },
  tools: {
    icon: Wrench,
    label: 'Unelte Studențești',
    kicker: 'Tools Practice',
    title: 'Tot ce-ți trebuie ca student.',
    description: 'Budget tracker, schimb de cărți, carpool și găsit colegi de cameră.',
  },
}

export const JOB_TYPES = ['Toate', 'Internship', 'Cercetare', 'Voluntariat']
export const GROUP_TYPES = ['Toate', 'Sport', 'Tech', 'Social', 'Studiu', 'Gaming', 'Outdoor']
export const EVENT_CATEGORIES = ['Toate', 'Tech', 'Cariera', 'Stiinta', 'Social', 'Antreprenoriat']

export const TOOLS_TABS = [
  {
    id: 'Budget',
    label: 'Budget',
    icon: Wallet,
    title: 'Plan lunar',
    description: 'Completezi cheltuielile pe categorii si vezi imediat abaterea fata de media studentilor.',
    hint: 'Introdu sume in RON/luna. Bara rosie inseamna peste medie, bara indigo inseamna in zona normala.',
    stat: '6 categorii',
  },
  {
    id: 'Carti',
    label: 'Carti',
    icon: BookOpen,
    title: 'Schimb de carti',
    description: 'Cauti cursuri, manuale sau culegeri disponibile la colegi.',
    hint: 'Filtreaza dupa titlu, materie sau tip: donatie ori vanzare.',
    stat: `${booksData.length} anunturi`,
  },
  {
    id: 'Carpool',
    label: 'Carpool',
    icon: Car,
    title: 'Drumuri comune',
    description: 'Gasesti curse intre oras, campus si localitati apropiate.',
    hint: 'Cauta destinatia, verifica locurile libere si contacteaza soferul pe Telegram.',
    stat: `${carpoolData.length} curse`,
  },
  {
    id: 'Colegi camera',
    label: 'Colegi camera',
    icon: Users2,
    title: 'Coleg de camera',
    description: 'Compari buget, zona, program si preferinte inainte sa contactezi persoana.',
    hint: 'Cauta dupa zona sau facultate, apoi foloseste tag-urile pentru compatibilitate rapida.',
    stat: `${roommateData.length} profiluri`,
  },
]

export const WELLNESS_ICONS = {
  brain:    Brain,
  sleep:    Moon,
  movement: Dumbbell,
  food:     Apple,
  phone:    Smartphone,
  support:  HandHeart,
}

export const SECS_PER_DIGIT = 12
