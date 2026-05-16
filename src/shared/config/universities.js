// University registry — single source of truth for faculties, email domains, city data
// Future: fetched from Supabase `universities` table

// ── Year set definitions ──────────────────────────────────────────────────────
const Y3 = [
  { label: 'Anul 1', desc: 'Primul an de licență (3 ani)' },
  { label: 'Anul 2', desc: 'Al doilea an de licență' },
  { label: 'Anul 3', desc: 'Ultimul an, pregătire examen licență' },
  { label: 'Master I', desc: 'Studii masterale, primul an' },
  { label: 'Master II', desc: 'Studii masterale, al doilea an' },
  { label: 'Doctorat', desc: 'Studii doctorale (3+ ani)' },
]

const Y4 = [
  { label: 'Anul 1', desc: 'Primul an de licență (4 ani)' },
  { label: 'Anul 2', desc: 'Al doilea an de licență' },
  { label: 'Anul 3', desc: 'Al treilea an de licență' },
  { label: 'Anul 4', desc: 'Ultimul an, pregătire examen licență' },
  { label: 'Master I', desc: 'Studii masterale, primul an' },
  { label: 'Master II', desc: 'Studii masterale, al doilea an' },
  { label: 'Doctorat', desc: 'Studii doctorale' },
]

const Y5 = [
  { label: 'Anul 1', desc: 'Preclinic — bazele farmaciei' },
  { label: 'Anul 2', desc: 'Chimie farmaceutică, botanică' },
  { label: 'Anul 3', desc: 'Farmacologie, biochimie clinică' },
  { label: 'Anul 4', desc: 'Tehnologie farmaceutică, stagii' },
  { label: 'Anul 5', desc: 'Stagiu în farmacie, examen de stat' },
  { label: 'Master / Rezidențiat', desc: 'Specializare postuniversitară' },
]

const Y6_MED = [
  { label: 'Anul 1', desc: 'Preclinic — anatomie, biochimie, biologie celulară' },
  { label: 'Anul 2', desc: 'Preclinic — fiziologie, histologie, fiziopatologie' },
  { label: 'Anul 3', desc: 'Paraclinic — semiologie, farmacologie, microbiologie' },
  { label: 'Anul 4', desc: 'Clinic — medicină internă, chirurgie generală' },
  { label: 'Anul 5', desc: 'Rotații clinice — specialități medicale și chirurgicale' },
  { label: 'Anul 6', desc: 'Stagii finale, pregătire examen de stat' },
  { label: 'Rezidențiat', desc: 'Specializare medicală (3–7 ani)' },
]

const Y6_DENT = [
  { label: 'Anul 1', desc: 'Preclinic — anatomie, biochimie, propedeutică' },
  { label: 'Anul 2', desc: 'Preclinic — histologie, fiziologie, materiale dentare' },
  { label: 'Anul 3', desc: 'Clinică — cariologie, endodonție, parodontologie' },
  { label: 'Anul 4', desc: 'Clinică — protetica dentară, ortodonție' },
  { label: 'Anul 5', desc: 'Clinică avansată — chirurgie oro-maxilo-facială' },
  { label: 'Anul 6', desc: 'Stagii finale, examen de licență' },
  { label: 'Rezidențiat', desc: 'Specializare în stomatologie' },
]

const Y6_ARCH = [
  { label: 'Anul 1', desc: 'Bazele arhitecturii, geometrie descriptivă, desen' },
  { label: 'Anul 2', desc: 'Proiectare arhitecturală I, materiale și tehnologii' },
  { label: 'Anul 3', desc: 'Proiectare arhitecturală II, teorie și critică' },
  { label: 'Anul 4', desc: 'Proiectare avansată, urbanism, management' },
  { label: 'Anul 5', desc: 'Proiect de diplomă, stagiu profesional' },
  { label: 'Anul 6', desc: 'Proiect final de arhitectură' },
  { label: 'Master', desc: 'Studii masterale în arhitectură / urbanism' },
]

const Y4_EFS = [
  { label: 'Anul 1', desc: 'Bazele educației fizice și sportului' },
  { label: 'Anul 2', desc: 'Metodica predării, atletism, jocuri sportive' },
  { label: 'Anul 3', desc: 'Kinetoterapie, management sportiv' },
  { label: 'Anul 4', desc: 'Practică pedagogică avansată, licență' },
  { label: 'Master', desc: 'Studii masterale în sport / kinetoterapie' },
]

// ── Universities ──────────────────────────────────────────────────────────────
export const UNIVERSITIES = [
  // ── UAIC Iași ──────────────────────────────────────────────────────────────
  {
    id: 'uaic',
    name: 'Universitatea Alexandru Ioan Cuza',
    shortName: 'UAIC Iași',
    city: 'Iași',
    country: 'Romania',
    emailDomain: 'student.uaic.ro',
    adminDomain: 'uaic.ro',
    color: '#6366f1',
    avatar: 'UAIC',
    established: 1860,
    faculties: [
      { code: 'FII',   name: 'Facultatea de Informatică',                              type: 'CS',          years: Y3, emailPrefix: 'info'  },
      { code: 'MATH',  name: 'Facultatea de Matematică',                               type: 'SCIENCES',    years: Y3, emailPrefix: 'math'  },
      { code: 'PHYS',  name: 'Facultatea de Fizică',                                   type: 'SCIENCES',    years: Y3, emailPrefix: 'phys'  },
      { code: 'CHEM',  name: 'Facultatea de Chimie',                                   type: 'SCIENCES',    years: Y3, emailPrefix: 'chem'  },
      { code: 'BIO',   name: 'Facultatea de Biologie',                                 type: 'SCIENCES',    years: Y3, emailPrefix: 'bio'   },
      { code: 'GEOG',  name: 'Facultatea de Geografie și Geologie',                    type: 'GEOGRAPHY',   years: Y3, emailPrefix: 'geo'   },
      { code: 'DREPT', name: 'Facultatea de Drept',                                    type: 'LAW',         years: Y4, emailPrefix: 'drept' },
      { code: 'FILO',  name: 'Facultatea de Filosofie și Știinte Social-Politice',     type: 'HUMANITIES',  years: Y3, emailPrefix: 'filo'  },
      { code: 'ISTO',  name: 'Facultatea de Istorie',                                  type: 'HUMANITIES',  years: Y3, emailPrefix: 'isto'  },
      { code: 'LITT',  name: 'Facultatea de Litere',                                   type: 'HUMANITIES',  years: Y3, emailPrefix: 'litt'  },
      { code: 'PSIH',  name: 'Facultatea de Psihologie și Știinte ale Educației',      type: 'PSYCHOLOGY',  years: Y3, emailPrefix: 'psih'  },
      { code: 'FEAA',  name: 'Facultatea de Economie și Administrarea Afacerilor',     type: 'ECONOMICS',   years: Y3, emailPrefix: 'econ'  },
      { code: 'TEOL',  name: 'Facultatea de Teologie Ortodoxă',                        type: 'THEOLOGY',    years: Y3, emailPrefix: 'teol'  },
      { code: 'EFS',   name: 'Facultatea de Educație Fizică și Sport',                 type: 'SPORTS',      years: Y4_EFS, emailPrefix: 'sport' },
    ],
  },

  // ── UBB Cluj-Napoca ────────────────────────────────────────────────────────
  {
    id: 'ubb',
    name: 'Universitatea Babeș-Bolyai',
    shortName: 'UBB Cluj',
    city: 'Cluj-Napoca',
    country: 'Romania',
    emailDomain: 'student.ubbcluj.ro',
    adminDomain: 'ubbcluj.ro',
    color: '#ef4444',
    avatar: 'UBB',
    established: 1872,
    faculties: [
      { code: 'MI',    name: 'Facultatea de Matematică și Informatică',                type: 'CS',          years: Y3, emailPrefix: 'mi'    },
      { code: 'PHYS',  name: 'Facultatea de Fizică',                                   type: 'SCIENCES',    years: Y3, emailPrefix: 'phys'  },
      { code: 'CHEM',  name: 'Facultatea de Chimie și Inginerie Chimică',              type: 'SCIENCES',    years: Y3, emailPrefix: 'chem'  },
      { code: 'BIO',   name: 'Facultatea de Biologie și Geologie',                     type: 'SCIENCES',    years: Y3, emailPrefix: 'bio'   },
      { code: 'GEOG',  name: 'Facultatea de Geografie',                                type: 'GEOGRAPHY',   years: Y3, emailPrefix: 'geo'   },
      { code: 'DREPT', name: 'Facultatea de Drept',                                    type: 'LAW',         years: Y4, emailPrefix: 'drept' },
      { code: 'LITT',  name: 'Facultatea de Litere',                                   type: 'HUMANITIES',  years: Y3, emailPrefix: 'litt'  },
      { code: 'ISTO',  name: 'Facultatea de Istorie și Filosofie',                     type: 'HUMANITIES',  years: Y3, emailPrefix: 'isto'  },
      { code: 'PSIH',  name: 'Facultatea de Psihologie și Știinte ale Educației',      type: 'PSYCHOLOGY',  years: Y3, emailPrefix: 'psih'  },
      { code: 'SOC',   name: 'Facultatea de Sociologie și Asistență Socială',          type: 'HUMANITIES',  years: Y3, emailPrefix: 'soc'   },
      { code: 'STP',   name: 'Facultatea de Știinte Politice, Administrative și Comunicare', type: 'HUMANITIES', years: Y3, emailPrefix: 'pol' },
      { code: 'ECON',  name: 'Facultatea de Știinte Economice și Gestiunea Afacerilor',type: 'ECONOMICS',   years: Y3, emailPrefix: 'econ'  },
      { code: 'BUS',   name: 'Facultatea de Business',                                 type: 'ECONOMICS',   years: Y3, emailPrefix: 'bus'   },
      { code: 'TEATR', name: 'Facultatea de Teatru și Televiziune',                    type: 'THEATER',     years: Y4, emailPrefix: 'teatru'},
      { code: 'MUZ',   name: 'Facultatea de Muzică',                                   type: 'MUSIC',       years: Y4, emailPrefix: 'muz'   },
      { code: 'ARTE',  name: 'Facultatea de Arte Vizuale și Design',                   type: 'ARTS',        years: Y4, emailPrefix: 'arte'  },
      { code: 'ING',   name: 'Facultatea de Inginerie',                                type: 'ENGINEERING', years: Y4, emailPrefix: 'ing'   },
      { code: 'EFS',   name: 'Facultatea de Educație Fizică și Sport',                 type: 'SPORTS',      years: Y4_EFS, emailPrefix: 'sport' },
      { code: 'STEU',  name: 'Facultatea de Studii Europene',                          type: 'HUMANITIES',  years: Y3, emailPrefix: 'eu'    },
    ],
  },

  // ── Universitatea din București ────────────────────────────────────────────
  {
    id: 'ub',
    name: 'Universitatea din București',
    shortName: 'UB București',
    city: 'București',
    country: 'Romania',
    emailDomain: 'student.unibuc.ro',
    adminDomain: 'unibuc.ro',
    color: '#f59e0b',
    avatar: 'UB',
    established: 1864,
    faculties: [
      { code: 'FMI',   name: 'Facultatea de Matematică și Informatică',                type: 'CS',          years: Y3, emailPrefix: 'fmi'   },
      { code: 'PHYS',  name: 'Facultatea de Fizică',                                   type: 'SCIENCES',    years: Y3, emailPrefix: 'phys'  },
      { code: 'CHEM',  name: 'Facultatea de Chimie',                                   type: 'SCIENCES',    years: Y3, emailPrefix: 'chem'  },
      { code: 'BIO',   name: 'Facultatea de Biologie',                                 type: 'SCIENCES',    years: Y3, emailPrefix: 'bio'   },
      { code: 'GEOG',  name: 'Facultatea de Geografie',                                type: 'GEOGRAPHY',   years: Y3, emailPrefix: 'geo'   },
      { code: 'DREPT', name: 'Facultatea de Drept',                                    type: 'LAW',         years: Y4, emailPrefix: 'drept' },
      { code: 'FILO',  name: 'Facultatea de Filosofie',                                type: 'HUMANITIES',  years: Y3, emailPrefix: 'filo'  },
      { code: 'ISTO',  name: 'Facultatea de Istorie',                                  type: 'HUMANITIES',  years: Y3, emailPrefix: 'isto'  },
      { code: 'LITT',  name: 'Facultatea de Litere',                                   type: 'HUMANITIES',  years: Y3, emailPrefix: 'litt'  },
      { code: 'PSIH',  name: 'Facultatea de Psihologie și Știintele Educației',        type: 'PSYCHOLOGY',  years: Y3, emailPrefix: 'psih'  },
      { code: 'SOC',   name: 'Facultatea de Sociologie și Asistență Socială',          type: 'HUMANITIES',  years: Y3, emailPrefix: 'soc'   },
      { code: 'LLS',   name: 'Facultatea de Limbi și Literaturi Străine',              type: 'HUMANITIES',  years: Y3, emailPrefix: 'lls'   },
      { code: 'JURN',  name: 'Facultatea de Jurnalism și Știintele Comunicării',       type: 'HUMANITIES',  years: Y3, emailPrefix: 'jurn'  },
      { code: 'ADM',   name: 'Facultatea de Administrație și Afaceri',                 type: 'ECONOMICS',   years: Y3, emailPrefix: 'adm'   },
      { code: 'EFS',   name: 'Facultatea de Educație Fizică și Sport',                 type: 'SPORTS',      years: Y4_EFS, emailPrefix: 'sport' },
      { code: 'TEOL',  name: 'Facultatea de Teologie Ortodoxă',                        type: 'THEOLOGY',    years: Y3, emailPrefix: 'teol'  },
    ],
  },

  // ── ASE București ──────────────────────────────────────────────────────────
  {
    id: 'ase',
    name: 'Academia de Studii Economice',
    shortName: 'ASE București',
    city: 'București',
    country: 'Romania',
    emailDomain: 'student.ase.ro',
    adminDomain: 'ase.ro',
    color: '#10b981',
    avatar: 'ASE',
    established: 1913,
    faculties: [
      { code: 'ETA',   name: 'Facultatea de Economie Teoretică și Aplicată',           type: 'ECONOMICS',   years: Y3, emailPrefix: 'eta'   },
      { code: 'AAB',   name: 'Facultatea de Administrarea Afacerilor (limbi străine)',  type: 'ECONOMICS',   years: Y3, emailPrefix: 'aab'   },
      { code: 'CIG',   name: 'Facultatea de Contabilitate și Informatică de Gestiune', type: 'ECONOMICS',   years: Y3, emailPrefix: 'cig'   },
      { code: 'COM',   name: 'Facultatea de Comerț',                                   type: 'ECONOMICS',   years: Y3, emailPrefix: 'com'   },
      { code: 'EAEM',  name: 'Facultatea de Economie Agroalimentară și a Mediului',    type: 'ECONOMICS',   years: Y3, emailPrefix: 'eaem'  },
      { code: 'FABV',  name: 'Facultatea de Finanțe, Asigurări, Bănci și Burse de Valori', type: 'ECONOMICS', years: Y3, emailPrefix: 'fin' },
      { code: 'CSIE',  name: 'Facultatea de Cibernetică, Statistică și Informatică Economică', type: 'CS',  years: Y3, emailPrefix: 'csie'  },
      { code: 'MAN',   name: 'Facultatea de Management',                                type: 'ECONOMICS',   years: Y3, emailPrefix: 'man'   },
      { code: 'MKT',   name: 'Facultatea de Marketing',                                 type: 'ECONOMICS',   years: Y3, emailPrefix: 'mkt'   },
      { code: 'REI',   name: 'Facultatea de Relații Economice Internaționale',          type: 'ECONOMICS',   years: Y3, emailPrefix: 'rei'   },
      { code: 'SPE',   name: 'Facultatea de Statistică și Previziune Economică',        type: 'ECONOMICS',   years: Y3, emailPrefix: 'spe'   },
    ],
  },

  // ── UPB București (Politehnica) ─────────────────────────────────────────────
  {
    id: 'upb',
    name: 'Universitatea Politehnica București',
    shortName: 'UPB București',
    city: 'București',
    country: 'Romania',
    emailDomain: 'student.upb.ro',
    adminDomain: 'upb.ro',
    color: '#8b5cf6',
    avatar: 'UPB',
    established: 1818,
    faculties: [
      { code: 'EE',    name: 'Facultatea de Inginerie Electrică',                      type: 'ENGINEERING', years: Y4, emailPrefix: 'elec'  },
      { code: 'IMM',   name: 'Facultatea de Inginerie Mecanică și Mecatronică',        type: 'ENGINEERING', years: Y4, emailPrefix: 'mec'   },
      { code: 'ICB',   name: 'Facultatea de Inginerie Chimică și Biotehnologii',       type: 'ENGINEERING', years: Y4, emailPrefix: 'chim'  },
      { code: 'FILS',  name: 'Facultatea de Inginerie în Limbi Străine',               type: 'ENGINEERING', years: Y4, emailPrefix: 'fils'  },
      { code: 'EEACS', name: 'Facultatea de Electrotehnică, Energetică și Calculatoare', type: 'ENGINEERING', years: Y4, emailPrefix: 'eeac' },
      { code: 'ETTI',  name: 'Facultatea de Electronică, Telecomunicații și IT',       type: 'CS',          years: Y4, emailPrefix: 'etti'  },
      { code: 'TRAN',  name: 'Facultatea de Transporturi',                             type: 'ENGINEERING', years: Y4, emailPrefix: 'trans' },
      { code: 'AERO',  name: 'Facultatea de Inginerie Aerospațială',                   type: 'ENGINEERING', years: Y4, emailPrefix: 'aero'  },
      { code: 'ISIM',  name: 'Facultatea de Știinta și Ingineria Materialelor',        type: 'ENGINEERING', years: Y4, emailPrefix: 'mat'   },
      { code: 'IMST',  name: 'Facultatea de Inginerie și Management al Sistemelor',    type: 'ENGINEERING', years: Y4, emailPrefix: 'imst'  },
      { code: 'AC',    name: 'Facultatea de Automatică și Calculatoare',               type: 'CS',          years: Y4, emailPrefix: 'ac'    },
      { code: 'BIOT',  name: 'Facultatea de Biotehnologii',                            type: 'SCIENCES',    years: Y4, emailPrefix: 'biot'  },
    ],
  },

  // ── UPT Timișoara (Politehnica) ────────────────────────────────────────────
  {
    id: 'upt',
    name: 'Universitatea Politehnica Timișoara',
    shortName: 'UPT Timișoara',
    city: 'Timișoara',
    country: 'Romania',
    emailDomain: 'student.upt.ro',
    adminDomain: 'upt.ro',
    color: '#06b6d4',
    avatar: 'UPT',
    established: 1920,
    faculties: [
      { code: 'AC',    name: 'Facultatea de Automatică și Calculatoare',               type: 'CS',          years: Y4, emailPrefix: 'ac'    },
      { code: 'CHIM',  name: 'Facultatea de Chimie Industrială și Ingineria Mediului', type: 'ENGINEERING', years: Y4, emailPrefix: 'chim'  },
      { code: 'CON',   name: 'Facultatea de Construcții',                              type: 'ENGINEERING', years: Y4, emailPrefix: 'con'   },
      { code: 'ETEE',  name: 'Facultatea de Electrotehnică și Electroenergetică',      type: 'ENGINEERING', years: Y4, emailPrefix: 'etee'  },
      { code: 'ETTI',  name: 'Facultatea de Electronică, Telecomunicații și TI',       type: 'ENGINEERING', years: Y4, emailPrefix: 'etti'  },
      { code: 'IIM',   name: 'Facultatea de Inginerie Industrială și Management',      type: 'ENGINEERING', years: Y4, emailPrefix: 'iim'   },
      { code: 'MEC',   name: 'Facultatea de Mecanică',                                 type: 'ENGINEERING', years: Y4, emailPrefix: 'mec'   },
      { code: 'ARCH',  name: 'Facultatea de Arhitectură și Urbanism',                  type: 'ARCHITECTURE', years: Y6_ARCH, emailPrefix: 'arh' },
      { code: 'MGT',   name: 'Facultatea de Management în Producție și Transporturi',  type: 'ECONOMICS',   years: Y4, emailPrefix: 'mgt'   },
    ],
  },

  // ── UMF Cluj ───────────────────────────────────────────────────────────────
  {
    id: 'umf-cluj',
    name: 'Universitatea de Medicină și Farmacie Cluj-Napoca',
    shortName: 'UMF Cluj',
    city: 'Cluj-Napoca',
    country: 'Romania',
    emailDomain: 'student.umfcluj.ro',
    adminDomain: 'umfcluj.ro',
    color: '#ef4444',
    avatar: 'UMF',
    established: 1919,
    faculties: [
      { code: 'MED',   name: 'Facultatea de Medicină',                                 type: 'MEDICINE',    years: Y6_MED,  emailPrefix: 'med'  },
      { code: 'DENT',  name: 'Facultatea de Medicină Dentară',                         type: 'MEDICINE',    years: Y6_DENT, emailPrefix: 'dent' },
      { code: 'FARM',  name: 'Facultatea de Farmacie',                                 type: 'PHARMACY',    years: Y5,      emailPrefix: 'farm' },
      { code: 'NURS',  name: 'Facultatea de Nursing',                                  type: 'MEDICINE',    years: Y3,      emailPrefix: 'nurs' },
    ],
  },

  // ── UVT Timișoara ──────────────────────────────────────────────────────────
  {
    id: 'uvt',
    name: 'Universitatea de Vest din Timișoara',
    shortName: 'UVT Timișoara',
    city: 'Timișoara',
    country: 'Romania',
    emailDomain: 'student.uvt.ro',
    adminDomain: 'uvt.ro',
    color: '#f97316',
    avatar: 'UVT',
    established: 1944,
    faculties: [
      { code: 'ARTE',  name: 'Facultatea de Arte și Design',                           type: 'ARTS',        years: Y4,     emailPrefix: 'arte'  },
      { code: 'CHBG',  name: 'Facultatea de Chimie, Biologie, Geografie',              type: 'SCIENCES',    years: Y3,     emailPrefix: 'chbg'  },
      { code: 'DREPT', name: 'Facultatea de Drept',                                    type: 'LAW',         years: Y4,     emailPrefix: 'drept' },
      { code: 'ECON',  name: 'Facultatea de Economie și Afaceri',                      type: 'ECONOMICS',   years: Y3,     emailPrefix: 'econ'  },
      { code: 'EFS',   name: 'Facultatea de Educație Fizică și Sport',                 type: 'SPORTS',      years: Y4_EFS, emailPrefix: 'sport' },
      { code: 'PHYS',  name: 'Facultatea de Fizică',                                   type: 'SCIENCES',    years: Y3,     emailPrefix: 'phys'  },
      { code: 'INFO',  name: 'Facultatea de Matematică și Informatică',                type: 'CS',          years: Y3,     emailPrefix: 'info'  },
      { code: 'LITT',  name: 'Facultatea de Litere, Istorie și Teologie',              type: 'HUMANITIES',  years: Y3,     emailPrefix: 'litt'  },
      { code: 'MUZ',   name: 'Facultatea de Muzică și Teatru',                         type: 'MUSIC',       years: Y4,     emailPrefix: 'muz'   },
      { code: 'PSIH',  name: 'Facultatea de Psihologie și Știintele Educației',        type: 'PSYCHOLOGY',  years: Y3,     emailPrefix: 'psih'  },
      { code: 'SOC',   name: 'Facultatea de Sociologie și Comunicare',                 type: 'HUMANITIES',  years: Y3,     emailPrefix: 'soc'   },
      { code: 'POL',   name: 'Facultatea de Știinte Politice, Filosofie și Comunicare',type: 'HUMANITIES',  years: Y3,     emailPrefix: 'pol'   },
    ],
  },
]

// ── Utility functions ─────────────────────────────────────────────────────────
export function getUniversityById(id) {
  return UNIVERSITIES.find(u => u.id === id) || null
}

export function detectFacultyFromEmail(email, university) {
  const [username] = email.split('@')
  const prefix = username.split('.')[0].toLowerCase()
  return university.faculties.find(f => f.emailPrefix === prefix) || null
}

export function validateInstitutionalEmail(email, university) {
  return email.endsWith(`@${university.emailDomain}`) ||
         email.endsWith(`@${university.adminDomain}`)
}
