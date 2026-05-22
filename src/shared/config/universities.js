import { Y3, Y4, Y5, Y6_MED, Y6_DENT, Y6_ARCH, Y4_EFS } from './universities.years'

// ── Universities ──────────────────────────────────────────────────────────────
export const UNIVERSITIES = [
  // ── TUIASI Iași (Gheorghe Asachi) ─────────────────────────────────────────
  {
    id: 'tuiasi',
    name: 'Universitatea Tehnică „Gheorghe Asachi" din Iași',
    shortName: 'Gheorghe Asachi',
    city: 'Iași',
    country: 'Romania',
    emailDomain: 'student.tuiasi.ro',
    adminDomain: 'academic.tuiasi.ro',
    color: '#2563eb',
    avatar: 'TUIASI',
    established: 1937,
    faculties: [
      { code: 'AC',    name: 'Facultatea de Automatică și Calculatoare',                                  type: 'ENGINEERING_CS',  years: Y4,       emailPrefix: 'ac'   },
      { code: 'ETTI',  name: 'Facultatea de Electronică, Telecomunicații și Tehnologia Informației',       type: 'ENGINEERING',     years: Y4,       emailPrefix: 'etti' },
      { code: 'IEEIA', name: 'Facultatea de Inginerie Electrică, Energetică și Informatică Aplicată',      type: 'ENGINEERING',     years: Y4,       emailPrefix: 'ee'   },
      { code: 'CI',    name: 'Facultatea de Construcții și Instalații',                                    type: 'ENGINEERING',     years: Y4,       emailPrefix: 'ci'   },
      { code: 'MEC',   name: 'Facultatea de Mecanică',                                                     type: 'ENGINEERING',     years: Y4,       emailPrefix: 'mec'  },
      { code: 'HGIM',  name: 'Facultatea de Hidrotehnică, Geodezie și Ingineria Mediului',                 type: 'ENGINEERING',     years: Y4,       emailPrefix: 'hg'   },
      { code: 'ICPM',  name: 'Facultatea de Inginerie Chimică și Protecția Mediului „Cristofor Simionescu"', type: 'ENGINEERING',   years: Y4,       emailPrefix: 'ch'   },
      { code: 'SIM',   name: 'Facultatea de Știința și Ingineria Materialelor',                            type: 'ENGINEERING',     years: Y4,       emailPrefix: 'sim'  },
      { code: 'CMMI',  name: 'Facultatea de Construcții de Mașini și Management Industrial',               type: 'ENGINEERING',     years: Y4,       emailPrefix: 'cm'   },
      { code: 'DIMA',  name: 'Facultatea de Design Industrial și Managementul Afacerilor',                 type: 'ECONOMICS',       years: Y4,       emailPrefix: 'dima' },
      { code: 'ARH',   name: 'Facultatea de Arhitectură „G.M. Cantacuzino"',                               type: 'ARCHITECTURE',    years: Y6_ARCH,  emailPrefix: 'arh'  },
    ],
  },

  // ── UAIC Iași ──────────────────────────────────────────────────────────────
  {
    id: 'uaic',
    name: 'Universitatea Alexandru Ioan Cuza',
    shortName: 'UAIC Iași',
    city: 'Iași',
    country: 'Romania',
    emailDomain: 'student.uaic.ro',
    adminDomain: 'uaic.ro',
    color: '#ef4444',
    avatar: 'UAIC',
    established: 1860,
    faculties: [
      { code: 'FMIM',  name: 'Facultatea de Matematică-Informatică',                   type: 'MATH_CS',     years: Y3, emailPrefix: 'fmim'  },
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
    color: '#6366f1',
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

  // ── UMF Iași (Grigore T. Popa) ────────────────────────────────────────────
  {
    id: 'umf-iasi',
    name: 'Universitatea de Medicină și Farmacie „Grigore T. Popa" Iași',
    shortName: 'UMF Iași',
    city: 'Iași',
    country: 'Romania',
    emailDomain: 'student.umfiasi.ro',
    adminDomain: 'umfiasi.ro',
    color: '#dc2626',
    avatar: 'UMF',
    established: 1879,
    faculties: [
      { code: 'MED',   name: 'Facultatea de Medicină',                                 type: 'MEDICINE',    years: Y6_MED,  emailPrefix: 'med'  },
      { code: 'DENT',  name: 'Facultatea de Medicină Dentară',                         type: 'MEDICINE',    years: Y6_DENT, emailPrefix: 'dent' },
      { code: 'FARM',  name: 'Facultatea de Farmacie',                                 type: 'PHARMACY',    years: Y5,      emailPrefix: 'farm' },
      { code: 'BMFD',  name: 'Facultatea de Bioinginerie Medicală',                    type: 'MEDICINE',    years: Y4,      emailPrefix: 'bm'   },
      { code: 'NURS',  name: 'Facultatea de Nursing',                                  type: 'MEDICINE',    years: Y3,      emailPrefix: 'nurs' },
    ],
  },

  // ── UMF București (Carol Davila) ───────────────────────────────────────────
  {
    id: 'umf-buc',
    name: 'Universitatea de Medicină și Farmacie „Carol Davila" București',
    shortName: 'UMF București',
    city: 'București',
    country: 'Romania',
    emailDomain: 'student.umfcd.ro',
    adminDomain: 'umfcd.ro',
    color: '#b91c1c',
    avatar: 'UMFB',
    established: 1857,
    faculties: [
      { code: 'MED',   name: 'Facultatea de Medicină',                                 type: 'MEDICINE',    years: Y6_MED,  emailPrefix: 'med'  },
      { code: 'DENT',  name: 'Facultatea de Medicină Dentară',                         type: 'MEDICINE',    years: Y6_DENT, emailPrefix: 'dent' },
      { code: 'FARM',  name: 'Facultatea de Farmacie',                                 type: 'PHARMACY',    years: Y5,      emailPrefix: 'farm' },
      { code: 'MOAM',  name: 'Facultatea de Moașe și Asistență Medicală',              type: 'MEDICINE',    years: Y4,      emailPrefix: 'moam' },
    ],
  },

  // ── UMF Târgu Mureș (George Emil Palade) ──────────────────────────────────
  {
    id: 'umf-tgm',
    name: 'Universitatea de Medicină, Farmacie, Știință și Tehnologie „George Emil Palade" Târgu Mureș',
    shortName: 'UMF Târgu Mureș',
    city: 'Târgu Mureș',
    country: 'Romania',
    emailDomain: 'student.umfst.ro',
    adminDomain: 'umfst.ro',
    color: '#991b1b',
    avatar: 'UMFT',
    established: 1945,
    faculties: [
      { code: 'MED',   name: 'Facultatea de Medicină',                                 type: 'MEDICINE',    years: Y6_MED,  emailPrefix: 'med'  },
      { code: 'DENT',  name: 'Facultatea de Medicină Dentară',                         type: 'MEDICINE',    years: Y6_DENT, emailPrefix: 'dent' },
      { code: 'FARM',  name: 'Facultatea de Farmacie',                                 type: 'PHARMACY',    years: Y5,      emailPrefix: 'farm' },
      { code: 'ING',   name: 'Facultatea de Inginerie și Tehnologia Informației',      type: 'ENGINEERING', years: Y4,      emailPrefix: 'ing'  },
      { code: 'ECON',  name: 'Facultatea de Economie și Drept',                        type: 'ECONOMICS',   years: Y3,      emailPrefix: 'econ' },
    ],
  },

  // ── UMF Craiova ────────────────────────────────────────────────────────────
  {
    id: 'umf-craiova',
    name: 'Universitatea de Medicină și Farmacie din Craiova',
    shortName: 'UMF Craiova',
    city: 'Craiova',
    country: 'Romania',
    emailDomain: 'student.umfcv.ro',
    adminDomain: 'umfcv.ro',
    color: '#c2410c',
    avatar: 'UMFC',
    established: 1970,
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

