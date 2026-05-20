import { BookOpen, Coffee, CreditCard, FileText, Landmark, Printer, ShoppingBag, Utensils, ShoppingCart } from 'lucide-react'
import { schedule } from '../../shared/data/mockData'

// TUIASI AC – Bd. Prof. Dimitrie Mangeron 67, Iași
export const CAMPUS_CENTER = [47.153886, 27.593992]
export const CURRENT_LOCATION = { id: 'current', label: 'Campus Tudor Vladimirescu', x: 110, y: 382, coords: [47.1549, 27.6089] }

export const buildings = [
  { id: 'corp-c', name: 'Facultatea de Automatica si Calculatoare', distance: '0m', time: '-', type: 'Cursuri', coords: [47.153886, 27.593992], x: 210, y: 248, w: 250, h: 74, color: '#6366f1', short: 'AC' },
  { id: 'corp-a', name: 'Corp A - Departamentul Automatica', distance: '80m', time: '1 min', type: 'Cursuri', coords: [47.154232, 27.593145], x: 70, y: 145, w: 95, h: 65, color: '#64748b', short: 'A' },
  { id: 'library', name: 'Biblioteca Gh. Asachi', distance: '650m', time: '9 min', type: 'Studiu', coords: [47.157030, 27.590140], x: 525, y: 135, w: 105, h: 75, color: '#f59e0b', short: 'BIB' },
  { id: 'canteen', name: 'Cantina TUIASI Tudor Vladimirescu', distance: '1.3km', time: '17 min', type: 'Servicii', coords: [47.154484, 27.609974], x: 510, y: 380, w: 94, h: 54, color: '#ef4444', short: 'CAN' },
  { id: 'secretariat', name: 'Secretariat AC', distance: '30m', time: '1 min', type: 'Admin', coords: [47.153886, 27.593992], x: 330, y: 110, w: 130, h: 85, color: '#10b981', short: 'SEC' },
  { id: 'etti', name: 'Facultatea ETTI - Bd. Carol I 11A', distance: '2.8km', time: '35 min', type: 'Cursuri', coords: [47.174798, 27.571092], x: 400, y: 80, w: 110, h: 60, color: '#8b5cf6', short: 'ETTI' },
  { id: 'ieeia', name: 'Facultatea IEEIA', distance: '370m', time: '5 min', type: 'Cursuri', coords: [47.153401, 27.596641], x: 460, y: 170, w: 100, h: 55, color: '#0ea5e9', short: 'IEEIA' },
  { id: 'mec', name: 'Facultatea de Mecanica', distance: '200m', time: '3 min', type: 'Cursuri', coords: [47.154029, 27.597939], x: 590, y: 280, w: 90, h: 50, color: '#f97316', short: 'MEC' },
  { id: 'ci', name: 'Facultatea de Constructii si Instalatii', distance: '290m', time: '4 min', type: 'Cursuri', coords: [47.152241, 27.589035], x: 480, y: 215, w: 90, h: 50, color: '#84cc16', short: 'CI' },
  { id: 'icpm', name: 'Facultatea de Inginerie Chimica si Protectia Mediului C. Simionescu', distance: '1.0km', time: '13 min', type: 'Cursuri', coords: [47.155607, 27.603028], x: 585, y: 222, w: 92, h: 50, color: '#ec4899', short: 'ICPM' },
  { id: 'arh', name: 'Facultatea de Arhitectura G.M. Cantacuzino', distance: '450m', time: '6 min', type: 'Cursuri', coords: [47.152718, 27.589454], x: 580, y: 120, w: 95, h: 50, color: '#a16207', short: 'ARH' },
  { id: 'cmmi', name: 'Facultatea CMMI', distance: '240m', time: '4 min', type: 'Cursuri', coords: [47.153802, 27.596924], x: 610, y: 335, w: 90, h: 50, color: '#0891b2', short: 'CMMI' },
  { id: 'hgim', name: 'Facultatea HGIM', distance: '230m', time: '4 min', type: 'Cursuri', coords: [47.155052, 27.599888], x: 365, y: 195, w: 90, h: 50, color: '#65a30d', short: 'HGIM' },
  { id: 'sim', name: 'Facultatea SIM', distance: '210m', time: '3 min', type: 'Cursuri', coords: [47.154814, 27.597532], x: 690, y: 280, w: 80, h: 50, color: '#dc2626', short: 'SIM' },
  { id: 'dima', name: 'Facultatea DIMA / Textile si Management Industrial', distance: '140m', time: '2 min', type: 'Cursuri', coords: [47.153434, 27.595632], x: 495, y: 315, w: 80, h: 50, color: '#7c3aed', short: 'DIMA' },
]

export const pois = [
  { id: 'petru', name: 'Magazin Petru', type: 'Minimarket', desc: 'Minimarket cu produse alimentare, snacks si bauturi.', rating: 4.3, hours: 'L-D 07:00-22:00', x: 430, y: 350, color: '#f97316', Icon: ShoppingBag },
  { id: 'luca', name: 'Magazin Luca', type: 'Minimarket', desc: 'Minimarket de proximitate langa complexul AC.', rating: 4.1, hours: 'L-D 07:00-21:00', x: 150, y: 220, color: '#fb923c', Icon: ShoppingCart },
  { id: 'iulius', name: 'Iulius Mall Iasi', type: 'Mall', desc: 'Restaurante, cinema, magazine si acces din campusul Tudor.', rating: 4.7, hours: 'L-D 10:00-22:00', x: 480, y: 246, color: '#8b5cf6', Icon: ShoppingBag },
  { id: 'canteen-poi', name: 'Cantina TUIASI', type: 'Cantina', desc: 'Cantina oficiala din campus, Aleea Prof. Vasile Petrescu nr. 29, L-V 11:00-19:00.', rating: 4.4, hours: 'L-V 11:00-19:00', x: 515, y: 382, color: '#ea580c', Icon: Utensils },
  { id: 'camin-tv', name: 'Complex Camine Tudor Vladimirescu', type: 'Camin', desc: 'Complex studentesc TUIASI cu 21 de camine si aproximativ 8.000 de locuri.', rating: 4.0, hours: '24/7', x: 175, y: 440, color: '#64748b', Icon: Landmark },
  { id: 'camine-t1-t4', name: 'Camine T1-T4', type: 'Camin', desc: 'Grup de camine in zona centrala a campusului Tudor Vladimirescu.', rating: 3.9, hours: '24/7', x: 245, y: 420, color: '#475569', Icon: Landmark },
  { id: 'camine-t5-t11', name: 'Camine T5-T11', type: 'Camin', desc: 'Camine aproape de cantina, parc si spatii de recreere.', rating: 4.0, hours: '24/7', x: 330, y: 445, color: '#475569', Icon: Landmark },
  { id: 'camine-t12-t19', name: 'Camine T12-T19 / DSS', type: 'Camin', desc: 'Zona DSS si caminele T12-T19 din Campus Tudor.', rating: 4.0, hours: '24/7', x: 420, y: 455, color: '#334155', Icon: Landmark },
  { id: 'atm-brd', name: 'ATM BRD Mangeron', type: 'ATM', desc: 'Bancomat langa intrarea AC, disponibil 24/7.', rating: null, hours: '24/7', x: 360, y: 205, color: '#0ea5e9', Icon: CreditCard },
  { id: 'farmacie', name: 'Farmacie Dacia', type: 'Farmacie', desc: 'Farmacie pe Bd. Mangeron, la cateva minute de facultate.', rating: 4.4, hours: 'L-V 08:00-20:00', x: 288, y: 382, color: '#22c55e', Icon: Landmark },
  { id: 'bib-ac', name: 'Biblioteca Facultatii AC', type: 'Biblioteca', desc: 'Sala de lectura si biblioteca Facultatii AC, in complexul Corp C.', rating: 4.3, hours: 'L-V 09:00-17:00', x: 270, y: 248, color: '#f59e0b', Icon: BookOpen },
  { id: 'copisterie', name: 'Copisterie Mangeron', type: 'Copisterie', desc: 'Printare, laminare si spiralare langa AC.', rating: 4.3, hours: 'L-V 08:00-17:00', x: 380, y: 320, color: '#475569', Icon: Printer },
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
  'corp-c': { x: 335, y: 285, label: 'AC / Corp C' },
  'corp-a': { x: 118, y: 178, label: 'Corp A' },
  library: { x: 578, y: 172, label: 'Biblioteca Gh. Asachi' },
  canteen: { x: 557, y: 407, label: 'Cantina TUIASI' },
  secretariat: { x: 395, y: 152, label: 'Secretariat AC' },
  etti: { x: 455, y: 110, label: 'ETTI Copou' },
  ieeia: { x: 510, y: 198, label: 'IEEIA' },
  mec: { x: 635, y: 305, label: 'Mecanica' },
  ci: { x: 525, y: 240, label: 'Constructii' },
  icpm: { x: 632, y: 247, label: 'ICPM' },
  arh: { x: 628, y: 145, label: 'Arhitectura' },
  cmmi: { x: 655, y: 360, label: 'CMMI' },
  hgim: { x: 410, y: 220, label: 'HGIM' },
  sim: { x: 730, y: 305, label: 'SIM' },
  dima: { x: 535, y: 340, label: 'DIMA' },
  petru: { x: 430, y: 350, label: 'Magazin Petru' },
  luca: { x: 150, y: 220, label: 'Magazin Luca' },
  iulius: { x: 480, y: 246, label: 'Iulius Mall' },
  'canteen-poi': { x: 515, y: 382, label: 'Cantina TUIASI' },
  'atm-brd': { x: 360, y: 205, label: 'ATM BRD' },
  farmacie: { x: 288, y: 382, label: 'Farmacie Dacia' },
  'camin-tv': { x: 175, y: 440, label: 'Camine Tudor Vladimirescu' },
  'camine-t1-t4': { x: 245, y: 420, label: 'Camine T1-T4' },
  'camine-t5-t11': { x: 330, y: 445, label: 'Camine T5-T11' },
  'camine-t12-t19': { x: 420, y: 455, label: 'Camine T12-T19 / DSS' },
  'bib-ac': { x: 270, y: 248, label: 'Biblioteca AC' },
  copisterie: { x: 380, y: 320, label: 'Copisterie Mangeron' },
}

export const routeGraph = {
  current: ['farmacie', 'camin-tv'],
  'camin-tv': ['current', 'farmacie', 'camine-t1-t4'],
  'camine-t1-t4': ['camin-tv', 'camine-t5-t11', 'canteen-poi'],
  'camine-t5-t11': ['camine-t1-t4', 'camine-t12-t19', 'canteen-poi'],
  'camine-t12-t19': ['camine-t5-t11', 'iulius'],
  farmacie: ['current', 'camin-tv', 'corp-c', 'petru'],
  'corp-c': ['farmacie', 'secretariat', 'iulius', 'canteen', 'luca', 'mec', 'dima', 'hgim', 'bib-ac', 'copisterie'],
  luca: ['corp-c', 'corp-a'],
  'corp-a': ['luca', 'secretariat'],
  secretariat: ['corp-a', 'corp-c', 'library', 'atm-brd', 'etti', 'ieeia', 'ci', 'arh'],
  etti: ['secretariat', 'library'],
  library: ['secretariat', 'etti', 'arh'],
  canteen: ['corp-c', 'petru', 'canteen-poi'],
  'canteen-poi': ['canteen', 'camine-t1-t4', 'camine-t5-t11'],
  petru: ['farmacie', 'canteen', 'iulius', 'mec'],
  iulius: ['corp-c', 'petru', 'atm-brd', 'camine-t12-t19'],
  'atm-brd': ['iulius', 'secretariat'],
  ieeia: ['secretariat', 'ci'],
  ci: ['secretariat', 'ieeia', 'arh'],
  arh: ['library', 'secretariat', 'ci'],
  mec: ['corp-c', 'icpm', 'cmmi', 'sim'],
  icpm: ['mec', 'sim'],
  cmmi: ['mec', 'dima'],
  hgim: ['corp-c', 'secretariat'],
  sim: ['mec', 'icpm'],
  dima: ['corp-c', 'cmmi'],
  'bib-ac': ['corp-c'],
  copisterie: ['corp-c'],
}

// ── Indoor map – AC building (Corp C, Corp A) ──────────────────────────────────
export const indoorFloorY = [455, 352, 264, 176, 88]
export const indoorStairX = 510
export const indoorRooms = [
  { id: 'secretariat-ac', label: 'Secretariat AC',   floor: 0, rx: 40,  ry: 412, rw: 110, rh: 35, cx: 95  },
  { id: 'amf-ac0-1',      label: 'Amf. AC0-1',       floor: 0, rx: 170, ry: 412, rw: 100, rh: 35, cx: 220 },
  { id: 'lab-a0-1',       label: 'Lab. A0-1',         floor: 0, rx: 290, ry: 412, rw: 80,  rh: 35, cx: 330 },
  { id: 'sala-ac0-2',     label: 'Sala AC0-2',        floor: 0, rx: 390, ry: 412, rw: 80,  rh: 35, cx: 430 },
  { id: 'lab-c1-1',       label: 'Lab. C1-1',         floor: 1, rx: 40,  ry: 309, rw: 90,  rh: 35, cx: 85  },
  { id: 'lab-c1-2',       label: 'Lab. C1-2',         floor: 1, rx: 300, ry: 309, rw: 90,  rh: 35, cx: 345 },
  { id: 'lab-c2-1',       label: 'Lab. C2-1',         floor: 2, rx: 150, ry: 221, rw: 90,  rh: 35, cx: 195 },
  { id: 'birou-c2-5',     label: 'Birou C2-5',        floor: 2, rx: 270, ry: 221, rw: 80,  rh: 35, cx: 310 },
  { id: 'lab-a3-1',       label: 'Lab. A3-1 (DAIA)',  floor: 3, rx: 40,  ry: 133, rw: 100, rh: 35, cx: 90  },
  { id: 'sala-a3-2',      label: 'Sala A3-2',         floor: 3, rx: 300, ry: 133, rw: 80,  rh: 35, cx: 340 },
  { id: 'sala-conf',      label: 'Sala Conferințe',   floor: 4, rx: 80,  ry: 40,  rw: 200, rh: 40, cx: 180 },
]

export const indoorGraph = {
  'secretariat-ac': ['amf-ac0-1', 'lab-a0-1', 'sala-ac0-2', 'stairs_0'],
  'amf-ac0-1':      ['secretariat-ac', 'lab-a0-1', 'stairs_0'],
  'lab-a0-1':       ['secretariat-ac', 'amf-ac0-1', 'sala-ac0-2', 'stairs_0'],
  'sala-ac0-2':     ['secretariat-ac', 'lab-a0-1', 'stairs_0'],
  stairs_0:         ['secretariat-ac', 'amf-ac0-1', 'lab-a0-1', 'sala-ac0-2', 'stairs_1'],
  'lab-c1-1':       ['lab-c1-2', 'stairs_1'],
  'lab-c1-2':       ['lab-c1-1', 'stairs_1'],
  stairs_1:         ['lab-c1-1', 'lab-c1-2', 'stairs_0', 'stairs_2'],
  'lab-c2-1':       ['birou-c2-5', 'stairs_2'],
  'birou-c2-5':     ['lab-c2-1', 'stairs_2'],
  stairs_2:         ['lab-c2-1', 'birou-c2-5', 'stairs_1', 'stairs_3'],
  'lab-a3-1':       ['sala-a3-2', 'stairs_3'],
  'sala-a3-2':      ['lab-a3-1', 'stairs_3'],
  stairs_3:         ['lab-a3-1', 'sala-a3-2', 'stairs_2', 'stairs_4'],
  'sala-conf':      ['stairs_4'],
  stairs_4:         ['sala-conf', 'stairs_3'],
}

export const staticCrowdZones = [
  { id: 'canteen',     label: 'Cantina TUIASI',    x: 557, y: 302, radius: 66, level: 92, wait: '14 min', trend: 'creste', color: '#ef4444' },
  { id: 'library',     label: 'Biblioteca',         x: 578, y: 172, radius: 54, level: 68, wait: '6 min',  trend: 'stabil', color: '#f59e0b' },
  { id: 'corp-c',      label: 'Corp C',              x: 335, y: 285, radius: 52, level: 74, wait: '8 min',  trend: 'creste', color: '#f97316' },
  { id: 'secretariat', label: 'Secretariat',         x: 395, y: 152, radius: 44, level: 36, wait: '2 min',  trend: 'scade',  color: '#10b981' },
  { id: 'study',       label: 'Zonă studiu',         x: 312, y: 322, radius: 42, level: 48, wait: 'liber',  trend: 'stabil', color: '#22c55e' },
]

export const recommendationCards = [
  { id: 'schedule-route', Icon: Landmark, title: 'Ruta pentru următorul curs',      desc: `Următorul loc din orar este ${schedule[0]?.room || 'Corp C'}. Pleacă cu 8 minute înainte.`, accent: '#6366f1' },
  { id: 'library-focus',  Icon: BookOpen, title: 'Zonă bună de studiu',              desc: 'Biblioteca Gh. Asachi are trafic moderat. Potrivită între două cursuri.',                    accent: '#f59e0b' },
  { id: 'document-stop',  Icon: FileText, title: 'Oprire administrativă',            desc: 'Secretariatul AC este la parterul Corp C. Evită intervalul 12:00–13:00.',                     accent: '#10b981' },
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
