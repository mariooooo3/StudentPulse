// ── Year sets reused across multiple faculties ────────────────────────────────
const Y3 = [
  { label: 'Anul 1', desc: 'Primul an de licență' },
  { label: 'Anul 2', desc: 'Al doilea an de licență' },
  { label: 'Anul 3', desc: 'Ultimul an licență, pregătire examen' },
  { label: 'Master I', desc: 'Studii masterale, primul an' },
  { label: 'Master II', desc: 'Studii masterale, al doilea an' },
  { label: 'Doctorat', desc: 'Studii doctorale' },
]
const Y4 = [
  { label: 'Anul 1', desc: 'Primul an de licență' },
  { label: 'Anul 2', desc: 'Al doilea an de licență' },
  { label: 'Anul 3', desc: 'Al treilea an de licență' },
  { label: 'Anul 4', desc: 'Ultimul an licență, pregătire examen' },
  { label: 'Master I', desc: 'Studii masterale, primul an' },
  { label: 'Master II', desc: 'Studii masterale, al doilea an' },
  { label: 'Doctorat', desc: 'Studii doctorale' },
]
const Y5 = [
  { label: 'Anul 1', desc: 'Primul an de licență' },
  { label: 'Anul 2', desc: 'Al doilea an de licență' },
  { label: 'Anul 3', desc: 'Al treilea an de licență' },
  { label: 'Anul 4', desc: 'Al patrulea an' },
  { label: 'Anul 5', desc: 'Ultimul an, stagii finale' },
  { label: 'Rezidențiat / Master', desc: 'Specializare postuniversitară' },
]
const Y6 = [
  { label: 'Anul 1', desc: 'Preclinic — anatomie, biochimie' },
  { label: 'Anul 2', desc: 'Preclinic — fiziologie, histologie' },
  { label: 'Anul 3', desc: 'Paraclinic — semiologie, farmacologie' },
  { label: 'Anul 4', desc: 'Clinic — medicină internă, chirurgie' },
  { label: 'Anul 5', desc: 'Rotații clinice, specialități' },
  { label: 'Anul 6', desc: 'Stagii finale, examen de stat' },
  { label: 'Rezidențiat', desc: 'Specializare post-licență' },
]
const Y6_ARCH = [
  { label: 'Anul 1', desc: 'Bazele arhitecturii, desen tehnic' },
  { label: 'Anul 2', desc: 'Proiectare arhitecturală I' },
  { label: 'Anul 3', desc: 'Proiectare arhitecturală II' },
  { label: 'Anul 4', desc: 'Proiectare avansată, urbanism' },
  { label: 'Anul 5', desc: 'Proiect de diplomă, stagiu' },
  { label: 'Anul 6', desc: 'Proiect final de arhitectură' },
  { label: 'Master', desc: 'Studii masterale în arhitectură' },
]

// ── Faculties ────────────────────────────────────────────────────────────────
export const FACULTIES = [
  { label: 'Facultatea de Informatică (FII)',               type: 'CS',          years: Y3 },
  { label: 'Facultatea de Calculatoare și Automatică',      type: 'CS',          years: Y4 },
  { label: 'Facultatea de Matematică și Informatică',       type: 'CS',          years: Y3 },
  { label: 'Facultatea de Matematică',                      type: 'SCIENCES',    years: Y3 },
  { label: 'Facultatea de Fizică',                          type: 'SCIENCES',    years: Y3 },
  { label: 'Facultatea de Chimie',                          type: 'SCIENCES',    years: Y3 },
  { label: 'Facultatea de Biologie',                        type: 'SCIENCES',    years: Y3 },
  { label: 'Facultatea de Geografie',                       type: 'SCIENCES',    years: Y4 },
  { label: 'Facultatea de Drept',                           type: 'HUMANITIES',  years: Y4 },
  { label: 'Facultatea de Filosofie',                       type: 'HUMANITIES',  years: Y3 },
  { label: 'Facultatea de Istorie',                         type: 'HUMANITIES',  years: Y3 },
  { label: 'Facultatea de Litere',                          type: 'HUMANITIES',  years: Y3 },
  { label: 'Facultatea de Psihologie',                      type: 'HUMANITIES',  years: Y3 },
  { label: 'Facultatea de Sociologie și Asistență Socială', type: 'HUMANITIES',  years: Y3 },
  { label: 'Facultatea de Economie',                        type: 'ECONOMICS',   years: Y3 },
  { label: 'Facultatea de Management',                      type: 'ECONOMICS',   years: Y3 },
  { label: 'Facultatea de Marketing',                       type: 'ECONOMICS',   years: Y3 },
  { label: 'Facultatea de Finanțe, Asigurări, Bănci',      type: 'ECONOMICS',   years: Y3 },
  { label: 'Facultatea de Contabilitate',                   type: 'ECONOMICS',   years: Y3 },
  { label: 'Facultatea de Medicină',                        type: 'MEDICINE',    years: Y6 },
  { label: 'Facultatea de Farmacie',                        type: 'PHARMACY',    years: Y5 },
  { label: 'Facultatea de Stomatologie',                    type: 'MEDICINE',    years: Y6 },
  { label: 'Facultatea de Inginerie Electrică',             type: 'ENGINEERING', years: Y4 },
  { label: 'Facultatea de Inginerie Mecanică',              type: 'ENGINEERING', years: Y4 },
  { label: 'Facultatea de Construcții',                     type: 'ENGINEERING', years: Y4 },
  { label: 'Facultatea de Inginerie Chimică',               type: 'ENGINEERING', years: Y4 },
  { label: 'Facultatea de Automatică',                      type: 'ENGINEERING', years: Y4 },
  { label: 'Facultatea de Arte și Design',                  type: 'ARTS',        years: Y4 },
  { label: 'Facultatea de Muzică',                          type: 'ARTS',        years: Y4 },
  { label: 'Facultatea de Teatru',                          type: 'ARTS',        years: Y4 },
  { label: 'Facultatea de Arhitectură',                     type: 'ARTS',        years: Y6_ARCH },
]

// ── Dynamic onboarding questions by faculty type ─────────────────────────────
export const FACULTY_QUESTIONS = {
  CS: {
    interestsLabel: 'Care sunt domeniile tehnice care te atrag?',
    interests: ['AI & Machine Learning','Web Development','Cybersecurity','Mobile Apps','Data Science & Analytics','Algoritmi & Structuri de Date','Sisteme Distribuite','Embedded & IoT','DevOps & Cloud','Game Development'],
    specific: {
      question: 'Ce limbaje / tehnologii folosești cel mai frecvent?',
      type: 'tags',
      options: ['Python','JavaScript / TypeScript','Java','C / C++','Go','Rust','SQL','Alt limbaj'],
    },
    experience: {
      question: 'Care este nivelul tău de experiență în programare?',
      type: 'cards',
      options: [
        { label: 'Începător', desc: 'Mai puțin de 1 an, încă învăț bazele' },
        { label: 'Intermediar', desc: '1–3 ani, lucrez pe proiecte proprii' },
        { label: 'Avansat', desc: '3+ ani, am experiență în proiecte reale / stagii' },
      ],
    },
  },
  SCIENCES: {
    interestsLabel: 'Ce domeniu al științei te atrage cel mai mult?',
    interests: ['Matematică aplicată','Fizică computațională','Chimie organică','Biologie moleculară','Bioinformatică','Statistică & Probabilități','Cercetare experimentală','Modelare matematică'],
    specific: {
      question: 'Care este orientarea ta principală?',
      type: 'cards',
      options: [
        { label: 'Cercetare academică', desc: 'Articole, conferințe, doctorat' },
        { label: 'Aplicații practice', desc: 'Industrie, laborator, consultanță' },
        { label: 'Didactică', desc: 'Predare, tutoring, educație' },
      ],
    },
    experience: {
      question: 'Unde te simți cel mai bine?',
      type: 'cards',
      options: [
        { label: 'Laborator experimental', desc: 'Experimente, măsurători, analiză' },
        { label: 'Analiză teoretică', desc: 'Demonstrații, modele, calcul' },
        { label: 'Date computaționale', desc: 'Software, simulări, vizualizare' },
      ],
    },
  },
  HUMANITIES: {
    interestsLabel: 'Care sunt ariile tale de interes din sfera umanioarelor?',
    interests: ['Drept civil & penal','Drept european','Filosofie analitică','Etică aplicată','Istorie modernă','Istoriografie','Lingvistică','Literatură comparată','Psihologie clinică','Asistență socială'],
    specific: {
      question: 'Ce format de lucru academic preferi?',
      type: 'cards',
      options: [
        { label: 'Seminare de dezbatere', desc: 'Discuții, analize, argumente' },
        { label: 'Cercetare individuală', desc: 'Arhive, surse primare, articole' },
        { label: 'Stagii practice', desc: 'Cabinet, ONG, instituție publică' },
      ],
    },
    experience: {
      question: 'Spre ce carieră te orientezi?',
      type: 'cards',
      options: [
        { label: 'Cercetare / Academie', desc: 'Doctorat, publicații, universitate' },
        { label: 'Practică profesională', desc: 'Avocat, psiholog, asistent social' },
        { label: 'Sector public', desc: 'Administrație, politici publice' },
        { label: 'Media / Jurnalism', desc: 'Comunicare, presa, PR' },
      ],
    },
  },
  ECONOMICS: {
    interestsLabel: 'Ce domeniu al economiei te interesează?',
    interests: ['Finanțe corporative','Marketing digital','Antreprenoriat','Management operațional','Piețe de capital','Contabilitate & Audit','Economie internațională','Business Analytics','Supply Chain','HR & Organizații'],
    specific: {
      question: 'Ce tip de mediu profesional te atrage?',
      type: 'cards',
      options: [
        { label: 'Corporație multinațională', desc: 'Structuri mari, proiecte internaționale' },
        { label: 'Start-up', desc: 'Inovație, ritm rapid, multitasking' },
        { label: 'Propria afacere', desc: 'Antreprenoriat, independență' },
        { label: 'Consultanță', desc: 'Clienți diverși, analiză, soluții' },
      ],
    },
    experience: {
      question: 'Ai deja experiență profesională?',
      type: 'cards',
      options: [
        { label: 'Nu, caut stagiu', desc: 'Primul contact cu mediul profesional' },
        { label: 'Part-time / stagiu', desc: 'Am ceva experiență în domeniu' },
        { label: 'Experiență completă', desc: 'Am lucrat cu normă întreagă' },
      ],
    },
  },
  MEDICINE: {
    interestsLabel: 'Ce specialitate medicală te atrage?',
    interests: ['Medicină internă','Chirurgie','Cardiologie','Neurologie','Pediatrie','Dermatologie & Cosmetologie','Urgențe medicale','Psihiatrie','Oftalmologie','Medicină de familie'],
    specific: {
      question: 'Care este orientarea ta principală?',
      type: 'cards',
      options: [
        { label: 'Clinică', desc: 'Relația directă cu pacienții, diagnostic, tratament' },
        { label: 'Cercetare medicală', desc: 'Studii clinice, publicații, laborator' },
        { label: 'Chirurgie', desc: 'Intervenții, proceduri, sala de operație' },
      ],
    },
    experience: {
      question: 'Preferi rotațiile de practică?',
      type: 'cards',
      options: [
        { label: 'Dimineața (6–14)', desc: 'Vizite, consultații matinale' },
        { label: 'După-amiaza (14–22)', desc: 'Urgențe, monitorizare' },
        { label: 'Schimburi variabile', desc: 'Mă adaptez la orarul spitalului' },
      ],
    },
  },
  ENGINEERING: {
    interestsLabel: 'Ce domeniu ingineresc te pasionează?',
    interests: ['Electronică & Microcontrollere','Automatizare & Roboți','Inginerie mecanică','Construcții civile','Energetică & Regenerabile','Inginerie de mediu','Telecomunicații','Inginerie chimică & Procese'],
    specific: {
      question: 'Ce tip de proiect te atrage cel mai mult?',
      type: 'cards',
      options: [
        { label: 'Proiectare CAD / BIM', desc: 'Modele 3D, desene tehnice, software' },
        { label: 'Simulări & calcule', desc: 'FEM, MATLAB, analiză numerică' },
        { label: 'Proiecte pe teren', desc: 'Șantier, instalații, măsurători' },
      ],
    },
    experience: {
      question: 'Ce software tehnic folosești?',
      type: 'tags',
      options: ['AutoCAD','SolidWorks / Inventor','MATLAB / Simulink','Revit','ANSYS','Arduino / PLC','LabVIEW','Alt software'],
    },
  },
  ARTS: {
    interestsLabel: 'Ce domeniu artistic te reprezintă?',
    interests: ['Pictură & Desen','Sculptură & Ceramică','Design grafic & Ilustrație','Design de interior','Fotografie & Film','Muzică clasică','Muzică contemporană','Teatru & Actorie','Coregrafie & Dans','Arhitectură & Urbanism'],
    specific: {
      question: 'Cum preferi să lucrezi?',
      type: 'cards',
      options: [
        { label: 'Proiect personal', desc: 'Libertate creativă, propriul ritm' },
        { label: 'Producții colective', desc: 'Trupe, colective, expoziții comune' },
        { label: 'Comenzi & clienți', desc: 'Proiecte comerciale, brief-uri' },
      ],
    },
    experience: {
      question: 'Ai deja un portofoliu?',
      type: 'cards',
      options: [
        { label: 'Da, complet', desc: 'Portofoliu structurat și publicat' },
        { label: 'În construcție', desc: 'Câteva lucrări, lucrez la el' },
        { label: 'Abia încep', desc: 'Prima experiență academică' },
      ],
    },
  },
  PHARMACY: {
    interestsLabel: 'Ce ramură a farmaciei te atrage?',
    interests: ['Farmacie clinică','Chimie farmaceutică','Farmacologie','Fitoterapie & Plante medicinale','Toxicologie','Farmacognozie','Biofarmaceutică','Industrie farmaceutică','Cosmetologie','Managementul farmaciei'],
    specific: {
      question: 'Care este orientarea ta principală?',
      type: 'cards',
      options: [
        { label: 'Farmacie comunitară', desc: 'Lucrul cu pacienții, eliberarea rețetelor' },
        { label: 'Industrie farmaceutică', desc: 'Producție, control calitate, R&D' },
        { label: 'Cercetare', desc: 'Studii clinice, publicații, laborator' },
      ],
    },
    experience: {
      question: 'Ai experiență în laborator farmaceutic?',
      type: 'cards',
      options: [
        { label: 'Da, stagii practice', desc: 'Am lucrat în farmacie sau laborator' },
        { label: 'Doar universitar', desc: 'Numai laboratoarele din facultate' },
        { label: 'Nu încă', desc: 'Abia încep să explorez' },
      ],
    },
  },
}

// ── Campus buildings (main map) ───────────────────────────────────────────────
export const campusBuildings = [
  { id: 'H',    name: 'Clădirea Principală', short: 'H',    desc: 'Secretariat, Decanat, Săli H1-H4', x: 330, y: 110, w: 130, h: 85,  color: '#6366f1' },
  { id: 'C1',   name: 'Corp C1',             short: 'C1',   desc: 'Laboratoare PC, Amfiteatru',        x: 165, y: 245, w: 85,  h: 65,  color: '#8b5cf6' },
  { id: 'C2',   name: 'Corp C2',             short: 'C2',   desc: 'Săli curs, Seminare',               x: 270, y: 245, w: 85,  h: 65,  color: '#8b5cf6' },
  { id: 'C3',   name: 'Corp C3',             short: 'C3',   desc: 'Laboratoare, Sala serverelor',      x: 375, y: 245, w: 85,  h: 65,  color: '#8b5cf6' },
  { id: 'B',    name: 'Biblioteca',          short: 'BIB',  desc: 'Sală lectură, Studiu 24/7',         x: 525, y: 135, w: 105, h: 75,  color: '#f59e0b' },
  { id: 'A',    name: 'Administrație',       short: 'ADM',  desc: 'Contabilitate, Resurse Umane',      x: 70,  y: 145, w: 95,  h: 65,  color: '#64748b' },
  { id: 'D1',   name: 'Cămin 1',             short: 'D1',   desc: 'Cămin studențesc P+4',              x: 65,  y: 355, w: 75,  h: 58,  color: '#06b6d4' },
  { id: 'D2',   name: 'Cămin 2',             short: 'D2',   desc: 'Cămin studențesc P+6',              x: 160, y: 355, w: 75,  h: 58,  color: '#06b6d4' },
  { id: 'SP',   name: 'Baza Sportivă',       short: 'SPORT',desc: 'Sală sport, Piscină, Teren',        x: 565, y: 55,  w: 115, h: 58,  color: '#ef4444' },
]

// ── Food & services on campus ─────────────────────────────────────────────────
export const foodSpots = [
  {
    id: 'CANT', name: 'Cantina Universității', type: 'canteen',
    x: 527, y: 290, icon: '🍽️', hours: 'Lu-Vi 7:00–20:00', priceRange: '15–30 lei',
    offers: [
      { text: 'Meniu complet 22 lei', type: 'deal', hot: true },
      { text: 'Supă gratuită cu abonament', type: 'info', hot: false },
    ],
  },
  {
    id: 'PETRU', name: 'Petru Café', type: 'cafe',
    x: 420, y: 345, icon: '☕', hours: 'Lu-Vi 7:30–18:00', priceRange: '8–20 lei',
    offers: [
      { text: '-20% studenți 10:00–12:00', type: 'discount', hot: true },
      { text: 'Cafea + croissant 12 lei', type: 'deal', hot: false },
    ],
  },
  {
    id: 'LUCA', name: 'Luca Bistro', type: 'restaurant',
    x: 175, y: 440, icon: '🍕', hours: 'Lu-Sa 11:00–22:00', priceRange: '20–45 lei',
    offers: [
      { text: 'Happy Hour 16:00–18:00', type: 'deal', hot: true },
      { text: 'Burger + suc 23 lei', type: 'deal', hot: false },
    ],
  },
  {
    id: 'VEND', name: 'Automat Snacks', type: 'vending',
    x: 310, y: 430, icon: '🥤', hours: '24/7', priceRange: '5–15 lei',
    offers: [],
  },
  {
    id: 'SHOP', name: 'Magazin Campus', type: 'shop',
    x: 495, y: 395, icon: '🛒', hours: 'Lu-Vi 8:00–19:00', priceRange: 'variabil',
    offers: [
      { text: '-10% rechizite cu carnet', type: 'discount', hot: false },
      { text: 'Abonament Xerox 5 lei/zi', type: 'info', hot: false },
    ],
  },
]

// ── Indoor floor plans ────────────────────────────────────────────────────────
export const indoorMaps = {
  H: {
    name: 'Clădirea Principală',
    floors: [
      {
        level: 0, label: 'Parter',
        w: 500, h: 280,
        rooms: [
          { id:'H-P-HOL', name:'Hol principal',    type:'corridor', x:0,   y:120, w:500, h:40 },
          { id:'H-P-SEC', name:'Secretariat',       type:'admin',    x:10,  y:10,  w:110, h:100 },
          { id:'H-P-DEC', name:'Decanat',           type:'admin',    x:130, y:10,  w:100, h:100 },
          { id:'H-P-INF', name:'Informații',        type:'info',     x:240, y:10,  w:70,  h:50 },
          { id:'H-P-WC',  name:'WC ♂/♀',           type:'wc',       x:240, y:68,  w:70,  h:42 },
          { id:'H-P-AMP', name:'Amfiteatru H1',     type:'lecture',  x:320, y:10,  w:170, h:100 },
          { id:'H-P-C1',  name:'Sala H-01',         type:'classroom',x:10,  y:168, w:120, h:100 },
          { id:'H-P-C2',  name:'Sala H-02',         type:'classroom',x:140, y:168, w:120, h:100 },
          { id:'H-P-COP', name:'Xerox / Copy',      type:'service',  x:270, y:168, w:90,  h:100 },
          { id:'H-P-IES', name:'Ieșire / Intrare',  type:'exit',     x:370, y:168, w:120, h:100 },
        ],
      },
      {
        level: 1, label: 'Etaj 1',
        w: 500, h: 280,
        rooms: [
          { id:'H-1-HOL', name:'Coridor',           type:'corridor', x:0,   y:110, w:500, h:40 },
          { id:'H-1-S1',  name:'Sala H-101',        type:'classroom',x:10,  y:10,  w:130, h:90 },
          { id:'H-1-S2',  name:'Sala H-102',        type:'classroom',x:150, y:10,  w:130, h:90 },
          { id:'H-1-S3',  name:'Sala H-103',        type:'classroom',x:290, y:10,  w:130, h:90 },
          { id:'H-1-BIR', name:'Birouri Profesori', type:'office',   x:430, y:10,  w:60,  h:90 },
          { id:'H-1-L1',  name:'Lab Demonstrativ',  type:'lab',      x:10,  y:158, w:170, h:110 },
          { id:'H-1-SEM', name:'Sala Seminare',     type:'classroom',x:190, y:158, w:170, h:110 },
          { id:'H-1-WC',  name:'WC ♂/♀',           type:'wc',       x:370, y:158, w:60,  h:110 },
          { id:'H-1-SC',  name:'Scări',             type:'stairs',   x:440, y:158, w:50,  h:110 },
        ],
      },
      {
        level: 2, label: 'Etaj 2',
        w: 500, h: 280,
        rooms: [
          { id:'H-2-HOL', name:'Coridor',           type:'corridor', x:0,   y:110, w:500, h:40 },
          { id:'H-2-AMP', name:'Amfiteatru H2',     type:'lecture',  x:10,  y:10,  w:200, h:90 },
          { id:'H-2-S1',  name:'Sala H-201',        type:'classroom',x:220, y:10,  w:130, h:90 },
          { id:'H-2-BIR', name:'Sala Consiliu',     type:'admin',    x:360, y:10,  w:130, h:90 },
          { id:'H-2-S2',  name:'Sala H-202',        type:'classroom',x:10,  y:158, w:130, h:110 },
          { id:'H-2-S3',  name:'Sala H-203',        type:'classroom',x:150, y:158, w:130, h:110 },
          { id:'H-2-REC', name:'Sală Recreere',     type:'study',    x:290, y:158, w:150, h:110 },
          { id:'H-2-SC',  name:'Scări',             type:'stairs',   x:450, y:158, w:40,  h:110 },
        ],
      },
    ],
  },
  C1: {
    name: 'Corp C1',
    floors: [
      {
        level: 0, label: 'Parter',
        w: 440, h: 260,
        rooms: [
          { id:'C1-P-HOL', name:'Hol',             type:'corridor', x:0,   y:110, w:440, h:35 },
          { id:'C1-P-L1',  name:'Lab 1 — PC',      type:'lab',      x:10,  y:10,  w:200, h:90 },
          { id:'C1-P-L2',  name:'Lab 2 — PC',      type:'lab',      x:220, y:10,  w:200, h:90 },
          { id:'C1-P-S1',  name:'Sala C1-01',      type:'classroom',x:10,  y:153, w:200, h:100 },
          { id:'C1-P-SRV', name:'Sala Serverelor', type:'lab',      x:220, y:153, w:150, h:100 },
          { id:'C1-P-WC',  name:'WC ♂/♀',         type:'wc',       x:380, y:153, w:50,  h:100 },
        ],
      },
      {
        level: 1, label: 'Etaj 1',
        w: 440, h: 260,
        rooms: [
          { id:'C1-1-HOL', name:'Coridor',         type:'corridor', x:0,   y:110, w:440, h:35 },
          { id:'C1-1-L3',  name:'Lab 3 — PC',      type:'lab',      x:10,  y:10,  w:200, h:90 },
          { id:'C1-1-L4',  name:'Lab 4 — PC',      type:'lab',      x:220, y:10,  w:200, h:90 },
          { id:'C1-1-AMP', name:'Amfiteatru C1',   type:'lecture',  x:10,  y:153, w:300, h:100 },
          { id:'C1-1-BIR', name:'Birou Asist.',    type:'office',   x:320, y:153, w:110, h:100 },
        ],
      },
    ],
  },
  B: {
    name: 'Biblioteca',
    floors: [
      {
        level: 0, label: 'Parter',
        w: 420, h: 240,
        rooms: [
          { id:'B-P-HOL', name:'Intrare / Hol',       type:'corridor', x:0,   y:110, w:420, h:35 },
          { id:'B-P-CAT', name:'Catalog & Împrumut',  type:'admin',    x:10,  y:10,  w:150, h:90 },
          { id:'B-P-LEC', name:'Sală Lectură',         type:'study',    x:170, y:10,  w:240, h:90 },
          { id:'B-P-ST',  name:'Sală Studiu Grup',    type:'study',    x:10,  y:153, w:260, h:80 },
          { id:'B-P-XER', name:'Xerox / Print',       type:'service',  x:280, y:153, w:130, h:80 },
        ],
      },
      {
        level: 1, label: 'Etaj 1 — 24/7',
        w: 420, h: 240,
        rooms: [
          { id:'B-1-HOL', name:'Coridor',              type:'corridor', x:0,   y:110, w:420, h:35 },
          { id:'B-1-ST',  name:'Sală Studiu 24/7',    type:'study',    x:10,  y:10,  w:395, h:90 },
          { id:'B-1-PC',  name:'PC acces liber',       type:'lab',      x:10,  y:153, w:200, h:80 },
          { id:'B-1-SIL', name:'Zonă Liniștită',      type:'study',    x:220, y:153, w:190, h:80 },
        ],
      },
    ],
  },
  SP: {
    name: 'Baza Sportivă',
    floors: [
      {
        level: 0, label: 'Parter',
        w: 480, h: 280,
        rooms: [
          { id:'SP-HOL', name:'Recepție',            type:'info',     x:0,   y:110, w:100, h:40 },
          { id:'SP-SAL', name:'Sală de sport',       type:'sport',    x:10,  y:10,  w:280, h:90 },
          { id:'SP-GYM', name:'Gym',                 type:'sport',    x:300, y:10,  w:170, h:90 },
          { id:'SP-VES', name:'Vestiare',            type:'wc',       x:10,  y:155, w:150, h:110 },
          { id:'SP-PIS', name:'Piscină',             type:'sport',    x:170, y:155, w:300, h:110 },
        ],
      },
    ],
  },
}

// ── Recovery grid data ────────────────────────────────────────────────────────
// day: 1=Mon … 5=Fri
export const recoverySlots = {
  'Algoritmi și Structuri de Date': [
    { day:1, start:8,  end:10, room:'C1',   group:'A1', professor:'Prof. Moldovan',   total:30, enrolled:28, isMine:true  },
    { day:1, start:10, end:12, room:'C2',   group:'A2', professor:'Prof. Moldovan',   total:30, enrolled:25, isMine:false },
    { day:2, start:8,  end:10, room:'C3',   group:'B1', professor:'Prof. Moldovan',   total:28, enrolled:28, isMine:false },
    { day:3, start:8,  end:10, room:'Lab1', group:'A1', professor:'Prof. Moldovan',   total:15, enrolled:14, isMine:false },
    { day:4, start:10, end:12, room:'C1',   group:'B2', professor:'Conf. Ionescu',    total:30, enrolled:22, isMine:false },
    { day:5, start:12, end:14, room:'C2',   group:'C1', professor:'Conf. Ionescu',    total:30, enrolled:30, isMine:false },
  ],
  'Baze de Date': [
    { day:1, start:14, end:16, room:'C3',   group:'A1', professor:'Conf. Popescu',    total:30, enrolled:27, isMine:true  },
    { day:2, start:10, end:12, room:'Lab2', group:'B1', professor:'Conf. Popescu',    total:15, enrolled:15, isMine:false },
    { day:3, start:16, end:18, room:'C1',   group:'A2', professor:'Conf. Popescu',    total:30, enrolled:24, isMine:false },
    { day:4, start:8,  end:10, room:'Lab3', group:'B2', professor:'Conf. Popescu',    total:15, enrolled:12, isMine:false },
  ],
  'Programare Orientată pe Obiecte': [
    { day:2, start:12, end:14, room:'Lab3', group:'A1', professor:'Asist. Ionescu',   total:15, enrolled:15, isMine:true  },
    { day:1, start:12, end:14, room:'C2',   group:'B1', professor:'Asist. Ionescu',   total:30, enrolled:29, isMine:false },
    { day:3, start:10, end:12, room:'C3',   group:'A2', professor:'Asist. Ionescu',   total:30, enrolled:20, isMine:false },
    { day:5, start:12, end:14, room:'C2',   group:'C1', professor:'Lect. Manea',      total:30, enrolled:26, isMine:false },
  ],
  'Algebră Liniară': [
    { day:1, start:10, end:12, room:'C2',   group:'A1', professor:'Conf. Dumitrescu', total:30, enrolled:30, isMine:true  },
    { day:2, start:14, end:16, room:'H101', group:'B1', professor:'Conf. Dumitrescu', total:30, enrolled:22, isMine:false },
    { day:4, start:12, end:14, room:'C3',   group:'B2', professor:'Conf. Dumitrescu', total:30, enrolled:18, isMine:false },
  ],
}

// ── Swap requests ─────────────────────────────────────────────────────────────
export const swapRequests = [
  {
    id:1, name:'Maria Ionescu', avatar:'MI',
    offersSubject:'Algoritmi și Structuri de Date',
    offersSlot:{ day:2, start:8, end:10, group:'B1' },
    wantsSlot:{ day:1, start:8, end:10, group:'A1' },
    message:'Marțea am altă materie care se suprapune',
    isMatch: true,
  },
  {
    id:2, name:'Andrei Popa', avatar:'AP',
    offersSubject:'Baze de Date',
    offersSlot:{ day:2, start:10, end:12, group:'B1' },
    wantsSlot:{ day:3, start:16, end:18, group:'A2' },
    message:'Prefer orele de după-amiază',
    isMatch: false,
  },
  {
    id:3, name:'Elena Radu', avatar:'ER',
    offersSubject:'Programare Orientată pe Obiecte',
    offersSlot:{ day:1, start:12, end:14, group:'B1' },
    wantsSlot:{ day:2, start:12, end:14, group:'A1' },
    message:'Mă suprapune cu sportul lunea',
    isMatch: true,
  },
]

// ── Professors (thesis) ───────────────────────────────────────────────────────
export const professors = [
  { id:1, name:'Prof. Dr. Ioan Moldovan',   title:'Profesor universitar',    domain:'Machine Learning & AI',     tags:['Deep Learning','Computer Vision','NLP'],             available:true,  slotsLeft:2, totalSlots:5, minGrade:8.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Detectarea emoțiilor cu CNNs',year:2024},{title:'Graph Neural Networks pentru recomandare',year:2023}], contact:'Teams / Email', avatar:'IM', color:'from-violet-600 to-indigo-600' },
  { id:2, name:'Conf. Dr. Elena Popescu',   title:'Conferențiar universitar', domain:'Web Development & Cloud',   tags:['React','Node.js','Microservices','Kubernetes'],      available:true,  slotsLeft:3, totalSlots:6, minGrade:7.0, language:'Română',          acceptsOther:false, previousTheses:[{title:'Platformă e-learning cu microservicii',year:2024},{title:'Optimizare React la scară largă',year:2024}], contact:'Email', avatar:'EP', color:'from-emerald-600 to-teal-600' },
  { id:3, name:'Prof. Dr. Andrei Ionescu',  title:'Profesor universitar',    domain:'Cybersecurity & Networking',tags:['Pen Testing','Criptografie','Network Security'],      available:false, slotsLeft:0, totalSlots:4, minGrade:9.0, language:'Română / Engleză', acceptsOther:false, previousTheses:[{title:'Detectare intruziuni IoT cu ML',year:2024},{title:'Zero Trust Architecture enterprise',year:2023}], contact:'Secretariat + Email', avatar:'AI', color:'from-red-600 to-orange-600' },
  { id:4, name:'Conf. Dr. Maria Dumitrescu',title:'Conferențiar universitar', domain:'Data Science & Statistics', tags:['Python','R','Vizualizare','Big Data'],               available:true,  slotsLeft:1, totalSlots:5, minGrade:8.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Predictarea abandonului studențesc',year:2024},{title:'Dashboard calitate aer',year:2023}], contact:'Teams', avatar:'MD', color:'from-amber-600 to-yellow-600' },
  { id:5, name:'Prof. Dr. Radu Constantin', title:'Profesor universitar',    domain:'Embedded Systems & IoT',    tags:['Arduino','FPGA','C/C++','RTOS'],                     available:true,  slotsLeft:2, totalSlots:4, minGrade:8.5, language:'Română',          acceptsOther:false, previousTheses:[{title:'Monitorizare consum energetic smart',year:2024},{title:'Control IoT latență redusă',year:2023}], contact:'Email', avatar:'RC', color:'from-blue-600 to-cyan-600' },
  { id:6, name:'Conf. Dr. Alina Gheorghe', title:'Conferențiar universitar', domain:'Mobile Development',        tags:['Flutter','React Native','iOS','Android'],            available:true,  slotsLeft:3, totalSlots:6, minGrade:7.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Navigație indoor cu AR',year:2024},{title:'Fitness tracking biometric',year:2024}], contact:'Teams', avatar:'AG', color:'from-pink-600 to-rose-600' },
]

// ── Tutors ────────────────────────────────────────────────────────────────────
export const tutors = [
  { id:1, name:'Alexandru Popa',  year:3, subjects:['Algoritmi și Structuri de Date','Matematică Discretă'], grade:9.5, sessions:47,  rating:4.9, reviews:38, price:50, availability:['Luni 18-20','Miercuri 16-20','Sâmbătă 10-14'], style:'Explicații pas cu pas, exerciții practice', avatar:'AP', color:'from-indigo-500 to-violet-500', online:true  },
  { id:2, name:'Ioana Radu',     year:4, subjects:['Web Development','React','Node.js','Baze de Date'],     grade:10,  sessions:89,  rating:5.0, reviews:71, price:70, availability:['Marți 17-21','Joi 17-21','Duminică 12-18'],      style:'Proiecte reale, code review, mentoring',    avatar:'IR', color:'from-emerald-500 to-teal-500',   online:true  },
  { id:3, name:'Mihai Costea',   year:3, subjects:['Matematică','Analiză Matematică','Algebră Liniară'],   grade:9.2, sessions:23,  rating:4.7, reviews:19, price:40, availability:['Luni 14-18','Vineri 14-18'],                     style:'Teorie solidă, multe exemple, răbdare',      avatar:'MC', color:'from-amber-500 to-orange-500',  online:false },
  { id:4, name:'Cristina Florea',year:4, subjects:['OOP','Java','Design Patterns','Spring Boot'],           grade:9.8, sessions:112, rating:4.9, reviews:89, price:65, availability:['Marți 16-20','Sâmbătă 10-16'],                   style:'Industry best practices, cod de producție',  avatar:'CF', color:'from-rose-500 to-pink-500',     online:true  },
  { id:5, name:'Bogdan Nistor',  year:3, subjects:['Python','Machine Learning','Data Science'],             grade:9.0, sessions:34,  rating:4.8, reviews:27, price:55, availability:['Miercuri 18-21','Joi 18-21','Sâmbătă 14-18'],   style:'Jupyter notebooks, proiecte Kaggle',         avatar:'BN', color:'from-blue-500 to-cyan-500',     online:true  },
]

// ── Schedule ──────────────────────────────────────────────────────────────────
export const schedule = [
  { id:1, name:'Algoritmi și Structuri de Date', short:'ASD', day:1, start:8,  end:10, room:'C1',   type:'Curs',      professor:'Prof. Moldovan',   color:'bg-indigo-500/80 border-indigo-400' },
  { id:2, name:'Algebră Liniară',                short:'AL',  day:1, start:10, end:12, room:'C2',   type:'Curs',      professor:'Conf. Dumitrescu', color:'bg-violet-500/80 border-violet-400' },
  { id:3, name:'Programare Orientată pe Obiecte',short:'POO', day:2, start:12, end:14, room:'Lab3', type:'Laborator', professor:'Asist. Ionescu',   color:'bg-emerald-500/80 border-emerald-400' },
  { id:4, name:'Algoritmi și Structuri de Date', short:'ASD', day:3, start:8,  end:10, room:'Lab1', type:'Laborator', professor:'Prof. Moldovan',   color:'bg-indigo-500/80 border-indigo-400' },
  { id:5, name:'Baze de Date',                   short:'BD',  day:3, start:14, end:16, room:'C3',   type:'Curs',      professor:'Conf. Popescu',    color:'bg-amber-500/80 border-amber-400' },
  { id:6, name:'Limba Engleză',                  short:'EN',  day:3, start:16, end:18, room:'H2',   type:'Seminar',   professor:'Lect. Marin',      color:'bg-rose-500/80 border-rose-400' },
  { id:7, name:'Baze de Date',                   short:'BD',  day:4, start:10, end:12, room:'Lab2', type:'Laborator', professor:'Conf. Popescu',    color:'bg-amber-500/80 border-amber-400' },
  { id:8, name:'Programare Orientată pe Obiecte',short:'POO', day:5, start:12, end:14, room:'C2',   type:'Seminar',   professor:'Asist. Ionescu',   color:'bg-emerald-500/80 border-emerald-400' },
]

// ── Messages ──────────────────────────────────────────────────────────────────
export const messages = [
  { id:1, name:'Ioana Radu',              avatar:'IR',  role:'Tutor',       color:'from-emerald-500 to-teal-500',   unread:2, online:true,  preview:'Joi la 18:00 merge perfect 🎉', thread:[{from:'me',text:'Bună! Aș vrea o sesiune React Hooks.',time:'10:22'},{from:'them',text:'Cu plăcere! Joi seara merge?',time:'10:35'},{from:'me',text:'Joi la 18:00, perfect!',time:'10:37'},{from:'them',text:'Joi la 18:00 merge perfect 🎉',time:'10:40'},{from:'them',text:'Trimit link Meet cu o oră înainte.',time:'10:41'}] },
  { id:2, name:'Prof. Dr. Ioan Moldovan', avatar:'IM',  role:'Profesor',    color:'from-violet-500 to-indigo-500',  unread:1, online:false, preview:'Am primit cererea. Revin în 2-3 zile.', thread:[{from:'me',text:'Bună ziua, am trimis cererea de rezervare loc la licență.',time:'09:05'},{from:'them',text:'Bună ziua. Am primit cererea. Revin în 2-3 zile lucrătoare.',time:'11:30'}] },
  { id:3, name:'Anunț: ASD',             avatar:'ASD', role:'Anunț Grup',  color:'from-blue-500 to-indigo-500',    unread:0, online:false, preview:'Cursul de vineri se mută în C3.', thread:[{from:'them',text:'📢 Cursul de vineri 17.05 se mută din C1 în C3. Ora rămâne 10:00.',time:'Ieri'}] },
  { id:4, name:'Alexandru Popa',          avatar:'AP',  role:'Coleg',       color:'from-indigo-500 to-violet-500',  unread:0, online:true,  preview:'Am rezolvat lab 3, comparăm soluțiile.', thread:[{from:'them',text:'Salut! Am rezolvat lab 3. Trimite-mi codul și comparam.',time:'Ieri'},{from:'me',text:'Super, trimit acum.',time:'Ieri'}] },
]

// ── Skill swap ────────────────────────────────────────────────────────────────
export const skillSwapUsers = [
  { id:1, name:'Radu Apostol', avatar:'RA', teaches:'Python Avansat',  learns:'React',         teachLevel:'Avansat',    learnLevel:'Beginner',   match:true,  online:true  },
  { id:2, name:'Diana Lungu',  avatar:'DL', teaches:'Machine Learning',learns:'Java',          teachLevel:'Intermediar',learnLevel:'Intermediar',match:true,  online:false },
  { id:3, name:'Vlad Manea',   avatar:'VM', teaches:'Docker & DevOps', learns:'Flutter',       teachLevel:'Avansat',    learnLevel:'Beginner',   match:false, online:true  },
  { id:4, name:'Sabina Toma',  avatar:'ST', teaches:'UI/UX Design',    learns:'JavaScript',    teachLevel:'Intermediar',learnLevel:'Beginner',   match:true,  online:true  },
]

export const groupSessions = [
  { id:1, host:'Cristina Florea', topic:'Java Fundamentals — Design Patterns', date:'Sâmbătă, 18 Mai', time:'10:00', spots:2, totalSpots:4, type:'teach', tags:['Java','OOP','Patterns'] },
  { id:2, host:'Bogdan Nistor',   topic:'Grup de studiu Machine Learning',     date:'Duminică, 19 Mai',time:'14:00', spots:3, totalSpots:4, type:'study', tags:['Python','ML','Sklearn'] },
  { id:3, host:'Ioana Radu',      topic:'React Hooks & State Management',      date:'Joi, 22 Mai',     time:'18:00', spots:1, totalSpots:4, type:'teach', tags:['React','Frontend','JS'] },
]

export const DAYS = ['Luni','Marți','Miercuri','Joi','Vineri']
export const HOURS = [8,9,10,11,12,13,14,15,16,17,18,19,20]

// ── Per-faculty schedules, recovery slots and swap requests ───────────────────
// Each key matches a FACULTY_QUESTIONS type. CS uses the existing exports above.
export const FACULTY_SCHEDULES = {
  CS: {
    schedule,
    recoverySlots,
    swapRequests,
  },

  MEDICINE: {
    schedule: [
      { id:1, name:'Anatomie',             short:'ANAT', day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',             professor:'Prof. Dr. Radu',      color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Biochimie Medicală',   short:'BIO',  day:1, start:10, end:12, room:'Amf.2',  type:'Curs',             professor:'Conf. Dr. Stoica',    color:'bg-violet-500/80 border-violet-400' },
      { id:3, name:'Anatomie',             short:'ANAT', day:2, start:8,  end:10, room:'Lab1',   type:'Lucrări practice', professor:'Asist. Dima',         color:'bg-indigo-500/80 border-indigo-400' },
      { id:4, name:'Histologie',           short:'HIST', day:2, start:10, end:12, room:'Lab.M',  type:'Lucrări practice', professor:'Asist. Marin',        color:'bg-emerald-500/80 border-emerald-400' },
      { id:5, name:'Fiziologie',           short:'FIZ',  day:3, start:8,  end:10, room:'Amf.3',  type:'Curs',             professor:'Prof. Dr. Lungu',     color:'bg-amber-500/80 border-amber-400' },
      { id:6, name:'Histologie',           short:'HIST', day:3, start:10, end:12, room:'Amf.1',  type:'Curs',             professor:'Conf. Dr. Popa',      color:'bg-emerald-500/80 border-emerald-400' },
      { id:7, name:'Biochimie Medicală',   short:'BIO',  day:4, start:8,  end:10, room:'Lab2',   type:'Lucrări practice', professor:'Asist. Neagu',        color:'bg-violet-500/80 border-violet-400' },
      { id:8, name:'Fiziologie',           short:'FIZ',  day:4, start:10, end:12, room:'Lab.F',  type:'Lucrări practice', professor:'Asist. Tudor',        color:'bg-amber-500/80 border-amber-400' },
      { id:9, name:'Biologie Celulară',    short:'BIOL', day:5, start:8,  end:10, room:'Amf.2',  type:'Curs',             professor:'Prof. Dr. Ionescu',   color:'bg-rose-500/80 border-rose-400' },
      { id:10,name:'Limbi Străine',        short:'LS',   day:5, start:10, end:12, room:'S.12',   type:'Seminar',          professor:'Lect. Dr. Avram',     color:'bg-cyan-500/80 border-cyan-400' },
    ],
    recoverySlots: {
      'Anatomie': [
        { day:1, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Prof. Dr. Radu',  total:20, enrolled:18, isMine:true  },
        { day:2, start:8,  end:10, room:'Lab1',  group:'A2', professor:'Asist. Dima',     total:12, enrolled:12, isMine:false },
        { day:3, start:12, end:14, room:'Amf.3', group:'B1', professor:'Prof. Dr. Radu',  total:20, enrolled:16, isMine:false },
        { day:4, start:8,  end:10, room:'Lab2',  group:'B2', professor:'Asist. Dima',     total:12, enrolled:10, isMine:false },
      ],
      'Fiziologie': [
        { day:1, start:12, end:14, room:'Lab.F', group:'A1', professor:'Prof. Dr. Lungu', total:12, enrolled:11, isMine:true  },
        { day:3, start:8,  end:10, room:'Amf.3', group:'B1', professor:'Prof. Dr. Lungu', total:20, enrolled:19, isMine:false },
        { day:5, start:10, end:12, room:'Lab.F', group:'A2', professor:'Asist. Tudor',    total:12, enrolled:9,  isMine:false },
      ],
      'Histologie': [
        { day:2, start:10, end:12, room:'Lab.M', group:'A1', professor:'Asist. Marin',   total:12, enrolled:12, isMine:true  },
        { day:4, start:12, end:14, room:'Lab.M', group:'B1', professor:'Asist. Marin',   total:12, enrolled:10, isMine:false },
        { day:5, start:14, end:16, room:'Amf.1', group:'B2', professor:'Conf. Dr. Popa', total:20, enrolled:17, isMine:false },
      ],
      'Biochimie Medicală': [
        { day:1, start:14, end:16, room:'Lab2',  group:'A1', professor:'Asist. Neagu',   total:12, enrolled:12, isMine:true  },
        { day:3, start:14, end:16, room:'Lab1',  group:'B1', professor:'Asist. Neagu',   total:12, enrolled:8,  isMine:false },
        { day:5, start:8,  end:10, room:'Amf.2', group:'B2', professor:'Conf. Dr. Stoica',total:20,enrolled:15, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Andreea Moisescu', avatar:'AM', offersSubject:'Anatomie', offersSlot:{ day:2, start:8, end:10, group:'A2' }, wantsSlot:{ day:1, start:8, end:10, group:'A1' }, message:'Marțea am stagiu la spital', isMatch:true },
      { id:2, name:'Bogdan Tăbăcaru',  avatar:'BT', offersSubject:'Fiziologie', offersSlot:{ day:3, start:8, end:10, group:'B1' }, wantsSlot:{ day:1, start:12, end:14, group:'A1' }, message:'Suprapunere cu practică clinică', isMatch:false },
      { id:3, name:'Diana Costache',   avatar:'DC', offersSubject:'Histologie', offersSlot:{ day:4, start:12, end:14, group:'B1' }, wantsSlot:{ day:2, start:10, end:12, group:'A1' }, message:'Prefer orele de dimineață', isMatch:true },
    ],
  },

  PHARMACY: {
    schedule: [
      { id:1, name:'Chimie Organică',        short:'CORG', day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',             professor:'Prof. Dr. Vlad',      color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Botanică Farmaceutică',  short:'BOT',  day:1, start:10, end:12, room:'Lab.B',  type:'Lucrări practice', professor:'Asist. Coman',        color:'bg-emerald-500/80 border-emerald-400' },
      { id:3, name:'Chimie Organică',        short:'CORG', day:2, start:8,  end:10, room:'Lab1',   type:'Lucrări practice', professor:'Asist. Florea',       color:'bg-indigo-500/80 border-indigo-400' },
      { id:4, name:'Anatomie & Fiziologie',  short:'AF',   day:2, start:10, end:12, room:'Amf.2',  type:'Curs',             professor:'Conf. Dr. Barbu',     color:'bg-amber-500/80 border-amber-400' },
      { id:5, name:'Biochimie',              short:'BIOC', day:3, start:8,  end:10, room:'Amf.3',  type:'Curs',             professor:'Prof. Dr. Nistor',    color:'bg-violet-500/80 border-violet-400' },
      { id:6, name:'Fizică & Biofizică',     short:'FIZ',  day:3, start:10, end:12, room:'Lab.F',  type:'Lucrări practice', professor:'Lect. Dr. Savu',      color:'bg-rose-500/80 border-rose-400' },
      { id:7, name:'Biochimie',              short:'BIOC', day:4, start:8,  end:10, room:'Lab2',   type:'Lucrări practice', professor:'Asist. Ionescu',      color:'bg-violet-500/80 border-violet-400' },
      { id:8, name:'Botanică Farmaceutică',  short:'BOT',  day:4, start:10, end:12, room:'Amf.1',  type:'Curs',             professor:'Conf. Dr. Ene',       color:'bg-emerald-500/80 border-emerald-400' },
      { id:9, name:'Limbi Străine',          short:'LS',   day:5, start:10, end:12, room:'S.12',   type:'Seminar',          professor:'Lect. Dr. Avram',     color:'bg-cyan-500/80 border-cyan-400' },
    ],
    recoverySlots: {
      'Chimie Organică': [
        { day:1, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Prof. Dr. Vlad',  total:20, enrolled:19, isMine:true  },
        { day:2, start:8,  end:10, room:'Lab1',  group:'A2', professor:'Asist. Florea',   total:12, enrolled:11, isMine:false },
        { day:4, start:14, end:16, room:'Lab1',  group:'B1', professor:'Asist. Florea',   total:12, enrolled:8,  isMine:false },
      ],
      'Biochimie': [
        { day:1, start:14, end:16, room:'Lab2',  group:'A1', professor:'Asist. Ionescu',  total:12, enrolled:12, isMine:true  },
        { day:3, start:8,  end:10, room:'Amf.3', group:'B1', professor:'Prof. Dr. Nistor',total:20, enrolled:14, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Mihaela Săndulescu', avatar:'MS', offersSubject:'Chimie Organică', offersSlot:{ day:2, start:8, end:10, group:'A2' }, wantsSlot:{ day:1, start:8, end:10, group:'A1' }, message:'Prefer orele de după-amiază', isMatch:true },
    ],
  },

  SCIENCES: {
    schedule: [
      { id:1, name:'Analiză Matematică',     short:'AM',   day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Prof. Dr. Dinu',      color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Algebră',                short:'ALG',  day:1, start:10, end:12, room:'Amf.2',  type:'Curs',   professor:'Conf. Dr. Preda',     color:'bg-violet-500/80 border-violet-400' },
      { id:3, name:'Geometrie',              short:'GEO',  day:2, start:8,  end:10, room:'Amf.3',  type:'Curs',   professor:'Prof. Dr. Antohi',    color:'bg-amber-500/80 border-amber-400' },
      { id:4, name:'Analiză Matematică',     short:'AM',   day:2, start:10, end:12, room:'S.11',   type:'Seminar',professor:'Asist. Florea',       color:'bg-indigo-500/80 border-indigo-400' },
      { id:5, name:'Algebră',                short:'ALG',  day:3, start:8,  end:10, room:'S.12',   type:'Seminar',professor:'Asist. Moldovan',     color:'bg-violet-500/80 border-violet-400' },
      { id:6, name:'Logică Matematică',      short:'LOG',  day:3, start:10, end:12, room:'Amf.2',  type:'Curs',   professor:'Lect. Dr. Crăciun',   color:'bg-emerald-500/80 border-emerald-400' },
      { id:7, name:'Geometrie',              short:'GEO',  day:4, start:10, end:12, room:'S.11',   type:'Seminar',professor:'Asist. Rotaru',       color:'bg-amber-500/80 border-amber-400' },
      { id:8, name:'Probabilități',          short:'PROB', day:4, start:14, end:16, room:'Amf.1',  type:'Curs',   professor:'Conf. Dr. Ababei',    color:'bg-rose-500/80 border-rose-400' },
      { id:9, name:'Informatică',            short:'INFO', day:5, start:10, end:12, room:'Lab.PC', type:'Laborator',professor:'Asist. Toma',       color:'bg-cyan-500/80 border-cyan-400' },
    ],
    recoverySlots: {
      'Analiză Matematică': [
        { day:1, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Prof. Dr. Dinu',  total:25, enrolled:23, isMine:true  },
        { day:2, start:10, end:12, room:'S.11',  group:'A2', professor:'Asist. Florea',   total:15, enrolled:15, isMine:false },
        { day:4, start:8,  end:10, room:'S.12',  group:'B1', professor:'Asist. Florea',   total:15, enrolled:10, isMine:false },
      ],
      'Algebră': [
        { day:1, start:10, end:12, room:'Amf.2', group:'A1', professor:'Conf. Dr. Preda', total:25, enrolled:22, isMine:true  },
        { day:3, start:8,  end:10, room:'S.12',  group:'B1', professor:'Asist. Moldovan', total:15, enrolled:13, isMine:false },
        { day:5, start:8,  end:10, room:'S.11',  group:'B2', professor:'Asist. Moldovan', total:15, enrolled:11, isMine:false },
      ],
      'Geometrie': [
        { day:2, start:8,  end:10, room:'Amf.3', group:'A1', professor:'Prof. Dr. Antohi',total:25, enrolled:24, isMine:true  },
        { day:4, start:10, end:12, room:'S.11',  group:'B1', professor:'Asist. Rotaru',   total:15, enrolled:9,  isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Cristina Vlad',    avatar:'CV', offersSubject:'Analiză Matematică', offersSlot:{ day:2, start:10, end:12, group:'A2' }, wantsSlot:{ day:1, start:8, end:10, group:'A1' }, message:'Suprapunere cu seminar de geometrie', isMatch:true },
      { id:2, name:'Marius Gheorghiu', avatar:'MG', offersSubject:'Algebră', offersSlot:{ day:3, start:8, end:10, group:'B1' }, wantsSlot:{ day:1, start:10, end:12, group:'A1' }, message:'Prefer orele de dimineață devreme', isMatch:false },
    ],
  },

  HUMANITIES: {
    schedule: [
      { id:1, name:'Drept Civil',              short:'DC',   day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Prof. Dr. Balan',     color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Drept Penal',              short:'DP',   day:1, start:10, end:12, room:'Amf.2',  type:'Curs',   professor:'Conf. Dr. Rusu',      color:'bg-violet-500/80 border-violet-400' },
      { id:3, name:'Drept Constituțional',     short:'DCON', day:2, start:8,  end:10, room:'Amf.3',  type:'Curs',   professor:'Prof. Dr. Mrejeru',   color:'bg-amber-500/80 border-amber-400' },
      { id:4, name:'Drept Civil',              short:'DC',   day:2, start:10, end:12, room:'S.10',   type:'Seminar',professor:'Asist. Lazăr',       color:'bg-indigo-500/80 border-indigo-400' },
      { id:5, name:'Drept Roman',              short:'DR',   day:3, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Conf. Dr. Paraschiv', color:'bg-emerald-500/80 border-emerald-400' },
      { id:6, name:'Drept Penal',              short:'DP',   day:3, start:10, end:12, room:'S.11',   type:'Seminar',professor:'Asist. Manea',        color:'bg-violet-500/80 border-violet-400' },
      { id:7, name:'Teoria Generală a Dr.',    short:'TGD',  day:4, start:8,  end:10, room:'Amf.2',  type:'Curs',   professor:'Prof. Dr. Crăciunescu',color:'bg-rose-500/80 border-rose-400' },
      { id:8, name:'Drept Constituțional',     short:'DCON', day:4, start:10, end:12, room:'S.12',   type:'Seminar',professor:'Asist. Duca',         color:'bg-amber-500/80 border-amber-400' },
      { id:9, name:'Drept Roman',              short:'DR',   day:5, start:12, end:14, room:'S.10',   type:'Seminar',professor:'Asist. Boca',         color:'bg-emerald-500/80 border-emerald-400' },
      { id:10,name:'Limbi Străine Juridice',   short:'LSJ',  day:5, start:10, end:12, room:'S.13',   type:'Seminar',professor:'Lect. Dr. Pop',       color:'bg-cyan-500/80 border-cyan-400' },
    ],
    recoverySlots: {
      'Drept Civil': [
        { day:1, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Prof. Dr. Balan',  total:30, enrolled:28, isMine:true  },
        { day:2, start:10, end:12, room:'S.10',  group:'A2', professor:'Asist. Lazăr',     total:20, enrolled:19, isMine:false },
        { day:4, start:14, end:16, room:'S.11',  group:'B1', professor:'Asist. Lazăr',     total:20, enrolled:14, isMine:false },
      ],
      'Drept Penal': [
        { day:1, start:10, end:12, room:'Amf.2', group:'A1', professor:'Conf. Dr. Rusu',   total:30, enrolled:25, isMine:true  },
        { day:3, start:10, end:12, room:'S.11',  group:'B1', professor:'Asist. Manea',     total:20, enrolled:20, isMine:false },
        { day:5, start:14, end:16, room:'S.12',  group:'B2', professor:'Asist. Manea',     total:20, enrolled:12, isMine:false },
      ],
      'Drept Roman': [
        { day:3, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Conf. Dr. Paraschiv',total:30,enrolled:27, isMine:true  },
        { day:5, start:12, end:14, room:'S.10',  group:'B1', professor:'Asist. Boca',      total:20, enrolled:15, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Raluca Neagu',   avatar:'RN', offersSubject:'Drept Civil',  offersSlot:{ day:2, start:10, end:12, group:'A2' }, wantsSlot:{ day:1, start:8, end:10, group:'A1' }, message:'Suprapunere cu seminar de drept penal', isMatch:true },
      { id:2, name:'Victor Iordan',  avatar:'VI', offersSubject:'Drept Roman',  offersSlot:{ day:5, start:12, end:14, group:'B1' }, wantsSlot:{ day:3, start:8, end:10, group:'A1' }, message:'Vinerea am practică la barou', isMatch:false },
      { id:3, name:'Ioana Stănescu', avatar:'IS', offersSubject:'Drept Penal', offersSlot:{ day:3, start:10, end:12, group:'B1' }, wantsSlot:{ day:1, start:10, end:12, group:'A1' }, message:'Prefer lunea dimineața', isMatch:true },
    ],
  },

  ECONOMICS: {
    schedule: [
      { id:1, name:'Microeconomie',           short:'MICRO',day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Prof. Dr. Apostol',   color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Matematici Economice',    short:'MATE', day:1, start:10, end:12, room:'Amf.2',  type:'Curs',   professor:'Conf. Dr. Chirilă',   color:'bg-violet-500/80 border-violet-400' },
      { id:3, name:'Management',              short:'MGT',  day:2, start:10, end:12, room:'Amf.3',  type:'Curs',   professor:'Prof. Dr. Scarlat',   color:'bg-amber-500/80 border-amber-400' },
      { id:4, name:'Marketing',               short:'MKT',  day:2, start:14, end:16, room:'S.20',   type:'Seminar',professor:'Lect. Dr. Ifrim',     color:'bg-emerald-500/80 border-emerald-400' },
      { id:5, name:'Contabilitate',           short:'CONT', day:3, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Conf. Dr. Toma',      color:'bg-rose-500/80 border-rose-400' },
      { id:6, name:'Microeconomie',           short:'MICRO',day:3, start:10, end:12, room:'S.21',   type:'Seminar',professor:'Asist. Brînzan',      color:'bg-indigo-500/80 border-indigo-400' },
      { id:7, name:'Matematici Economice',    short:'MATE', day:4, start:10, end:12, room:'S.22',   type:'Seminar',professor:'Asist. Nechifor',     color:'bg-violet-500/80 border-violet-400' },
      { id:8, name:'Contabilitate',           short:'CONT', day:4, start:14, end:16, room:'Lab.PC', type:'Laborator',professor:'Asist. Carp',       color:'bg-rose-500/80 border-rose-400' },
      { id:9, name:'Informatică Economică',   short:'IE',   day:5, start:12, end:14, room:'Lab.PC', type:'Laborator',professor:'Lect. Dr. Lupu',    color:'bg-cyan-500/80 border-cyan-400' },
    ],
    recoverySlots: {
      'Microeconomie': [
        { day:1, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Prof. Dr. Apostol',total:30, enrolled:28, isMine:true  },
        { day:3, start:10, end:12, room:'S.21',  group:'B1', professor:'Asist. Brînzan',   total:20, enrolled:18, isMine:false },
        { day:5, start:8,  end:10, room:'S.20',  group:'B2', professor:'Asist. Brînzan',   total:20, enrolled:12, isMine:false },
      ],
      'Contabilitate': [
        { day:3, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Conf. Dr. Toma',   total:30, enrolled:29, isMine:true  },
        { day:4, start:14, end:16, room:'Lab.PC',group:'B1', professor:'Asist. Carp',      total:15, enrolled:14, isMine:false },
      ],
      'Matematici Economice': [
        { day:1, start:10, end:12, room:'Amf.2', group:'A1', professor:'Conf. Dr. Chirilă',total:30, enrolled:24, isMine:true  },
        { day:4, start:10, end:12, room:'S.22',  group:'B1', professor:'Asist. Nechifor',  total:20, enrolled:17, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Mădălina Cotea', avatar:'MC', offersSubject:'Microeconomie', offersSlot:{ day:3, start:10, end:12, group:'B1' }, wantsSlot:{ day:1, start:8, end:10, group:'A1' }, message:'Miercurea am part-time', isMatch:true },
      { id:2, name:'Andrei Hodorogea', avatar:'AH', offersSubject:'Contabilitate', offersSlot:{ day:4, start:14, end:16, group:'B1' }, wantsSlot:{ day:3, start:8, end:10, group:'A1' }, message:'Prefer orele de dimineață', isMatch:false },
    ],
  },

  ENGINEERING: {
    schedule: [
      { id:1, name:'Matematici Superioare',   short:'MAT',  day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Prof. Dr. Călin',     color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Fizică',                  short:'FIZ',  day:1, start:10, end:12, room:'Amf.2',  type:'Curs',   professor:'Conf. Dr. Rusu',      color:'bg-violet-500/80 border-violet-400' },
      { id:3, name:'Electronică Analogică',   short:'EA',   day:2, start:8,  end:10, room:'Amf.3',  type:'Curs',   professor:'Prof. Dr. Ababei',    color:'bg-amber-500/80 border-amber-400' },
      { id:4, name:'Matematici Superioare',   short:'MAT',  day:2, start:10, end:12, room:'S.30',   type:'Seminar',professor:'Asist. Iftodi',       color:'bg-indigo-500/80 border-indigo-400' },
      { id:5, name:'Fizică',                  short:'FIZ',  day:3, start:8,  end:10, room:'Lab.F',  type:'Laborator',professor:'Asist. Braha',      color:'bg-violet-500/80 border-violet-400' },
      { id:6, name:'Desen Tehnic',            short:'DT',   day:3, start:10, end:12, room:'Atelier',type:'Laborator',professor:'Lect. Dr. Cosma',   color:'bg-emerald-500/80 border-emerald-400' },
      { id:7, name:'Electronică Analogică',   short:'EA',   day:4, start:10, end:12, room:'Lab.E',  type:'Laborator',professor:'Asist. Moroianu',   color:'bg-amber-500/80 border-amber-400' },
      { id:8, name:'Mecanică',                short:'MEC',  day:4, start:14, end:16, room:'Amf.2',  type:'Curs',   professor:'Conf. Dr. Gavrilescu',color:'bg-rose-500/80 border-rose-400' },
      { id:9, name:'Desen Tehnic',            short:'DT',   day:5, start:14, end:16, room:'Atelier',type:'Laborator',professor:'Lect. Dr. Cosma',   color:'bg-emerald-500/80 border-emerald-400' },
    ],
    recoverySlots: {
      'Matematici Superioare': [
        { day:1, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Prof. Dr. Călin',  total:30, enrolled:27, isMine:true  },
        { day:2, start:10, end:12, room:'S.30',  group:'B1', professor:'Asist. Iftodi',    total:20, enrolled:19, isMine:false },
        { day:4, start:8,  end:10, room:'S.31',  group:'B2', professor:'Asist. Iftodi',    total:20, enrolled:14, isMine:false },
      ],
      'Fizică': [
        { day:1, start:10, end:12, room:'Amf.2', group:'A1', professor:'Conf. Dr. Rusu',   total:30, enrolled:29, isMine:true  },
        { day:3, start:8,  end:10, room:'Lab.F', group:'B1', professor:'Asist. Braha',     total:15, enrolled:13, isMine:false },
      ],
      'Electronică Analogică': [
        { day:2, start:8,  end:10, room:'Amf.3', group:'A1', professor:'Prof. Dr. Ababei', total:30, enrolled:25, isMine:true  },
        { day:4, start:10, end:12, room:'Lab.E', group:'B1', professor:'Asist. Moroianu',  total:15, enrolled:12, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Laurențiu Apetrei', avatar:'LA', offersSubject:'Fizică', offersSlot:{ day:3, start:8, end:10, group:'B1' }, wantsSlot:{ day:1, start:10, end:12, group:'A1' }, message:'Miercurea am overlap cu Desen Tehnic', isMatch:true },
      { id:2, name:'Teodora Căpraru',  avatar:'TC', offersSubject:'Matematici Superioare', offersSlot:{ day:2, start:10, end:12, group:'B1' }, wantsSlot:{ day:1, start:8, end:10, group:'A1' }, message:'Prefer să am materiile groupate dimineața', isMatch:false },
    ],
  },

  ARTS: {
    schedule: [
      { id:1, name:'Teoria & Istoria Artei',  short:'TIA',  day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Prof. Dr. Panaite',   color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Desen — Studiu de Model', short:'DESEN',day:1, start:10, end:14, room:'Atelier1',type:'Atelier',professor:'Conf. Dr. Irimia',   color:'bg-amber-500/80 border-amber-400' },
      { id:3, name:'Culoare & Compoziție',    short:'CC',   day:2, start:8,  end:12, room:'Atelier2',type:'Atelier',professor:'Prof. Dr. Stratulat', color:'bg-violet-500/80 border-violet-400' },
      { id:4, name:'Estetică',               short:'EST',  day:2, start:14, end:16, room:'S.10',   type:'Curs',   professor:'Lect. Dr. Rusu',      color:'bg-emerald-500/80 border-emerald-400' },
      { id:5, name:'Sculptură',              short:'SCU',  day:3, start:10, end:14, room:'Atelier3',type:'Atelier',professor:'Prof. Dr. Ene',       color:'bg-rose-500/80 border-rose-400' },
      { id:6, name:'Estetică',               short:'EST',  day:3, start:14, end:16, room:'S.11',   type:'Seminar',professor:'Asist. Ciocan',       color:'bg-emerald-500/80 border-emerald-400' },
      { id:7, name:'Pictură',                short:'PIC',  day:4, start:8,  end:12, room:'Atelier2',type:'Atelier',professor:'Conf. Dr. Irimia',   color:'bg-cyan-500/80 border-cyan-400' },
      { id:8, name:'Istoria Artei',          short:'IA',   day:5, start:10, end:12, room:'Amf.1',  type:'Curs',   professor:'Conf. Dr. Agachi',    color:'bg-indigo-500/80 border-indigo-400' },
      { id:9, name:'Design Grafic',          short:'DG',   day:5, start:12, end:16, room:'Lab.PC', type:'Laborator',professor:'Lect. Dr. Trandafir',color:'bg-violet-500/80 border-violet-400' },
    ],
    recoverySlots: {
      'Teoria & Istoria Artei': [
        { day:1, start:8,  end:10, room:'Amf.1',   group:'A1', professor:'Prof. Dr. Panaite', total:25, enrolled:22, isMine:true  },
        { day:3, start:16, end:18, room:'S.10',    group:'B1', professor:'Conf. Dr. Agachi',  total:15, enrolled:12, isMine:false },
      ],
      'Estetică': [
        { day:2, start:14, end:16, room:'S.10',    group:'A1', professor:'Lect. Dr. Rusu',    total:20, enrolled:18, isMine:true  },
        { day:3, start:14, end:16, room:'S.11',    group:'B1', professor:'Asist. Ciocan',     total:15, enrolled:13, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Bianca Olaru',   avatar:'BO', offersSubject:'Estetică', offersSlot:{ day:3, start:14, end:16, group:'B1' }, wantsSlot:{ day:2, start:14, end:16, group:'A1' }, message:'Miercurea am critică de atelier', isMatch:true },
      { id:2, name:'Cristian Lupu',  avatar:'CL', offersSubject:'Teoria & Istoria Artei', offersSlot:{ day:3, start:16, end:18, group:'B1' }, wantsSlot:{ day:1, start:8, end:10, group:'A1' }, message:'Prefer dimineața, nu seara', isMatch:false },
    ],
  },
}
