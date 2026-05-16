import { BookOpen, Coffee, CreditCard, FileText, Landmark, Printer, ShoppingBag, Utensils } from 'lucide-react'
import { schedule } from '../../shared/data/mockData'

export const CAMPUS_CENTER = [47.1764, 27.5733]
export const CURRENT_LOCATION = { id: 'current', label: 'Camin D1', x: 110, y: 382, coords: [47.1764, 27.5733] }

export const buildings = [
  { id: 'corp-c', name: 'Corp C - Informatica', distance: '350m', time: '5 min', type: 'Cursuri', coords: [47.1771, 27.5742], x: 210, y: 248, w: 250, h: 74, color: '#6366f1', short: 'C' },
  { id: 'corp-a', name: 'Corp A - Matematica', distance: '520m', time: '7 min', type: 'Seminarii', coords: [47.1758, 27.5728], x: 70, y: 145, w: 95, h: 65, color: '#64748b', short: 'A' },
  { id: 'library', name: 'Biblioteca Centrala', distance: '200m', time: '3 min', type: 'Studiu', coords: [47.1753, 27.5747], x: 525, y: 135, w: 105, h: 75, color: '#f59e0b', short: 'BIB' },
  { id: 'canteen', name: 'Cantina Studenteasca', distance: '180m', time: '2 min', type: 'Servicii', coords: [47.1783, 27.5718], x: 510, y: 275, w: 94, h: 54, color: '#ef4444', short: 'CAN' },
  { id: 'secretariat', name: 'Secretariat FII', distance: '400m', time: '5 min', type: 'Admin', coords: [47.1771, 27.5742], x: 330, y: 110, w: 130, h: 85, color: '#10b981', short: 'SEC' },
]

export const pois = [
  { id: 'petru-luca', name: 'Magazin Petru Luca', type: 'Minimarket', desc: 'Produse alimentare, snacks si bauturi reci.', rating: 4.2, hours: 'L-D 07:00-22:00', x: 430, y: 350, color: '#f97316', Icon: ShoppingBag },
  { id: 'catena', name: 'Farmacia Catena', type: 'Farmacie', desc: 'Farmacie utila pentru urgente si consultanta rapida.', rating: 4.6, hours: 'L-V 08:00-20:00', x: 150, y: 220, color: '#22c55e', Icon: Landmark },
  { id: 'coffee-campus', name: 'Coffee Campus', type: 'Cafenea', desc: 'Cafea, prize si Wi-Fi langa corpurile de curs.', rating: 4.5, hours: 'L-V 07:30-19:00', x: 480, y: 246, color: '#8b5cf6', Icon: Coffee },
  { id: 'atm-brd', name: 'ATM BRD Campus', type: 'ATM', desc: 'Bancomat aproape de intrarea principala.', rating: null, hours: '24/7', x: 360, y: 205, color: '#0ea5e9', Icon: CreditCard },
  { id: 'copy-fii', name: 'Copisterie FII', type: 'Copisterie', desc: 'Printare, scanare si laminare pentru studenti.', rating: 4.4, hours: 'L-V 08:00-17:00', x: 288, y: 382, color: '#475569', Icon: Printer },
  { id: 'kebab', name: 'Kebab & Pizza Express', type: 'Fast-food', desc: 'Mancare rapida si accesibila seara.', rating: 4.0, hours: 'L-D 10:00-24:00', x: 175, y: 440, color: '#fb7185', Icon: Utensils },
]

export const campusPaths = [
  'M395,195 L395,245',
  'M395,245 L300,245',
  'M395,245 L480,245',
  'M395,195 L395,152',
  'M630,170 L630,113',
  'M480,245 L480,310',
  'M300,245 L215,245',
  'M215,245 L215,355',
  'M215,355 L165,355',
  'M165,355 L110,355',
  'M480,310 L570,310',
  'M630,113 L630,83',
  'M165,210 L165,245',
  'M395,195 L165,195',
  'M165,195 L165,210',
]

export const routeNodes = {
  current: { x: 110, y: 382, label: 'Tu' },
  'corp-c': { x: 335, y: 285, label: 'Corp C' },
  'corp-a': { x: 118, y: 178, label: 'Corp A' },
  library: { x: 578, y: 172, label: 'Biblioteca Centrala' },
  canteen: { x: 557, y: 302, label: 'Cantina Studenteasca' },
  secretariat: { x: 395, y: 152, label: 'Secretariat FII' },
  'petru-luca': { x: 430, y: 350, label: 'Magazin Petru Luca' },
  catena: { x: 150, y: 220, label: 'Farmacia Catena' },
  'coffee-campus': { x: 480, y: 246, label: 'Coffee Campus' },
  'atm-brd': { x: 360, y: 205, label: 'ATM BRD Campus' },
  'copy-fii': { x: 288, y: 382, label: 'Copisterie FII' },
  kebab: { x: 175, y: 440, label: 'Kebab & Pizza Express' },
}

export const routeGraph = {
  current: ['copy-fii', 'kebab'],
  kebab: ['current', 'copy-fii'],
  'copy-fii': ['current', 'kebab', 'corp-c', 'petru-luca'],
  'corp-c': ['copy-fii', 'secretariat', 'coffee-campus', 'canteen', 'catena'],
  catena: ['corp-c', 'corp-a'],
  'corp-a': ['catena', 'secretariat'],
  secretariat: ['corp-a', 'corp-c', 'library', 'atm-brd'],
  library: ['secretariat'],
  canteen: ['corp-c', 'petru-luca'],
  'petru-luca': ['copy-fii', 'canteen', 'coffee-campus'],
  'coffee-campus': ['corp-c', 'petru-luca', 'atm-brd'],
  'atm-brd': ['coffee-campus', 'secretariat'],
}

export const indoorFloorY = [455, 352, 264, 176, 88]
export const indoorStairX = 510
export const indoorRooms = [
  { id: 'secretariat', label: 'Secretariat', floor: 0, rx: 40, ry: 412, rw: 100, rh: 35, cx: 90 },
  { id: 'lab101', label: 'Lab 101', floor: 0, rx: 165, ry: 412, rw: 70, rh: 35, cx: 200 },
  { id: 'lab102', label: 'Lab 102', floor: 0, rx: 255, ry: 412, rw: 70, rh: 35, cx: 290 },
  { id: 'c2', label: 'C2 Aula', floor: 0, rx: 355, ry: 412, rw: 85, rh: 35, cx: 397 },
  { id: 'c112', label: 'C112', floor: 1, rx: 40, ry: 309, rw: 80, rh: 35, cx: 80 },
  { id: 'c118', label: 'C118', floor: 1, rx: 300, ry: 309, rw: 80, rh: 35, cx: 340 },
  { id: 'c210', label: 'C210', floor: 2, rx: 150, ry: 221, rw: 80, rh: 35, cx: 190 },
  { id: 'c308', label: 'C308', floor: 3, rx: 40, ry: 133, rw: 80, rh: 35, cx: 80 },
  { id: 'c315', label: 'C315', floor: 3, rx: 300, ry: 133, rw: 80, rh: 35, cx: 340 },
  { id: 'c420', label: 'C420 Amfiteatru', floor: 4, rx: 80, ry: 40, rw: 200, rh: 40, cx: 180 },
]

export const indoorGraph = {
  secretariat: ['lab101', 'lab102', 'c2', 'stairs_0'],
  lab101: ['secretariat', 'lab102', 'c2', 'stairs_0'],
  lab102: ['secretariat', 'lab101', 'c2', 'stairs_0'],
  c2: ['secretariat', 'lab101', 'lab102', 'stairs_0'],
  stairs_0: ['secretariat', 'lab101', 'lab102', 'c2', 'stairs_1'],
  c112: ['c118', 'stairs_1'],
  c118: ['c112', 'stairs_1'],
  stairs_1: ['c112', 'c118', 'stairs_0', 'stairs_2'],
  c210: ['stairs_2'],
  stairs_2: ['c210', 'stairs_1', 'stairs_3'],
  c308: ['c315', 'stairs_3'],
  c315: ['c308', 'stairs_3'],
  stairs_3: ['c308', 'c315', 'stairs_2', 'stairs_4'],
  c420: ['stairs_4'],
  stairs_4: ['c420', 'stairs_3'],
}

export const staticCrowdZones = [
  { id: 'canteen', label: 'Cantina', x: 557, y: 302, radius: 66, level: 92, wait: '14 min', trend: 'creste', color: '#ef4444' },
  { id: 'library', label: 'Biblioteca', x: 578, y: 172, radius: 54, level: 68, wait: '6 min', trend: 'stabil', color: '#f59e0b' },
  { id: 'corp-c', label: 'Corp C', x: 335, y: 285, radius: 52, level: 74, wait: '8 min', trend: 'creste', color: '#f97316' },
  { id: 'secretariat', label: 'Secretariat', x: 395, y: 152, radius: 44, level: 36, wait: '2 min', trend: 'scade', color: '#10b981' },
  { id: 'study', label: 'Zona studiu', x: 312, y: 322, radius: 42, level: 48, wait: 'liber', trend: 'stabil', color: '#22c55e' },
]

export const recommendationCards = [
  { id: 'schedule-route', Icon: Landmark, title: 'Ruta pentru urmatorul curs', desc: `Urmatorul reper din orar este ${schedule[0]?.room || 'Corp C'}. Pleaca cu 8 minute inainte.`, accent: '#6366f1' },
  { id: 'library-focus', Icon: BookOpen, title: 'Zona buna de studiu', desc: 'Biblioteca are trafic moderat si este potrivita intre doua cursuri.', accent: '#f59e0b' },
  { id: 'document-stop', Icon: FileText, title: 'Oprire administrativa', desc: 'Secretariatul este in axul principal. Evita intervalul de pranz.', accent: '#10b981' },
]

export function destinations() {
  return [...buildings, ...pois]
}

export function crowdLabel(level) {
  if (level >= 80) return 'Foarte aglomerat'
  if (level >= 60) return 'Aglomerat'
  if (level >= 40) return 'Moderat'
  return 'Liber'
}
