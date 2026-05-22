export const ROUTE_PROFILES = {
  foot: {
    label: 'Pe jos',
    osrmProfile: 'foot',
    durationLabel: 'pe jos',
    fallbackSpeedKmh: 4.8,
    speedKmh: 5,
  },
  bike: {
    label: 'Cu bicicleta',
    osrmProfile: 'bike',
    durationLabel: 'cu bicicleta',
    fallbackSpeedKmh: 15,
    speedKmh: 15,
  },
  car: {
    label: 'Cu masina',
    osrmProfile: 'driving',
    durationLabel: 'cu masina',
    fallbackSpeedKmh: 40,
    speedKmh: 40,
  },
}

// ─── TUIASI – Bd. Prof. Dimitrie Mangeron 67, Iași ───────────────────────────
export const TUIASI_CENTER = [47.153886, 27.593992]

export const TUIASI_BUILDINGS = [
  { id: 1,  name: 'Facultatea de Automatică și Calculatoare (AC)', distance: '0m',    time: '-',      type: 'Cursuri',  coords: [47.153886, 27.593992] },
  { id: 2,  name: 'Corp A – Departamentul Automatică',             distance: '80m',   time: '1 min',  type: 'Cursuri',  coords: [47.154232, 27.593145] },
  { id: 3,  name: 'Biblioteca Gh. Asachi',                         distance: '650m',  time: '9 min',  type: 'Studiu',   coords: [47.157030, 27.590140] },
  { id: 4,  name: 'Cantina TUIASI – Tudor Vladimirescu',           distance: '1.3km', time: '17 min', type: 'Servicii', coords: [47.154484, 27.609974] },
  { id: 5,  name: 'Secretariat AC',                                distance: '30m',   time: '1 min',  type: 'Admin',    coords: [47.153886, 27.593992] },
  { id: 6,  name: 'Facultatea ETTI – Bd. Carol I nr. 11A',         distance: '2.8km', time: '35 min', type: 'Cursuri',  coords: [47.174798, 27.571092] },
  { id: 7,  name: 'Rectorat TUIASI',                               distance: '480m',  time: '7 min',  type: 'Admin',    coords: [47.154639, 27.599747] },
  { id: 8,  name: 'Facultatea IEEIA',                              distance: '370m',  time: '5 min',  type: 'Cursuri',  coords: [47.153401, 27.596641] },
  { id: 9,  name: 'Facultatea de Mecanică',                        distance: '200m',  time: '3 min',  type: 'Cursuri',  coords: [47.154029, 27.597939] },
  { id: 10, name: 'Facultatea de Construcții și Instalații',       distance: '290m',  time: '4 min',  type: 'Cursuri',  coords: [47.152241, 27.589035] },
  { id: 11, name: 'Facultatea de Inginerie Chimica si Protectia Mediului „C. Simionescu"', distance: '1.0km', time: '13 min', type: 'Cursuri', coords: [47.155607, 27.603028] },
  { id: 12, name: 'Facultatea de Arhitectură „G.M. Cantacuzino"',  distance: '450m',  time: '6 min',  type: 'Cursuri',  coords: [47.152718, 27.589454] },
  { id: 13, name: 'Facultatea CMMI',                               distance: '240m',  time: '4 min',  type: 'Cursuri',  coords: [47.153802, 27.596924] },
  { id: 14, name: 'Facultatea HGIM',                               distance: '230m',  time: '4 min',  type: 'Cursuri',  coords: [47.155052, 27.599888] },
  { id: 15, name: 'Facultatea SIM',                                distance: '210m',  time: '3 min',  type: 'Cursuri',  coords: [47.154814, 27.597532] },
  { id: 16, name: 'Facultatea DIMA / Textile si Management Industrial', distance: '140m', time: '2 min', type: 'Cursuri', coords: [47.153434, 27.595632] },
]

export const TUIASI_POIS = [
  { id: 1,  name: 'Magazin Petru',                    type: 'Minimarket', lat: 47.15378, lng: 27.59570, short: 'PET',  color: '#f97316', desc: 'Minimarket frecventat de studenți – alimente, snacks, băuturi, rechizite.', rating: 4.3, hours: 'L-D: 07:00-22:00' },
  { id: 2,  name: 'Magazin Luca',                     type: 'Minimarket', lat: 47.15440, lng: 27.59600, short: 'LUC',  color: '#fb923c', desc: 'Minimarket de proximitate lângă complexul AC, ideal pentru pauze scurte.', rating: 4.1, hours: 'L-D: 07:00-21:00' },
  { id: 3,  name: 'Iulius Mall Iași',                 type: 'Mall',       lat: 47.155289, lng: 27.605741, short: 'MALL', color: '#8b5cf6', desc: 'Restaurante, Cinema City, supermarket și acces rapid din campusul Tudor Vladimirescu.', rating: 4.7, hours: 'L-D: 10:00-22:00' },
  { id: 4,  name: 'Complex Cămine Tudor Vladimirescu', type: 'Cămin',     lat: 47.154900, lng: 27.608900, short: 'TUD',  color: '#64748b', desc: 'Campus TUIASI cu 21 de cămine și ~8.000 locuri de cazare.', rating: 4.0, hours: '24/7' },
  { id: 5,  name: 'Cantina TUIASI',                   type: 'Cantina',    lat: 47.154484, lng: 27.609974, short: 'CAN',  color: '#ea580c', desc: 'Cantina oficială din campus, Aleea Prof. Vasile Petrescu nr. 29. Program L-V 11:00-19:00.', rating: 4.4, hours: 'L-V: 11:00-19:00' },
  { id: 6,  name: 'Cămine T1–T4',                     type: 'Cămin',      lat: 47.155650, lng: 27.607450, short: 'T1',   color: '#475569', desc: 'Primele cămine ale campusului Tudor Vladimirescu, aproape de zona centrală.', rating: 3.9, hours: '24/7' },
  { id: 7,  name: 'Cămine T5–T11',                    type: 'Cămin',      lat: 47.154950, lng: 27.609450, short: 'T5',   color: '#475569', desc: 'Zonă cu cămine, parc, spații de recreere și acces rapid la cantina.', rating: 4.0, hours: '24/7' },
  { id: 8,  name: 'Cămine T12–T17',                   type: 'Cămin',      lat: 47.153900, lng: 27.610600, short: 'T12',  color: '#475569', desc: 'Grup de cămine în campusul Tudor Vladimirescu, aproape de Iulius Mall.', rating: 4.0, hours: '24/7' },
  { id: 9,  name: 'Cămine T18–T19 / DSS',             type: 'Cămin',      lat: 47.153250, lng: 27.611700, short: 'DSS',  color: '#334155', desc: 'Cămine T18–T19 și Direcția Servicii Studențești, parter. DSS L-V 07:00-15:00.', rating: 4.0, hours: '24/7' },
  { id: 10, name: 'Biblioteca Facultății AC',          type: 'Biblioteca', lat: 47.153920, lng: 27.593900, short: 'BIB',  color: '#f59e0b', desc: 'Sală de lectură și bibliotecă proprie a Facultății AC, în complexul Corp C.', rating: 4.3, hours: 'L-V: 09:00-17:00' },
  { id: 11, name: 'ATM BRD Mangeron',                 type: 'ATM',        lat: 47.153780, lng: 27.594220, short: 'ATM',  color: '#1d4ed8', desc: 'Bancomat BRD la intrarea principală a complexului AC.', rating: null, hours: '24/7' },
  { id: 12, name: 'Farmacie Dacia',                   type: 'Farmacie',   lat: 47.153620, lng: 27.596300, short: 'RX',   color: '#22c55e', desc: 'Farmacie pe Bd. Mangeron, la câteva minute de facultate.', rating: 4.4, hours: 'L-V: 08:00-20:00 | S: 09:00-15:00' },
  { id: 13, name: 'Copisterie Mangeron',               type: 'Copisterie', lat: 47.153760, lng: 27.594360, short: 'PRN',  color: '#475569', desc: 'Printare, laminare și spiralare lângă AC.', rating: 4.3, hours: 'L-V: 08:00-17:00' },
]

export const TUIASI_IND_ROOMS = [
  { id: 'secretariat-ac', label: 'Secretariat AC',  floor: 0, rx: 40,  ry: 412, rw: 110, rh: 35, cx: 95  },
  { id: 'amf-ac0-1',      label: 'Amf. AC0-1',      floor: 0, rx: 170, ry: 412, rw: 100, rh: 35, cx: 220 },
  { id: 'lab-a0-1',       label: 'Lab. A0-1',        floor: 0, rx: 290, ry: 412, rw: 80,  rh: 35, cx: 330 },
  { id: 'sala-ac0-2',     label: 'Sala AC0-2',       floor: 0, rx: 390, ry: 412, rw: 80,  rh: 35, cx: 430 },
  { id: 'lab-c1-1',       label: 'Lab. C1-1',        floor: 1, rx: 40,  ry: 309, rw: 90,  rh: 35, cx: 85  },
  { id: 'lab-c1-2',       label: 'Lab. C1-2',        floor: 1, rx: 300, ry: 309, rw: 90,  rh: 35, cx: 345 },
  { id: 'lab-c2-1',       label: 'Lab. C2-1',        floor: 2, rx: 150, ry: 221, rw: 90,  rh: 35, cx: 195 },
  { id: 'birou-c2-5',     label: 'Birou C2-5',       floor: 2, rx: 270, ry: 221, rw: 80,  rh: 35, cx: 310 },
  { id: 'lab-a3-1',       label: 'Lab. A3-1 (DAIA)', floor: 3, rx: 40,  ry: 133, rw: 100, rh: 35, cx: 90  },
  { id: 'sala-a3-2',      label: 'Sala A3-2',        floor: 3, rx: 300, ry: 133, rw: 80,  rh: 35, cx: 340 },
  { id: 'sala-conf',      label: 'Sala Conferințe',  floor: 4, rx: 80,  ry: 40,  rw: 200, rh: 40, cx: 180 },
]

export const TUIASI_IND_GRAPH = {
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

export const TUIASI_ROUTE_IDS = {
  'corp-c': '1', ac: '1', automatica: '1',
  'corp-a': '2', daia: '2',
  library: '3', biblioteca: '3',
  canteen: '4', cantina: '4',
  secretariat: '5', 'secretariat-ac': '5',
  etti: '6',
  rectorat: '7',
  ieeia: '8',
  mec: '9', mecanica: '9',
  ci: '10', constructii: '10',
  icpm: '11', chimie: '11',
  arh: '12', arhitectura: '12',
  cmmi: '13',
  hgim: '14',
  sim: '15',
  dima: '16',
}

export const TUIASI_WALK_NODES = [
  { id: 'constructii',    coords: [47.152241, 27.589035] },
  { id: 'arh',            coords: [47.152718, 27.589454] },
  { id: 'library',        coords: [47.157030, 27.590140] },
  { id: 'corp-a',         coords: [47.154232, 27.593145] },
  { id: 'ieeia',          coords: [47.153401, 27.596641] },
  { id: 'ac',             coords: [47.153886, 27.593992] },
  { id: 'cmmi',           coords: [47.153802, 27.596924] },
  { id: 'sim',            coords: [47.154814, 27.597532] },
  { id: 'mec',            coords: [47.154029, 27.597939] },
  { id: 'icpm',           coords: [47.155607, 27.603028] },
  { id: 'dima',           coords: [47.153434, 27.595632] },
  { id: 'rectorat',       coords: [47.154639, 27.599747] },
  { id: 'hgim',           coords: [47.155052, 27.599888] },
  { id: 'tudor-entry',    coords: [47.154600, 27.603500] },
  { id: 'mall',           coords: [47.155289, 27.605741] },
  { id: 'dorms-north',    coords: [47.155650, 27.607450] },
  { id: 'dorms-center',   coords: [47.154950, 27.609450] },
  { id: 'canteen',        coords: [47.154484, 27.609974] },
  { id: 'dorms-south',    coords: [47.153900, 27.610600] },
  { id: 'copou-hub',      coords: [47.175000, 27.572000] },
  { id: 'etti',           coords: [47.174798, 27.571092] },
  // Noduri de jonctiune pe drumurile reale ale campusului
  { id: 'bd-mangeron-s',  coords: [47.152850, 27.591300] }, // Bd. Mangeron sud, lângă Constructii/Arh
  { id: 'bd-mangeron-mid',coords: [47.153750, 27.591900] }, // Bd. Mangeron intrare principala campus
  { id: 'bd-mangeron-n',  coords: [47.155600, 27.591100] }, // Bd. Mangeron nord, spre Biblioteca
  { id: 'campus-jct-w',   coords: [47.153800, 27.594800] }, // Jonctiune vest campus (AC → est)
  { id: 'campus-jct-e',   coords: [47.154150, 27.598100] }, // Jonctiune est campus
]

export const TUIASI_WALK_EDGES = [
  // Bd. Mangeron – coloana vertebrala nord-sud
  ['constructii',    'bd-mangeron-s'],
  ['arh',            'bd-mangeron-s'],
  ['bd-mangeron-s',  'bd-mangeron-mid'],
  ['bd-mangeron-mid','bd-mangeron-n'],
  ['bd-mangeron-n',  'library'],

  // Intrari in campus de pe Bd. Mangeron
  ['bd-mangeron-mid','corp-a'],
  ['bd-mangeron-mid','ac'],
  ['corp-a',         'ac'],

  // Drumul principal est-vest prin campus
  ['ac',             'campus-jct-w'],
  ['campus-jct-w',   'dima'],
  ['campus-jct-w',   'ieeia'],
  ['campus-jct-w',   'cmmi'],
  ['dima',           'ieeia'],
  ['ieeia',          'cmmi'],
  ['cmmi',           'campus-jct-e'],
  ['campus-jct-e',   'sim'],
  ['campus-jct-e',   'mec'],
  ['campus-jct-e',   'rectorat'],
  ['sim',            'mec'],
  ['mec',            'icpm'],
  ['rectorat',       'hgim'],
  ['rectorat',       'tudor-entry'],
  ['hgim',           'tudor-entry'],
  ['icpm',           'tudor-entry'],

  // Campus Tudor Vladimirescu
  ['tudor-entry',    'mall'],
  ['mall',           'dorms-north'],
  ['mall',           'dorms-center'],
  ['dorms-center',   'canteen'],
  ['canteen',        'dorms-south'],
  ['dorms-center',   'dorms-south'],

  // Spre ETTI / Copou
  ['library',        'copou-hub'],
  ['copou-hub',      'etti'],
]

export const TUIASI_AI_DESTINATIONS = [
  { label: 'C210', query: 'Vreau să ajung la sala C210', type: 'Sală' },
  { label: 'C308', query: 'Vreau să ajung la sala C308', type: 'Sală' },
  { label: 'Secretariat', query: 'Vreau să ajung la Secretariatul AC', type: 'Admin' },
  { label: 'Biblioteca', query: 'Cum ajung la Biblioteca Gh. Asachi?', type: 'Campus' },
  { label: 'Cantina', query: 'Cum ajung la cantina TUIASI?', type: 'Campus' },
  { label: 'Corp A', query: 'Cum ajung la Corp A de la AC?', type: 'Campus' },
  { label: 'AC', query: 'Cum ajung la Facultatea de Automatica si Calculatoare?', type: 'Facultate' },
  { label: 'ETTI', query: 'Cum ajung la Facultatea ETTI?', type: 'Facultate' },
  { label: 'IEEIA', query: 'Cum ajung la Facultatea IEEIA?', type: 'Facultate' },
  { label: 'Mecanica', query: 'Cum ajung la Facultatea de Mecanica?', type: 'Facultate' },
  { label: 'Constructii', query: 'Cum ajung la Facultatea de Constructii si Instalatii?', type: 'Facultate' },
  { label: 'Chimie', query: 'Cum ajung la Facultatea de Inginerie Chimica si Protectia Mediului?', type: 'Facultate' },
  { label: 'Arhitectura', query: 'Cum ajung la Facultatea de Arhitectura?', type: 'Facultate' },
  { label: 'CMMI', query: 'Cum ajung la Facultatea CMMI?', type: 'Facultate' },
  { label: 'HGIM', query: 'Cum ajung la Facultatea HGIM?', type: 'Facultate' },
  { label: 'SIM', query: 'Cum ajung la Facultatea SIM?', type: 'Facultate' },
  { label: 'DIMA', query: 'Cum ajung la Facultatea DIMA?', type: 'Facultate' },
  { label: 'Rectorat', query: 'Cum ajung la Rectoratul TUIASI?', type: 'Admin' },
]

// ─── UAIC – Bd. Carol I nr. 11, Iași ─────────────────────────────────────────
export const UAIC_CENTER = [47.174207, 27.571376]

export const UAIC_BUILDINGS = [
  { id: 1,  name: 'Corp A - Universitatea Alexandru Ioan Cuza',     distance: '0m',    time: '-',      type: 'Admin',   coords: [47.174207, 27.571376] },
  { id: 2,  name: 'Facultatea de Informatica - FII',                distance: '350m',  time: '5 min',  type: 'Cursuri', coords: [47.173984, 27.574863] },
  { id: 3,  name: 'Facultatea de Matematica',                       distance: '0m',    time: '-',      type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 4,  name: 'Facultatea de Fizica',                           distance: '190m',  time: '3 min',  type: 'Cursuri', coords: [47.175112, 27.573861] },
  { id: 5,  name: 'Facultatea de Chimie',                           distance: '190m',  time: '3 min',  type: 'Cursuri', coords: [47.175112, 27.573861] },
  { id: 6,  name: 'Facultatea de Biologie',                         distance: '190m',  time: '3 min',  type: 'Cursuri', coords: [47.175112, 27.573861] },
  { id: 7,  name: 'Facultatea de Drept',                            distance: '0m',    time: '-',      type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 8,  name: 'Facultatea de Litere',                           distance: '0m',    time: '-',      type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 9,  name: 'Facultatea de Filosofie si Stiinte Social-Politice', distance: '0m', time: '-', type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 10, name: 'Facultatea de Psihologie si Stiinte ale Educatiei', distance: '650m', time: '9 min', type: 'Cursuri', coords: [47.173648, 27.564996] },
  { id: 11, name: 'Facultatea de Economie si Administrarea Afacerilor - FEAA', distance: '350m', time: '5 min', type: 'Cursuri', coords: [47.172152, 27.574391] },
  { id: 12, name: 'Facultatea de Geografie si Geologie',             distance: '190m',  time: '3 min',  type: 'Cursuri', coords: [47.175112, 27.573861] },
  { id: 13, name: 'Biblioteca Centrala Mihai Eminescu - BCU',        distance: '350m',  time: '5 min',  type: 'Studiu',  coords: [47.170261, 27.575235] },
  { id: 14, name: 'Secretariat FII',                                distance: '350m',  time: '5 min',  type: 'Admin',   coords: [47.173984, 27.574863] },
  { id: 15, name: 'Camine Codrescu',                                distance: '500m',  time: '7 min',  type: 'Camin',   coords: [47.177743, 27.573077] },
  { id: 16, name: 'Facultatea de Istorie',                          distance: '0m',    time: '-',      type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 17, name: 'Facultatea de Teologie Ortodoxa',                distance: '1.5km', time: '20 min', type: 'Cursuri', coords: [47.162385, 27.580734] },
  { id: 18, name: 'Facultatea de Educatie Fizica si Sport',         distance: '650m',  time: '9 min',  type: 'Cursuri', coords: [47.173648, 27.564996] },
  { id: 19, name: 'Facultatea de Teologie Romano-Catolica',         distance: '0m',    time: '-',      type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 20, name: 'Cantina Titu Maiorescu UAIC',                    distance: '200m',  time: '3 min',  type: 'Servicii', coords: [47.174453, 27.569726] },
]

export const UAIC_POIS = [
  { id: 1,  name: 'Cantina Titu Maiorescu UAIC',        type: 'Cantina',    lat: 47.174453, lng: 27.569726, short: 'CAN', color: '#ea580c', desc: 'Cantina UAIC din zona Titu Maiorescu, folosita frecvent de studenti.', rating: 4.2, hours: 'L-V: 11:00-19:00' },
  { id: 2,  name: 'ATM BRD (Bd. Carol I)',              type: 'ATM',        lat: 47.174207, lng: 27.571376, short: 'ATM', color: '#1d4ed8', desc: 'Bancomat in zona corpului principal UAIC.', rating: null, hours: '24/7' },
  { id: 3,  name: 'Cafenea Studenteasca FII',           type: 'Cafenea',    lat: 47.173984, lng: 27.574863, short: 'CAF', color: '#92400e', desc: 'Cafenea in zona Facultatii de Informatica, buna pentru pauze intre cursuri.', rating: 4.5, hours: 'L-V: 08:00-18:00' },
  { id: 4,  name: 'Copisterie Carol I',                 type: 'Copisterie', lat: 47.173984, lng: 27.574863, short: 'PRN', color: '#475569', desc: 'Printare, copiere si spiralare in zona FII / Carol I.', rating: 4.3, hours: 'L-V: 08:00-17:00' },
  { id: 5,  name: 'Farmacie Salvator (Bd. Carol I)',    type: 'Farmacie',   lat: 47.175112, lng: 27.573861, short: 'RX',  color: '#22c55e', desc: 'Farmacie pe Bd. Carol I, la cateva minute de universitate.', rating: 4.4, hours: 'L-V: 08:00-20:00 | S: 09:00-15:00' },
  { id: 6,  name: 'Piata Unirii',                       type: 'Reper',      lat: 47.166901, lng: 27.580523, short: 'UNI', color: '#7c3aed', desc: 'Nod central pentru transport, cafenele, banci si acces spre centru.', rating: 4.8, hours: '24/7' },
  { id: 7,  name: 'Camine Codrescu',                    type: 'Camin',      lat: 47.177743, lng: 27.573077, short: 'COD', color: '#64748b', desc: 'Complex de camine UAIC din zona Codrescu.', rating: 4.0, hours: '24/7' },
  { id: 8,  name: 'Biblioteca Centrala BCU',            type: 'Biblioteca', lat: 47.170261, lng: 27.575235, short: 'BCU', color: '#f59e0b', desc: 'Biblioteca Centrala Universitara Mihai Eminescu. Program L-V 09:00-20:00.', rating: 4.6, hours: 'L-V: 09:00-20:00 | S: 09:00-14:00' },
  { id: 9,  name: 'Minimarket Profi (Bd. Carol I)',     type: 'Minimarket', lat: 47.175112, lng: 27.573861, short: 'PRO', color: '#f97316', desc: 'Minimarket in zona Carol I pentru produse zilnice.', rating: 4.2, hours: 'L-D: 07:00-22:00' },
  { id: 10, name: 'Parcul Copou',                       type: 'Parc',       lat: 47.18158, lng: 27.57243, short: 'CPO', color: '#16a34a', desc: 'Parcul Copou - Teiul lui Eminescu si zone de studiu outdoor.', rating: 4.9, hours: '24/7' },
]

export const UAIC_IND_ROOMS = [
  { id: 'secretariat-fii', label: 'Secretariat FII',   floor: 0, rx: 40,  ry: 412, rw: 110, rh: 35, cx: 95  },
  { id: 'amf-otelea',      label: 'Amf. „E. Otelea"',  floor: 0, rx: 170, ry: 412, rw: 100, rh: 35, cx: 220 },
  { id: 'lab-info-0',      label: 'Lab. Info 0-1',      floor: 0, rx: 290, ry: 412, rw: 80,  rh: 35, cx: 330 },
  { id: 'sala-info-0',     label: 'Sala Info 0-2',      floor: 0, rx: 390, ry: 412, rw: 80,  rh: 35, cx: 430 },
  { id: 'lab-info-1a',     label: 'Lab. Info 1-1',      floor: 1, rx: 40,  ry: 309, rw: 90,  rh: 35, cx: 85  },
  { id: 'lab-info-1b',     label: 'Lab. Info 1-2',      floor: 1, rx: 300, ry: 309, rw: 90,  rh: 35, cx: 345 },
  { id: 'lab-info-2a',     label: 'Lab. Info 2-1',      floor: 2, rx: 150, ry: 221, rw: 90,  rh: 35, cx: 195 },
  { id: 'birou-prof',      label: 'Birouri Profesori',  floor: 2, rx: 270, ry: 221, rw: 80,  rh: 35, cx: 310 },
  { id: 'lab-info-3a',     label: 'Lab. Info 3-1',      floor: 3, rx: 40,  ry: 133, rw: 100, rh: 35, cx: 90  },
  { id: 'decanat-fii',     label: 'Decanat FII',        floor: 3, rx: 300, ry: 133, rw: 80,  rh: 35, cx: 340 },
  { id: 'sala-conf-fii',   label: 'Sala Conferințe',    floor: 4, rx: 80,  ry: 40,  rw: 200, rh: 40, cx: 180 },
]

export const UAIC_IND_GRAPH = {
  'secretariat-fii': ['amf-otelea', 'lab-info-0', 'sala-info-0', 'stairs_0'],
  'amf-otelea':      ['secretariat-fii', 'lab-info-0', 'stairs_0'],
  'lab-info-0':      ['secretariat-fii', 'amf-otelea', 'sala-info-0', 'stairs_0'],
  'sala-info-0':     ['secretariat-fii', 'lab-info-0', 'stairs_0'],
  stairs_0:          ['secretariat-fii', 'amf-otelea', 'lab-info-0', 'sala-info-0', 'stairs_1'],
  'lab-info-1a':     ['lab-info-1b', 'stairs_1'],
  'lab-info-1b':     ['lab-info-1a', 'stairs_1'],
  stairs_1:          ['lab-info-1a', 'lab-info-1b', 'stairs_0', 'stairs_2'],
  'lab-info-2a':     ['birou-prof', 'stairs_2'],
  'birou-prof':      ['lab-info-2a', 'stairs_2'],
  stairs_2:          ['lab-info-2a', 'birou-prof', 'stairs_1', 'stairs_3'],
  'lab-info-3a':     ['decanat-fii', 'stairs_3'],
  'decanat-fii':     ['lab-info-3a', 'stairs_3'],
  stairs_3:          ['lab-info-3a', 'decanat-fii', 'stairs_2', 'stairs_4'],
  'sala-conf-fii':   ['stairs_4'],
  stairs_4:          ['sala-conf-fii', 'stairs_3'],
}

export const UAIC_ROUTE_IDS = {
  rectorat: '1', 'rectorat-uaic': '1', uaic: '1',
  fii: '2', informatica: '2',
  matematica: '3',
  fizica: '4',
  chimie: '5',
  biologie: '6',
  drept: '7',
  litere: '8',
  filosofie: '9',
  psihologie: '10',
  feaa: '11', economie: '11',
  geografie: '12', geologie: '12',
  bcu: '13', biblioteca: '13',
  secretariat: '14', 'secretariat-fii': '14',
  camine: '15', 'camine-codrescu': '15',
  istorie: '16',
  teologie: '17',
  sport: '18',
  catolica: '19',
  cantina: '20', 'canteen-uaic': '20',
}

export const UAIC_AI_DESTINATIONS = [
  { label: 'Secretariat FII', query: 'Unde se afla Secretariatul FII?', type: 'Admin' },
  { label: 'Decanat FII', query: 'Cum ajung la Decanatul FII?', type: 'Admin' },
  { label: 'Lab Info', query: 'Unde sunt laboratoarele de informatica?', type: 'Sala' },
  { label: 'BCU', query: 'Cum ajung la Biblioteca Centrala BCU?', type: 'Studiu' },
  { label: 'Cantina', query: 'Cum ajung la cantina UAIC?', type: 'Campus' },
  { label: 'Camine', query: 'Cum ajung la caminele Codrescu?', type: 'Camin' },
  { label: 'Matematica', query: 'Cum ajung la Facultatea de Matematica UAIC?', type: 'Facultate' },
  { label: 'Fizica', query: 'Cum ajung la Facultatea de Fizica UAIC?', type: 'Facultate' },
  { label: 'Chimie', query: 'Cum ajung la Facultatea de Chimie UAIC?', type: 'Facultate' },
  { label: 'Biologie', query: 'Cum ajung la Facultatea de Biologie UAIC?', type: 'Facultate' },
  { label: 'Drept', query: 'Cum ajung la Facultatea de Drept UAIC?', type: 'Facultate' },
  { label: 'Litere', query: 'Cum ajung la Facultatea de Litere UAIC?', type: 'Facultate' },
  { label: 'Filosofie', query: 'Cum ajung la Facultatea de Filosofie UAIC?', type: 'Facultate' },
  { label: 'Psihologie', query: 'Cum ajung la Facultatea de Psihologie UAIC?', type: 'Facultate' },
  { label: 'FEAA', query: 'Cum ajung la FEAA UAIC?', type: 'Facultate' },
  { label: 'Geografie', query: 'Cum ajung la Facultatea de Geografie si Geologie UAIC?', type: 'Facultate' },
  { label: 'Istorie', query: 'Cum ajung la Facultatea de Istorie UAIC?', type: 'Facultate' },
  { label: 'Teologie', query: 'Cum ajung la Facultatea de Teologie Ortodoxa UAIC?', type: 'Facultate' },
  { label: 'Sport', query: 'Cum ajung la Facultatea de Educatie Fizica si Sport UAIC?', type: 'Facultate' },
]

export const UAIC_WALK_NODES = [
  { id: 'corp-a',    coords: [47.174207, 27.571376] },
  { id: 'fii',       coords: [47.173984, 27.574863] },
  { id: 'fizica',    coords: [47.175112, 27.573861] },
  { id: 'feaa',      coords: [47.172152, 27.574391] },
  { id: 'bcu',       coords: [47.170261, 27.575235] },
  { id: 'camine',    coords: [47.177743, 27.573077] },
  { id: 'psihologie',coords: [47.173648, 27.564996] },
  { id: 'cantina',   coords: [47.174453, 27.569726] },
]

export const UAIC_WALK_EDGES = [
  ['corp-a', 'fii'],
  ['corp-a', 'fizica'],
  ['corp-a', 'cantina'],
  ['fii', 'fizica'],
  ['fii', 'feaa'],
  ['fizica', 'feaa'],
  ['feaa', 'bcu'],
  ['corp-a', 'camine'],
  ['cantina', 'psihologie'],
  ['corp-a', 'psihologie'],
]

// ─── Campus config – keyed by university ID ───────────────────────────────────
export const CAMPUS_CONFIG = {
  tuiasi: {
    center:          TUIASI_CENTER,
    buildings:       TUIASI_BUILDINGS,
    pois:            TUIASI_POIS,
    indRooms:        TUIASI_IND_ROOMS,
    indGraph:        TUIASI_IND_GRAPH,
    outdoorRouteIds: TUIASI_ROUTE_IDS,
    walkNodes:       TUIASI_WALK_NODES,
    walkEdges:       TUIASI_WALK_EDGES,
    aiDestinations:  TUIASI_AI_DESTINATIONS,
    name:            'TUIASI – Gh. Asachi',
    greeting:        'Salut! Sunt asistentul tău de navigare pentru campusul TUIASI. Cum te pot ajuta?',
    indoorLabel:     'Navigare interioară – Corp C (AC)',
    indoorDefault:   'secretariat-ac',
  },
  uaic: {
    center:          UAIC_CENTER,
    buildings:       UAIC_BUILDINGS,
    pois:            UAIC_POIS,
    indRooms:        UAIC_IND_ROOMS,
    indGraph:        UAIC_IND_GRAPH,
    outdoorRouteIds: UAIC_ROUTE_IDS,
    walkNodes:       UAIC_WALK_NODES,
    walkEdges:       UAIC_WALK_EDGES,
    aiDestinations:  UAIC_AI_DESTINATIONS,
    name:            'UAIC Iași',
    greeting:        'Salut! Sunt asistentul tău de navigare pentru campusul UAIC. Cum te pot ajuta?',
    indoorLabel:     'Navigare interioară – Facultatea de Informatică FII',
    indoorDefault:   'secretariat-fii',
  },
}
