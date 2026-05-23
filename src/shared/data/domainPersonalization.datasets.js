import {
  FACULTY_QUESTIONS,
  FACULTY_SCHEDULES,
  professors as csProfessors,
  tutors as csTutors,
  skillSwapUsers as csSkillSwap,
  groupSessions as csGroupSessions,
} from './mockData.js'

// ── New faculty type questions ─────────────────────────────────────────────────
const EXTRA_QUESTIONS = {
  LAW: {
    interestsLabel: 'Ce ramuri ale dreptului te atrag cel mai mult?',
    interests: ['Drept civil','Drept penal','Drept constituțional','Drept european','Drept internațional','Drept comercial','Drept administrativ','Drept muncii','Drept procesual','Criminologie'],
    specific: {
      question: 'Ce format de muncă juridică preferi?',
      type: 'cards',
      options: [
        { label: 'Litigiu & avocatură', desc: 'Dosare, pledoarii, instanță' },
        { label: 'Consiliere juridică', desc: 'Redactare acte, consultanță, notariat' },
        { label: 'Magistratură', desc: 'Judecătorie, parchet, carieră în stat' },
        { label: 'Cercetare juridică', desc: 'Doctrină, articole, drept comparat' },
      ],
    },
    experience: {
      question: 'Ai deja experiență în domeniu?',
      type: 'cards',
      options: [
        { label: 'Stagiu la barou / notariat', desc: 'Am efectuat stagiu de practică' },
        { label: 'Simulare de proces (moot court)', desc: 'Am participat la competiții juridice' },
        { label: 'Nu încă', desc: 'Caut prima experiență practică' },
      ],
    },
  },

  GEOGRAPHY: {
    interestsLabel: 'Ce domeniu geografic te pasionează?',
    interests: ['Geografie fizică','Cartografie & GIS','Climatologie','Geomorfologie','Hidrologie','Geografie urbană','Teledetecție','Geografie economică','Geologie','Mediu & ecologie'],
    specific: {
      question: 'Ce metodologie preferi în cercetare?',
      type: 'cards',
      options: [
        { label: 'Teren & expediționist', desc: 'Măsurători GPS, cartare, probe de sol' },
        { label: 'GIS & teledetecție', desc: 'QGIS, ArcGIS, imagini satelitare' },
        { label: 'Analiză statistică', desc: 'Date climatice, modele numerice' },
      ],
    },
    experience: {
      question: 'Ce software GIS cunoști?',
      type: 'tags',
      options: ['QGIS','ArcGIS','Google Earth Engine','ENVI','AutoCAD Map','Python (GeoPandas)','R (spatial)','Niciunul încă'],
    },
  },

  PSYCHOLOGY: {
    interestsLabel: 'Ce ramură a psihologiei te interesează?',
    interests: ['Psihologie clinică','Psihologie cognitivă','Psihologie educațională','Neuropsihologie','Psihoterapie','Psihologie organizațională','Psihopatologie','Psihologie experimentală','Psihologie socială','Consiliere psihologică'],
    specific: {
      question: 'Care este orientarea ta profesională?',
      type: 'cards',
      options: [
        { label: 'Practică clinică', desc: 'Cabinet, psihoterapie, evaluare psihologică' },
        { label: 'Cercetare experimentală', desc: 'Studii, publicații, laborator cognitiv' },
        { label: 'Aplicat organizațional', desc: 'HR, selecție de personal, coaching' },
        { label: 'Educație & consiliere', desc: 'Școli, universități, centru de consiliere' },
      ],
    },
    experience: {
      question: 'Ai experiență cu psihodiagnoză?',
      type: 'cards',
      options: [
        { label: 'Da, am aplicat teste', desc: 'MMPI, Rorschach, WAIS sau altele' },
        { label: 'Doar în laborator', desc: 'Testare în cadrul cursurilor' },
        { label: 'Nu încă', desc: 'Abia încep practica' },
      ],
    },
  },

  SPORTS: {
    interestsLabel: 'Ce ramură sportivă sau kineto te atrage?',
    interests: ['Kinetoterapie & recuperare','Antrenament sportiv','Educație fizică școlară','Nutriție sportivă','Biomecanică','Sport de performanță','Management sportiv','Psihologie sportivă','Sport adaptat','Fitness & wellness'],
    specific: {
      question: 'Care este specializarea dorită?',
      type: 'cards',
      options: [
        { label: 'Educator fizic / Profesor', desc: 'Predare în școli, metodica educației fizice' },
        { label: 'Antrenor sportiv', desc: 'Cluburi, federații, lotul național' },
        { label: 'Kinetoterapeut', desc: 'Recuperare, clinici, spitale' },
        { label: 'Manager sportiv', desc: 'Administrarea cluburilor, evenimente' },
      ],
    },
    experience: {
      question: 'Ești sportiv de performanță?',
      type: 'cards',
      options: [
        { label: 'Da, sportiv licențiat', desc: 'Competiții regionale / naționale / internaționale' },
        { label: 'Sport amator', desc: 'Activitate regulată, fără competiție de performanță' },
        { label: 'Interes academic', desc: 'Interesat de sport din perspectivă științifică' },
      ],
    },
  },

  MUSIC: {
    interestsLabel: 'Ce domeniu muzical te reprezintă?',
    interests: ['Interpretare instrumentală','Cânt vocal (clasic)','Dirijat coral & orchestral','Compoziție & Muzicologie','Muzică de cameră','Muzică contemporană & experimentală','Jaz & improvizație','Pedagogie muzicală','Producție muzicală','Etno-muzicologie'],
    specific: {
      question: 'Cum te definești cel mai bine?',
      type: 'cards',
      options: [
        { label: 'Interpret', desc: 'Concert, scenă, recital' },
        { label: 'Compozitor / Aranjor', desc: 'Creație proprie, compoziție academică' },
        { label: 'Pedagog muzical', desc: 'Predare instrument sau teorie' },
        { label: 'Muzicolog / Cercetător', desc: 'Estetică, analiză, istoria muzicii' },
      ],
    },
    experience: {
      question: 'Câți ani studiezi instrumentul / vocea?',
      type: 'cards',
      options: [
        { label: 'Peste 10 ani', desc: 'Studiu sistematic, participare la concursuri' },
        { label: '5–10 ani', desc: 'Experiență solidă, repertoriu variat' },
        { label: 'Sub 5 ani', desc: 'Debutant academic' },
      ],
    },
  },

  THEOLOGY: {
    interestsLabel: 'Ce domeniu teologic te atrage?',
    interests: ['Teologie dogmatică','Teologie biblică','Teologie morală & etică','Liturgică & tipic','Patrologie','Istoria bisericii','Missiologie','Ecumenism','Filosofia religiei','Artă sacră & iconografie'],
    specific: {
      question: 'Care este vocația ta principală?',
      type: 'cards',
      options: [
        { label: 'Slujire pastorală', desc: 'Parohie, preoție, diaconie' },
        { label: 'Cercetare academică', desc: 'Doctorat, publicații, predare teologie' },
        { label: 'Educație religioasă', desc: 'Profesor religie, catehist, misionar' },
        { label: 'Asistenţă socială creştină', desc: 'ONG, spital, carceral' },
      ],
    },
    experience: {
      question: 'Ai deja o implicare activă în Biserică?',
      type: 'cards',
      options: [
        { label: 'Da, liturgic activ', desc: 'Psalt, citeț, paracliser, lector' },
        { label: 'Voluntar social', desc: 'ONG, ajutor comunitar, misionar' },
        { label: 'Interes academic', desc: 'Studiu teologic din curiozitate intelectuală' },
      ],
    },
  },

  ARCHITECTURE: {
    interestsLabel: 'Ce direcție arhitecturală te pasionează?',
    interests: ['Proiectare arhitecturală','Urbanism & planificare','Arhitectură de interior','Restaurare & conservare','Arhitectură sustenabilă','Arhitectură peisagistică','Design structural','Teoria arhitecturii','Patrimoniu construit','Arhitectură digitală & parametrică'],
    specific: {
      question: 'Ce software de proiectare folosești?',
      type: 'tags',
      options: ['AutoCAD','Revit','Rhino 3D','SketchUp','ArchiCAD','Lumion','Grasshopper','Adobe Suite'],
    },
    experience: {
      question: 'Ai deja un portofoliu de proiecte?',
      type: 'cards',
      options: [
        { label: 'Da, complet și publicat', desc: 'Portofoliu online / fizic gata pentru angajare' },
        { label: 'Lucrări universitare', desc: 'Proiecte din ateliere și critique' },
        { label: 'Abia construiesc', desc: 'Primele semestre, portofoliu în formare' },
      ],
    },
  },

  THEATER: {
    interestsLabel: 'Ce domeniu al artelor spectacolului te atrage?',
    interests: ['Arta actorului','Regie de teatru','Dramaturgie','Teatru de păpuși & animație','Teatru muzical','Tehnica scenei','Mise en scène','Teatru experimental','Performance art','Critică teatrală'],
    specific: {
      question: 'Cum lucrezi cel mai bine?',
      type: 'cards',
      options: [
        { label: 'Spectacole de repertoriu', desc: 'Teatru clasic, repertoriu fix, trupe profesionale' },
        { label: 'Teatru independent', desc: 'Proiecte proprii, colective, alternative' },
        { label: 'Pedagogie teatrală', desc: 'Predare, ateliere, teatru educațional' },
      ],
    },
    experience: {
      question: 'Ai jucat pe scenă?',
      type: 'cards',
      options: [
        { label: 'Da, spectacole publice', desc: 'Am jucat în producții văzute de public' },
        { label: 'Studențesc / Amator', desc: 'Spectacole în facultate, teatre de amatori' },
        { label: 'Abia încep', desc: 'Prima experiență academică teatrală' },
      ],
    },
  },

  MATH_CS: {
    interestsLabel: 'Ce domeniu te atrage cel mai mult?',
    interests: ['Analiză matematică','Algebră & geometrie','Probabilități & statistică','Algoritmi & structuri de date','Programare web','Machine learning & AI','Baze de date','Criptografie','Teoria numerelor','Ecuații diferențiale'],
    specific: {
      question: 'Care este direcția ta principală?',
      type: 'cards',
      options: [
        { label: 'Matematică pură', desc: 'Analiză, algebră, geometrie, topologie' },
        { label: 'Informatică teoretică', desc: 'Algoritmi, calculabilitate, logică matematică' },
        { label: 'Matematică aplicată', desc: 'Modele numerice, optimizare, statistică' },
        { label: 'Informatică aplicată', desc: 'Web, AI, baze de date, software' },
      ],
    },
    experience: {
      question: 'Ce limbaje de programare cunoști?',
      type: 'tags',
      options: ['Python','C++','Java','C','MATLAB','R','Haskell','JavaScript','SQL','Niciunul încă'],
    },
  },

  ENGINEERING_CS: {
    interestsLabel: 'Ce domenii din ingineria calculatoarelor te pasionează?',
    interests: ['Programare & software','Algoritmi & structuri de date','Rețele de calculatoare','Sisteme de operare','Baze de date','Inteligență artificială','Securitate cibernetică','Embedded systems','Control automat','Robotică','VLSI & circuite digitale','Web & aplicații mobile'],
    specific: {
      question: 'Ce tip de proiecte preferi?',
      type: 'cards',
      options: [
        { label: 'Software & aplicații', desc: 'Web, mobile, backend, inginerie software' },
        { label: 'Hardware & embedded', desc: 'Microcontrolere, FPGA, sisteme încorporate' },
        { label: 'AI & Data Science', desc: 'Machine learning, modele inteligente, date' },
        { label: 'Sisteme automate', desc: 'Control procese, robotică, automatizare industrială' },
      ],
    },
    experience: {
      question: 'Ce limbaje / tehnologii cunoști deja?',
      type: 'tags',
      options: ['C','C++','Python','Java','JavaScript','MATLAB/Simulink','Assembly','SQL','Git','Niciunul încă'],
    },
  },
}

// ── New faculty type schedules ─────────────────────────────────────────────────
const EXTRA_SCHEDULES = {
  LAW: {
    schedule: [
      { id:1,  name:'Drept Civil',               short:'DC',   day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Prof. Dr. Balan',       color:'bg-indigo-500/80 border-indigo-400' },
      { id:2,  name:'Drept Penal',               short:'DP',   day:1, start:10, end:12, room:'Amf.2',  type:'Curs',   professor:'Conf. Dr. Rusu',        color:'bg-violet-500/80 border-violet-400' },
      { id:3,  name:'Drept Constituțional',      short:'DCON', day:2, start:8,  end:10, room:'Amf.3',  type:'Curs',   professor:'Prof. Dr. Mrejeru',     color:'bg-amber-500/80 border-amber-400' },
      { id:4,  name:'Drept Civil',               short:'DC',   day:2, start:10, end:12, room:'S.10',   type:'Seminar',professor:'Asist. Lazăr',          color:'bg-indigo-500/80 border-indigo-400' },
      { id:5,  name:'Drept Roman',               short:'DR',   day:3, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Conf. Dr. Paraschiv',   color:'bg-emerald-500/80 border-emerald-400' },
      { id:6,  name:'Drept Penal',               short:'DP',   day:3, start:10, end:12, room:'S.11',   type:'Seminar',professor:'Asist. Manea',          color:'bg-violet-500/80 border-violet-400' },
      { id:7,  name:'Teoria Generală a Dr.',     short:'TGD',  day:4, start:8,  end:10, room:'Amf.2',  type:'Curs',   professor:'Prof. Dr. Crăciunescu', color:'bg-rose-500/80 border-rose-400' },
      { id:8,  name:'Drept Constituțional',      short:'DCON', day:4, start:10, end:12, room:'S.12',   type:'Seminar',professor:'Asist. Duca',           color:'bg-amber-500/80 border-amber-400' },
      { id:9,  name:'Drept Roman',               short:'DR',   day:5, start:12, end:14, room:'S.10',   type:'Seminar',professor:'Asist. Boca',           color:'bg-emerald-500/80 border-emerald-400' },
      { id:10, name:'Limbi Străine Juridice',    short:'LSJ',  day:5, start:10, end:12, room:'S.13',   type:'Seminar',professor:'Lect. Dr. Pop',         color:'bg-cyan-500/80 border-cyan-400' },
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
        { day:3, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Conf. Dr. Paraschiv', total:30, enrolled:27, isMine:true },
        { day:5, start:12, end:14, room:'S.10',  group:'B1', professor:'Asist. Boca',      total:20, enrolled:15, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Raluca Neagu',   avatar:'RN', offersSubject:'Drept Civil', offersSlot:{ day:2, start:10, end:12, group:'A2' }, wantsSlot:{ day:1, start:8, end:10, group:'A1' }, message:'Suprapunere cu seminar de drept penal', isMatch:true },
      { id:2, name:'Victor Iordan',  avatar:'VI', offersSubject:'Drept Roman', offersSlot:{ day:5, start:12, end:14, group:'B1' }, wantsSlot:{ day:3, start:8, end:10, group:'A1' }, message:'Vinerea am practică la barou', isMatch:false },
      { id:3, name:'Ioana Stănescu', avatar:'IS', offersSubject:'Drept Penal', offersSlot:{ day:3, start:10, end:12, group:'B1' }, wantsSlot:{ day:1, start:10, end:12, group:'A1' }, message:'Prefer lunea dimineața', isMatch:true },
    ],
  },

  GEOGRAPHY: {
    schedule: [
      { id:1, name:'Geografie Fizică',           short:'GF',   day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',     professor:'Prof. Dr. Ungureanu', color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Cartografie',                short:'CART', day:1, start:10, end:12, room:'Lab.PC', type:'Laborator', professor:'Conf. Dr. Niculiță', color:'bg-emerald-500/80 border-emerald-400' },
      { id:3, name:'Climatologie',               short:'CLIM', day:2, start:8,  end:10, room:'Amf.2',  type:'Curs',     professor:'Conf. Dr. Apostol',  color:'bg-amber-500/80 border-amber-400' },
      { id:4, name:'Geografie Fizică',           short:'GF',   day:2, start:10, end:12, room:'S.11',   type:'Seminar',  professor:'Asist. Hrițac',      color:'bg-indigo-500/80 border-indigo-400' },
      { id:5, name:'Geomorfologie',              short:'GEOM', day:3, start:8,  end:10, room:'Amf.3',  type:'Curs',     professor:'Prof. Dr. Ioniță',   color:'bg-violet-500/80 border-violet-400' },
      { id:6, name:'Cartografie',                short:'CART', day:3, start:10, end:12, room:'Lab.PC', type:'Laborator', professor:'Conf. Dr. Niculiță', color:'bg-emerald-500/80 border-emerald-400' },
      { id:7, name:'Hidrologie',                 short:'HIDR', day:4, start:10, end:12, room:'Amf.1',  type:'Curs',     professor:'Lect. Dr. Romanescu',color:'bg-rose-500/80 border-rose-400' },
      { id:8, name:'Geomorfologie',              short:'GEOM', day:4, start:12, end:14, room:'S.12',   type:'Seminar',  professor:'Asist. Sfîcă',       color:'bg-violet-500/80 border-violet-400' },
      { id:9, name:'GIS & Teledetecție',         short:'GIS',  day:5, start:10, end:14, room:'Lab.GIS',type:'Laborator', professor:'Conf. Dr. Niculiță', color:'bg-cyan-500/80 border-cyan-400' },
    ],
    recoverySlots: {
      'Geografie Fizică': [
        { day:1, start:8,  end:10, room:'Amf.1',  group:'A1', professor:'Prof. Dr. Ungureanu', total:25, enrolled:22, isMine:true  },
        { day:2, start:10, end:12, room:'S.11',   group:'A2', professor:'Asist. Hrițac',       total:15, enrolled:14, isMine:false },
        { day:4, start:8,  end:10, room:'S.12',   group:'B1', professor:'Asist. Hrițac',       total:15, enrolled:11, isMine:false },
      ],
      'Geomorfologie': [
        { day:3, start:8,  end:10, room:'Amf.3',  group:'A1', professor:'Prof. Dr. Ioniță',    total:25, enrolled:24, isMine:true  },
        { day:4, start:12, end:14, room:'S.12',   group:'B1', professor:'Asist. Sfîcă',        total:15, enrolled:10, isMine:false },
      ],
      'Climatologie': [
        { day:2, start:8,  end:10, room:'Amf.2',  group:'A1', professor:'Conf. Dr. Apostol',   total:25, enrolled:20, isMine:true  },
        { day:5, start:8,  end:10, room:'S.11',   group:'B1', professor:'Asist. Hrițac',       total:15, enrolled:9,  isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Ionela Dănilă',  avatar:'ID', offersSubject:'Geomorfologie', offersSlot:{ day:4, start:12, end:14, group:'B1' }, wantsSlot:{ day:3, start:8, end:10, group:'A1' }, message:'Joi am lucru de teren', isMatch:true },
      { id:2, name:'Sorin Blândul',  avatar:'SB', offersSubject:'Climatologie',  offersSlot:{ day:5, start:8, end:10, group:'B1' }, wantsSlot:{ day:2, start:8, end:10, group:'A1' }, message:'Vinerea am seminar la hidrologie', isMatch:false },
    ],
  },

  PSYCHOLOGY: {
    schedule: [
      { id:1, name:'Psihologie Generală',        short:'PG',   day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Prof. Dr. Turliuc',   color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Statistică în Psihologie',   short:'STAT', day:1, start:10, end:12, room:'Lab.PC', type:'Seminar',professor:'Asist. Dănilă',       color:'bg-violet-500/80 border-violet-400' },
      { id:3, name:'Psihopatologie',             short:'PSP',  day:2, start:8,  end:10, room:'Amf.2',  type:'Curs',   professor:'Conf. Dr. Mîndrilă',  color:'bg-amber-500/80 border-amber-400' },
      { id:4, name:'Psihologie Generală',        short:'PG',   day:2, start:10, end:12, room:'S.10',   type:'Seminar',professor:'Asist. Radu',         color:'bg-indigo-500/80 border-indigo-400' },
      { id:5, name:'Psihologie Cognitivă',       short:'PC',   day:3, start:8,  end:10, room:'Amf.3',  type:'Curs',   professor:'Prof. Dr. Boncu',     color:'bg-emerald-500/80 border-emerald-400' },
      { id:6, name:'Psihopatologie',             short:'PSP',  day:3, start:10, end:12, room:'S.11',   type:'Seminar',professor:'Asist. Vornicu',      color:'bg-amber-500/80 border-amber-400' },
      { id:7, name:'Neuropsihologie',            short:'NRPS', day:4, start:10, end:12, room:'Amf.1',  type:'Curs',   professor:'Conf. Dr. Iliescu',   color:'bg-rose-500/80 border-rose-400' },
      { id:8, name:'Statistică în Psihologie',   short:'STAT', day:4, start:14, end:16, room:'Lab.PC', type:'Laborator',professor:'Asist. Dănilă',     color:'bg-violet-500/80 border-violet-400' },
      { id:9, name:'Psihologie Clinică',         short:'PCLI', day:5, start:10, end:12, room:'Amf.2',  type:'Curs',   professor:'Prof. Dr. Turliuc',   color:'bg-cyan-500/80 border-cyan-400' },
    ],
    recoverySlots: {
      'Psihologie Generală': [
        { day:1, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Prof. Dr. Turliuc',  total:25, enrolled:24, isMine:true  },
        { day:2, start:10, end:12, room:'S.10',  group:'A2', professor:'Asist. Radu',        total:15, enrolled:15, isMine:false },
        { day:4, start:8,  end:10, room:'S.11',  group:'B1', professor:'Asist. Radu',        total:15, enrolled:11, isMine:false },
      ],
      'Psihopatologie': [
        { day:2, start:8,  end:10, room:'Amf.2', group:'A1', professor:'Conf. Dr. Mîndrilă',total:25, enrolled:22, isMine:true  },
        { day:3, start:10, end:12, room:'S.11',  group:'B1', professor:'Asist. Vornicu',     total:15, enrolled:12, isMine:false },
        { day:5, start:14, end:16, room:'S.10',  group:'B2', professor:'Asist. Vornicu',     total:15, enrolled:9,  isMine:false },
      ],
      'Statistică în Psihologie': [
        { day:1, start:10, end:12, room:'Lab.PC',group:'A1', professor:'Asist. Dănilă',      total:15, enrolled:14, isMine:true  },
        { day:4, start:14, end:16, room:'Lab.PC',group:'B1', professor:'Asist. Dănilă',      total:15, enrolled:11, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Elena Chiriac',  avatar:'EC', offersSubject:'Psihopatologie', offersSlot:{ day:3, start:10, end:12, group:'B1' }, wantsSlot:{ day:2, start:8, end:10, group:'A1' }, message:'Suprapunere cu stagiu la centrul de consiliere', isMatch:true },
      { id:2, name:'Andrei Maxim',   avatar:'AM', offersSubject:'Statistică în Psihologie', offersSlot:{ day:4, start:14, end:16, group:'B1' }, wantsSlot:{ day:1, start:10, end:12, group:'A1' }, message:'Prefer orele de dimineață', isMatch:false },
      { id:3, name:'Laura Iftode',   avatar:'LI', offersSubject:'Psihologie Generală', offersSlot:{ day:2, start:10, end:12, group:'A2' }, wantsSlot:{ day:1, start:8, end:10, group:'A1' }, message:'Marțea am voluntariat la centrul psihiatric', isMatch:true },
    ],
  },

  SPORTS: {
    schedule: [
      { id:1, name:'Teoria Sportului',           short:'TS',   day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',     professor:'Prof. Dr. Cârstea',   color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Atletism',                   short:'ATL',  day:1, start:10, end:12, room:'Teren',  type:'Practică', professor:'Conf. Dr. Macovei',   color:'bg-emerald-500/80 border-emerald-400' },
      { id:3, name:'Fiziologie Sportivă',        short:'FIZS', day:2, start:8,  end:10, room:'Amf.2',  type:'Curs',     professor:'Conf. Dr. Budăcă',    color:'bg-amber-500/80 border-amber-400' },
      { id:4, name:'Biomecanică',                short:'BM',   day:2, start:10, end:12, room:'Lab.Sp', type:'Laborator',professor:'Lect. Dr. Pelin',     color:'bg-violet-500/80 border-violet-400' },
      { id:5, name:'Jocuri Sportive',            short:'JS',   day:3, start:8,  end:12, room:'Sală',   type:'Practică', professor:'Conf. Dr. Macovei',   color:'bg-rose-500/80 border-rose-400' },
      { id:6, name:'Kinetoterapie',              short:'KINE', day:3, start:14, end:16, room:'Lab.Kn', type:'Curs',     professor:'Prof. Dr. Grosu',     color:'bg-cyan-500/80 border-cyan-400' },
      { id:7, name:'Fiziologie Sportivă',        short:'FIZS', day:4, start:8,  end:10, room:'Lab.Sp', type:'Laborator',professor:'Asist. Turcu',        color:'bg-amber-500/80 border-amber-400' },
      { id:8, name:'Kinetoterapie',              short:'KINE', day:4, start:10, end:12, room:'Lab.Kn', type:'Laborator',professor:'Asist. Micu',         color:'bg-cyan-500/80 border-cyan-400' },
      { id:9, name:'Nutriție Sportivă',          short:'NUTR', day:5, start:10, end:12, room:'Amf.1',  type:'Curs',     professor:'Lect. Dr. Ciomag',    color:'bg-pink-500/80 border-pink-400' },
    ],
    recoverySlots: {
      'Fiziologie Sportivă': [
        { day:2, start:8,  end:10, room:'Amf.2',  group:'A1', professor:'Conf. Dr. Budăcă', total:25, enrolled:23, isMine:true  },
        { day:4, start:8,  end:10, room:'Lab.Sp', group:'B1', professor:'Asist. Turcu',     total:15, enrolled:13, isMine:false },
      ],
      'Kinetoterapie': [
        { day:3, start:14, end:16, room:'Lab.Kn', group:'A1', professor:'Prof. Dr. Grosu',  total:20, enrolled:18, isMine:true  },
        { day:4, start:10, end:12, room:'Lab.Kn', group:'B1', professor:'Asist. Micu',      total:20, enrolled:15, isMine:false },
        { day:5, start:14, end:16, room:'Lab.Kn', group:'B2', professor:'Asist. Micu',      total:20, enrolled:12, isMine:false },
      ],
      'Atletism': [
        { day:1, start:10, end:12, room:'Teren',  group:'A1', professor:'Conf. Dr. Macovei',total:20, enrolled:19, isMine:true  },
        { day:3, start:8,  end:10, room:'Teren',  group:'B1', professor:'Asist. Dragnea',   total:20, enrolled:14, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Bogdan Munteanu', avatar:'BM', offersSubject:'Atletism', offersSlot:{ day:3, start:8, end:10, group:'B1' }, wantsSlot:{ day:1, start:10, end:12, group:'A1' }, message:'Miercurea am antrenament la lot', isMatch:true },
      { id:2, name:'Alina Sandu',     avatar:'AS', offersSubject:'Fiziologie Sportivă', offersSlot:{ day:4, start:8, end:10, group:'B1' }, wantsSlot:{ day:2, start:8, end:10, group:'A1' }, message:'Prefer labul de dimineață devreme', isMatch:false },
    ],
  },

  MUSIC: {
    schedule: [
      { id:1, name:'Armonie',                    short:'ARM',  day:1, start:8,  end:10, room:'S.M1',   type:'Curs',     professor:'Prof. Dr. Buciu',     color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Solfegiu',                   short:'SOL',  day:1, start:10, end:12, room:'S.M2',   type:'Seminar',  professor:'Conf. Dr. Pricope',   color:'bg-violet-500/80 border-violet-400' },
      { id:3, name:'Istoria Muzicii',            short:'IM',   day:2, start:8,  end:10, room:'Amf.Muz',type:'Curs',     professor:'Prof. Dr. Iliuț',     color:'bg-amber-500/80 border-amber-400' },
      { id:4, name:'Studiu Individual',          short:'SI',   day:2, start:10, end:14, room:'Salon',  type:'Practică', professor:'—',                   color:'bg-emerald-500/80 border-emerald-400' },
      { id:5, name:'Contrapunct',                short:'CTRP', day:3, start:8,  end:10, room:'S.M1',   type:'Curs',     professor:'Conf. Dr. Buciu',     color:'bg-rose-500/80 border-rose-400' },
      { id:6, name:'Armonie',                    short:'ARM',  day:3, start:10, end:12, room:'S.M3',   type:'Seminar',  professor:'Asist. Vrînceanu',    color:'bg-indigo-500/80 border-indigo-400' },
      { id:7, name:'Muzică de cameră',           short:'MC',   day:4, start:10, end:14, room:'Salon',  type:'Practică', professor:'Prof. Dr. Neagă',     color:'bg-cyan-500/80 border-cyan-400' },
      { id:8, name:'Estetică muzicală',          short:'EM',   day:5, start:10, end:12, room:'Amf.Muz',type:'Curs',     professor:'Conf. Dr. Berindean', color:'bg-pink-500/80 border-pink-400' },
      { id:9, name:'Solfegiu',                   short:'SOL',  day:5, start:12, end:14, room:'S.M2',   type:'Seminar',  professor:'Asist. Tutu',         color:'bg-violet-500/80 border-violet-400' },
    ],
    recoverySlots: {
      'Armonie': [
        { day:1, start:8,  end:10, room:'S.M1',  group:'A1', professor:'Prof. Dr. Buciu',   total:15, enrolled:14, isMine:true  },
        { day:3, start:10, end:12, room:'S.M3',  group:'B1', professor:'Asist. Vrînceanu',  total:10, enrolled:9,  isMine:false },
      ],
      'Solfegiu': [
        { day:1, start:10, end:12, room:'S.M2',  group:'A1', professor:'Conf. Dr. Pricope', total:15, enrolled:15, isMine:true  },
        { day:5, start:12, end:14, room:'S.M2',  group:'B1', professor:'Asist. Tutu',       total:10, enrolled:8,  isMine:false },
      ],
      'Contrapunct': [
        { day:3, start:8,  end:10, room:'S.M1',  group:'A1', professor:'Conf. Dr. Buciu',   total:15, enrolled:12, isMine:true  },
        { day:4, start:8,  end:10, room:'S.M3',  group:'B1', professor:'Asist. Vrînceanu',  total:10, enrolled:7,  isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Mara Dobre',     avatar:'MD', offersSubject:'Solfegiu', offersSlot:{ day:5, start:12, end:14, group:'B1' }, wantsSlot:{ day:1, start:10, end:12, group:'A1' }, message:'Vinerea am repetiție de orchestră', isMatch:true },
      { id:2, name:'Tudor Apostol',  avatar:'TA', offersSubject:'Armonie',  offersSlot:{ day:3, start:10, end:12, group:'B1' }, wantsSlot:{ day:1, start:8, end:10, group:'A1' }, message:'Miercurea am studio de înregistrare', isMatch:false },
    ],
  },

  THEOLOGY: {
    schedule: [
      { id:1, name:'Teologie Dogmatică',         short:'TD',   day:1, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Prof. Dr. Timuș',     color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Teologie Biblică (VT)',      short:'VT',   day:1, start:10, end:12, room:'S.T1',   type:'Seminar',professor:'Conf. Dr. Mihoc',     color:'bg-violet-500/80 border-violet-400' },
      { id:3, name:'Liturgică',                  short:'LIT',  day:2, start:8,  end:10, room:'Amf.2',  type:'Curs',   professor:'Conf. Dr. Buzescu',   color:'bg-amber-500/80 border-amber-400' },
      { id:4, name:'Teologie Dogmatică',         short:'TD',   day:2, start:10, end:12, room:'S.T2',   type:'Seminar',professor:'Asist. Necula',       color:'bg-indigo-500/80 border-indigo-400' },
      { id:5, name:'Patrologie',                 short:'PAT',  day:3, start:8,  end:10, room:'Amf.3',  type:'Curs',   professor:'Prof. Dr. Grigoraș',  color:'bg-emerald-500/80 border-emerald-400' },
      { id:6, name:'Morală Creștină',            short:'MC',   day:3, start:10, end:12, room:'S.T1',   type:'Curs',   professor:'Conf. Dr. Coman',     color:'bg-rose-500/80 border-rose-400' },
      { id:7, name:'Istoria Bisericii',          short:'IB',   day:4, start:8,  end:10, room:'Amf.1',  type:'Curs',   professor:'Conf. Dr. Iftimiu',   color:'bg-cyan-500/80 border-cyan-400' },
      { id:8, name:'Liturgică',                  short:'LIT',  day:4, start:10, end:12, room:'Bis.',   type:'Practică',professor:'Conf. Dr. Buzescu',  color:'bg-amber-500/80 border-amber-400' },
      { id:9, name:'Filosofia Religiei',         short:'FR',   day:5, start:10, end:12, room:'Amf.2',  type:'Curs',   professor:'Lect. Dr. Mladin',    color:'bg-pink-500/80 border-pink-400' },
    ],
    recoverySlots: {
      'Teologie Dogmatică': [
        { day:1, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Prof. Dr. Timuș',   total:25, enrolled:23, isMine:true  },
        { day:2, start:10, end:12, room:'S.T2',  group:'B1', professor:'Asist. Necula',     total:15, enrolled:14, isMine:false },
      ],
      'Liturgică': [
        { day:2, start:8,  end:10, room:'Amf.2', group:'A1', professor:'Conf. Dr. Buzescu', total:25, enrolled:22, isMine:true  },
        { day:4, start:10, end:12, room:'Bis.',  group:'B1', professor:'Asist. Necula',     total:15, enrolled:11, isMine:false },
      ],
      'Patrologie': [
        { day:3, start:8,  end:10, room:'Amf.3', group:'A1', professor:'Prof. Dr. Grigoraș',total:25,enrolled:21, isMine:true  },
        { day:5, start:8,  end:10, room:'S.T1',  group:'B1', professor:'Asist. Necula',     total:15, enrolled:8,  isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Nicolae Bratu',  avatar:'NB', offersSubject:'Liturgică', offersSlot:{ day:4, start:10, end:12, group:'B1' }, wantsSlot:{ day:2, start:8, end:10, group:'A1' }, message:'Joia am slujbă la parohie', isMatch:true },
      { id:2, name:'Ioana Micu',     avatar:'IM', offersSubject:'Patrologie', offersSlot:{ day:5, start:8, end:10, group:'B1' }, wantsSlot:{ day:3, start:8, end:10, group:'A1' }, message:'Prefer miercurea dimineața', isMatch:false },
    ],
  },

  ARCHITECTURE: {
    schedule: [
      { id:1,  name:'Proiect de Arhitectură I',  short:'PA1',  day:1, start:8,  end:14, room:'Atelier', type:'Atelier', professor:'Prof. Dr. Enache',    color:'bg-indigo-500/80 border-indigo-400' },
      { id:2,  name:'Istoria Arhitecturii',      short:'IA',   day:2, start:8,  end:10, room:'Amf.1',  type:'Curs',    professor:'Conf. Dr. Zahariade', color:'bg-violet-500/80 border-violet-400' },
      { id:3,  name:'Geometrie Descriptivă',     short:'GD',   day:2, start:10, end:12, room:'Lab.D',  type:'Laborator',professor:'Asist. Ionescu',     color:'bg-amber-500/80 border-amber-400' },
      { id:4,  name:'Materiale de Construcție',  short:'MC',   day:3, start:8,  end:10, room:'Amf.2',  type:'Curs',    professor:'Conf. Dr. Stroe',     color:'bg-emerald-500/80 border-emerald-400' },
      { id:5,  name:'Proiect de Arhitectură I',  short:'PA1',  day:3, start:10, end:14, room:'Atelier', type:'Atelier', professor:'Prof. Dr. Enache',    color:'bg-indigo-500/80 border-indigo-400' },
      { id:6,  name:'Urbanism',                  short:'URB',  day:4, start:8,  end:10, room:'Amf.1',  type:'Curs',    professor:'Prof. Dr. Pâinescu',  color:'bg-rose-500/80 border-rose-400' },
      { id:7,  name:'Geometrie Descriptivă',     short:'GD',   day:4, start:10, end:12, room:'Lab.D',  type:'Laborator',professor:'Asist. Dima',        color:'bg-amber-500/80 border-amber-400' },
      { id:8,  name:'Urbanism',                  short:'URB',  day:5, start:8,  end:10, room:'S.A1',   type:'Seminar', professor:'Asist. Constantin',   color:'bg-rose-500/80 border-rose-400' },
      { id:9,  name:'Critica de Arhitectură',    short:'CA',   day:5, start:10, end:12, room:'Amf.2',  type:'Seminar', professor:'Conf. Dr. Zahariade', color:'bg-cyan-500/80 border-cyan-400' },
    ],
    recoverySlots: {
      'Istoria Arhitecturii': [
        { day:2, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Conf. Dr. Zahariade',total:20, enrolled:18, isMine:true  },
        { day:5, start:10, end:12, room:'Amf.2', group:'B1', professor:'Conf. Dr. Zahariade',total:20, enrolled:15, isMine:false },
      ],
      'Geometrie Descriptivă': [
        { day:2, start:10, end:12, room:'Lab.D', group:'A1', professor:'Asist. Ionescu',     total:12, enrolled:12, isMine:true  },
        { day:4, start:10, end:12, room:'Lab.D', group:'B1', professor:'Asist. Dima',        total:12, enrolled:10, isMine:false },
      ],
      'Urbanism': [
        { day:4, start:8,  end:10, room:'Amf.1', group:'A1', professor:'Prof. Dr. Pâinescu', total:20, enrolled:17, isMine:true  },
        { day:5, start:8,  end:10, room:'S.A1',  group:'B1', professor:'Asist. Constantin',  total:12, enrolled:9,  isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Diana Tudoran',  avatar:'DT', offersSubject:'Geometrie Descriptivă', offersSlot:{ day:4, start:10, end:12, group:'B1' }, wantsSlot:{ day:2, start:10, end:12, group:'A1' }, message:'Joia am critică de proiect', isMatch:true },
      { id:2, name:'Vlad Popescu',   avatar:'VP', offersSubject:'Urbanism', offersSlot:{ day:5, start:8, end:10, group:'B1' }, wantsSlot:{ day:4, start:8, end:10, group:'A1' }, message:'Vinerea dimineața am workshop de BIM', isMatch:false },
    ],
  },

  THEATER: {
    schedule: [
      { id:1, name:'Arta Actorului',             short:'AA',   day:1, start:8,  end:14, room:'Scenă',  type:'Atelier', professor:'Prof. Mihail Sandu',  color:'bg-indigo-500/80 border-indigo-400' },
      { id:2, name:'Istoria Teatrului',          short:'IT',   day:2, start:8,  end:10, room:'Amf.T',  type:'Curs',    professor:'Conf. Dr. Ionescu',   color:'bg-violet-500/80 border-violet-400' },
      { id:3, name:'Dicție & Voce',             short:'DV',   day:2, start:10, end:12, room:'S.T1',   type:'Seminar', professor:'Lect. Andreescu',     color:'bg-amber-500/80 border-amber-400' },
      { id:4, name:'Mișcare Scenică',           short:'MS',   day:3, start:8,  end:12, room:'Sală',   type:'Practică',professor:'Conf. Florescu',      color:'bg-emerald-500/80 border-emerald-400' },
      { id:5, name:'Arta Actorului',             short:'AA',   day:3, start:14, end:18, room:'Scenă',  type:'Repetiție',professor:'Prof. Mihail Sandu', color:'bg-indigo-500/80 border-indigo-400' },
      { id:6, name:'Dramaturgie',                short:'DRAM', day:4, start:8,  end:10, room:'Amf.T',  type:'Curs',    professor:'Prof. Dr. Papadima',  color:'bg-rose-500/80 border-rose-400' },
      { id:7, name:'Dicție & Voce',             short:'DV',   day:4, start:10, end:12, room:'S.T2',   type:'Seminar', professor:'Asist. Nica',         color:'bg-amber-500/80 border-amber-400' },
      { id:8, name:'Dramaturgie',                short:'DRAM', day:5, start:10, end:12, room:'S.T1',   type:'Seminar', professor:'Asist. Gavrilă',      color:'bg-rose-500/80 border-rose-400' },
      { id:9, name:'Critică Teatrală',          short:'CT',   day:5, start:12, end:14, room:'Amf.T',  type:'Seminar', professor:'Conf. Dr. Ionescu',   color:'bg-cyan-500/80 border-cyan-400' },
    ],
    recoverySlots: {
      'Istoria Teatrului': [
        { day:2, start:8,  end:10, room:'Amf.T', group:'A1', professor:'Conf. Dr. Ionescu',  total:20, enrolled:18, isMine:true  },
        { day:5, start:12, end:14, room:'Amf.T', group:'B1', professor:'Conf. Dr. Ionescu',  total:20, enrolled:14, isMine:false },
      ],
      'Dicție & Voce': [
        { day:2, start:10, end:12, room:'S.T1',  group:'A1', professor:'Lect. Andreescu',    total:10, enrolled:10, isMine:true  },
        { day:4, start:10, end:12, room:'S.T2',  group:'B1', professor:'Asist. Nica',        total:10, enrolled:8,  isMine:false },
      ],
      'Dramaturgie': [
        { day:4, start:8,  end:10, room:'Amf.T', group:'A1', professor:'Prof. Dr. Papadima', total:20, enrolled:16, isMine:true  },
        { day:5, start:10, end:12, room:'S.T1',  group:'B1', professor:'Asist. Gavrilă',     total:15, enrolled:11, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Ioana Ciobanu',  avatar:'IC', offersSubject:'Dicție & Voce', offersSlot:{ day:4, start:10, end:12, group:'B1' }, wantsSlot:{ day:2, start:10, end:12, group:'A1' }, message:'Joia am repetiție pentru spectacolul de absolvire', isMatch:true },
      { id:2, name:'Petru Vlad',     avatar:'PV', offersSubject:'Dramaturgie', offersSlot:{ day:5, start:10, end:12, group:'B1' }, wantsSlot:{ day:4, start:8, end:10, group:'A1' }, message:'Prefer să am materiile de teorie dimineața', isMatch:false },
    ],
  },

  MATH_CS: {
    schedule: [
      { id:1,  name:'Analiză Matematică',          short:'AM',   day:1, start:8,  end:10, room:'Amf. C1', type:'Curs',     professor:'Prof. Dr. Vasile Ene',        color:'bg-indigo-500/80 border-indigo-400' },
      { id:2,  name:'Algebră Liniară',             short:'AL',   day:1, start:10, end:12, room:'Amf. C2', type:'Seminar',  professor:'Conf. Dr. Luminița Dumitriu', color:'bg-violet-500/80 border-violet-400' },
      { id:3,  name:'Programare Orientată Obiect', short:'POO',  day:2, start:8,  end:10, room:'Amf. A1', type:'Curs',     professor:'Conf. Dr. Mihai Gavriluț',    color:'bg-emerald-500/80 border-emerald-400' },
      { id:4,  name:'Programare Orientată Obiect', short:'POO',  day:2, start:10, end:12, room:'Lab. 1',  type:'Laborator',professor:'Asist. Dr. Andrei Cucoș',     color:'bg-emerald-500/80 border-emerald-400' },
      { id:5,  name:'Structuri de Date',           short:'SD',   day:3, start:8,  end:10, room:'Amf. A2', type:'Curs',     professor:'Prof. Dr. Ioan Leustean',     color:'bg-amber-500/80 border-amber-400' },
      { id:6,  name:'Structuri de Date',           short:'SD',   day:3, start:10, end:12, room:'Lab. 2',  type:'Laborator',professor:'Asist. Dr. Andrei Cucoș',     color:'bg-amber-500/80 border-amber-400' },
      { id:7,  name:'Probabilități & Statistică',  short:'PS',   day:4, start:8,  end:10, room:'Amf. C3', type:'Curs',     professor:'Conf. Dr. Luminița Dumitriu', color:'bg-rose-500/80 border-rose-400' },
      { id:8,  name:'Baze de Date',                short:'BD',   day:4, start:10, end:12, room:'Lab. 3',  type:'Laborator',professor:'Conf. Dr. Mihai Gavriluț',    color:'bg-cyan-500/80 border-cyan-400' },
      { id:9,  name:'Geometrie Analitică',         short:'GA',   day:5, start:8,  end:10, room:'Amf. C2', type:'Seminar',  professor:'Conf. Dr. Luminița Dumitriu', color:'bg-pink-500/80 border-pink-400' },
      { id:10, name:'Ecuații Diferențiale',        short:'ED',   day:5, start:10, end:12, room:'Amf. C1', type:'Curs',     professor:'Prof. Dr. Vasile Ene',        color:'bg-teal-500/80 border-teal-400' },
    ],
    recoverySlots: {
      'Analiză Matematică': [
        { day:1, start:8,  end:10, room:'Amf. C1', group:'A1', professor:'Prof. Dr. Vasile Ene',       total:28, enrolled:26, isMine:true  },
        { day:3, start:14, end:16, room:'S. C4',   group:'A2', professor:'Asist. Nechita',             total:18, enrolled:15, isMine:false },
        { day:5, start:14, end:16, room:'S. C3',   group:'B1', professor:'Asist. Nechita',             total:18, enrolled:11, isMine:false },
      ],
      'Structuri de Date': [
        { day:3, start:8,  end:10, room:'Amf. A2', group:'A1', professor:'Prof. Dr. Ioan Leustean',    total:28, enrolled:25, isMine:true  },
        { day:4, start:14, end:16, room:'Lab. 2',  group:'B1', professor:'Asist. Dr. Andrei Cucoș',   total:14, enrolled:12, isMine:false },
        { day:5, start:12, end:14, room:'Lab. 1',  group:'B2', professor:'Asist. Dr. Andrei Cucoș',   total:14, enrolled:9,  isMine:false },
      ],
      'Probabilități & Statistică': [
        { day:4, start:8,  end:10, room:'Amf. C3', group:'A1', professor:'Conf. Dr. Luminița Dumitriu', total:28, enrolled:22, isMine:true  },
        { day:2, start:14, end:16, room:'S. C4',   group:'B1', professor:'Asist. Nechita',             total:18, enrolled:13, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Alexandru Buza',  avatar:'AB', offersSubject:'Structuri de Date',      offersSlot:{ day:4, start:14, end:16, group:'B1' }, wantsSlot:{ day:3, start:8, end:10, group:'A1' }, message:'Joia am activitate de cercetare', isMatch:true },
      { id:2, name:'Ioana Munteanu',  avatar:'IM', offersSubject:'Analiză Matematică',     offersSlot:{ day:5, start:14, end:16, group:'B1' }, wantsSlot:{ day:1, start:8, end:10, group:'A1' }, message:'Prefer seminarul de dimineață', isMatch:false },
      { id:3, name:'Radu Croitoru',   avatar:'RC', offersSubject:'Probabilități & Statistică', offersSlot:{ day:2, start:14, end:16, group:'B1' }, wantsSlot:{ day:4, start:8, end:10, group:'A1' }, message:'Marțea am tutoriat la facultate', isMatch:true },
    ],
  },

  ENGINEERING_CS_CTI: {
    schedule: [
      { id:1,  name:'Programare Orientată pe Obiecte', short:'POO',  day:1, start:8,  end:10, room:'Amf. AC0-1',  type:'Curs',     professor:'Conf. dr. ing. Andrei Stan',         color:'bg-indigo-500/80 border-indigo-400', group:'CTI-A1' },
      { id:2,  name:'Programare Orientată pe Obiecte', short:'POO',  day:1, start:12, end:14, room:'Lab. C1-1',   type:'Laborator',professor:'Ș.l. dr. ing. Cristian Aflori',       color:'bg-indigo-500/80 border-indigo-400', group:'CTI-A1' },
      { id:3,  name:'Electronică Digitală',            short:'ED',   day:2, start:8,  end:10, room:'Amf. AC0-2',  type:'Curs',     professor:'Prof. dr. ing. Mircea Hulea',         color:'bg-violet-500/80 border-violet-400', group:'CTI-A1' },
      { id:4,  name:'Teoria Sistemelor',               short:'TS',   day:2, start:10, end:12, room:'Amf. AC0-1',  type:'Curs',     professor:'Conf. dr. ing. Anca Maxim',           color:'bg-amber-500/80 border-amber-400',   group:'CTI-A1' },
      { id:5,  name:'Statistică și Prelucrarea Datelor',short:'SPD', day:3, start:8,  end:10, room:'Amf. AC0-2',  type:'Curs',     professor:'Conf. dr. ing. Lavinia Ferariu',      color:'bg-emerald-500/80 border-emerald-400',group:'CTI-A1' },
      { id:6,  name:'Programare în Limbaj de Asamblare',short:'ASM', day:3, start:12, end:14, room:'Lab. C1-3',   type:'Laborator',professor:'Ș.l. dr. ing. Mihai Timiș',          color:'bg-rose-500/80 border-rose-400',     group:'CTI-A1' },
      { id:7,  name:'Dispozitive și Electronică Analogică',short:'DEA',day:4,start:8, end:10, room:'Amf. AC0-1',  type:'Curs',     professor:'Prof. dr. ing. Robert Gabriel Lupu',  color:'bg-cyan-500/80 border-cyan-400',     group:'CTI-A1' },
      { id:8,  name:'Electronică Digitală',            short:'ED',   day:4, start:12, end:14, room:'Lab. C2-1',   type:'Laborator',professor:'Ș.l. dr. ing. Alexandru Archip',     color:'bg-violet-500/80 border-violet-400', group:'CTI-A1' },
      { id:9,  name:'Teoria Sistemelor',               short:'TS',   day:5, start:10, end:12, room:'S. A1-5',     type:'Seminar',  professor:'Asist. drd. ing. Sofia Huștiu',      color:'bg-amber-500/80 border-amber-400',   group:'CTI-A1' },
      { id:10, name:'Statistică și Prelucrarea Datelor',short:'SPD', day:5, start:14, end:16, room:'S. A1-7',     type:'Seminar',  professor:'Asist. drd. ing. Ioana Huștiu',      color:'bg-emerald-500/80 border-emerald-400',group:'CTI-A1' },
    ],
    recoverySlots: {
      'Programare Orientată pe Obiecte': [
        { day:1, start:8,  end:10, room:'Amf. AC0-1', group:'CTI-A1', professor:'Conf. dr. ing. Andrei Stan',   total:30, enrolled:28, isMine:true  },
        { day:2, start:14, end:16, room:'Lab. C1-2',  group:'CTI-A2', professor:'Ș.l. dr. ing. Cristian Aflori', total:16, enrolled:14, isMine:false },
        { day:4, start:16, end:18, room:'Lab. C1-1',  group:'CTI-B1', professor:'Ș.l. dr. ing. Cristian Aflori', total:16, enrolled:11, isMine:false },
      ],
      'Electronică Digitală': [
        { day:2, start:8,  end:10, room:'Amf. AC0-2', group:'CTI-A1', professor:'Prof. dr. ing. Mircea Hulea',   total:30, enrolled:27, isMine:true  },
        { day:3, start:10, end:12, room:'Lab. C2-1',  group:'CTI-A2', professor:'Ș.l. dr. ing. Alexandru Archip',total:16, enrolled:15, isMine:false },
        { day:5, start:14, end:16, room:'Lab. C2-2',  group:'CTI-B1', professor:'Ș.l. dr. ing. Alexandru Archip',total:16, enrolled:9,  isMine:false },
      ],
      'Teoria Sistemelor': [
        { day:2, start:10, end:12, room:'Amf. AC0-1', group:'CTI-A1', professor:'Conf. dr. ing. Anca Maxim',     total:30, enrolled:24, isMine:true  },
        { day:5, start:10, end:12, room:'S. A1-5',    group:'CTI-A2', professor:'Asist. drd. ing. Sofia Huștiu', total:18, enrolled:16, isMine:false },
        { day:4, start:14, end:16, room:'S. A1-6',    group:'CTI-B1', professor:'Asist. drd. ing. Sofia Huștiu', total:18, enrolled:12, isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Radu Botnari',    avatar:'RB', offersSubject:'Programare Orientată pe Obiecte', offersSlot:{ day:2, start:14, end:16, group:'CTI-A2' }, wantsSlot:{ day:1, start:8, end:10, group:'CTI-A1' }, message:'Suprapunere cu laborator de Electronică', isMatch:true },
      { id:2, name:'Elena Ciobanu',   avatar:'EC', offersSubject:'Electronică Digitală',           offersSlot:{ day:3, start:10, end:12, group:'CTI-A2' }, wantsSlot:{ day:2, start:8, end:10, group:'CTI-A1' }, message:'Prefer joia dimineața', isMatch:false },
      { id:3, name:'Andrei Toma',     avatar:'AT', offersSubject:'Teoria Sistemelor',              offersSlot:{ day:5, start:10, end:12, group:'CTI-A2' }, wantsSlot:{ day:2, start:10, end:12, group:'CTI-A1' }, message:'Se suprapune cu seminarul de SPD', isMatch:true },
    ],
  },

  ENGINEERING_CS_IS: {
    schedule: [
      { id:1,  name:'Metode Numerice',                    short:'MN',   day:1, start:8,  end:10, room:'Amf. AC0-1',  type:'Curs',     professor:'Conf. dr. ing. Carlos-Mihai Pascal',  color:'bg-indigo-500/80 border-indigo-400', group:'IS-A1' },
      { id:2,  name:'Structuri de Date și Algoritmi',     short:'SDA',  day:1, start:12, end:14, room:'Lab. C1-2',   type:'Laborator',professor:'Ș.l. dr. ing. Florin Brăescu',        color:'bg-violet-500/80 border-violet-400', group:'IS-A1' },
      { id:3,  name:'Electronică Digitală',               short:'ED',   day:2, start:8,  end:10, room:'Amf. AC0-2',  type:'Curs',     professor:'Prof. dr. ing. Mircea Hulea',          color:'bg-amber-500/80 border-amber-400',   group:'IS-A1' },
      { id:4,  name:'Matematici Speciale',                short:'MS',   day:2, start:10, end:12, room:'Amf. AC0-1',  type:'Curs',     professor:'Conf. dr. ing. Lavinia Ferariu',       color:'bg-emerald-500/80 border-emerald-400',group:'IS-A1' },
      { id:5,  name:'Analiza și Sinteza Dispozitivelor Numerice',short:'ASDN',day:3,start:10,end:12,room:'Lab. C2-3',type:'Laborator',professor:'Ș.l. dr. ing. Silviu Ostafi',          color:'bg-rose-500/80 border-rose-400',     group:'IS-A1' },
      { id:6,  name:'Modelarea Sistemelor Fizice',        short:'MSF',  day:3, start:12, end:14, room:'Amf. AC0-2',  type:'Curs',     professor:'Prof. dr. ing. Marius Kloetzer',       color:'bg-cyan-500/80 border-cyan-400',     group:'IS-A1' },
      { id:7,  name:'Structuri de Date și Algoritmi',     short:'SDA',  day:4, start:8,  end:10, room:'Amf. AC0-1',  type:'Curs',     professor:'Conf. dr. ing. Cristina Budaciu',      color:'bg-violet-500/80 border-violet-400', group:'IS-A1' },
      { id:8,  name:'Electronică Digitală',               short:'ED',   day:4, start:12, end:14, room:'S. A1-4',     type:'Seminar',  professor:'Asist. drd. ing. Rareș Crăciun',      color:'bg-amber-500/80 border-amber-400',   group:'IS-A1' },
      { id:9,  name:'Metode Numerice',                    short:'MN',   day:5, start:10, end:12, room:'S. A1-6',     type:'Seminar',  professor:'Asist. drd. ing. Angela Nagîț',        color:'bg-indigo-500/80 border-indigo-400', group:'IS-A1' },
      { id:10, name:'Modelarea Sistemelor Fizice',        short:'MSF',  day:5, start:14, end:16, room:'Lab. A1-1',   type:'Laborator',professor:'Asist. drd. ing. Teodor Sauciuc',      color:'bg-cyan-500/80 border-cyan-400',     group:'IS-A1' },
    ],
    recoverySlots: {
      'Structuri de Date și Algoritmi': [
        { day:4, start:8,  end:10, room:'Amf. AC0-1', group:'IS-A1', professor:'Conf. dr. ing. Cristina Budaciu', total:28, enrolled:26, isMine:true  },
        { day:2, start:14, end:16, room:'Lab. C1-2',  group:'IS-A2', professor:'Ș.l. dr. ing. Florin Brăescu',   total:16, enrolled:14, isMine:false },
        { day:5, start:14, end:16, room:'Lab. C1-3',  group:'IS-B1', professor:'Ș.l. dr. ing. Florin Brăescu',   total:16, enrolled:10, isMine:false },
      ],
      'Metode Numerice': [
        { day:1, start:8,  end:10, room:'Amf. AC0-1', group:'IS-A1', professor:'Conf. dr. ing. Carlos-Mihai Pascal', total:28, enrolled:25, isMine:true  },
        { day:5, start:10, end:12, room:'S. A1-6',    group:'IS-A2', professor:'Asist. drd. ing. Angela Nagîț',      total:18, enrolled:15, isMine:false },
        { day:3, start:14, end:16, room:'S. A1-5',    group:'IS-B1', professor:'Asist. drd. ing. Angela Nagîț',      total:18, enrolled:11, isMine:false },
      ],
      'Modelarea Sistemelor Fizice': [
        { day:3, start:12, end:14, room:'Amf. AC0-2', group:'IS-A1', professor:'Prof. dr. ing. Marius Kloetzer',     total:28, enrolled:23, isMine:true  },
        { day:5, start:14, end:16, room:'Lab. A1-1',  group:'IS-A2', professor:'Asist. drd. ing. Teodor Sauciuc',    total:16, enrolled:13, isMine:false },
        { day:4, start:14, end:16, room:'Lab. A1-2',  group:'IS-B1', professor:'Asist. drd. ing. Teodor Sauciuc',    total:16, enrolled:9,  isMine:false },
      ],
    },
    swapRequests: [
      { id:1, name:'Iulia Botezatu',  avatar:'IB', offersSubject:'Structuri de Date și Algoritmi', offersSlot:{ day:2, start:14, end:16, group:'IS-A2' }, wantsSlot:{ day:4, start:8, end:10, group:'IS-A1' }, message:'Suprapunere cu laborator de Electronică Digitală', isMatch:true },
      { id:2, name:'Mihai Stănescu',  avatar:'MS', offersSubject:'Metode Numerice',               offersSlot:{ day:5, start:10, end:12, group:'IS-A2' }, wantsSlot:{ day:1, start:8, end:10, group:'IS-A1' }, message:'Prefer lunea dimineața', isMatch:false },
      { id:3, name:'Diana Moraru',    avatar:'DM', offersSubject:'Modelarea Sistemelor Fizice',   offersSlot:{ day:5, start:14, end:16, group:'IS-A2' }, wantsSlot:{ day:3, start:12, end:14, group:'IS-A1' }, message:'Joia am antrenament', isMatch:true },
    ],
  },
}

// ── Professors by faculty type ─────────────────────────────────────────────────
const EXTRA_PROFESSORS = {
  LAW: [
    { id:101, name:'Prof. Dr. Alexandru Balan',    title:'Profesor universitar',     domain:'Drept Civil & Procesual',      tags:['Succesiuni','Contracte','Răspundere civilă'],          available:true,  slotsLeft:3, totalSlots:6, minGrade:8.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Răspunderea civilă delictuală în mediu digital',year:2024},{title:'Simularea actelor juridice în jurisprudența românească',year:2023}], contact:'Email', avatar:'AB', color:'from-indigo-600 to-blue-600', requirementsNote:'Solicită un referat de 2 pagini cu tema propusă și bibliografie. CV recomandat la prima întâlnire.' },
    { id:102, name:'Conf. Dr. Mihai Rusu',         title:'Conferențiar universitar',  domain:'Drept Penal & Criminologie',   tags:['Criminalitate organizată','Drept penal european','Victimologie'], available:true, slotsLeft:2, totalSlots:5, minGrade:8.5, language:'Română / Franceză', acceptsOther:false, previousTheses:[{title:'Traficul de persoane — politici penale europene',year:2024},{title:'Discernământul în dreptul penal român',year:2023}], contact:'Teams', avatar:'MR', color:'from-violet-600 to-purple-600', requirementsNote:'Necesită extras de studii și o scrisoare de intenție motivată. Preferă teme cu aplicabilitate europeană.' },
    { id:103, name:'Prof. Dr. Elena Mrejeru',      title:'Profesor universitar',     domain:'Drept Constituțional & European',tags:['Drepturi fundamentale','Drept UE','Contencios constituțional'], available:true, slotsLeft:2, totalSlots:4, minGrade:9.0, language:'Română / Engleză', acceptsOther:true, previousTheses:[{title:'Limitele suveranității în dreptul UE',year:2024},{title:'Controlul constituționalității legilor',year:2023}], contact:'Secretariat', avatar:'EM', color:'from-amber-600 to-orange-600', requirementsNote:'Solicită cunoașterea limbii engleze sau franceze și un plan de cercetare de 1 pagină cu surse propuse.' },
    { id:104, name:'Conf. Dr. Ion Paraschiv',      title:'Conferențiar universitar',  domain:'Drept Roman & Istoria Dr.',    tags:['Drept privat roman','Drept medieval','Istoriografie juridică'], available:true, slotsLeft:4, totalSlots:6, minGrade:7.5, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Instituții romaniste în Codul Civil actual',year:2024},{title:'Receptarea dreptului roman în Moldova medievală',year:2023}], contact:'Email', avatar:'IP', color:'from-emerald-600 to-teal-600', requirementsNote:'Acceptă teme din orice perioadă juridică. CV și extras de studii la prima întâlnire.' },
  ],
  GEOGRAPHY: [
    { id:201, name:'Prof. Dr. Ionel Ungureanu',    title:'Profesor universitar',     domain:'Geografie Fizică & Geomorfologie', tags:['Geomorfologie fluvială','Hazarde naturale','Teren'],  available:true,  slotsLeft:2, totalSlots:5, minGrade:8.0, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Dinamica albiei Prutului în context climatic',year:2024},{title:'Procesele de eroziune în Podișul Moldovei',year:2023}], contact:'Email', avatar:'IU', color:'from-emerald-600 to-green-600', requirementsNote:'Solicită experiență de teren sau un proiect GIS demonstrabil. CV obligatoriu la prima întâlnire.' },
    { id:202, name:'Conf. Dr. Mihai Niculiță',     title:'Conferențiar universitar',  domain:'Cartografie & GIS',             tags:['QGIS','Teledetecție','Modele digitale de teren'],       available:true,  slotsLeft:3, totalSlots:6, minGrade:7.5, language:'Română / Engleză', acceptsOther:false, previousTheses:[{title:'Cartare automată cu GIS și ML pentru alunecări',year:2024},{title:'Analiza peisajului prin imagini Sentinel-2',year:2024}], contact:'Teams', avatar:'MN', color:'from-blue-600 to-cyan-600', requirementsNote:'Necesită cunoașterea QGIS sau ArcGIS. Portofoliu de hărți sau analize raster este un avantaj.' },
    { id:203, name:'Conf. Dr. Dumitru Apostol',    title:'Conferențiar universitar',  domain:'Climatologie & Mediu',          tags:['Schimbări climatice','Precipitații extreme','Aridity'], available:true,  slotsLeft:1, totalSlots:4, minGrade:8.5, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Seceta în estul României — indici și tendințe',year:2024},{title:'Variabilitate pluviometrică în Moldova',year:2023}], contact:'Email', avatar:'DA', color:'from-amber-600 to-yellow-600', requirementsNote:'Acceptă teme cu seturi de date climatice publice. Plan de lucru de 1 pagină la prima întâlnire.' },
    { id:204, name:'Prof. Dr. Ionel Ioniță',       title:'Profesor universitar',     domain:'Geomorfologie & Hazarde',       tags:['Alunecări de teren','Eroziune','Gullying'],              available:false, slotsLeft:0, totalSlots:4, minGrade:9.0, language:'Română',          acceptsOther:false, previousTheses:[{title:'Ravinele din Colinele Tutovei',year:2023},{title:'Răspunsul versanților la precipitații extreme',year:2022}], contact:'Email', avatar:'II', color:'from-rose-600 to-red-600', requirementsNote:'Nu mai acceptă cereri pentru sesiunea curentă. Contactează secretariatul pentru sesiunile viitoare.' },
  ],
  PSYCHOLOGY: [
    { id:301, name:'Prof. Dr. Maria Turliuc',      title:'Profesor universitar',     domain:'Psihologie Clinică & Cuplu',    tags:['Terapie de cuplu','Atașament','Psihopatologie relaț.'], available:true,  slotsLeft:2, totalSlots:5, minGrade:8.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Anxietatea de separare la adulți — modele de atașament',year:2024},{title:'Satisfacția conjugală și comunicarea interpersonală',year:2023}], contact:'Teams', avatar:'MT', color:'from-violet-600 to-purple-600', requirementsNote:'Solicită un plan de cercetare sumar și CV. Experiența de voluntariat clinic sau de consiliere este un avantaj.' },
    { id:302, name:'Conf. Dr. Mihaela Mîndrilă',  title:'Conferențiar universitar',  domain:'Psihopatologie & Sănătate mentală', tags:['Depresie','Tulburări anxioase','CBT'], available:true, slotsLeft:3, totalSlots:6, minGrade:8.0, language:'Română',          acceptsOther:false, previousTheses:[{title:'Eficacitatea terapiei CBT în depresia majoră',year:2024},{title:'Burnout la studenți — predictori și intervenții',year:2024}], contact:'Email', avatar:'MM', color:'from-indigo-600 to-blue-600', requirementsNote:'CV obligatoriu. Preferă teme cu componentă empirică (chestionar, interviu clinic sau protocol de intervenție).' },
    { id:303, name:'Prof. Dr. Ștefan Boncu',       title:'Profesor universitar',     domain:'Psihologie Socială & Cognitivă',tags:['Influență socială','Persuasiune','Procese cognitive'],  available:true,  slotsLeft:1, totalSlots:4, minGrade:9.0, language:'Română / Engleză', acceptsOther:true, previousTheses:[{title:'Efectul martorului pasiv în era digitală',year:2024},{title:'Stereotipuri și discriminare implicită',year:2023}], contact:'Email', avatar:'SB', color:'from-emerald-600 to-teal-600', requirementsNote:'Necesită plan de cercetare de 1 pagină cu design metodologic propus și ipoteze de cercetare.' },
    { id:304, name:'Conf. Dr. Daniel Iliescu',     title:'Conferențiar universitar',  domain:'Neuropsihologie & Evaluare',    tags:['Teste cognitive','Evaluare clinică','WAIS','Q-Sort'],   available:true,  slotsLeft:2, totalSlots:5, minGrade:7.5, language:'Română / Engleză', acceptsOther:false, previousTheses:[{title:'Profil neuropsihologic în ADHD la adulți',year:2024},{title:'Validarea baterii de evaluare cognitivă RO-MOCA',year:2023}], contact:'Teams', avatar:'DI', color:'from-amber-600 to-orange-600', requirementsNote:'Solicită CV cu experiență în testare psihologică. Colaborarea cu clinici partenere este posibilă.' },
  ],
  SPORTS: [
    { id:401, name:'Prof. Dr. Elena Cârstea',      title:'Profesor universitar',     domain:'Teoria Educației Fizice',       tags:['Pedagogie sport','Curriculum EFS','Didactica EF'],      available:true,  slotsLeft:3, totalSlots:6, minGrade:7.5, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Optimizarea programei de EFS în liceu',year:2024},{title:'Motivația intrinsecă la elevii sportivi',year:2023}], contact:'Email', avatar:'EC', color:'from-emerald-600 to-green-600', requirementsNote:'Acceptă teme cu aplicație practică în școli sau cluburi sportive. CV și scrisoare de intenție la prima întâlnire.' },
    { id:402, name:'Prof. Dr. Emil Grosu',         title:'Profesor universitar',     domain:'Kinetoterapie & Recuperare',    tags:['Recuperare ortopedică','Biomecanică','Protocoale fizioterapie'], available:true, slotsLeft:2, totalSlots:5, minGrade:8.0, language:'Română', acceptsOther:false, previousTheses:[{title:'Recuperarea după ruptura LCA la sportivi de performanță',year:2024},{title:'Sindromul burnout la sportivi — intervenție kinetică',year:2023}], contact:'Teams', avatar:'EG', color:'from-blue-600 to-cyan-600', requirementsNote:'Solicită cunoștințe de anatomie funcțională și un caz clinic propus sau protocol de recuperare schițat.' },
    { id:403, name:'Conf. Dr. Simona Macovei',     title:'Conferențiar universitar',  domain:'Antrenament Sportiv & Jocuri', tags:['Periodizare','Fotbal','Handbal','Anduranță'],             available:true,  slotsLeft:4, totalSlots:6, minGrade:7.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Periodizarea antrenamentului la juniori',year:2024},{title:'Tehnici de joc în handbalul feminin de performanță',year:2023}], contact:'Email', avatar:'SM', color:'from-amber-600 to-yellow-600', requirementsNote:'Acceptă teme cu analiză de performanță sportivă. Experiența în sport de performanță este un avantaj.' },
    { id:404, name:'Lect. Dr. Radu Ciomag',        title:'Lector universitar',       domain:'Nutriție Sportivă & Suplim.',   tags:['Macronutrienți','Ergogeni','Compoziție corporală'],      available:true,  slotsLeft:3, totalSlots:5, minGrade:7.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Protocoale de nutriție periodizată la halterofili',year:2024},{title:'Hidratarea și performanța aerobă',year:2023}], contact:'Email', avatar:'RC', color:'from-rose-600 to-pink-600', requirementsNote:'Necesită baze solide de nutriție sportivă. Plan de cercetare și CV la prima întâlnire.' },
  ],
  MUSIC: [
    { id:501, name:'Prof. Dr. Mihai Buciu',        title:'Profesor universitar',     domain:'Armonie & Contrapunct',         tags:['Armonie tonală','Contrapunct modal','Analiză muzicală'], available:true,  slotsLeft:2, totalSlots:4, minGrade:8.5, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Structuri polifonice în muzica românească interbelică',year:2024},{title:'Armonizarea modurilor folclorice autohtone',year:2023}], contact:'Email', avatar:'MB', color:'from-violet-600 to-purple-600', requirementsNote:'Solicită o lucrare muzicală proprie (armonizare sau compoziție scurtă) ca exemplu de capacitate.' },
    { id:502, name:'Prof. Dr. Vasile Iliuț',       title:'Profesor universitar',     domain:'Istoria Muzicii Universale',    tags:['Baroc','Romantism','Muzică contemporană'],               available:true,  slotsLeft:3, totalSlots:5, minGrade:8.0, language:'Română / Franceză', acceptsOther:false, previousTheses:[{title:'Recepția operei wagneriene în România',year:2024},{title:'Influența impresionismului francez în muzica românească',year:2023}], contact:'Teams', avatar:'VI', color:'from-amber-600 to-yellow-600', requirementsNote:'Necesită un referat inițial de 2 pagini despre tema aleasă cu surse bibliografice muzicologice.' },
    { id:503, name:'Conf. Dr. Luminița Pricope',   title:'Conferențiar universitar',  domain:'Solfegiu & Teoria Muzicii',    tags:['Dicțeuri muzicale','Ritmică','Percepție auditivă'],      available:true,  slotsLeft:4, totalSlots:6, minGrade:7.5, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Metode active de predare a solfegiului',year:2024},{title:'Audierea dirijată și formarea urechi muzicale',year:2023}], contact:'Email', avatar:'LP', color:'from-emerald-600 to-teal-600', requirementsNote:'Acceptă teme pedagogice sau de cercetare didactică muzicală. CV și scrisoare de intenție.' },
  ],
  THEOLOGY: [
    { id:601, name:'Prof. Dr. Vasile Timuș',       title:'Profesor universitar',     domain:'Teologie Dogmatică & Ecumenism',tags:['Hristologie','Ecclesiologie','Dialog ecumenic'],         available:true,  slotsLeft:3, totalSlots:5, minGrade:8.0, language:'Română / Greacă', acceptsOther:true,  previousTheses:[{title:'Filioque — teologie comparată est-vest',year:2024},{title:'Unitatea Bisericii în eclesiologia ortodoxă contemporană',year:2023}], contact:'Email', avatar:'VT', color:'from-indigo-600 to-blue-600', requirementsNote:'Solicită un referat teologic de 2 pagini cu tema și bibliografie patristică și contemporană.' },
    { id:602, name:'Conf. Dr. Ioan Mihoc',         title:'Conferențiar universitar',  domain:'Teologie Biblică & Exegeză',   tags:['Exegeză NT','Limbă greacă biblică','Hermeneutică'],     available:true,  slotsLeft:2, totalSlots:4, minGrade:8.5, language:'Română / Greacă', acceptsOther:false, previousTheses:[{title:'Parabolele sinoptice — lectură narativă',year:2024},{title:'Conceptul de δικαιοσύνη în Epistola către Romani',year:2023}], contact:'Email', avatar:'IM', color:'from-violet-600 to-purple-600', requirementsNote:'Necesită cunoașterea limbii grecești biblice. Plan de exegeză propus și surse patristice la prima întâlnire.' },
    { id:603, name:'Prof. Dr. Constantin Grigoraș',title:'Profesor universitar',     domain:'Patrologie & Spiritualitate',  tags:['Părinți răsăriteni','Isihasm','Ascetica ortodoxă'],     available:true,  slotsLeft:2, totalSlots:4, minGrade:8.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Theologia corpului la Sf. Ioan Damaschin',year:2024},{title:'Rugăciunea lui Iisus — tradiție și actualitate',year:2023}], contact:'Teams', avatar:'CG', color:'from-amber-600 to-orange-600', requirementsNote:'Acceptă teme din patristica răsăriteană și occidentală. CV și propunere motivată de temă.' },
    { id:604, name:'Conf. Dr. Dumitru Buzescu',    title:'Conferențiar universitar',  domain:'Liturgică & Tipic',            tags:['Euharistie','Rânduiala slujbelor','Artă sacră'],         available:true,  slotsLeft:4, totalSlots:6, minGrade:7.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Reforma liturgică în ortodoxia secolului XX',year:2024},{title:'Muzica psaltică și rolul ei liturgic',year:2023}], contact:'Email', avatar:'DB', color:'from-emerald-600 to-teal-600', requirementsNote:'Solicită un plan preliminar de temă. Acceptă studenți de la toate specializările teologice.' },
  ],
  ARCHITECTURE: [
    { id:701, name:'Prof. Dr. Augustin Enache',    title:'Profesor universitar',     domain:'Proiectare Arhitecturală',      tags:['Design contemporan','Sustenabilitate','BIM'],            available:true,  slotsLeft:2, totalSlots:4, minGrade:8.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Arhitectura vernaculară ca sursă de sustenabilitate',year:2024},{title:'Reabilitarea clădirilor socialiste prin design pasiv',year:2023}], contact:'Email', avatar:'AE', color:'from-indigo-600 to-violet-600', requirementsNote:'Solicită un portofoliu de proiecte și o schiță a conceptului de diplomă propus.' },
    { id:702, name:'Conf. Dr. Ana Zahariade',      title:'Conferențiar universitar',  domain:'Istoria Arhitecturii & Critic', tags:['Modernism românesc','Teoria arhitecturii','Patrimoniu'],available:true,  slotsLeft:3, totalSlots:6, minGrade:7.5, language:'Română / Franceză', acceptsOther:false, previousTheses:[{title:'Impactul ideologiei asupra arhitecturii bucureștene',year:2024},{title:'Utopie urbană în România comunistă',year:2023}], contact:'Teams', avatar:'AZ', color:'from-amber-600 to-orange-600', requirementsNote:'Necesită un referat de 2 pagini cu tema și sursele propuse. CV cu proiecte relevante.' },
    { id:703, name:'Prof. Dr. Tiberiu Pâinescu',   title:'Profesor universitar',     domain:'Urbanism & Planificare',        tags:['Plan urbanistic general','Spațiu public','Smart city'],  available:false, slotsLeft:0, totalSlots:4, minGrade:9.0, language:'Română',          acceptsOther:false, previousTheses:[{title:'Regenerarea centrelor istorice din orașele mici',year:2023},{title:'Mobilitate sustenabilă și morfologie urbană',year:2022}], contact:'Secretariat', avatar:'TP', color:'from-emerald-600 to-green-600', requirementsNote:'Nu mai acceptă cereri pentru sesiunea curentă. Contactează secretariatul pentru sesiunile viitoare.' },
    { id:704, name:'Lect. Dr. Ruxandra Stroe',     title:'Lector universitar',       domain:'Materiale & Tehnologii',        tags:['Materiale inovative','Fațade','Construcție sustenabilă'],available:true,  slotsLeft:3, totalSlots:5, minGrade:7.0, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Materialele biogene în construcțiile contemporane',year:2024},{title:'Performanța termică a anvelopelor ventilate',year:2023}], contact:'Email', avatar:'RS', color:'from-rose-600 to-pink-600', requirementsNote:'Acceptă teme cu componente tehnice inovative. Portofoliu de proiecte și CV la prima întâlnire.' },
  ],
  THEATER: [
    { id:801, name:'Prof. Mihail Sandu',            title:'Profesor, Artist Emerit',  domain:'Arta Actorului & Regie',       tags:['Stanislavski','Regie teatrală','Actorie de film'],       available:true,  slotsLeft:2, totalSlots:4, minGrade:8.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Corpul actorului ca instrument — tehnici contemporane',year:2024},{title:'Autenticitate și convențional în actoria realistă',year:2023}], contact:'Secretariat', avatar:'MS', color:'from-indigo-600 to-blue-600', requirementsNote:'Solicită o schiță de proiect artistic (concept de spectacol sau analiză de rol) și CV cu activitate teatrală.' },
    { id:802, name:'Conf. Dr. Liviu Ionescu',       title:'Conferențiar universitar',  domain:'Istoria & Critica Teatrală',   tags:['Teatrul românesc','Avangarda','Critique teatrală'],     available:true,  slotsLeft:3, totalSlots:5, minGrade:7.5, language:'Română / Franceză', acceptsOther:false, previousTheses:[{title:'Teatrul experimental românesc post-1989',year:2024},{title:'Figura femininului în dramaturgia interbelică',year:2023}], contact:'Email', avatar:'LI', color:'from-violet-600 to-purple-600', requirementsNote:'Necesită un referat de analiză teatrală de 2 pagini pe un spectacol ales, cu referințe critice.' },
    { id:803, name:'Prof. Dr. Liviu Papadima',      title:'Profesor universitar',     domain:'Dramaturgie & Text Dramatic',  tags:['Dramaturgie contemporană','Adaptare text','Scriere dramatică'], available:true, slotsLeft:2, totalSlots:4, minGrade:8.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Rewriting-ul clasicilor în teatrul contemporan',year:2024},{title:'Monologul dramatic — forme și funcții',year:2023}], contact:'Teams', avatar:'LP', color:'from-amber-600 to-orange-600', requirementsNote:'Solicită un fragment de scriere dramatică (minim 3 pagini) și o scrisoare de intenție.' },
  ],
  MATH_CS: [
    { id:901, name:'Prof. Dr. Ioan Leustean',      title:'Profesor universitar',    domain:'Logică & Informatică Teoretică',   tags:['Logică matematică','Teoria calculabilității','Lingvistici formale'],   available:true,  slotsLeft:3, totalSlots:5, minGrade:8.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Logici fuzzy și aplicații în procesarea limbajului natural',year:2024},{title:'Sisteme de tip dependent și verificare formală',year:2023}], contact:'Email',  avatar:'IL', color:'from-indigo-600 to-blue-600', requirementsNote:'Solicită un rezumat de 1 pagină cu tema propusă și referințe bibliografice de specialitate.' },
    { id:902, name:'Prof. Dr. Vasile Ene',         title:'Profesor universitar',    domain:'Analiză Matematică & Topologie',   tags:['Analiză reală','Topologie','Teoria măsurii','Spații funcționale'],     available:true,  slotsLeft:2, totalSlots:4, minGrade:9.0, language:'Română',          acceptsOther:false, previousTheses:[{title:'Proprietăți topologice ale spațiilor Banach',year:2024},{title:'Aproximarea funcțiilor în spații metrice complete',year:2023}], contact:'Teams', avatar:'VE', color:'from-violet-600 to-purple-600', requirementsNote:'Necesită media generală min. 9.0 și o schiță a direcției de cercetare matematică propuse.' },
    { id:903, name:'Conf. Dr. Luminița Dumitriu',  title:'Conferențiar universitar', domain:'Algebră & Statistică Matematică', tags:['Algebră abstractă','Probabilități','Statistică matematică','R'],        available:true,  slotsLeft:3, totalSlots:6, minGrade:7.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Metode statistice pentru analiza datelor genomice',year:2024},{title:'Algebre Lie și aplicații în mecanică',year:2023}],              contact:'Email',  avatar:'LD', color:'from-emerald-600 to-teal-600', requirementsNote:'Acceptă teme interdisciplinare (statistică + bioinformatică, eco-statistică). CV și extras notă de studii.' },
    { id:904, name:'Conf. Dr. Mihai Gavriluț',     title:'Conferențiar universitar', domain:'Baze de Date & Inginerie Software',tags:['Baze de date relaționale','SQL','NoSQL','Arhitecturi software'],        available:true,  slotsLeft:2, totalSlots:4, minGrade:8.0, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Optimizarea interogărilor în sisteme distribuite',year:2024},{title:'Modele de date pentru sisteme IoT scalabile',year:2023}],      contact:'Email',  avatar:'MG', color:'from-amber-600 to-orange-600', requirementsNote:'Preferă studenți cu proiect de baze de date demonstrabil. CV și link la repository la prima întâlnire.' },
  ],
  ENGINEERING_CS_CTI: [
    { id:1001, name:'Prof. dr. ing. Florin Leon',      title:'Profesor universitar',    domain:'Inteligență Artificială & Web Semantic', tags:['Agenți inteligenți','Raționament automat','Semantic Web'],         available:true,  slotsLeft:3, totalSlots:5, minGrade:8.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Sisteme multi-agent pentru planificare adaptivă',year:2024},{title:'Ontologii OWL pentru interoperabilitate în e-Health',year:2023}], contact:'Email', avatar:'FL', color:'from-indigo-600 to-blue-600', requirementsNote:'Solicită un plan de cercetare de 1 pagină cu problema propusă, metode și bibliografie. Recomandare: cunoașterea Python sau Prolog.' },
    { id:1002, name:'Prof. dr. ing. Petru Cașcaval',   title:'Profesor universitar',    domain:'Calcul Paralel & Distribuit',            tags:['MPI','OpenMP','Sisteme distribuite','HPC'],                        available:true,  slotsLeft:2, totalSlots:4, minGrade:8.0, language:'Română / Engleză', acceptsOther:false, previousTheses:[{title:'Optimizarea comunicației în clustere MPI',year:2024},{title:'Scheduling în grid computing',year:2023}], contact:'Teams', avatar:'PC', color:'from-violet-600 to-purple-600', requirementsNote:'Necesită cunoașterea programării paralele (C/C++ cu MPI sau OpenMP). Proiect demonstrabil de performanță la prima întâlnire.' },
    { id:1003, name:'Conf. dr. ing. Andrei Stan',       title:'Conferențiar universitar', domain:'Rețele de Calculatoare & Securitate',    tags:['TCP/IP','Securitate rețele','Firewall','VPN'],                     available:true,  slotsLeft:3, totalSlots:6, minGrade:7.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Detectarea intruziunilor cu ML în rețele SDN',year:2024},{title:'VPN site-to-site cu IPSec — performanță și securitate',year:2023}], contact:'Email', avatar:'AS', color:'from-emerald-600 to-teal-600', requirementsNote:'Acceptă teme cu implementare practică pe echipamente Cisco sau simulatoare (GNS3, Packet Tracer). CV și laborator de rețele propus.' },
    { id:1004, name:'Conf. dr. ing. Dan Mardare',       title:'Conferențiar universitar', domain:'Inginerie Software & Arhitecturi',       tags:['UML','Design patterns','Microservicii','DevOps'],                  available:true,  slotsLeft:2, totalSlots:5, minGrade:8.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Migrarea monolitului la microservicii — studiu de caz',year:2024},{title:'CI/CD pipelines pentru aplicații Java enterprise',year:2023}], contact:'Email', avatar:'DM', color:'from-amber-600 to-orange-600', requirementsNote:'Preferă teme cu aplicație software demonstrabilă. Repository GitHub cu cod demonstrabil la prima întâlnire.' },
  ],
  ENGINEERING_CS_IS: [
    { id:1101, name:'Prof. dr. ing. Marius Kloetzer',  title:'Profesor universitar',    domain:'Sisteme Hibride & Verificare Formală',   tags:['Automate hibride','Temporal logic','Model checking'],              available:true,  slotsLeft:2, totalSlots:4, minGrade:9.0, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Verificarea formală a sistemelor embedded critice',year:2024},{title:'Sinteză automată de controlere din specificații LTL',year:2023}], contact:'Email', avatar:'MK', color:'from-indigo-600 to-blue-600', requirementsNote:'Solicită cunoașterea automatelor finite și a logicii temporale. Plan de cercetare cu 2 pagini și bibliografie de specialitate obligatorie.' },
    { id:1102, name:'Conf. dr. ing. Anca Maxim',        title:'Conferențiar universitar', domain:'Control Predictiv & Sisteme Avansate',   tags:['MPC','Sisteme neliniare','Optimizare în timp real'],               available:true,  slotsLeft:3, totalSlots:5, minGrade:8.0, language:'Română / Engleză', acceptsOther:false, previousTheses:[{title:'Control predictiv robust pentru procese chimice',year:2024},{title:'Reglare în timp real cu MPC explicit',year:2023}], contact:'Teams', avatar:'AM', color:'from-violet-600 to-purple-600', requirementsNote:'Necesită cunoașterea MATLAB/Simulink și noțiuni de optimizare convexă. Proiect de simulare propus la prima întâlnire.' },
    { id:1103, name:'Conf. dr. ing. Lavinia Ferariu',   title:'Conferențiar universitar', domain:'Procesarea Semnalelor & Machine Learning',tags:['DSP','Rețele neuronale','MATLAB','Clasificare'],                    available:true,  slotsLeft:3, totalSlots:6, minGrade:7.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Clasificarea aritmiilor cu CNN pe date ECG',year:2024},{title:'Filtrare adaptivă pentru semnale biomediale',year:2024}], contact:'Email', avatar:'LF', color:'from-emerald-600 to-teal-600', requirementsNote:'Acceptă teme cu seturi de date reale (biomedicale, industriale). Cunoașterea Python/MATLAB și repository demonstrabil sunt avantaje.' },
    { id:1104, name:'Prof. dr. ing. Carlos-Mihai Pascal',title:'Profesor universitar',   domain:'Robotică & Viziune Artificială',         tags:['ROS','Computer Vision','Embedded control','Kinematică'],           available:true,  slotsLeft:2, totalSlots:4, minGrade:8.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Localizare și cartare simultană (SLAM) cu LiDAR',year:2024},{title:'Detectare obiecte cu YOLO pe sisteme embedded',year:2023}], contact:'Email', avatar:'CP', color:'from-amber-600 to-orange-600', requirementsNote:'Solicită cunoașterea ROS sau OpenCV și un proiect de robotică sau viziune artificială demonstrabil. CV și link la proiect obligatorii.' },
  ],
  // Existing types kept with real data
  ENGINEERING: [],
  ARTS: [],
}

// ── Tutors by faculty type ─────────────────────────────────────────────────────
const EXTRA_TUTORS = {
  LAW: [
    { id:101, name:'Radu Paraschiv',   year:4, subjects:['Drept Civil','Drept Procesual Civil'],   grade:9.5, sessions:41, rating:4.9, reviews:33, price:60, availability:['Luni 18-20','Miercuri 17-20','Sâmbătă 10-13'], style:'Cazeuri din jurisprudență, metoda socratică', avatar:'RP', color:'from-indigo-500 to-blue-500', online:true  },
    { id:102, name:'Ioana Mrejeru',    year:3, subjects:['Drept Constituțional','Teoria Generală a Dreptului'], grade:9.8, sessions:27, rating:5.0, reviews:22, price:55, availability:['Marți 17-20','Joi 17-20'],              style:'Scheme clare, analiză de text juridic', avatar:'IM', color:'from-violet-500 to-purple-500', online:true  },
    { id:103, name:'Mihai Balan',      year:4, subjects:['Drept Penal','Criminologie','Drept Penal European'], grade:9.2, sessions:19, rating:4.7, reviews:15, price:50, availability:['Vineri 16-20','Sâmbătă 14-18'],       style:'Grile și spețe, repetiție sistematică', avatar:'MB', color:'from-rose-500 to-red-500',    online:false },
  ],
  GEOGRAPHY: [
    { id:201, name:'Claudia Hrițac',   year:3, subjects:['Geografie Fizică','Geomorfologie','Climatologie'], grade:9.4, sessions:31, rating:4.8, reviews:25, price:45, availability:['Luni 16-19','Miercuri 16-19'],           style:'Hărți, excursii virtuale, date meteo', avatar:'CH', color:'from-emerald-500 to-green-500', online:true  },
    { id:202, name:'Bogdan Sfîcă',     year:4, subjects:['GIS & Teledetecție','Cartografie'],              grade:9.6, sessions:18, rating:4.9, reviews:14, price:55, availability:['Joi 17-20','Sâmbătă 10-14'],               style:'QGIS hands-on, proiecte reale', avatar:'BS', color:'from-blue-500 to-cyan-500',     online:true  },
    { id:203, name:'Maria Apintei',    year:3, subjects:['Hidrologie','Geografie Fizică','Teren'],          grade:9.0, sessions:14, rating:4.6, reviews:11, price:40, availability:['Marți 16-19','Vineri 16-19'],              style:'Note de teren, exerciții practice', avatar:'MA', color:'from-amber-500 to-yellow-500', online:false },
  ],
  PSYCHOLOGY: [
    { id:301, name:'Diana Vornicu',    year:4, subjects:['Psihopatologie','Psihologie Clinică'],             grade:9.7, sessions:38, rating:5.0, reviews:31, price:60, availability:['Luni 18-21','Miercuri 18-21'],            style:'Cazuri clinice, DSM-5 aplicat', avatar:'DV', color:'from-violet-500 to-purple-500', online:true  },
    { id:302, name:'Alexandru Radu',   year:3, subjects:['Statistică în Psihologie','SPSS','R'],             grade:9.3, sessions:22, rating:4.8, reviews:18, price:50, availability:['Joi 17-20','Sâmbătă 10-14'],               style:'Analiza datelor pas cu pas, exerciții SPSS', avatar:'AR', color:'from-indigo-500 to-blue-500', online:true  },
    { id:303, name:'Ioana Dănilă',     year:4, subjects:['Psihologie Generală','Psihologie Cognitivă','Neuropsihologie'], grade:9.5, sessions:47, rating:4.9, reviews:38, price:55, availability:['Marți 17-20','Vineri 16-20'], style:'Scheme mnemonice, fișe conceptuale', avatar:'ID', color:'from-emerald-500 to-teal-500', online:false },
  ],
  SPORTS: [
    { id:401, name:'Bogdan Dragnea',   year:4, subjects:['Atletism','Teoria Sportului','Jocuri Sportive'],   grade:9.4, sessions:29, rating:4.8, reviews:23, price:45, availability:['Luni 16-19','Miercuri 16-19','Sâmbătă 9-13'], style:'Demonstrație practică, analiză video', avatar:'BD', color:'from-emerald-500 to-green-500', online:true  },
    { id:402, name:'Alina Turcu',      year:3, subjects:['Fiziologie Sportivă','Biomecanică'],               grade:9.1, sessions:17, rating:4.7, reviews:13, price:50, availability:['Joi 17-20','Sâmbătă 14-18'],               style:'Teste funcționale, teorie aplicată', avatar:'AT', color:'from-blue-500 to-cyan-500',     online:true  },
    { id:403, name:'Marius Micu',      year:4, subjects:['Kinetoterapie','Nutriție Sportivă'],               grade:9.6, sessions:35, rating:5.0, reviews:28, price:55, availability:['Marți 17-20','Vineri 16-20'],              style:'Protocoale recovery, exerciții terapeutice', avatar:'MM', color:'from-rose-500 to-pink-500',   online:false },
  ],
  MUSIC: [
    { id:501, name:'Mara Vrînceanu',   year:4, subjects:['Armonie','Contrapunct','Solfegiu'],                grade:9.8, sessions:53, rating:5.0, reviews:44, price:65, availability:['Luni 16-19','Miercuri 16-19','Sâmbătă 10-13'], style:'Exerciții la pian, analiță pe partituri', avatar:'MV', color:'from-violet-500 to-purple-500', online:true  },
    { id:502, name:'Tudor Tutu',       year:3, subjects:['Solfegiu','Ritmică','Dicțeuri muzicale'],           grade:9.4, sessions:31, rating:4.9, reviews:25, price:50, availability:['Joi 17-20','Vineri 16-20'],                 style:'Ascultare activă, exerciții de intonație', avatar:'TT', color:'from-indigo-500 to-blue-500', online:true  },
    { id:503, name:'Ioana Neagă',      year:4, subjects:['Muzică de cameră','Istoria Muzicii'],               grade:9.2, sessions:24, rating:4.7, reviews:19, price:55, availability:['Marți 17-20','Sâmbătă 14-18'],              style:'Repertoriu selectat, context cultural', avatar:'IN', color:'from-amber-500 to-orange-500', online:false },
  ],
  THEOLOGY: [
    { id:601, name:'Vasile Necula',    year:4, subjects:['Teologie Dogmatică','Liturgică','Patrologie'],     grade:9.6, sessions:36, rating:4.9, reviews:29, price:40, availability:['Luni 18-20','Miercuri 18-21'],              style:'Sintezepatristic-sistematice, scheme dogmatice', avatar:'VN', color:'from-indigo-500 to-blue-500', online:true  },
    { id:602, name:'Ana Mladin',       year:3, subjects:['Morală Creștină','Filosofia Religiei'],             grade:9.3, sessions:18, rating:4.8, reviews:14, price:35, availability:['Joi 17-20','Sâmbătă 10-14'],               style:'Texte patristice comentate, analiță etică', avatar:'AM', color:'from-violet-500 to-purple-500', online:true  },
    { id:603, name:'Ioan Boca',        year:4, subjects:['Teologie Biblică','Exegeză NT','Greacă biblică'],  grade:9.5, sessions:27, rating:5.0, reviews:22, price:45, availability:['Marți 17-20','Vineri 16-19'],               style:'Text biblic pe versete, gramatică greacă', avatar:'IB', color:'from-amber-500 to-yellow-500', online:false },
  ],
  ARCHITECTURE: [
    { id:701, name:'Diana Ionescu',    year:5, subjects:['Proiectare Arhitecturală','AutoCAD','Revit'],       grade:9.4, sessions:32, rating:4.9, reviews:25, price:70, availability:['Luni 16-20','Sâmbătă 10-14'],              style:'Critică de proiect, tehnici de prezentare', avatar:'DI', color:'from-indigo-500 to-violet-500', online:true  },
    { id:702, name:'Andrei Stroe',     year:4, subjects:['Istoria Arhitecturii','Estetică'],                   grade:9.1, sessions:19, rating:4.7, reviews:15, price:55, availability:['Miercuri 17-20','Joi 17-20'],              style:'Slideshow cronologic, analiză de forme', avatar:'AS', color:'from-amber-500 to-orange-500', online:true  },
    { id:703, name:'Elena Dima',       year:5, subjects:['Urbanism','Geometrie Descriptivă'],                  grade:9.6, sessions:41, rating:5.0, reviews:33, price:65, availability:['Marți 17-20','Vineri 16-20'],              style:'Plan+secțiune+fațadă sistematic, machetă', avatar:'ED', color:'from-emerald-500 to-teal-500', online:false },
  ],
  THEATER: [
    { id:801, name:'Ioana Gavrilă',    year:4, subjects:['Arta Actorului','Improvizație','Mișcare Scenică'],  grade:9.3, sessions:28, rating:4.8, reviews:22, price:55, availability:['Luni 17-20','Miercuri 17-20'],              style:'Exerciții Stanislavski, lucru cu partenerul', avatar:'IG', color:'from-indigo-500 to-blue-500', online:true  },
    { id:802, name:'Petru Andreescu',  year:3, subjects:['Dicție & Voce','Dramaturgie'],                      grade:9.5, sessions:21, rating:5.0, reviews:17, price:50, availability:['Joi 17-20','Sâmbătă 10-14'],               style:'Respirație, rezonanță, text dramatic', avatar:'PA', color:'from-violet-500 to-purple-500', online:true  },
    { id:803, name:'Maria Nica',       year:4, subjects:['Istoria Teatrului','Critică Teatrală'],              grade:9.0, sessions:15, rating:4.6, reviews:12, price:45, availability:['Marți 16-19','Vineri 16-19'],              style:'Lecturi comentate, spectacole de referință', avatar:'MN', color:'from-amber-500 to-orange-500', online:false },
  ],
  MATH_CS: [
    { id:901, name:'Alexandru Buza',  year:3, subjects:['Algoritmi & Structuri de Date','Programare C++','Python'], grade:9.5, sessions:38, rating:4.9, reviews:30, price:50, availability:['Luni 17-20','Miercuri 17-20','Sâmbătă 10-13'], style:'Probleme rezolvate pas cu pas, vizualizare algoritmi', avatar:'AB', color:'from-indigo-500 to-blue-500',   online:true  },
    { id:902, name:'Ioana Munteanu',  year:2, subjects:['Analiză Matematică','Algebră Liniară','Geometrie'],       grade:9.7, sessions:24, rating:4.9, reviews:19, price:45, availability:['Marți 17-20','Joi 17-20'],                   style:'Demonstrații riguroase, exerciții tip examen', avatar:'IM', color:'from-violet-500 to-purple-500', online:true  },
    { id:903, name:'Radu Croitoru',   year:3, subjects:['Baze de Date','SQL','Java POO'],                         grade:9.2, sessions:31, rating:4.8, reviews:24, price:55, availability:['Vineri 16-20','Sâmbătă 10-14'],               style:'Proiecte reale, debugging în timp real', avatar:'RC', color:'from-emerald-500 to-teal-500', online:false },
  ],
  ENGINEERING_CS_CTI: [
    { id:1001, name:'Andrei Popescu',   year:3, subjects:['Programare Orientată Obiect','Java','Design Patterns'], grade:9.4, sessions:35, rating:4.9, reviews:28, price:50, availability:['Luni 17-20','Miercuri 17-20'],              style:'Live coding, refactoring ghidat, code review',  avatar:'AP', color:'from-indigo-500 to-blue-500',   online:true  },
    { id:1002, name:'Mihaela Ionescu',  year:4, subjects:['Structuri de Date & Algoritmi','C++','Complexitate'],   grade:9.6, sessions:42, rating:5.0, reviews:34, price:55, availability:['Marți 17-20','Joi 17-20','Sâmbătă 10-13'], style:'Vizualizare algoritmi, probleme pas cu pas',    avatar:'MI', color:'from-violet-500 to-purple-500', online:true  },
    { id:1003, name:'Bogdan Arhire',    year:3, subjects:['Rețele de Calculatoare','Packet Tracer','TCP/IP'],       grade:9.1, sessions:22, rating:4.7, reviews:17, price:45, availability:['Vineri 16-20','Sâmbătă 10-14'],              style:'Simulare Packet Tracer, scheme comentate',      avatar:'BA', color:'from-emerald-500 to-teal-500',  online:false },
    { id:1004, name:'Teodora Ciocan',   year:4, subjects:['Baze de Date','SQL','PostgreSQL','Modelare ER'],         grade:9.3, sessions:29, rating:4.8, reviews:23, price:50, availability:['Luni 17-20','Joi 17-20'],                   style:'Proiecte reale, normalizare și optimizare SQL',  avatar:'TC', color:'from-amber-500 to-orange-500', online:true  },
  ],
  ENGINEERING_CS_IS: [
    { id:1101, name:'Cristian Rusu',    year:4, subjects:['Teoria Sistemelor','MATLAB/Simulink','Reglaj automat'], grade:9.5, sessions:31, rating:4.9, reviews:25, price:50, availability:['Luni 17-20','Miercuri 17-20'],              style:'Simulare Simulink, proiecte de reglaj',         avatar:'CR', color:'from-indigo-500 to-blue-500',   online:true  },
    { id:1102, name:'Elena Moisiu',     year:3, subjects:['Matematici Superioare','Analiză Matematică','Calcul'],  grade:9.7, sessions:38, rating:5.0, reviews:30, price:45, availability:['Marți 17-20','Joi 17-20'],                   style:'Demonstrații riguroase, exerciții graduale',    avatar:'EM', color:'from-violet-500 to-purple-500', online:true  },
    { id:1103, name:'Radu Chiriac',     year:4, subjects:['Sisteme Digitale','VHDL','Microprocesoare'],             grade:9.2, sessions:26, rating:4.8, reviews:21, price:50, availability:['Joi 17-20','Sâmbătă 10-14'],                style:'Lab FPGA, cod VHDL comentat',                   avatar:'RC', color:'from-emerald-500 to-teal-500',  online:false },
    { id:1104, name:'Ioana Sandu',      year:3, subjects:['Procesarea Semnalelor','MATLAB','Python DSP'],           grade:9.0, sessions:18, rating:4.6, reviews:14, price:45, availability:['Vineri 16-20','Sâmbătă 10-14'],              style:'Exerciții pe seturi de date reale',              avatar:'IS', color:'from-rose-500 to-pink-500',    online:true  },
  ],
}

// ── Skill swap & group sessions by faculty type ────────────────────────────────
const EXTRA_SKILL_SWAP = {
  LAW: [
    { id:1, name:'Raluca Neagu',  avatar:'RN', teaches:'Redactare acte juridice', learns:'Excel juridic & statistică', teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
    { id:2, name:'Victor Iordan', avatar:'VI', teaches:'Drept european & UE',     learns:'Limbă franceză juridică',   teachLevel:'Intermediar',learnLevel:'Intermediar',match:true,  online:false },
    { id:3, name:'Ioana Stănescu',avatar:'IS', teaches:'Retorică & pledoarie',    learns:'Drept notarial',            teachLevel:'Avansat',    learnLevel:'Incepator',   match:false, online:true  },
    { id:4, name:'Andrei Lupu',   avatar:'AL', teaches:'Latină juridică',         learns:'Drept penal european',     teachLevel:'Intermediar',learnLevel:'Incepator',   match:true,  online:true  },
  ],
  GEOGRAPHY: [
    { id:1, name:'Ionela Dănilă', avatar:'ID', teaches:'QGIS & ArcGIS',           learns:'Python GeoPandas',          teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
    { id:2, name:'Sorin Blândul', avatar:'SB', teaches:'Climatologie aplicată',    learns:'Teledetecție satelitară',   teachLevel:'Intermediar',learnLevel:'Intermediar',match:false, online:true  },
    { id:3, name:'Maria Apintei', avatar:'MA', teaches:'Cartare de teren GPS',     learns:'Modelarea 3D a reliefului', teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:false },
  ],
  PSYCHOLOGY: [
    { id:1, name:'Diana Vornicu', avatar:'DV', teaches:'Diagnosticare clinică',    learns:'Statistică avansată SPSS',  teachLevel:'Avansat',    learnLevel:'Intermediar',match:true,  online:true  },
    { id:2, name:'Alex Radu',     avatar:'AR', teaches:'SPSS & R pentru psih.',    learns:'Interviu clinic structurat', teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
    { id:3, name:'Laura Iftode',  avatar:'LI', teaches:'Tehnici CBT & ACT',        learns:'Testare neuropsihologică',  teachLevel:'Intermediar',learnLevel:'Incepator',   match:false, online:false },
    { id:4, name:'Andrei Maxim',  avatar:'AM', teaches:'Psihologie organizațională',learns:'Psihodiagnoză proiectivă', teachLevel:'Intermediar',learnLevel:'Incepator',   match:true,  online:true  },
  ],
  SPORTS: [
    { id:1, name:'Bogdan Munteanu',avatar:'BM', teaches:'Tehnica alergării',       learns:'Nutriție sportivă avansată',teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
    { id:2, name:'Alina Sandu',    avatar:'AS', teaches:'Kinetoterapie de bază',   learns:'Psihologie sportivă',       teachLevel:'Intermediar',learnLevel:'Intermediar',match:true,  online:false },
    { id:3, name:'Florin Dragnea', avatar:'FD', teaches:'Antrenament de forță',    learns:'Biomecanica mișcărilor',   teachLevel:'Avansat',    learnLevel:'Incepator',   match:false, online:true  },
  ],
  MUSIC: [
    { id:1, name:'Mara Dobre',    avatar:'MD', teaches:'Solfegiu & intonație',     learns:'Software de notație (Sibelius)', teachLevel:'Avansat', learnLevel:'Incepator', match:true,  online:true  },
    { id:2, name:'Tudor Apostol', avatar:'TA', teaches:'Armonie funcțională',      learns:'Producție muzicală DAW',    teachLevel:'Avansat',    learnLevel:'Intermediar',match:false, online:true  },
    { id:3, name:'Ioana Neagă',   avatar:'IN', teaches:'Repertoriu baroc & clasic',learns:'Improvizație jazz',         teachLevel:'Intermediar',learnLevel:'Incepator',   match:true,  online:false },
  ],
  THEOLOGY: [
    { id:1, name:'Nicolae Bratu', avatar:'NB', teaches:'Lectură patristică (greacă)',learns:'Limbă ebraică biblică',  teachLevel:'Intermediar',learnLevel:'Incepator',   match:true,  online:true  },
    { id:2, name:'Ioana Micu',    avatar:'IM', teaches:'Muzică psaltică',           learns:'Iconografie & artă sacră', teachLevel:'Avansat',    learnLevel:'Incepator',   match:false, online:true  },
    { id:3, name:'Vasile Necula', avatar:'VN', teaches:'Dogmatică sistematică',    learns:'Teologie ecumenică',       teachLevel:'Avansat',    learnLevel:'Intermediar',match:true,  online:false },
  ],
  ARCHITECTURE: [
    { id:1, name:'Diana Tudoran', avatar:'DT', teaches:'Rhino 3D & Grasshopper',   learns:'Urbanism & planificare',    teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
    { id:2, name:'Vlad Popescu',  avatar:'VP', teaches:'Revit BIM',                learns:'Restaurare & patrimoniu',  teachLevel:'Intermediar',learnLevel:'Incepator',   match:true,  online:true  },
    { id:3, name:'Elena Dima',    avatar:'ED', teaches:'Proiectare sustenabilă',    learns:'Parametric design Grasshopper', teachLevel:'Avansat', learnLevel:'Intermediar',match:false, online:false },
    { id:4, name:'Andrei Stroe',  avatar:'AS', teaches:'Istoria arhitecturii',     learns:'Render Lumion & V-Ray',    teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
  ],
  THEATER: [
    { id:1, name:'Ioana Ciobanu', avatar:'IC', teaches:'Improvizație teatrală',    learns:'Regie de film',             teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
    { id:2, name:'Petru Vlad',    avatar:'PV', teaches:'Analiza textului dramatic', learns:'Mișcare contemporană',      teachLevel:'Intermediar',learnLevel:'Incepator',   match:false, online:true  },
    { id:3, name:'Maria Nica',    avatar:'MN', teaches:'Critică teatrală',          learns:'Pedagogie teatrală',        teachLevel:'Avansat',    learnLevel:'Intermediar',match:true,  online:false },
  ],
  MATH_CS: [
    { id:1, name:'Alexandru Buza',  avatar:'AB', teaches:'Algoritmi & C++',           learns:'Machine learning aplicat',        teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
    { id:2, name:'Ioana Munteanu',  avatar:'IM', teaches:'Analiză Matematică',         learns:'Programare Python & R',           teachLevel:'Avansat',    learnLevel:'Intermediar',match:true,  online:true  },
    { id:3, name:'Radu Croitoru',   avatar:'RC', teaches:'SQL & Baze de Date',         learns:'Geometrie diferențială',          teachLevel:'Intermediar',learnLevel:'Incepator',   match:false, online:false },
    { id:4, name:'Maria Nechita',   avatar:'MN', teaches:'Probabilități & Statistică', learns:'Framework-uri web (Django/Flask)',teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
  ],
  ENGINEERING_CS_CTI: [
    { id:1, name:'Andrei Popescu',  avatar:'AP', teaches:'Java & Design Patterns',    learns:'DevOps & Docker',             teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
    { id:2, name:'Mihaela Ionescu', avatar:'MI', teaches:'Algoritmi & C++',            learns:'Machine Learning (PyTorch)',   teachLevel:'Avansat',    learnLevel:'Intermediar',match:true,  online:true  },
    { id:3, name:'Bogdan Arhire',   avatar:'BA', teaches:'Rețele & Cisco (GNS3)',      learns:'Programare web (React)',       teachLevel:'Intermediar',learnLevel:'Incepator',   match:false, online:false },
    { id:4, name:'Teodora Ciocan',  avatar:'TC', teaches:'SQL & Modelare BD',          learns:'Algoritmi avansați (C++)',     teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
  ],
  ENGINEERING_CS_IS: [
    { id:1, name:'Cristian Rusu',   avatar:'CR', teaches:'MATLAB/Simulink & Control',   learns:'Embedded Linux & ROS',         teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
    { id:2, name:'Elena Moisiu',    avatar:'EM', teaches:'Matematici Superioare',        learns:'Programare Python & SciPy',    teachLevel:'Avansat',    learnLevel:'Intermediar',match:true,  online:true  },
    { id:3, name:'Radu Chiriac',    avatar:'RC', teaches:'VHDL & Sisteme Digitale',      learns:'Computer Vision (OpenCV)',     teachLevel:'Intermediar',learnLevel:'Incepator',   match:false, online:false },
  ],
}

const EXTRA_GROUP_SESSIONS = {
  LAW: [
    { id:1, host:'Raluca Neagu',  topic:'Speță practică — Drept civil: succesiuni',  date:'Sâmbătă, 18 Mai', time:'10:00', spots:2, totalSpots:4, type:'study', tags:['Drept Civil','Speță','Moșteniri'] },
    { id:2, host:'Victor Iordan', topic:'Simulare ședință de judecată (moot court)',  date:'Duminică, 19 Mai',time:'14:00', spots:3, totalSpots:6, type:'teach', tags:['Moot Court','Pledoarie','Procedură'] },
    { id:3, host:'Mihai Balan',   topic:'Grile pentru examen drept penal',            date:'Joi, 22 Mai',     time:'17:00', spots:2, totalSpots:4, type:'study', tags:['Grile','Drept Penal','Examen'] },
  ],
  GEOGRAPHY: [
    { id:1, host:'Ionela Dănilă', topic:'Atelier QGIS — analiză bazine hidrografice',date:'Sâmbătă, 18 Mai', time:'10:00', spots:2, totalSpots:4, type:'teach', tags:['QGIS','GIS','Hidrologie'] },
    { id:2, host:'Bogdan Sfîcă',  topic:'Grup pregătire examen geomorfologie',         date:'Duminică, 19 Mai',time:'15:00', spots:3, totalSpots:4, type:'study', tags:['Geomorfologie','Examen','Teren'] },
  ],
  PSYCHOLOGY: [
    { id:1, host:'Diana Vornicu', topic:'Studiu de caz clinic — tulburări anxioase',  date:'Sâmbătă, 18 Mai', time:'11:00', spots:2, totalSpots:4, type:'teach', tags:['Clinică','DSM-5','Anxietate'] },
    { id:2, host:'Alex Radu',     topic:'Atelier SPSS — analiză regresie',            date:'Joi, 22 Mai',     time:'17:00', spots:3, totalSpots:4, type:'teach', tags:['SPSS','Statistică','Cercetare'] },
    { id:3, host:'Laura Iftode',  topic:'Grup de supervizare CBT',                    date:'Duminică, 19 Mai',time:'14:00', spots:1, totalSpots:4, type:'study', tags:['CBT','Terapie','Practică'] },
  ],
  SPORTS: [
    { id:1, host:'Bogdan Munteanu',topic:'Antrenament demonstrativ atletism',         date:'Sâmbătă, 18 Mai', time:'9:00',  spots:3, totalSpots:6, type:'teach', tags:['Atletism','Practică','Performanță'] },
    { id:2, host:'Marius Micu',    topic:'Grup studiu kinetoterapie — articulații',  date:'Joi, 22 Mai',     time:'17:00', spots:2, totalSpots:4, type:'study', tags:['Kinetoterapie','Recuperare','Anatomie'] },
  ],
  MUSIC: [
    { id:1, host:'Mara Vrînceanu', topic:'Atelier solfegiu — intervale și ritmuri',  date:'Sâmbătă, 18 Mai', time:'10:00', spots:2, totalSpots:4, type:'teach', tags:['Solfegiu','Intonație','Exerciții'] },
    { id:2, host:'Tudor Tutu',     topic:'Muzică de cameră — repetiție cvartet',     date:'Duminică, 19 Mai',time:'16:00', spots:1, totalSpots:4, type:'study', tags:['Muzică cameră','Interpretare','Ansamblu'] },
    { id:3, host:'Ioana Neagă',    topic:'Grup istoria muzicii — muzica de film',    date:'Joi, 22 Mai',     time:'18:00', spots:3, totalSpots:4, type:'study', tags:['Istoria Muzicii','Film','Analiță'] },
  ],
  THEOLOGY: [
    { id:1, host:'Vasile Necula',  topic:'Seminar de exegeză biblică (NT)',           date:'Sâmbătă, 18 Mai', time:'10:00', spots:3, totalSpots:4, type:'study', tags:['Exegeză','NT','Greacă'] },
    { id:2, host:'Ana Mladin',     topic:'Dezbatere etică — eutanasie & teologie',   date:'Joi, 22 Mai',     time:'17:00', spots:2, totalSpots:4, type:'teach', tags:['Morală','Etică','Dezbatere'] },
  ],
  ARCHITECTURE: [
    { id:1, host:'Diana Ionescu',  topic:'Critică de proiect — concepte de semestru',date:'Sâmbătă, 18 Mai', time:'10:00', spots:2, totalSpots:4, type:'teach', tags:['Proiectare','Critică','Concept'] },
    { id:2, host:'Andrei Stroe',   topic:'Atelier Revit BIM pentru arhitecți',       date:'Duminică, 19 Mai',time:'14:00', spots:3, totalSpots:4, type:'teach', tags:['Revit','BIM','Software'] },
    { id:3, host:'Elena Dima',     topic:'Grup analiză urbanism — centru istoric',   date:'Joi, 22 Mai',     time:'17:00', spots:2, totalSpots:4, type:'study', tags:['Urbanism','Patrimoniu','Analiță'] },
  ],
  THEATER: [
    { id:1, host:'Ioana Gavrilă',  topic:'Atelier improvizație teatrală — scurt',    date:'Sâmbătă, 18 Mai', time:'11:00', spots:3, totalSpots:6, type:'teach', tags:['Improvizație','Actorie','Workshop'] },
    { id:2, host:'Petru Andreescu',topic:'Dicție și voce — exerciții de rezonanță',  date:'Joi, 22 Mai',     time:'17:00', spots:2, totalSpots:4, type:'teach', tags:['Dicție','Voce','Tehnică'] },
    { id:3, host:'Maria Nica',     topic:'Lectură dramatică — Caragiale comentat',   date:'Duminică, 19 Mai',time:'15:00', spots:3, totalSpots:4, type:'study', tags:['Dramaturgie','Lectură','Analiță'] },
  ],
  MATH_CS: [
    { id:1, host:'Alexandru Buza', topic:'Algoritmi — pregătire concurs ACM/InfoEducație', date:'Sâmbătă, 18 Mai', time:'10:00', spots:3, totalSpots:6, type:'study', tags:['Algoritmi','Concurs','Dinamică'] },
    { id:2, host:'Ioana Munteanu', topic:'Analiză Matematică — exerciții tip sesiune',      date:'Joi, 22 Mai',     time:'17:00', spots:2, totalSpots:4, type:'study', tags:['Analiză','Serii','Examen'] },
    { id:3, host:'Radu Croitoru',  topic:'Atelier SQL — interogări avansate & optimizare', date:'Duminică, 19 Mai',time:'15:00', spots:3, totalSpots:4, type:'teach', tags:['SQL','Baze de Date','Practică'] },
  ],
  ENGINEERING_CS_CTI: [
    { id:1, host:'Andrei Popescu',   topic:'Atelier Java — Design Patterns în practică',        date:'Sâmbătă, 18 Mai',  time:'10:00', spots:3, totalSpots:4, type:'teach', tags:['Java','OOP','Design Patterns'] },
    { id:2, host:'Mihaela Ionescu',  topic:'Pregătire examen Algoritmi & Structuri de Date',    date:'Joi, 22 Mai',      time:'17:00', spots:2, totalSpots:4, type:'study', tags:['Algoritmi','C++','Examen'] },
    { id:3, host:'Bogdan Arhire',    topic:'Atelier rețele — subnetting și ACL Cisco',          date:'Duminică, 19 Mai', time:'14:00', spots:3, totalSpots:4, type:'teach', tags:['Rețele','Cisco','Subnetting'] },
  ],
  ENGINEERING_CS_IS: [
    { id:1, host:'Cristian Rusu',    topic:'Simulink — modelarea unui sistem de reglaj automat',date:'Sâmbătă, 18 Mai',  time:'10:00', spots:2, totalSpots:4, type:'teach', tags:['MATLAB','Simulink','Control'] },
    { id:2, host:'Elena Moisiu',     topic:'Sesiune exerciții Matematici Superioare — sesiune', date:'Joi, 22 Mai',      time:'17:00', spots:3, totalSpots:4, type:'study', tags:['Matematică','Examen','Exerciții'] },
    { id:3, host:'Radu Chiriac',     topic:'Atelier VHDL — implementare pe placă FPGA',         date:'Duminică, 19 Mai', time:'14:00', spots:2, totalSpots:4, type:'teach', tags:['VHDL','FPGA','Digital'] },
  ],
}

// ── Thesis domain filters by faculty type ──────────────────────────────────────
const EXTRA_THESIS_DOMAINS = {
  LAW:          ['Toate', 'Drept Civil & Procesual', 'Drept Penal & Criminologie', 'Drept Constituțional & European', 'Drept Roman & Istoria Dr.'],
  GEOGRAPHY:    ['Toate', 'Geografie Fizică & Geomorfologie', 'Cartografie & GIS', 'Climatologie & Mediu', 'Geomorfologie & Hazarde'],
  PSYCHOLOGY:   ['Toate', 'Psihologie Clinică & Cuplu', 'Psihopatologie & Sănătate mentală', 'Psihologie Socială & Cognitivă', 'Neuropsihologie & Evaluare'],
  SPORTS:       ['Toate', 'Teoria Educației Fizice', 'Kinetoterapie & Recuperare', 'Antrenament Sportiv & Jocuri', 'Nutriție Sportivă & Suplim.'],
  MUSIC:        ['Toate', 'Armonie & Contrapunct', 'Istoria Muzicii Universale', 'Solfegiu & Teoria Muzicii'],
  THEOLOGY:     ['Toate', 'Teologie Dogmatică & Ecumenism', 'Teologie Biblică & Exegeză', 'Patrologie & Spiritualitate', 'Liturgică & Tipic'],
  ARCHITECTURE: ['Toate', 'Proiectare Arhitecturală', 'Istoria Arhitecturii & Critic', 'Urbanism & Planificare', 'Materiale & Tehnologii'],
  THEATER:      ['Toate', 'Arta Actorului & Regie', 'Istoria & Critica Teatrală', 'Dramaturgie & Text Dramatic'],
  CS:           ['Toate', 'Machine Learning & AI', 'Web Development & Cloud', 'Cybersecurity & Networking', 'Data Science & Statistics', 'Embedded Systems & IoT', 'Mobile Development'],
  SCIENCES:     ['Toate', 'Matematică & Modelare', 'Fizică computațională', 'Chimie & Biologie', 'Statistică & Cercetare'],
  HUMANITIES:   ['Toate', 'Filosofie & Etică', 'Istorie & Istoriografie', 'Litere & Lingvistică', 'Sociologie & Asistență Socială'],
  ECONOMICS:    ['Toate', 'Finanțe & Bănci', 'Marketing & Management', 'Economie internațională', 'Business Analytics & Contabilitate'],
  MEDICINE:     ['Toate', 'Medicină internă', 'Chirurgie', 'Cardiologie & Neurologie', 'Pediatrie & Urgențe', 'Psihiatrie'],
  PHARMACY:     ['Toate', 'Farmacie clinică', 'Chimie farmaceutică', 'Industrie farmaceutică', 'Fitoterapie & Toxicologie'],
  ENGINEERING:  ['Toate', 'Electronică & Automatizare', 'Inginerie mecanică', 'Energetică & Mediu', 'Telecomunicații & IT'],
  ARTS:         ['Toate', 'Pictură & Desen', 'Sculptură & Ceramică', 'Design grafic & Digital', 'Arhitectură de interior'],
  MATH_CS:      ['Toate', 'Algoritmi & Complexitate', 'Machine Learning & AI', 'Analiză Matematică & Ecuații', 'Baze de Date & Sisteme Distribuite', 'Probabilități & Statistică', 'Algebră & Geometrie'],
  ENGINEERING_CS_CTI: ['Toate', 'Arhitecturi Software & Microservicii', 'Inteligență Artificială & Agenți', 'Rețele & Securitate Cibernetică', 'Calcul Paralel & Distribuit', 'Baze de Date & Big Data', 'Web & Cloud Computing'],
  ENGINEERING_CS_IS:  ['Toate', 'Control Predictiv & Sisteme Avansate', 'Sisteme Hibride & Verificare Formală', 'Robotică & Viziune Artificială', 'Procesarea Semnalelor & ML', 'Automatizare Industrială', 'Sisteme Digitale & FPGA'],
}

// ── Subject filters for tutoring by faculty type ───────────────────────────────
const EXTRA_SUBJECT_FILTERS = {
  LAW:          ['Toate', 'Drept Civil', 'Drept Penal', 'Drept Constituțional', 'Drept Roman', 'Limbă juridică'],
  GEOGRAPHY:    ['Toate', 'Geografie Fizică', 'GIS & Cartografie', 'Climatologie', 'Geomorfologie'],
  PSYCHOLOGY:   ['Toate', 'Psihologie Clinică', 'Psihopatologie', 'Statistică în Psih.', 'Psihologie Cognitivă'],
  SPORTS:       ['Toate', 'Atletism', 'Kinetoterapie', 'Fiziologie Sportivă', 'Nutriție Sportivă'],
  MUSIC:        ['Toate', 'Armonie', 'Solfegiu', 'Contrapunct', 'Istoria Muzicii'],
  THEOLOGY:     ['Toate', 'Teologie Dogmatică', 'Teologie Biblică', 'Liturgică', 'Patrologie'],
  ARCHITECTURE: ['Toate', 'Proiectare Arhitecturală', 'Istoria Arhitecturii', 'Urbanism', 'Software (CAD/BIM)'],
  THEATER:      ['Toate', 'Arta Actorului', 'Dicție & Voce', 'Dramaturgie', 'Istoria Teatrului'],
  CS:           ['Toate', 'Algoritmi', 'Web Development', 'Matematică', 'OOP / Java', 'Python / ML'],
  SCIENCES:     ['Toate', 'Matematică', 'Fizică', 'Chimie', 'Biologie', 'Statistică'],
  HUMANITIES:   ['Toate', 'Filosofie', 'Istorie', 'Limbă și Literatură', 'Sociologie'],
  ECONOMICS:    ['Toate', 'Microeconomie', 'Marketing', 'Contabilitate', 'Finanțe'],
  MEDICINE:     ['Toate', 'Anatomie', 'Fiziologie', 'Biochimie', 'Farmacologie'],
  PHARMACY:     ['Toate', 'Chimie Organică', 'Biochimie', 'Botanică Farmaceutică', 'Farmacologie'],
  ENGINEERING:  ['Toate', 'Matematici Superioare', 'Fizică', 'Electronică', 'Mecanică'],
  ARTS:         ['Toate', 'Desen', 'Pictură', 'Sculptură', 'Design Grafic'],
  MATH_CS:      ['Toate', 'Analiză Matematică', 'Algebră Liniară', 'Algoritmi & Structuri de Date', 'Baze de Date', 'Probabilități & Statistică', 'POO / Java / Python'],
  ENGINEERING_CS_CTI: ['Toate', 'Algoritmi & Structuri Date', 'POO / Java', 'Rețele Calculatoare', 'Baze de Date / SQL', 'Sisteme de Operare', 'Arhitectura Calculatoarelor'],
  ENGINEERING_CS_IS:  ['Toate', 'Teoria Sistemelor', 'Matematici Superioare', 'Sisteme Digitale', 'Procesarea Semnalelor', 'Automatizare', 'Electronică Analogică'],
}

// ── Professors for existing faculty types ─────────────────────────────────────
const EXISTING_PROFESSORS = {
  SCIENCES: [
    { id:11, name:'Prof. Dr. Ioan Dinu',        title:'Profesor universitar',     domain:'Matematică & Modelare',          tags:['Analiză funcțională','Ecuații diferențiale','Modele matematice'], available:true,  slotsLeft:3, totalSlots:5, minGrade:8.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Modele dinamice pentru epidemii — abordare matematică',year:2024},{title:'Sisteme haotice și atractori ciudați',year:2023}], contact:'Email', avatar:'ID', color:'from-indigo-600 to-blue-600', requirementsNote:'Solicită un plan de cercetare de 1 pagină și dovedirea cunoașterii analizei matematice avansate.' },
    { id:12, name:'Conf. Dr. Victor Preda',     title:'Conferențiar universitar',  domain:'Algebră & Geometrie',            tags:['Algebră abstractă','Geometrie diferențială','Topologie'],        available:true,  slotsLeft:2, totalSlots:4, minGrade:9.0, language:'Română / Franceză', acceptsOther:false, previousTheses:[{title:'Varietăți Riemanniene cu curbură constantă',year:2024},{title:'Structuri algebrice în spații metrice',year:2023}], contact:'Teams', avatar:'VP', color:'from-violet-600 to-purple-600', requirementsNote:'Necesită media min. 9.0 și un referat introductiv pe tema propusă cu bibliografie de specialitate.' },
    { id:13, name:'Prof. Dr. Elena Rusu',       title:'Profesor universitar',     domain:'Fizică & Biofizică',             tags:['Fizică statistică','Optică','Fizică biomedicală'],               available:true,  slotsLeft:2, totalSlots:4, minGrade:8.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Biofizica membranelor celulare — modele mecanice',year:2024},{title:'Lasere și aplicații medicale',year:2023}], contact:'Email', avatar:'ER', color:'from-amber-600 to-yellow-600', requirementsNote:'Acceptă teme interdisciplinare (fizică + medicină). CV și o scurtă descriere a intereselor de cercetare.' },
    { id:14, name:'Conf. Dr. Maria Chirilă',    title:'Conferențiar universitar',  domain:'Statistică & Cercetare',         tags:['Statistică matematică','R','Analiză de date','Bayesianism'],     available:true,  slotsLeft:4, totalSlots:6, minGrade:7.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Metode bayesiene pentru analiza seriilor de timp',year:2024},{title:'Testare statistică multiplă — controlul erorii',year:2023}], contact:'Email', avatar:'MC', color:'from-emerald-600 to-teal-600', requirementsNote:'Preferă teme cu aplicare a statisticii pe date reale. Cunoașterea R sau Python este un avantaj.' },
  ],
  HUMANITIES: [
    { id:21, name:'Prof. Dr. Ovidiu Ghitta',    title:'Profesor universitar',     domain:'Filosofie & Etică',              tags:['Filosofie analitică','Etică aplicată','Filosofia minții'],       available:true,  slotsLeft:3, totalSlots:5, minGrade:8.0, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Identitate personală și continuitate psihologică',year:2024},{title:'Etica inteligenței artificiale — dileme și principii',year:2023}], contact:'Email', avatar:'OG', color:'from-indigo-600 to-blue-600', requirementsNote:'Solicită o schiță de argument filosofic de 1 pagină și bibliografie de texte primare.' },
    { id:22, name:'Conf. Dr. Liviu Pilat',      title:'Conferențiar universitar',  domain:'Istorie & Istoriografie',        tags:['Evul Mediu','Istoria mentalităților','Diplomatică'],              available:true,  slotsLeft:2, totalSlots:4, minGrade:8.5, language:'Română / Franceză', acceptsOther:false, previousTheses:[{title:'Relațiile moldo-polone în sec. XV–XVI',year:2024},{title:'Propaganda și memoria colectivă în România comunistă',year:2023}], contact:'Teams', avatar:'LP', color:'from-violet-600 to-purple-600', requirementsNote:'Necesită un referat de 2 pagini cu tema, intervalul cronologic și sursele primare propuse.' },
    { id:23, name:'Prof. Dr. Elena Tamba',      title:'Profesor universitar',     domain:'Litere & Lingvistică',           tags:['Lingvistică cognitivă','Semantică','Pragmatică'],                available:true,  slotsLeft:1, totalSlots:4, minGrade:8.5, language:'Română / Franceză', acceptsOther:true,  previousTheses:[{title:'Metafora conceptuală în discursul politic românesc',year:2024},{title:'Structuri narative în romanul postmodern românesc',year:2023}], contact:'Email', avatar:'ET', color:'from-amber-600 to-orange-600', requirementsNote:'Solicită un corpus de texte propus și o ipoteză lingvistică sau literară de cercetare.' },
    { id:24, name:'Conf. Dr. Maria Nicolau',    title:'Conferențiar universitar',  domain:'Sociologie & Asistență Socială', tags:['Sociologie urbană','Migrație','Incluziune socială'],             available:true,  slotsLeft:3, totalSlots:5, minGrade:7.5, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Stigmatizarea populației rome în mediul urban',year:2024},{title:'Efectele migrației asupra familiei transnaționale',year:2023}], contact:'Email', avatar:'MN', color:'from-emerald-600 to-teal-600', requirementsNote:'Acceptă teme cu impact social. CV și scrisoare de motivație la prima întâlnire.' },
  ],
  ECONOMICS: [
    { id:31, name:'Prof. Dr. Mihai Apostol',    title:'Profesor universitar',     domain:'Finanțe & Bănci',                tags:['Piețe de capital','Risc financiar','FinTech'],                   available:true,  slotsLeft:2, totalSlots:5, minGrade:8.0, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Volatilitatea bursei românești în perioade de criză',year:2024},{title:'Criptomonede și stabilitate financiară',year:2023}], contact:'Teams', avatar:'MA', color:'from-amber-600 to-yellow-600', requirementsNote:'Solicită un plan de cercetare economic și cunoașterea instrumentelor de analiză financiară (Excel, Bloomberg).' },
    { id:32, name:'Conf. Dr. Elena Scarlat',    title:'Conferențiar universitar',  domain:'Marketing & Management',         tags:['Marketing digital','Comportament consumator','Brand strategy'],  available:true,  slotsLeft:3, totalSlots:6, minGrade:7.5, language:'Română',          acceptsOther:false, previousTheses:[{title:'Influencer marketing pe piața românească',year:2024},{title:'Satisfacția clientului în e-commerce B2C',year:2024}], contact:'Email', avatar:'ES', color:'from-emerald-600 to-teal-600', requirementsNote:'CV obligatoriu. Preferă teme cu studiu empiric (sondaj, analiză de date secundare) pe piața românească.' },
    { id:33, name:'Prof. Dr. Vasile Chirilă',   title:'Profesor universitar',     domain:'Economie internațională',        tags:['Comerț internațional','Investiții străine','UE economică'],      available:true,  slotsLeft:2, totalSlots:4, minGrade:8.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Efectele Brexit asupra exporturilor românești',year:2024},{title:'Convergența economică în zona euro',year:2023}], contact:'Email', avatar:'VC', color:'from-blue-600 to-cyan-600', requirementsNote:'Solicită cunoașterea economiei internaționale și un plan de temă cu date statistice propuse (Eurostat, UNCTAD).' },
    { id:34, name:'Conf. Dr. Ioana Toma',       title:'Conferențiar universitar',  domain:'Business Analytics & Contabilitate', tags:['IFRS','Audit','Power BI','Excel avansat'],               available:true,  slotsLeft:3, totalSlots:5, minGrade:7.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Digitalizarea contabilității în IMM-uri',year:2024},{title:'Detectarea fraudei financiare cu machine learning',year:2023}], contact:'Email', avatar:'IT', color:'from-rose-600 to-pink-600', requirementsNote:'Acceptă teme cu componente practice de analiză de date. Cunoașterea Power BI sau Excel avansat e un avantaj.' },
  ],
  MEDICINE: [
    { id:41, name:'Prof. Dr. Nicolae Radu',     title:'Profesor universitar',     domain:'Medicină internă',               tags:['Diabet','Endocrinologie','Medicină internă'],                    available:true,  slotsLeft:2, totalSlots:4, minGrade:9.0, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Managementul diabetului tip 2 — noi ținte terapeutice',year:2024},{title:'Sindromul metabolic și complicații cardiovasculare',year:2023}], contact:'Secretariat', avatar:'NR', color:'from-indigo-600 to-blue-600', requirementsNote:'Solicită dosar cu fișa matricolă și o propunere de temă clinică argumentată. Contactul se face prin secretariat.' },
    { id:42, name:'Prof. Dr. Adrian Lungu',     title:'Profesor universitar',     domain:'Cardiologie & Neurologie',       tags:['Insuficiență cardiacă','AVC','Neuroimagistică'],                 available:true,  slotsLeft:1, totalSlots:4, minGrade:9.5, language:'Română / Engleză', acceptsOther:false, previousTheses:[{title:'Biomarkeri de prognostic în infarctul miocardic',year:2024},{title:'Reabilitarea post-AVC — protocoale bazate pe dovezi',year:2023}], contact:'Email', avatar:'AL', color:'from-violet-600 to-purple-600', requirementsNote:'Necesită media min. 9.5 și experiență de stagiu în cardiologie sau neurologie. CV obligatoriu.' },
    { id:43, name:'Conf. Dr. Alina Stoica',     title:'Conferențiar universitar',  domain:'Pediatrie & Urgențe',            tags:['Pediatrie clinică','Urgențe pediatrice','Neonatologie'],         available:true,  slotsLeft:3, totalSlots:5, minGrade:8.5, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Sepsis neonatal — factori de risc și prognostic',year:2024},{title:'Pneumonia virală pediatrică post-COVID',year:2023}], contact:'Teams', avatar:'AS', color:'from-emerald-600 to-teal-600', requirementsNote:'Acceptă teme clinice cu lot de pacienți sau studii retrospective. CV cu stagii clinice efectuate.' },
    { id:44, name:'Conf. Dr. Mihai Ionescu',    title:'Conferențiar universitar',  domain:'Psihiatrie',                     tags:['Tulburări afective','Psihoterapie','Farmacoterapie'],             available:true,  slotsLeft:2, totalSlots:4, minGrade:8.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Depresia la medici rezidenți — prevalență și intervenție',year:2024},{title:'Schizofrenia refractară — opțiuni terapeutice actuale',year:2023}], contact:'Email', avatar:'MI', color:'from-amber-600 to-orange-600', requirementsNote:'Solicită o propunere de caz clinic sau temă de cercetare și CV. Colaborare cu Spitalul de Psihiatrie posibilă.' },
  ],
  PHARMACY: [
    { id:51, name:'Prof. Dr. Simona Vlad',      title:'Profesor universitar',     domain:'Farmacie clinică',               tags:['Interacțiuni medicamentoase','Farmacovigilență','Farmacoterapie'], available:true, slotsLeft:2, totalSlots:5, minGrade:8.5, language:'Română',         acceptsOther:true,  previousTheses:[{title:'Aderența la tratament în bolile cronice',year:2024},{title:'Reconcilierea medicației la externare',year:2023}], contact:'Email', avatar:'SV', color:'from-indigo-600 to-blue-600', requirementsNote:'Solicită un plan de temă cu aplicabilitate clinică și CV. Experiența de stagiu în farmacii este avantaj.' },
    { id:52, name:'Prof. Dr. Lucian Nistor',    title:'Profesor universitar',     domain:'Chimie farmaceutică',            tags:['Sinteza medicamentelor','HPLC','Validare analitica'],            available:true,  slotsLeft:3, totalSlots:5, minGrade:8.0, language:'Română / Engleză', acceptsOther:false, previousTheses:[{title:'Sinteza și caracterizarea de noi derivați de imidazol',year:2024},{title:'Metode spectrofotometrice în analiza farmaceutică',year:2023}], contact:'Teams', avatar:'LN', color:'from-violet-600 to-purple-600', requirementsNote:'Necesită cunoașterea tehnicilor analitice (HPLC, spectrofotometrie). Plan de sinteză sau analiză propus.' },
    { id:53, name:'Conf. Dr. Diana Ene',        title:'Conferențiar universitar',  domain:'Fitoterapie & Toxicologie',      tags:['Plante medicinale','Toxicologie clinică','Extracte standardizate'], available:true, slotsLeft:3, totalSlots:6, minGrade:7.5, language:'Română',         acceptsOther:true,  previousTheses:[{title:'Potențialul antioxidant al plantelor din flora spontană',year:2024},{title:'Toxicitate hepatică a medicamentelor pe bază de plante',year:2023}], contact:'Email', avatar:'DE', color:'from-emerald-600 to-teal-600', requirementsNote:'Acceptă teme cu extrase din flora spontană. Cunoașterea metodelor de evaluare biologică este avantaj.' },
    { id:54, name:'Conf. Dr. Oana Barbu',       title:'Conferențiar universitar',  domain:'Industrie farmaceutică',         tags:['Forme farmaceutice solide','GMP','Tehnologie farmaceutică'],    available:true,  slotsLeft:2, totalSlots:4, minGrade:8.0, language:'Română',          acceptsOther:false, previousTheses:[{title:'Sisteme nanoparticulate pentru eliberare controlată',year:2024},{title:'Optimizarea granulării umede prin design of experiments',year:2023}], contact:'Email', avatar:'OB', color:'from-amber-600 to-orange-600', requirementsNote:'Solicită un proiect de formulare sau optimizare tehnologică. Cunoașterea principiilor GMP este necesară.' },
  ],
  ENGINEERING: [
    { id:61, name:'Prof. Dr. Gheorghe Ababei',  title:'Profesor universitar',     domain:'Electronică & Automatizare',     tags:['Circuite integrate','FPGA','Control automat'],                   available:true,  slotsLeft:2, totalSlots:5, minGrade:8.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Controlul adaptiv al dronelor cu FPGA',year:2024},{title:'Procesarea digitală a semnalelor în timp real',year:2023}], contact:'Email', avatar:'GA', color:'from-indigo-600 to-blue-600', requirementsNote:'Solicită cunoașterea FPGA sau microcontrolerelor și un proiect hardware sau de simulare propus.' },
    { id:62, name:'Conf. Dr. Ioan Gavrilescu',  title:'Conferențiar universitar',  domain:'Inginerie mecanică',             tags:['CAD/CAM','Vibrații','Elemente finite (FEM)'],                    available:true,  slotsLeft:3, totalSlots:5, minGrade:8.0, language:'Română',          acceptsOther:false, previousTheses:[{title:'Analiza modală a structurilor metalice industriale',year:2024},{title:'Optimizarea topologică a componentelor imprimate 3D',year:2023}], contact:'Teams', avatar:'IG', color:'from-violet-600 to-purple-600', requirementsNote:'Necesită cunoașterea CAD (SolidWorks/CATIA) și un proiect de analiză FEM propus.' },
    { id:63, name:'Prof. Dr. Dana Călin',       title:'Profesor universitar',     domain:'Energetică & Mediu',             tags:['Energii regenerabile','Eficiență energetică','Rețele inteligente'], available:true, slotsLeft:2, totalSlots:4, minGrade:8.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Integrarea fotovoltaicelor în rețele de distribuție',year:2024},{title:'Stocarea energiei prin baterii Li-ion — modele termice',year:2023}], contact:'Email', avatar:'DC', color:'from-amber-600 to-yellow-600', requirementsNote:'Acceptă teme cu simulare energetică sau analiză de rețele. Plan de cercetare și CV la prima întâlnire.' },
    { id:64, name:'Lect. Dr. Radu Braha',       title:'Lector universitar',       domain:'Telecomunicații & IT',           tags:['Rețele 5G','Protocoale de comunicație','IoT industrial'],         available:true,  slotsLeft:4, totalSlots:6, minGrade:7.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Protocoale de comunicație pentru IIoT',year:2024},{title:'Securitatea rețelelor wireless în medii industriale',year:2023}], contact:'Email', avatar:'RB', color:'from-emerald-600 to-teal-600', requirementsNote:'Preferă teme cu implementare practică pe hardware real sau simulatoare de rețea (NS3, Packet Tracer).' },
  ],
  ARTS: [
    { id:71, name:'Prof. Dr. Viorica Panaite',  title:'Profesor universitar',     domain:'Pictură & Desen',                tags:['Ulei pe pânză','Tehnici mixte','Studiu de model'],               available:true,  slotsLeft:2, totalSlots:4, minGrade:8.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Corpul uman în arta contemporană românească',year:2024},{title:'Abstracționism și expresionism în pictura post-1989',year:2023}], contact:'Email', avatar:'VP', color:'from-indigo-600 to-violet-600', requirementsNote:'Solicită un portofoliu vizual (min. 10 lucrări) și o descriere a conceptului de diplomă.' },
    { id:72, name:'Prof. Dr. Dan Ene',          title:'Profesor universitar',     domain:'Sculptură & Ceramică',           tags:['Bronz','Ceramică raku','Instalație artistică'],                  available:true,  slotsLeft:3, totalSlots:5, minGrade:7.5, language:'Română',          acceptsOther:false, previousTheses:[{title:'Sculptura monumentală în spațiul public urban',year:2024},{title:'Ceramica tradițională și reinterpretarea contemporană',year:2023}], contact:'Teams', avatar:'DE', color:'from-amber-600 to-orange-600', requirementsNote:'Necesită portofoliu foto al lucrărilor și un proiect conceptual de sculptură sau ceramică.' },
    { id:73, name:'Conf. Dr. Luminița Trandafir',title:'Conferențiar universitar', domain:'Design grafic & Digital',        tags:['Branding','Tipografie','Ilustrație digitală'],                   available:true,  slotsLeft:3, totalSlots:6, minGrade:7.5, language:'Română / Engleză', acceptsOther:true,  previousTheses:[{title:'Identitate vizuală pentru instituții culturale',year:2024},{title:'Pictogramele în interfețele digitale — limbaj vizual',year:2023}], contact:'Email', avatar:'LT', color:'from-emerald-600 to-teal-600', requirementsNote:'Solicită un portofoliu de design (Behance sau PDF) și un brief al proiectului de diplomă.' },
    { id:74, name:'Conf. Dr. Mihai Stratulat',  title:'Conferențiar universitar',  domain:'Arhitectură de interior',       tags:['Design spații','Lumini','Materiale & texturi'],                  available:true,  slotsLeft:2, totalSlots:4, minGrade:8.0, language:'Română',          acceptsOther:true,  previousTheses:[{title:'Revitalizarea spațiilor industriale abandonate',year:2024},{title:'Designul iluminatului natural în spații comerciale',year:2023}], contact:'Email', avatar:'MS', color:'from-rose-600 to-pink-600', requirementsNote:'Acceptă teme de reabilitare sau design de spații noi. Portofoliu și schiță de concept la prima întâlnire.' },
  ],
}

// ── Tutors for existing faculty types ──────────────────────────────────────────
const EXISTING_TUTORS = {
  SCIENCES: [
    { id:11, name:'Cristina Florea',    year:3, subjects:['Analiză Matematică','Algebră','Geometrie'],        grade:9.5, sessions:42, rating:4.9, reviews:34, price:45, availability:['Luni 16-19','Miercuri 16-19','Sâmbătă 10-14'], style:'Demonstrații pas cu pas, exerciții gradate', avatar:'CF', color:'from-indigo-500 to-blue-500',   online:true  },
    { id:12, name:'Radu Antohi',        year:4, subjects:['Fizică','Biofizică','Chimie'],                     grade:9.2, sessions:27, rating:4.8, reviews:21, price:40, availability:['Joi 17-20','Sâmbătă 14-18'],                 style:'Experimente simulate, problemă cu problemă',  avatar:'RA', color:'from-violet-500 to-purple-500', online:true  },
    { id:13, name:'Mara Moldovan',      year:3, subjects:['Probabilități','Statistică','Logică matematică'],  grade:9.0, sessions:18, rating:4.7, reviews:14, price:40, availability:['Marți 16-19','Vineri 16-19'],                style:'Fișe clare, scheme de rezolvare',             avatar:'MM', color:'from-emerald-500 to-teal-500',  online:false },
  ],
  HUMANITIES: [
    { id:21, name:'Ioana Pilat',        year:4, subjects:['Filosofie','Etică','Logică'],                      grade:9.4, sessions:31, rating:4.9, reviews:25, price:40, availability:['Luni 17-20','Miercuri 17-20'],              style:'Texte filosofice comentate, argumentare',     avatar:'IP', color:'from-violet-500 to-purple-500', online:true  },
    { id:22, name:'Andrei Ghitta',      year:3, subjects:['Istorie modernă','Istoria mentalităților'],        grade:9.1, sessions:22, rating:4.8, reviews:17, price:35, availability:['Joi 17-20','Sâmbătă 10-14'],                style:'Cronologie vizuală, hărți istorice',          avatar:'AG', color:'from-indigo-500 to-blue-500',   online:true  },
    { id:23, name:'Daniela Tamba',      year:4, subjects:['Lingvistică','Literată română','Semiotică'],       grade:9.3, sessions:28, rating:4.9, reviews:22, price:40, availability:['Marți 17-20','Vineri 16-20'],               style:'Analiță de text, grile lingvistice',          avatar:'DT', color:'from-amber-500 to-orange-500', online:false },
  ],
  ECONOMICS: [
    { id:31, name:'Mădălina Apostol',   year:3, subjects:['Microeconomie','Marketing','Economie generală'],   grade:9.3, sessions:37, rating:4.9, reviews:30, price:50, availability:['Luni 16-20','Miercuri 16-20'],              style:'Studii de caz reale, aplicații practice',     avatar:'MA', color:'from-amber-500 to-yellow-500', online:true  },
    { id:32, name:'Florin Chirilă',     year:4, subjects:['Contabilitate','IFRS','Audit financiar'],          grade:9.5, sessions:51, rating:5.0, reviews:41, price:60, availability:['Joi 17-20','Sâmbătă 10-14'],                style:'Aplicații ERP, situații financiare reale',    avatar:'FC', color:'from-emerald-500 to-teal-500',  online:true  },
    { id:33, name:'Ioana Brînzan',      year:3, subjects:['Matematici Economice','Statistică economică'],     grade:9.1, sessions:24, rating:4.7, reviews:19, price:45, availability:['Marți 17-20','Vineri 16-19'],               style:'Formule, scheme, exerciții tip examen',       avatar:'IB', color:'from-indigo-500 to-blue-500',   online:false },
  ],
  MEDICINE: [
    { id:41, name:'Andreea Moisescu',  year:4, subjects:['Anatomie','Histologie','Biologie Celulară'],        grade:9.6, sessions:58, rating:5.0, reviews:47, price:65, availability:['Luni 17-20','Miercuri 17-20'],              style:'Atlas anatomic, modele 3D, repetiție sistematică', avatar:'AM', color:'from-indigo-500 to-blue-500',   online:true  },
    { id:42, name:'Bogdan Tăbăcaru',  year:5, subjects:['Fiziologie','Farmacologie','Semiologie'],           grade:9.4, sessions:43, rating:4.9, reviews:35, price:70, availability:['Joi 16-20','Sâmbătă 10-14'],                style:'Scheme clinice, cazuri discutate, flashcard-uri', avatar:'BT', color:'from-violet-500 to-purple-500', online:true  },
    { id:43, name:'Diana Costache',   year:3, subjects:['Biochimie Medicală','Chimie organică'],             grade:9.2, sessions:29, rating:4.8, reviews:23, price:55, availability:['Marți 16-20','Vineri 16-20'],               style:'Reacții biochimice vizualizate, mnemonice',   avatar:'DC', color:'from-emerald-500 to-teal-500',  online:false },
  ],
  PHARMACY: [
    { id:51, name:'Mihaela Săndulescu', year:4, subjects:['Chimie Organică','Chimie Analitică'],              grade:9.5, sessions:36, rating:4.9, reviews:29, price:55, availability:['Luni 17-20','Miercuri 17-20'],              style:'Mecanisme de reacție vizualizate, tabele',   avatar:'MS', color:'from-violet-500 to-purple-500', online:true  },
    { id:52, name:'Radu Florea',        year:3, subjects:['Botanică Farmaceutică','Fitochimie'],              grade:9.3, sessions:21, rating:4.8, reviews:16, price:45, availability:['Joi 17-20','Sâmbătă 10-14'],                style:'Ierbar digital, atlasuri botanice',           avatar:'RF', color:'from-emerald-500 to-teal-500',  online:true  },
    { id:53, name:'Ioana Ionescu',      year:5, subjects:['Farmacologie','Farmacie clinică','Biochimie'],     grade:9.7, sessions:47, rating:5.0, reviews:38, price:65, availability:['Marți 17-20','Vineri 16-20'],               style:'Clase de medicamente sistematizate, spețe',  avatar:'II', color:'from-amber-500 to-orange-500', online:false },
  ],
  ENGINEERING: [
    { id:61, name:'Laurențiu Apetrei',  year:4, subjects:['Matematici Superioare','Fizică','Electronică'],    grade:9.3, sessions:39, rating:4.9, reviews:31, price:50, availability:['Luni 16-20','Miercuri 16-20'],              style:'Probleme pas cu pas, exerciții de la zero',  avatar:'LA', color:'from-indigo-500 to-blue-500',   online:true  },
    { id:62, name:'Teodora Căpraru',    year:3, subjects:['Electronică Analogică','Sisteme Digitale'],        grade:9.1, sessions:26, rating:4.8, reviews:20, price:50, availability:['Joi 17-20','Sâmbătă 10-14'],                style:'Simulare Multisim, scheme comentate',         avatar:'TC', color:'from-violet-500 to-purple-500', online:true  },
    { id:63, name:'Sorin Iftodi',       year:4, subjects:['Mecanică','Desen Tehnic','Rezistența materialelor'],grade:9.0, sessions:31, rating:4.7, reviews:24, price:45, availability:['Marți 17-20','Vineri 16-20'],              style:'AutoCAD direct, probleme de rezistență',     avatar:'SI', color:'from-amber-500 to-orange-500', online:false },
  ],
  ARTS: [
    { id:71, name:'Bianca Olaru',       year:4, subjects:['Desen','Pictură','Studiu de model'],               grade:9.4, sessions:29, rating:4.9, reviews:23, price:55, availability:['Luni 15-19','Miercuri 15-19'],              style:'Critică de atelier, tehnici variante',        avatar:'BO', color:'from-indigo-500 to-violet-500', online:true  },
    { id:72, name:'Cristian Lupu',      year:3, subjects:['Design Grafic','Ilustrație','Adobe Suite'],        grade:9.2, sessions:34, rating:4.8, reviews:27, price:60, availability:['Joi 16-20','Sâmbătă 10-14'],                style:'Proiecte reale, feedback vizual imediat',     avatar:'CL', color:'from-amber-500 to-orange-500', online:true  },
    { id:73, name:'Ana Ciocan',         year:4, subjects:['Istoria Artei','Estetică','Teoria culorii'],        grade:9.1, sessions:20, rating:4.7, reviews:16, price:45, availability:['Marți 17-20','Vineri 16-19'],               style:'Slideshow cu opere, analiță vizuală',         avatar:'AC', color:'from-emerald-500 to-teal-500',  online:false },
  ],
}

// ── Skill swap for existing faculty types ──────────────────────────────────────
const EXISTING_SKILL_SWAP = {
  SCIENCES: [
    { id:1, name:'Cristina Florea',  avatar:'CF', teaches:'Analiză Matematică', learns:'Programare Python & R',      teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
    { id:2, name:'Radu Antohi',      avatar:'RA', teaches:'Fizică aplicată',    learns:'GIS & date geospațiale',    teachLevel:'Intermediar',learnLevel:'Incepator',   match:false, online:true  },
    { id:3, name:'Mara Moldovan',    avatar:'MM', teaches:'Statistică & R',     learns:'Machine learning aplicat',  teachLevel:'Avansat',    learnLevel:'Intermediar',match:true,  online:false },
  ],
  HUMANITIES: [
    { id:1, name:'Ioana Pilat',      avatar:'IP', teaches:'Argumentare filosofică', learns:'Scriere academică în engleză', teachLevel:'Avansat',    learnLevel:'Intermediar',match:true,  online:true  },
    { id:2, name:'Andrei Ghitta',    avatar:'AG', teaches:'Cercetare de arhivă',    learns:'Digital humanities & Excel',  teachLevel:'Intermediar',learnLevel:'Incepator',   match:true,  online:false },
    { id:3, name:'Daniela Tamba',    avatar:'DT', teaches:'Analiță literară',       learns:'Tehnici de interviu oral',    teachLevel:'Avansat',    learnLevel:'Incepator',   match:false, online:true  },
  ],
  ECONOMICS: [
    { id:1, name:'Mădălina Apostol', avatar:'MA', teaches:'Marketing digital & SEO', learns:'SQL & Power BI',            teachLevel:'Avansat',    learnLevel:'Incepator',   match:true,  online:true  },
    { id:2, name:'Florin Chirilă',   avatar:'FC', teaches:'Contabilitate & IFRS',    learns:'Programare Python pentru finanțe', teachLevel:'Avansat', learnLevel:'Intermediar',match:true, online:true  },
    { id:3, name:'Ioana Brînzan',    avatar:'IB', teaches:'Econometrie & Statistică',learns:'Prezentare & public speaking', teachLevel:'Intermediar',learnLevel:'Incepator',  match:false, online:false },
  ],
  MEDICINE: [
    { id:1, name:'Andreea Moisescu', avatar:'AM', teaches:'Anatomie topografică',    learns:'Limbă engleză medicală',    teachLevel:'Avansat',    learnLevel:'Intermediar',match:true,  online:true  },
    { id:2, name:'Bogdan Tăbăcaru',  avatar:'BT', teaches:'Farmacologie clinică',    learns:'Tehnici de suturare',       teachLevel:'Intermediar',learnLevel:'Incepator',   match:true,  online:true  },
    { id:3, name:'Diana Costache',   avatar:'DC', teaches:'Biochimie medicală',      learns:'Interpretare EKG',          teachLevel:'Avansat',    learnLevel:'Incepator',   match:false, online:false },
  ],
  PHARMACY: [
    { id:1, name:'Mihaela Săndulescu',avatar:'MS', teaches:'Chimie organică — mecanisme', learns:'Programare Python pentru farmacovigil.', teachLevel:'Avansat', learnLevel:'Incepator', match:true, online:true },
    { id:2, name:'Radu Florea',       avatar:'RF', teaches:'Botanică & fitochimie', learns:'Limbă latină farmaceutică',  teachLevel:'Intermediar',learnLevel:'Incepator',   match:false, online:true  },
    { id:3, name:'Ioana Ionescu',     avatar:'II', teaches:'Farmacocinetică',        learns:'Bioinformatică & DrugBank', teachLevel:'Avansat',    learnLevel:'Intermediar',match:true,  online:false },
  ],
  ENGINEERING: [
    { id:1, name:'Laurențiu Apetrei', avatar:'LA', teaches:'Electronică analogică',  learns:'Programare Embedded (C++)',  teachLevel:'Avansat',    learnLevel:'Intermediar',match:true,  online:true  },
    { id:2, name:'Teodora Căpraru',   avatar:'TC', teaches:'Simulare Multisim',      learns:'Proiectare CAD 3D (Fusion)', teachLevel:'Intermediar',learnLevel:'Incepator',   match:true,  online:true  },
    { id:3, name:'Sorin Iftodi',      avatar:'SI', teaches:'Rezistența materialelor',learns:'Python pentru inginerie',    teachLevel:'Avansat',    learnLevel:'Incepator',   match:false, online:false },
  ],
  ARTS: [
    { id:1, name:'Bianca Olaru',      avatar:'BO', teaches:'Tehnici de desen clasic', learns:'Ilustrație digitală (Procreate)', teachLevel:'Avansat', learnLevel:'Incepator', match:true, online:true },
    { id:2, name:'Cristian Lupu',     avatar:'CL', teaches:'Design grafic & branding',learns:'Fotografie de produs',      teachLevel:'Avansat',    learnLevel:'Intermediar',match:false, online:true  },
    { id:3, name:'Ana Ciocan',        avatar:'AC', teaches:'Istoria artei occidentale',learns:'Design de interior 3D',    teachLevel:'Intermediar',learnLevel:'Incepator',   match:true,  online:false },
  ],
}

// ── Group sessions for existing faculty types ──────────────────────────────────
const EXISTING_GROUP_SESSIONS = {
  SCIENCES: [
    { id:1, host:'Cristina Florea', topic:'Rezolvare probleme analiză matematică — sesiune', date:'Sâmbătă, 18 Mai', time:'10:00', spots:3, totalSpots:4, type:'study', tags:['Analiză','Matematică','Examen'] },
    { id:2, host:'Radu Antohi',     topic:'Grup fizică — pregătire examen cuantică',        date:'Joi, 22 Mai',     time:'17:00', spots:2, totalSpots:4, type:'teach', tags:['Fizică','Cuantică','Probleme'] },
    { id:3, host:'Mara Moldovan',   topic:'Atelier statistică — SPSS & R de la zero',      date:'Duminică, 19 Mai',time:'14:00', spots:3, totalSpots:4, type:'teach', tags:['Statistică','R','SPSS'] },
  ],
  HUMANITIES: [
    { id:1, host:'Ioana Pilat',     topic:'Dezbatere filozofică — identitate și etică',    date:'Sâmbătă, 18 Mai', time:'11:00', spots:3, totalSpots:6, type:'study', tags:['Filosofie','Dezbatere','Etică'] },
    { id:2, host:'Andrei Ghitta',   topic:'Atelier cercetare istorică — surse primare',    date:'Joi, 22 Mai',     time:'17:00', spots:2, totalSpots:4, type:'teach', tags:['Istorie','Arhivă','Cercetare'] },
    { id:3, host:'Daniela Tamba',   topic:'Grup analiță literară — romanul interbelic',   date:'Duminică, 19 Mai',time:'15:00', spots:3, totalSpots:4, type:'study', tags:['Literatură','Text','Analiță'] },
  ],
  ECONOMICS: [
    { id:1, host:'Mădălina Apostol',topic:'Studiu de caz real — startup marketing',       date:'Sâmbătă, 18 Mai', time:'10:00', spots:2, totalSpots:4, type:'teach', tags:['Marketing','Caz','Business'] },
    { id:2, host:'Florin Chirilă',  topic:'Grup contabilitate — situații financiare IFRS', date:'Joi, 22 Mai',     time:'17:00', spots:3, totalSpots:4, type:'study', tags:['Contabilitate','IFRS','Practică'] },
    { id:3, host:'Ioana Brînzan',   topic:'Pregătire examen econometrie',                 date:'Duminică, 19 Mai',time:'14:00', spots:2, totalSpots:4, type:'study', tags:['Econometrie','Regresie','Examen'] },
  ],
  MEDICINE: [
    { id:1, host:'Andreea Moisescu',topic:'Grup anatomie — preparare examen practic',     date:'Sâmbătă, 18 Mai', time:'9:00',  spots:2, totalSpots:4, type:'study', tags:['Anatomie','Practic','Examen'] },
    { id:2, host:'Bogdan Tăbăcaru', topic:'Caz clinic — management AVC ischemic',        date:'Joi, 22 Mai',     time:'17:00', spots:3, totalSpots:4, type:'teach', tags:['Clinică','AVC','Neurologie'] },
    { id:3, host:'Diana Costache',  topic:'Biochimie — mecanisme metabolice vizualizate', date:'Duminică, 19 Mai',time:'14:00', spots:2, totalSpots:4, type:'study', tags:['Biochimie','Metabolism','Scheme'] },
  ],
  PHARMACY: [
    { id:1, host:'Mihaela Săndulescu',topic:'Mecanisme de reacție organică — Chimie farm.',date:'Sâmbătă, 18 Mai', time:'10:00', spots:2, totalSpots:4, type:'teach', tags:['Chimie Org.','Mecanisme','Farmaceutic'] },
    { id:2, host:'Ioana Ionescu',   topic:'Grup farmacologie — clase de medicamente',     date:'Joi, 22 Mai',     time:'17:00', spots:3, totalSpots:4, type:'study', tags:['Farmacologie','Medicamente','Clinică'] },
  ],
  ENGINEERING: [
    { id:1, host:'Laurențiu Apetrei',topic:'Atelier electronică — circuite pe breadboard', date:'Sâmbătă, 18 Mai', time:'10:00', spots:2, totalSpots:4, type:'teach', tags:['Electronică','Laborator','Practică'] },
    { id:2, host:'Teodora Căpraru', topic:'Simulare Multisim — amplifiatoare operaționale',date:'Joi, 22 Mai',     time:'17:00', spots:3, totalSpots:4, type:'teach', tags:['Multisim','Op-Amp','Simulare'] },
    { id:3, host:'Sorin Iftodi',    topic:'Grup rezistența materialelor — probleme',       date:'Duminică, 19 Mai',time:'14:00', spots:2, totalSpots:4, type:'study', tags:['Rezistența mat.','Calcul','Examen'] },
  ],
  ARTS: [
    { id:1, host:'Bianca Olaru',    topic:'Sesiune de desen — studiu de model live',      date:'Sâmbătă, 18 Mai', time:'10:00', spots:3, totalSpots:6, type:'study', tags:['Desen','Model','Atelier'] },
    { id:2, host:'Cristian Lupu',   topic:'Atelier Photoshop & Illustrator — design UI',  date:'Joi, 22 Mai',     time:'17:00', spots:2, totalSpots:4, type:'teach', tags:['Design Grafic','Adobe','UI'] },
    { id:3, host:'Ana Ciocan',      topic:'Istoria artei — impresionismul francez',       date:'Duminică, 19 Mai',time:'15:00', spots:3, totalSpots:4, type:'study', tags:['Istoria artei','Impresionism','Analiță'] },
  ],
}

// ── Assembled exports ──────────────────────────────────────────────────────────
export const ALL_FACULTY_QUESTIONS = {
  ...FACULTY_QUESTIONS,
  ...EXTRA_QUESTIONS,
}

export const ALL_FACULTY_SCHEDULES = {
  ...FACULTY_SCHEDULES,
  ...EXTRA_SCHEDULES,
}

export const PROFESSORS_BY_TYPE = {
  CS:          csProfessors,
  SCIENCES:    EXISTING_PROFESSORS.SCIENCES,
  HUMANITIES:  EXISTING_PROFESSORS.HUMANITIES,
  ECONOMICS:   EXISTING_PROFESSORS.ECONOMICS,
  MEDICINE:    EXISTING_PROFESSORS.MEDICINE,
  PHARMACY:    EXISTING_PROFESSORS.PHARMACY,
  ENGINEERING: EXISTING_PROFESSORS.ENGINEERING,
  ARTS:        EXISTING_PROFESSORS.ARTS,
  ...EXTRA_PROFESSORS,
}

export const TUTORS_BY_TYPE = {
  CS:          csTutors,
  SCIENCES:    EXISTING_TUTORS.SCIENCES,
  HUMANITIES:  EXISTING_TUTORS.HUMANITIES,
  ECONOMICS:   EXISTING_TUTORS.ECONOMICS,
  MEDICINE:    EXISTING_TUTORS.MEDICINE,
  PHARMACY:    EXISTING_TUTORS.PHARMACY,
  ENGINEERING: EXISTING_TUTORS.ENGINEERING,
  ARTS:        EXISTING_TUTORS.ARTS,
  ...EXTRA_TUTORS,
}

export const SKILL_SWAP_BY_TYPE = {
  CS:          csSkillSwap,
  SCIENCES:    EXISTING_SKILL_SWAP.SCIENCES,
  HUMANITIES:  EXISTING_SKILL_SWAP.HUMANITIES,
  ECONOMICS:   EXISTING_SKILL_SWAP.ECONOMICS,
  MEDICINE:    EXISTING_SKILL_SWAP.MEDICINE,
  PHARMACY:    EXISTING_SKILL_SWAP.PHARMACY,
  ENGINEERING: EXISTING_SKILL_SWAP.ENGINEERING,
  ARTS:        EXISTING_SKILL_SWAP.ARTS,
  ...EXTRA_SKILL_SWAP,
}

export const GROUP_SESSIONS_BY_TYPE = {
  CS:          csGroupSessions,
  SCIENCES:    EXISTING_GROUP_SESSIONS.SCIENCES,
  HUMANITIES:  EXISTING_GROUP_SESSIONS.HUMANITIES,
  ECONOMICS:   EXISTING_GROUP_SESSIONS.ECONOMICS,
  MEDICINE:    EXISTING_GROUP_SESSIONS.MEDICINE,
  PHARMACY:    EXISTING_GROUP_SESSIONS.PHARMACY,
  ENGINEERING: EXISTING_GROUP_SESSIONS.ENGINEERING,
  ARTS:        EXISTING_GROUP_SESSIONS.ARTS,
  ...EXTRA_GROUP_SESSIONS,
}

export const THESIS_DOMAINS_BY_TYPE = EXTRA_THESIS_DOMAINS
export const SUBJECT_FILTERS_BY_TYPE = EXTRA_SUBJECT_FILTERS

