// Server-side demo professor identity. Kept here (not imported from src/) so the
// backend never depends on frontend bundle code. The frontend keeps its own copy
// for display defaults; this one is the source of truth for the Portal API.
export const DEMO_PROFESSOR = {
  id: 'prof-mihai-ciobanu',
  name: 'Prof. dr. ing. Mihai Ciobanu',
  email: 'mihai.ciobanu@academic.tuiasi.ro',
  password: null,
  universityId: 'tuiasi',
  universityName: 'Gheorghe Asachi',
  facultyCode: 'AC',
  facultyName: 'Facultatea de Automatică și Calculatoare',
  title: 'Profesor universitar',
  domain: 'Arhitectura Calculatoarelor și Sisteme Distribuite',
  room: 'Corp C, birou C2-5',
  phone: '+40 232 701 305',
  consultationHours: [
    { id: 'oh-1', day: 'Marți', time: '14:00-16:00', place: 'Corp C, birou C2-5', mode: 'Fizic', capacity: 6 },
    { id: 'oh-2', day: 'Joi', time: '10:00-12:00', place: 'Teams', mode: 'Online', capacity: 10 },
  ],
  courses: [
    { id: 'course-ac', name: 'Arhitectura Calculatoarelor', groups: ['CTI-A1', 'CTI-A2'], room: 'Amf. AC0-1', next: 'Marți 10:00' },
    { id: 'course-sd', name: 'Sisteme Distribuite', groups: ['CTI-B1'], room: 'Lab C2-1', next: 'Joi 14:00' },
    { id: 'course-vlsi', name: 'Circuite VLSI', groups: ['CTI-M1'], room: 'Lab C3-1', next: 'Vineri 12:00' },
  ],
  research: ['Arhitecturi de calcul avansate', 'Sisteme distribuite', 'Edge Computing', 'VLSI și circuite reconfigurabile'],
  assistant: 'Ș.l. dr. ing. Alexandru-Tudor Popovici',
  avatar: 'MC',
}
