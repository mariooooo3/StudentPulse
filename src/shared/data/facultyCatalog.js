import {
  ALL_FACULTY_SCHEDULES,
  PROFESSORS_BY_TYPE,
  TUTORS_BY_TYPE,
  SKILL_SWAP_BY_TYPE,
  GROUP_SESSIONS_BY_TYPE,
  THESIS_DOMAINS_BY_TYPE,
  SUBJECT_FILTERS_BY_TYPE,
} from './domainPersonalization'

const FACULTY_CODE_KEY = {
  BIO: 'BIOLOGY',
  BIOT: 'BIOLOGY',
  CHBG: 'BIOLOGY',
  CHEM: 'CHEMISTRY',
  CHIM: 'CHEMISTRY',
  PHYS: 'PHYSICS',
  MATH: 'MATHEMATICS',
  FMIM: 'MATH_CS',
  AC: 'ENGINEERING_CS',
}

export function getFacultyKey(profile) {
  const base = FACULTY_CODE_KEY[profile?.facultyCode] || profile?.facultyType || 'CS'
  if (base === 'ENGINEERING_CS') {
    if (profile?.specialization === 'IS') return 'ENGINEERING_CS_IS'
    if (profile?.specialization === 'CTI') return 'ENGINEERING_CS_CTI'
    return 'ENGINEERING_CS_CTI'
  }
  return base
}

const scienceColors = [
  'bg-indigo-500/80 border-indigo-400',
  'bg-violet-500/80 border-violet-400',
  'bg-emerald-500/80 border-emerald-400',
  'bg-amber-500/80 border-amber-400',
  'bg-rose-500/80 border-rose-400',
  'bg-cyan-500/80 border-cyan-400',
]

function makeSchedule(courses) {
  const schedule = courses.map((c, i) => ({
    id: i + 1,
    name: c.name,
    short: c.short,
    day: c.day,
    start: c.start,
    end: c.end,
    room: c.room,
    type: c.type,
    professor: c.professor,
    group: c.group || 'A1',
    color: scienceColors[i % scienceColors.length],
  }))

  const recoverySubjects = courses.slice(0, 3)
  const recoverySlots = Object.fromEntries(recoverySubjects.map((c, i) => [
    c.name,
    [
      { day: c.day, start: c.start, end: c.end, room: c.room, group: 'A1', professor: c.professor, total: 28, enrolled: 24 - i, isMine: true },
      { day: Math.min(c.day + 1, 5), start: c.start + 2, end: c.end + 2, room: `S.${20 + i}`, group: 'B1', professor: c.professor.replace('Prof.', 'Asist.'), total: 18, enrolled: 13 + i, isMine: false },
      { day: 5, start: 14, end: 16, room: `Lab.${i + 1}`, group: 'C1', professor: c.professor.replace('Prof.', 'Lect.'), total: 18, enrolled: 16 - i, isMine: false },
    ],
  ]))

  const swapRequests = recoverySubjects.map((c, i) => ({
    id: i + 1,
    name: ['Mara Ionescu', 'Radu Pavel', 'Ioana Dima'][i],
    avatar: ['MI', 'RP', 'ID'][i],
    offersSubject: c.name,
    offersSlot: { day: Math.min(c.day + 1, 5), start: c.start + 2, end: c.end + 2, group: 'B1' },
    wantsSlot: { day: c.day, start: c.start, end: c.end, group: 'A1' },
    message: ['Am practică de laborator în același interval', 'Prefer grupa de dimineață', 'Se suprapune cu seminarul opțional'][i],
    isMatch: i !== 1,
  }))

  return { schedule, recoverySlots, swapRequests }
}

const OVERRIDES = {
  BIOLOGY: {
    dashboard: {
      nextCourse: { in: '1h 40m', label: 'Biologie Celulară · Lab Bio 2' },
      stats: [
        { val: '3', label: 'Cursuri azi', icon: '📚' },
        { val: '2', label: 'Probe laborator', icon: '🔬' },
        { val: '8', label: 'Zile până la colocviu', icon: '⏳' },
        { val: '3', label: 'Coordonatori disponibili', icon: '🎓' },
      ],
      upcoming: [
        { time: '08:00', name: 'Biologie Celulară', room: 'Lab Bio 2', type: 'Laborator', in: '1h 40m', color: 'bg-emerald-500' },
        { time: '10:00', name: 'Genetică Moleculară', room: 'Amf. B1', type: 'Curs', in: '3h 40m', color: 'bg-indigo-500' },
        { time: '12:00', name: 'Ecologie Generală', room: 'S.12', type: 'Seminar', in: '5h 40m', color: 'bg-lime-500' },
      ],
      alerts: [
        { icon: '🔬', text: 'Laboratorul de Biologie Celulară cere halat și fișa de lucru imprimată', time: '10 min în urmă', type: 'warn' },
        { icon: '🧬', text: 'Genetică Moleculară: quiz-ul de recapitulare se închide diseară la 22:00', time: '1 oră în urmă', type: 'danger' },
        { icon: '✅', text: 'Prof. Marinescu a confirmat tema ta de licență pe microbiom', time: 'Ieri', type: 'success' },
      ],
    },
    schedule: makeSchedule([
      { name: 'Biologie Celulară', short: 'BC', day: 1, start: 8, end: 10, room: 'Lab Bio 2', type: 'Laborator', professor: 'Prof. Dr. Ana Marinescu' },
      { name: 'Genetică Moleculară', short: 'GEN', day: 1, start: 10, end: 12, room: 'Amf. B1', type: 'Curs', professor: 'Conf. Dr. Vlad Rusu' },
      { name: 'Botanică Sistematică', short: 'BOT', day: 2, start: 8, end: 10, room: 'Herbar', type: 'Laborator', professor: 'Lect. Dr. Ioana Preda' },
      { name: 'Ecologie Generală', short: 'ECO', day: 2, start: 12, end: 14, room: 'S.12', type: 'Seminar', professor: 'Prof. Dr. Sorin Matei' },
      { name: 'Microbiologie', short: 'MIC', day: 3, start: 10, end: 12, room: 'Lab Micro', type: 'Laborator', professor: 'Conf. Dr. Elena Pop' },
      { name: 'Fiziologia Plantelor', short: 'FIZP', day: 4, start: 8, end: 10, room: 'Sera didactică', type: 'Practică', professor: 'Lect. Dr. Raluca Ilie' },
      { name: 'Zoologia Nevertebratelor', short: 'ZOO', day: 5, start: 10, end: 12, room: 'Lab Zoo', type: 'Laborator', professor: 'Prof. Dr. Dan Munteanu' },
    ]),
    professors: [
      { id: 1, name: 'Prof. Dr. Ana Marinescu', title: 'Profesor universitar', domain: 'Biologie Celulară & Moleculară', tags: ['Microscopie', 'Cultură celulară', 'Semnalizare'], available: true, slotsLeft: 3, totalSlots: 5, minGrade: 8.0, language: 'Română / Engleză', acceptsOther: true, previousTheses: [{ title: 'Markerii stresului oxidativ în culturi celulare', year: 2024 }, { title: 'Organizarea citoscheletului în celule epiteliale', year: 2023 }], contact: 'Email', avatar: 'AM', color: 'from-emerald-600 to-teal-600' },
      { id: 2, name: 'Conf. Dr. Vlad Rusu', title: 'Conferențiar universitar', domain: 'Genetică & Genomică', tags: ['PCR', 'Secvențiere', 'Bioinformatică'], available: true, slotsLeft: 2, totalSlots: 4, minGrade: 8.5, language: 'Română / Engleză', acceptsOther: false, previousTheses: [{ title: 'Variabilitate genetică în populații locale', year: 2024 }, { title: 'Analiza expresiei genice prin qPCR', year: 2023 }], contact: 'Teams', avatar: 'VR', color: 'from-indigo-600 to-blue-600' },
      { id: 3, name: 'Prof. Dr. Sorin Matei', title: 'Profesor universitar', domain: 'Ecologie & Conservare', tags: ['Biodiversitate', 'Habitate', 'Monitorizare teren'], available: true, slotsLeft: 4, totalSlots: 6, minGrade: 7.5, language: 'Română', acceptsOther: true, previousTheses: [{ title: 'Evaluarea biodiversității în zone periurbane', year: 2024 }, { title: 'Impactul speciilor invazive asupra pajiștilor', year: 2023 }], contact: 'Email', avatar: 'SM', color: 'from-lime-600 to-green-600' },
      { id: 4, name: 'Conf. Dr. Elena Pop', title: 'Conferențiar universitar', domain: 'Microbiologie', tags: ['Microbiom', 'Antibiorezistență', 'Culturi bacteriene'], available: true, slotsLeft: 1, totalSlots: 4, minGrade: 8.0, language: 'Română', acceptsOther: true, previousTheses: [{ title: 'Profilul microbiomului în probe de mediu', year: 2024 }, { title: 'Rezistența bacteriană în tulpini izolate local', year: 2023 }], contact: 'Laborator', avatar: 'EP', color: 'from-amber-600 to-orange-600' },
    ],
    domains: ['Toate', 'Biologie Celulară & Moleculară', 'Genetică & Genomică', 'Ecologie & Conservare', 'Microbiologie'],
    tutors: [
      { id: 1, name: 'Ioana Preda', year: 3, subjects: ['Biologie Celulară', 'Microscopie', 'Histologie'], grade: 9.7, sessions: 42, rating: 4.9, reviews: 31, price: 45, availability: ['Luni 16-19', 'Miercuri 17-20'], style: 'Scheme vizuale și exerciții pe imagini microscopice', avatar: 'IP', color: 'from-emerald-500 to-teal-500', online: true },
      { id: 2, name: 'Radu Neagu', year: 3, subjects: ['Genetică Moleculară', 'PCR', 'Bioinformatică'], grade: 9.5, sessions: 35, rating: 4.8, reviews: 27, price: 50, availability: ['Marți 17-20', 'Joi 17-20'], style: 'Probleme de genetică explicate pas cu pas', avatar: 'RN', color: 'from-indigo-500 to-blue-500', online: true },
      { id: 3, name: 'Mara Dobre', year: 2, subjects: ['Ecologie Generală', 'Botanică', 'Zoologie'], grade: 9.2, sessions: 21, rating: 4.7, reviews: 16, price: 40, availability: ['Vineri 15-18', 'Sâmbătă 10-13'], style: 'Fișe de teren, clasificări și recapitulare rapidă', avatar: 'MD', color: 'from-lime-500 to-green-500', online: false },
    ],
    subjects: ['Toate', 'Biologie Celulară', 'Genetică Moleculară', 'Microbiologie', 'Ecologie Generală', 'Botanică', 'Zoologie'],
    skillSwap: [
      { id: 1, name: 'Ioana Preda', avatar: 'IP', teaches: 'Microscopie & histologie', learns: 'Bioinformatică în R', teachLevel: 'Avansat', learnLevel: 'Beginner', match: true, online: true },
      { id: 2, name: 'Radu Neagu', avatar: 'RN', teaches: 'Genetică moleculară', learns: 'Ecologie de teren', teachLevel: 'Avansat', learnLevel: 'Intermediar', match: true, online: true },
      { id: 3, name: 'Mara Dobre', avatar: 'MD', teaches: 'Botanică sistematică', learns: 'PCR & laborator molecular', teachLevel: 'Intermediar', learnLevel: 'Beginner', match: false, online: false },
    ],
    groupSessions: [
      { id: 1, host: 'Ioana Preda', topic: 'Recapitulare microscopie: identificare țesuturi', date: 'Sâmbătă, 18 Mai', time: '10:00', spots: 3, totalSpots: 5, type: 'study', tags: ['Microscopie', 'Histologie', 'Laborator'] },
      { id: 2, host: 'Radu Neagu', topic: 'Genetică: probleme de ereditate și qPCR', date: 'Joi, 22 Mai', time: '17:00', spots: 2, totalSpots: 4, type: 'teach', tags: ['Genetică', 'PCR', 'Examen'] },
    ],
  },
  CHEMISTRY: {
    dashboard: {
      nextCourse: { in: '2h 05m', label: 'Chimie Organică · Lab 4' },
      upcoming: [
        { time: '08:00', name: 'Chimie Organică', room: 'Lab 4', type: 'Laborator', in: '2h 05m', color: 'bg-violet-500' },
        { time: '10:00', name: 'Chimie Analitică', room: 'Amf. C', type: 'Curs', in: '4h 05m', color: 'bg-amber-500' },
        { time: '12:00', name: 'Termodinamică Chimică', room: 'S.18', type: 'Seminar', in: '6h 05m', color: 'bg-cyan-500' },
      ],
      alerts: [
        { icon: '🧪', text: 'Pentru laboratorul de organică este obligatoriu caietul de reacții completat', time: '15 min în urmă', type: 'warn' },
        { icon: '📊', text: 'Chimie Analitică: setul de probleme titrimetrie are deadline mâine', time: '2 ore în urmă', type: 'danger' },
        { icon: '✅', text: 'Cererea de recuperare la laborator a fost aprobată', time: 'Ieri', type: 'success' },
      ],
    },
    schedule: makeSchedule([
      { name: 'Chimie Organică', short: 'ORG', day: 1, start: 8, end: 10, room: 'Lab 4', type: 'Laborator', professor: 'Prof. Dr. Mihaela Sandu' },
      { name: 'Chimie Analitică', short: 'AN', day: 1, start: 10, end: 12, room: 'Amf. C', type: 'Curs', professor: 'Conf. Dr. Radu Florea' },
      { name: 'Chimie Fizică', short: 'CF', day: 2, start: 8, end: 10, room: 'S.18', type: 'Curs', professor: 'Prof. Dr. Diana Ene' },
      { name: 'Termodinamică Chimică', short: 'TERM', day: 3, start: 10, end: 12, room: 'S.19', type: 'Seminar', professor: 'Lect. Dr. Oana Barbu' },
      { name: 'Spectroscopie', short: 'SPEC', day: 4, start: 12, end: 14, room: 'Lab Instr.', type: 'Laborator', professor: 'Conf. Dr. Radu Florea' },
    ]),
  },
  PHYSICS: {
    dashboard: {
      nextCourse: { in: '1h 20m', label: 'Mecanică Cuantică · Amf. F1' },
      upcoming: [
        { time: '08:00', name: 'Mecanică Cuantică', room: 'Amf. F1', type: 'Curs', in: '1h 20m', color: 'bg-indigo-500' },
        { time: '10:00', name: 'Electromagnetism', room: 'S. F3', type: 'Seminar', in: '3h 20m', color: 'bg-cyan-500' },
        { time: '14:00', name: 'Laborator Optică', room: 'Lab Optică', type: 'Laborator', in: '7h 20m', color: 'bg-violet-500' },
      ],
      alerts: [
        { icon: '⚛️', text: 'Mecanică Cuantică: seminarul de miercuri se mută în S. F2', time: '8 min în urmă', type: 'warn' },
        { icon: '📐', text: 'Electromagnetism: problemele 4-8 se predau până vineri', time: '1 oră în urmă', type: 'danger' },
        { icon: '✅', text: 'Ai fost adăugat în grupa de laborator Optică B1', time: 'Ieri', type: 'success' },
      ],
    },
    schedule: makeSchedule([
      { name: 'Mecanică Cuantică', short: 'MC', day: 1, start: 8, end: 10, room: 'Amf. F1', type: 'Curs', professor: 'Prof. Dr. Radu Antohi' },
      { name: 'Electromagnetism', short: 'EM', day: 1, start: 10, end: 12, room: 'S. F3', type: 'Seminar', professor: 'Conf. Dr. Ioana Pavel' },
      { name: 'Termodinamică', short: 'TER', day: 2, start: 8, end: 10, room: 'Amf. F2', type: 'Curs', professor: 'Prof. Dr. Dan Popa' },
      { name: 'Laborator Optică', short: 'OPT', day: 3, start: 14, end: 16, room: 'Lab Optică', type: 'Laborator', professor: 'Lect. Dr. Ana Ilie' },
      { name: 'Fizică Computațională', short: 'FC', day: 4, start: 10, end: 12, room: 'Lab PC', type: 'Laborator', professor: 'Conf. Dr. Ioana Pavel' },
    ]),
  },
  MATHEMATICS: {
    dashboard: {
      nextCourse: { in: '2h 15m', label: 'Analiză Matematică · Amf. 1' },
      upcoming: [
        { time: '08:00', name: 'Analiză Matematică', room: 'Amf. 1', type: 'Curs', in: '2h 15m', color: 'bg-indigo-500' },
        { time: '10:00', name: 'Algebră Liniară', room: 'S.11', type: 'Seminar', in: '4h 15m', color: 'bg-violet-500' },
        { time: '12:00', name: 'Probabilități', room: 'S.13', type: 'Curs', in: '6h 15m', color: 'bg-emerald-500' },
      ],
      alerts: [
        { icon: '📐', text: 'Seminarul de Algebră Liniară se mută în S.12', time: '5 min în urmă', type: 'warn' },
        { icon: '📝', text: 'Tema de analiză are deadline mâine la 23:59', time: '2 ore în urmă', type: 'danger' },
        { icon: '✅', text: 'Ai fost acceptat în grupa de pregătire pentru sesiune', time: 'Ieri', type: 'success' },
      ],
    },
  },
  MATH_CS: {
    dashboard: {
      nextCourse: { in: '1h 30m', label: 'Structuri de Date · Amf. A2' },
      stats: [
        { val: '3', label: 'Cursuri azi', icon: '📚' },
        { val: '2', label: 'Teme în așteptare', icon: '📝' },
        { val: '9', label: 'Zile până la sesiune', icon: '⏳' },
        { val: '3', label: 'Coordonatori disponibili', icon: '🎓' },
      ],
      upcoming: [
        { time: '08:00', name: 'Analiză Matematică', room: 'Amf. C1', type: 'Curs', in: '1h 30m', color: 'bg-indigo-500' },
        { time: '10:00', name: 'Structuri de Date', room: 'Amf. A2', type: 'Curs', in: '3h 30m', color: 'bg-amber-500' },
        { time: '12:00', name: 'Baze de Date', room: 'Lab. 3', type: 'Laborator', in: '5h 30m', color: 'bg-cyan-500' },
      ],
      alerts: [
        { icon: '📐', text: 'Seminarul de Algebră Liniară se mută în Amf. C4 săptămâna viitoare', time: '10 min în urmă', type: 'warn' },
        { icon: '💻', text: 'Laboratorul de Structuri de Date: tema 3 are deadline mâine la 23:59', time: '2 ore în urmă', type: 'danger' },
        { icon: '✅', text: 'Prof. Leustean a confirmat subiectul propus pentru lucrarea de licență', time: 'Ieri', type: 'success' },
      ],
    },
  },
  ENGINEERING_CS_CTI: {
    dashboard: {
      nextCourse: { in: '1h 15m', label: 'POO · Lab. C1-1' },
      stats: [
        { val: '3', label: 'Cursuri azi', icon: '📚' },
        { val: '2', label: 'Teme în așteptare', icon: '📝' },
        { val: '7', label: 'Zile până la sesiune', icon: '⏳' },
        { val: '4', label: 'Coordonatori disponibili', icon: '🎓' },
      ],
      upcoming: [
        { time: '08:00', name: 'Programare Orientată Obiect', room: 'Lab. C1-1', type: 'Laborator', in: '1h 15m', color: 'bg-indigo-500' },
        { time: '10:00', name: 'Electronică Digitală Avansată', room: 'Amf. AC0-1', type: 'Curs', in: '3h 15m', color: 'bg-amber-500' },
        { time: '14:00', name: 'Tehnici de Simulare', room: 'Lab. C2-1', type: 'Laborator', in: '7h 15m', color: 'bg-emerald-500' },
      ],
      alerts: [
        { icon: '💻', text: 'POO: tema 4 (Design Patterns) are deadline mâine la 23:59', time: '5 min în urmă', type: 'danger' },
        { icon: '🏫', text: 'Laboratorul EDA din joi se mută în Lab. C2-2', time: '30 min în urmă', type: 'warn' },
        { icon: '✅', text: 'Prof. dr. ing. Florin Leon a confirmat tema de licență propusă', time: 'Ieri', type: 'success' },
      ],
    },
  },
  ENGINEERING_CS_IS: {
    dashboard: {
      nextCourse: { in: '0h 50m', label: 'Matematici Numerice · Lab. A1-1' },
      stats: [
        { val: '3', label: 'Cursuri azi', icon: '📚' },
        { val: '1', label: 'Raport laborator', icon: '📝' },
        { val: '7', label: 'Zile până la sesiune', icon: '⏳' },
        { val: '4', label: 'Coordonatori disponibili', icon: '🎓' },
      ],
      upcoming: [
        { time: '08:00', name: 'Matematici Numerice', room: 'Lab. A1-1', type: 'Laborator', in: '0h 50m', color: 'bg-violet-500' },
        { time: '10:00', name: 'Sisteme cu Dispozitive Numerice', room: 'Amf. AC0-1', type: 'Curs', in: '2h 50m', color: 'bg-indigo-500' },
        { time: '14:00', name: 'Matematica Sistemelor Fizice', room: 'Lab. A2-1', type: 'Laborator', in: '6h 50m', color: 'bg-cyan-500' },
      ],
      alerts: [
        { icon: '📊', text: 'Raportul de laborator MN are deadline vineri la 18:00', time: '15 min în urmă', type: 'danger' },
        { icon: '🏫', text: 'Cursul ASDN din marți se mută în sala A0-2', time: '1 oră în urmă', type: 'warn' },
        { icon: '✅', text: 'Conf. dr. ing. Anca Maxim a confirmat cererea de consultație', time: 'Ieri', type: 'success' },
      ],
    },
  },
}

const DEFAULT_DASHBOARD = {
  nextCourse: { in: '2h 15m', label: 'ASD · C1' },
  stats: [
    { val: '3', label: 'Cursuri azi', icon: '📚' },
    { val: '2', label: 'Mesaje noi', icon: '💬' },
    { val: '8', label: 'Zile până la sesiune', icon: '⏳' },
    { val: '2', label: 'Locuri licență disponibile', icon: '🎓' },
  ],
  upcoming: [
    { time: '08:00', name: 'Algoritmi și Structuri de Date', room: 'C1', type: 'Curs', in: '2h 15m', color: 'bg-indigo-500' },
    { time: '10:00', name: 'Algebră Liniară', room: 'C2', type: 'Curs', in: '4h 15m', color: 'bg-violet-500' },
    { time: '12:00', name: 'Lab POO', room: 'Lab 3', type: 'Laborator', in: '6h 15m', color: 'bg-emerald-500' },
  ],
  alerts: [
    { icon: '📢', text: 'Cursul de ASD din vineri se mută în sala C3', time: '5 min în urmă', type: 'warn' },
    { icon: '📝', text: 'Laborator 4 — deadline predare mâine la 23:59', time: '2 ore în urmă', type: 'danger' },
    { icon: '✅', text: 'Prof. Moldovan a acceptat cererea ta de licență!', time: 'Ieri', type: 'success' },
  ],
}

function byKey(collection, key, fallback = 'CS') {
  const scienceFallback = ['BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'MATHEMATICS'].includes(key) ? 'SCIENCES' : fallback
  return OVERRIDES[key]?.[collection] || collectionFallback(collection, key) || collectionFallback(collection, scienceFallback)
}

function collectionFallback(collection, key) {
  const maps = {
    schedule: ALL_FACULTY_SCHEDULES,
    professors: PROFESSORS_BY_TYPE,
    tutors: TUTORS_BY_TYPE,
    skillSwap: SKILL_SWAP_BY_TYPE,
    groupSessions: GROUP_SESSIONS_BY_TYPE,
    domains: THESIS_DOMAINS_BY_TYPE,
    subjects: SUBJECT_FILTERS_BY_TYPE,
  }
  return maps[collection]?.[key]
}

export function getDashboardData(profile) {
  const key = getFacultyKey(profile)
  return { ...DEFAULT_DASHBOARD, ...(OVERRIDES[key]?.dashboard || {}) }
}

export function getScheduleData(profile) {
  return byKey('schedule', getFacultyKey(profile))
}

export function getProfessors(profile) {
  return byKey('professors', getFacultyKey(profile)) || []
}

export function getThesisDomains(profile) {
  return byKey('domains', getFacultyKey(profile)) || ['Toate']
}

export function getTutors(profile) {
  return byKey('tutors', getFacultyKey(profile)) || []
}

export function getSubjectFilters(profile) {
  return byKey('subjects', getFacultyKey(profile)) || ['Toate']
}

export function getSkillSwapUsers(profile) {
  return byKey('skillSwap', getFacultyKey(profile)) || []
}

export function getGroupSessions(profile) {
  return byKey('groupSessions', getFacultyKey(profile)) || []
}
