// City: Iași — adapt per university city via config

export const arrivalChecklist = [
  // DOCUMENTE
  { id:1,  cat:'Documente',  icon:'📋', title:'Înregistrare la secretariat',         desc:'Predă dosarul de înmatriculare, primești carnetul de student și parola WiFi campus.',  urgency:'critical', deadline:'Săptămâna 1', done:false, tip:'Adu 2 copii ale tuturor documentelor — secretariatul e mereu la parter în clădirea H.' },
  { id:2,  cat:'Documente',  icon:'🪪', title:'Carte de identitate actualizată',      desc:'Actualizează adresa cu cea din cămin sau chirie. Necesară pentru legitimații de transport.', urgency:'high', deadline:'Luna 1', done:false, tip:'Secția 1 de Poliție Iași este cea mai apropiată de campus.' },
  { id:3,  cat:'Documente',  icon:'🎓', title:'Carnet de student fizic',              desc:'Ridică-l de la secretariat după confirmare. Îți dă acces la reduceri și bibliotecă.',  urgency:'high', deadline:'Săptămâna 2', done:false, tip:null },
  { id:4,  cat:'Documente',  icon:'📸', title:'Poze tip buletin (6 bucăți)',          desc:'Necesare pentru carnet, dosar medical, legitimație transport.',  urgency:'medium', deadline:'Luna 1', done:false, tip:'Foto Iași din apropierea gării face poze în 15 minute, 25 lei.' },

  // FINANȚE
  { id:5,  cat:'Finanțe',    icon:'🏦', title:'Deschide cont bancar studențesc',      desc:'BCR, BT sau CEC au conturi gratuite pentru studenți. Necesar pentru primirea bursei.',  urgency:'critical', deadline:'Săptămâna 2', done:false, tip:'BCR Iași de pe Str. Lăpușneanu are ghișeu dedicat studenților UAIC.' },
  { id:6,  cat:'Finanțe',    icon:'💳', title:'Activează cardul de bursa',            desc:'Bursele se virează automat dacă contul e activat și legat la secretariat.',  urgency:'high', deadline:'Luna 1', done:false, tip:null },
  { id:7,  cat:'Finanțe',    icon:'📊', title:'Buget lunar estimat',                  desc:'Cazare ~400 lei, mâncare ~600 lei, transport ~60 lei, materiale ~200 lei. Total ~1260 lei/lună.', urgency:'low', deadline:null, done:false, tip:'Cantina din campus: meniu complet 22 lei.' },

  // TRANSPORT
  { id:8,  cat:'Transport',  icon:'🚌', title:'Abonament transport studențesc',       desc:'Reducere 50% pe toate liniile CTP Iași. Necesită carnet + CI actualizat.',  urgency:'high', deadline:'Săptămâna 2', done:false, tip:'Ghișeul CTP e la Piața Unirii, program L-V 8-18. Abonament lunar 30 lei (față de 60).' },
  { id:9,  cat:'Transport',  icon:'🚲', title:'Înregistrare veloiași',                desc:'Sistem bike-sharing urban. Prima jumătate de oră gratuită cu carnet de student.',  urgency:'low', deadline:null, done:false, tip:'Stație Veloiași chiar lângă intrarea principală UAIC.' },

  // SĂNĂTATE
  { id:10, cat:'Sănătate',   icon:'🏥', title:'Înscrie-te la medic de familie',       desc:'Medicul de familie de pe campus este gratuit pentru studenți cu asigurare.',  urgency:'high', deadline:'Luna 1', done:false, tip:'Cabinetul medical studențesc UAIC: Bd. Carol I nr. 11, program L-V 8-14.' },
  { id:11, cat:'Sănătate',   icon:'💊', title:'Asigurare sănătate activă',            desc:'Studenții cu frecvență sunt asigurați automat. Verifică cu secretariatul.',  urgency:'medium', deadline:'Săptămâna 3', done:false, tip:null },
  { id:12, cat:'Sănătate',   icon:'🧠', title:'Servicii de consiliere psihologică',   desc:'UAIC oferă gratuit 6 sesiuni de consiliere/an. Anonime, fără dosar medical.',  urgency:'low', deadline:null, done:false, tip:'Programare online pe site-ul UAIC, secțiunea Bunăstare Studențesc.' },

  // SOCIAL
  { id:13, cat:'Social',     icon:'🤝', title:'Integrare în grupul de an',            desc:'Grupul de WhatsApp/Telegram al grupei tale — cere link la prima oră de curs.',  urgency:'medium', deadline:'Săptămâna 1', done:false, tip:null },
  { id:14, cat:'Social',     icon:'🎉', title:'Welcome week & activități',            desc:'Prima săptămână are activități de integrare. Prezența voluntară dar recomandată.',  urgency:'low', deadline:'Săptămâna 1', done:false, tip:'Liga Studenților FII organizează petrecerea de bun-venit în fiecare an.' },
]

export const studentDiscounts = [
  // ── Iași ────────────────────────────────────────────────────────────────────
  { id:1,  name:'McDonald\'s Palas',         cat:'Mâncare',   city:'Iași',        discount:'20% cu carnet',      distance:'15 min', verified:true,  hot:true,  desc:'Valabil L-V 10-16 cu carnet student fizic.',                                           address:'Palas Mall, Iași' },
  { id:2,  name:'KFC Podu Roș',              cat:'Mâncare',   city:'Iași',        discount:'15% cu carnet',      distance:'20 min', verified:true,  hot:false, desc:'Meniu student 25 lei (burger + cartofi + suc).',                                        address:'Str. Elena Doamna, Iași' },
  { id:3,  name:'Brutăria Moldovei',         cat:'Mâncare',   city:'Iași',        discount:'Cornuri 2 lei',       distance:'5 min',  verified:true,  hot:true,  desc:'Brutărie lângă campus, pâine proaspătă de la 07:00.',                                   address:'Bd. Carol I, lângă campus' },
  { id:4,  name:'CTP Iași — studenți bugetari', cat:'Transport', city:'Iași',     discount:'-90% · ~6 lei/lună', distance:'0 min',  verified:true,  hot:true,  desc:'Studenți bugetari sub 26 ani cu CI în Iași: abonament 30 zile ~6 lei (față de 130 lei normal). Carnet vizat + CI + adeverință. Ghișeu CTP Piața Unirii L-V 8-18 sau app 24pay.', address:'Piața Unirii, Iași' },
  { id:5,  name:'CTP Iași — studenți cu taxă', cat:'Transport', city:'Iași',     discount:'-50% · ~40 lei/lună', distance:'0 min', verified:true,  hot:false, desc:'Studenți cu taxă sub 26 ani cu CI în Iași: abonament 30 zile ~40 lei (față de 130 lei). Carnet + CI + adeverință. Ghișeu CTP Piața Unirii.',                                  address:'Piața Unirii, Iași' },
  { id:6,  name:'CTP Iași — decontare TUIASI', cat:'Transport', city:'Iași',     discount:'-90% decontat',      distance:'0 min',  verified:true,  hot:true,  desc:'Studenții TUIASI cu frecvență până la 30 ani: 90% din abonament decontat de universitate. Plătești ~13 lei/lună. Depui cerere la secretariat semestrial.', address:'Campus TUIASI / Secretariat' },
  { id:7,  name:'Veloiași',                  cat:'Transport', city:'Iași',        discount:'30 min gratuit/zi',  distance:'2 min',  verified:true,  hot:false, desc:'Bike-sharing urban. Prima 30 min gratuită zilnic cu carnet de student. Stație chiar lângă campus UAIC.',                                                  address:'Campus UAIC, Iași' },
  { id:8,  name:'Cinema Ateneu Iași',        cat:'Cultură',   city:'Iași',        discount:'-40% cu carnet',     distance:'25 min', verified:true,  hot:false, desc:'Bilet student 15 lei față de 25. Valabil la orice proiecție.',                          address:'Str. Cuza Vodă 4, Iași' },
  { id:9,  name:'Teatrul Național Iași',     cat:'Cultură',   city:'Iași',        discount:'-50% student',       distance:'20 min', verified:true,  hot:true,  desc:'Bilet student de la 15 lei. Înregistrare online pe tni.ro.',                            address:'Str. Agatha Bârsescu, Iași' },
  { id:10, name:'Filarmonica Moldova Iași',  cat:'Cultură',   city:'Iași',        discount:'10 lei bilet',       distance:'20 min', verified:false, hot:false, desc:'Bilete cu preț redus pentru studenți, cantitate limitată.',                             address:'Str. Cuza Vodă, Iași' },
  { id:11, name:'Iulius Mall Iași',          cat:'Shopping',  city:'Iași',        discount:'Card loyalty',       distance:'30 min', verified:false, hot:false, desc:'Program Iulius Student cu puncte și reduceri la parteneri.',                            address:'Str. Anastasie Panu, Iași' },
  { id:12, name:'Gym Campus UAIC',           cat:'Sport',     city:'Iași',        discount:'Gratuit',            distance:'3 min',  verified:true,  hot:true,  desc:'Sală de sport din baza sportivă a universității, gratuită cu carnet.',                  address:'Campus UAIC' },
  { id:13, name:'Piscina Campus UAIC',       cat:'Sport',     city:'Iași',        discount:'10 lei/intrare',     distance:'3 min',  verified:true,  hot:false, desc:'Piscina semi-olimpică disponibilă studenților UAIC.',                                   address:'Campus UAIC' },
  { id:14, name:'Librăria Universității',    cat:'Rechizite', city:'Iași',        discount:'-15% cu carnet',     distance:'2 min',  verified:true,  hot:false, desc:'Manuale, rechizite, materiale didactice cu reducere.',                                  address:'Bd. Carol I, campus' },
  // ── Cluj-Napoca ─────────────────────────────────────────────────────────────
  { id:20, name:'CTP Cluj-Napoca — GRATUIT', cat:'Transport', city:'Cluj-Napoca', discount:'GRATUIT',            distance:'0 min',  verified:true,  hot:true,  desc:'Studenți sub 30 ani înscriși la universități din Cluj cu frecvență: transport 100% gratuit pe rețeaua CTP. Universitatea + CTP + Primăria acoperă integral costul. Solicită de la secretariat adeverință pentru CTP.', address:'ctpcj.ro / Secretariat universitate' },
  { id:21, name:'Velocluj',                  cat:'Transport', city:'Cluj-Napoca', discount:'30 min gratuit/zi',  distance:'5 min',  verified:true,  hot:false, desc:'Bike-sharing Cluj. Prima 30 min gratuită zilnic cu legitimație de student.',           address:'Multiple stații, Cluj-Napoca' },
  { id:22, name:'Cineplexx Iulius Mall Cluj',cat:'Cultură',   city:'Cluj-Napoca', discount:'-30% cu carnet',     distance:'20 min', verified:true,  hot:true,  desc:'Bilet student ~22 lei. Valabil la proiecțiile de L-J.',                                address:'Iulius Mall, Cluj-Napoca' },
  { id:23, name:'Teatrul Național Cluj',     cat:'Cultură',   city:'Cluj-Napoca', discount:'-50% student',       distance:'10 min', verified:true,  hot:false, desc:'Bilet de la 10 lei. Program student online pe tncj.ro.',                               address:'Piața Ștefan cel Mare, Cluj-Napoca' },
  { id:24, name:'Gym UBB',                   cat:'Sport',     city:'Cluj-Napoca', discount:'Gratuit / 5 lei',    distance:'5 min',  verified:true,  hot:false, desc:'Sală de sport UBB gratuită cu carnet sau 5 lei/intrare pentru alte facultăți.',         address:'Str. Teodor Mihali, Cluj-Napoca' },
  // ── București ───────────────────────────────────────────────────────────────
  { id:30, name:'STB București',             cat:'Transport', city:'București',   discount:'-90% · 8 lei/lună',  distance:'0 min',  verified:true,  hot:true,  desc:'Studenți înscriși în instituții acreditate din București-Ilfov: abonament STB (autobuze, tramvaie, troleibuze) 8 lei/lună față de 80 lei. Card student STB la ghișeele STB cu carnet vizat + CI.', address:'Ghișee STB, București' },
  { id:31, name:'Metrorex București',        cat:'Transport', city:'București',   discount:'-90% · 8 lei/lună',  distance:'0 min',  verified:true,  hot:true,  desc:'Studenți din București-Ilfov: abonament metrou 8 lei/lună față de 80 lei. Card Metrorex separat de STB. Ghișee la toate stațiile de metrou, carnet vizat + CI.', address:'Stații metrou, București' },
  { id:32, name:'Cinema Pro București',      cat:'Cultură',   city:'București',   discount:'-40% cu carnet',     distance:'15 min', verified:true,  hot:false, desc:'Bilet student 15 lei. Film de artă și independent.',                                   address:'Str. Ion Ghica 3, București' },
  { id:33, name:'Teatrul Național București',cat:'Cultură',   city:'București',   discount:'-50% student',       distance:'10 min', verified:true,  hot:true,  desc:'Bilet de la 20 lei. Program student pe tnb.ro.',                                       address:'Bd. N. Bălcescu 2, București' },
  { id:34, name:'Gym Complexul Regie',       cat:'Sport',     city:'București',   discount:'Gratuit',            distance:'5 min',  verified:true,  hot:false, desc:'Sală de sport și bazin pentru studenții din căminele Regie cu carnet.',                 address:'Grozăvești (Regie), București' },
  // ── Timișoara ───────────────────────────────────────────────────────────────
  { id:40, name:'STPT Timișoara — UVT',      cat:'Transport', city:'Timișoara',   discount:'GRATUIT (UVT)',      distance:'0 min',  verified:true,  hot:true,  desc:'Studenți UVT: 90% decontat de UVT + 10% de Primăria Timișoara = transport GRATUIT efectiv pe toată rețeaua STPT (autobuze, tramvaie, troleibuze). Depui cerere la secretariat UVT la începutul anului.', address:'uvt.ro / Secretariat UVT' },
  { id:41, name:'STPT Timișoara — UPT/alte', cat:'Transport', city:'Timișoara',   discount:'-50% abonament',     distance:'0 min',  verified:true,  hot:false, desc:'Studenți UPT și alte universități: abonament STPT lunar ~20 lei (față de 40 lei). Card STPT student cu carnet vizat. Ghișee STPT Piața Victoriei.',       address:'Piața Victoriei, Timișoara' },
  { id:42, name:'Cinema Timiș',              cat:'Cultură',   city:'Timișoara',   discount:'-30% cu carnet',     distance:'15 min', verified:true,  hot:false, desc:'Bilet student ~18 lei. Valabil L-V.',                                                  address:'Str. Mărășești, Timișoara' },
  { id:43, name:'Teatrul Național Timișoara',cat:'Cultură',   city:'Timișoara',   discount:'-50% student',       distance:'10 min', verified:true,  hot:false, desc:'Bilet de la 12 lei. Program pe tntimisoara.ro.',                                       address:'Str. Mărășești, Timișoara' },
  { id:44, name:'Iulius Town Timișoara',     cat:'Shopping',  city:'Timișoara',   discount:'Card loyalty',       distance:'15 min', verified:false, hot:false, desc:'Program Iulius Student cu reduceri la parteneri.',                                      address:'Calea Torontalului, Timișoara' },
  // ── Târgu Mureș ─────────────────────────────────────────────────────────────
  { id:50, name:'Mureș Transport',           cat:'Transport', city:'Târgu Mureș', discount:'-50% abonament',     distance:'0 min',  verified:true,  hot:false, desc:'Studenți UMFST și alte universități din Târgu Mureș: abonament lunar ~15 lei (față de ~30 lei). Carnet vizat la ghișeul Mureș Transport, Piața Trandafirilor.', address:'Piața Trandafirilor, Târgu Mureș' },
  // ── Craiova ─────────────────────────────────────────────────────────────────
  { id:60, name:'RAT Craiova',               cat:'Transport', city:'Craiova',     discount:'-50% abonament',     distance:'0 min',  verified:true,  hot:false, desc:'Studenți înscriși la instituții de învățământ din Craiova: 50% reducere la abonamentele lunare RAT, pe toate mijloacele. Card student RAT cu legitimație vizată. Ghișee RAT în Piața Centrală, L-V 9-17.', address:'Calea București bl.17A, Craiova' },
  // ── Național ────────────────────────────────────────────────────────────────
  { id:70, name:'CFR Călători — tren',       cat:'Transport', city:'Național',    discount:'-50% la tren',       distance:'—',      verified:true,  hot:true,  desc:'Studenți cu frecvență până la 26 ani: 50% reducere la toate trenurile CFR (Interregio, Regio, IR). Necesită carnet vizat + adeverință de student pentru fiecare an universitar. Bilete la ghișeele CFR sau online cfrcalatori.ro.', address:'Gări CFR / cfrcalatori.ro' },
]

export const localTips = [
  { id:1,  author:'Andrei M., An 3 FII',  avatar:'AM', upvotes:134, cat:'Mâncare',    verified:true,  text:'Brutăria din colțul campusului (Str. Carol I) face cornuri proaspete la 7:00 fix. Dacă ajungi la 7:05, sunt deja gata. 2 lei cornul.' },
  { id:2,  author:'Diana L., An 2 Drept', avatar:'DL', upvotes:98,  cat:'Transport',  verified:true,  text:'Linia 3 și linia 8 trec cel mai aproape de campus. Aplicația iAȘI Bus îți arată în timp real când vine autobuzul. Mai precisă decât mersul oficial.' },
  { id:3,  author:'Mihai C., An 4 FII',   avatar:'MC', upvotes:89,  cat:'Academic',   verified:true,  text:'Biblioteca UAIC de pe Copou are un etaj 1 cu locuri de studiu disponibile 24/7. Card student obligatoriu la intrare.' },
  { id:4,  author:'Sabina T., An 1 Med',  avatar:'ST', upvotes:76,  cat:'Mâncare',    verified:false, text:'Piața Veche din centru (La Anchidin) are legume și fructe cu ~40% mai ieftine decât Kaufland. La 10 minute cu linia 3.' },
  { id:5,  author:'Radu A., Erasmus',     avatar:'RA', upvotes:71,  cat:'Social',     verified:true,  text:'ESN Iași organizează evenimente gratuite pentru studenți internaționali în fiecare săptămână. Grupul Facebook ESN UAIC.' },
  { id:6,  author:'Elena R., An 2 Eco',   avatar:'ER', upvotes:67,  cat:'Birocrație', verified:true,  text:'Dacă vrei să îți actualizezi CI-ul cu adresa de cămin, du-te marțea dimineața devreme la Secția 1. Coadă mică, servici rapid.' },
  { id:7,  author:'Vlad M., An 3 Auto',   avatar:'VM', upvotes:54,  cat:'Safety',     verified:true,  text:'Zona Tătărași este ok ziua, dar evită traversarea neiluminată spre cămine noaptea. Traseul principal prin Bd. Primăverii e mult mai sigur.' },
  { id:8,  author:'Cristina F., An 4 FII',avatar:'CF', upvotes:49,  cat:'Academic',   verified:true,  text:'Profesorii de la FII preferă să fii activ la seminar, nu neapărat să ai note mari la test. Participarea contează enorm.' },
  { id:9,  author:'Bogdan N., An 2 Bio',  avatar:'BN', upvotes:43,  cat:'Mâncare',    verified:false, text:'Cantina are meniu schimbat zilnic — cel mai bun e miercurea (papricaș cu mămăligă). Ajunge devreme, se termină până la 13:30.' },
  { id:10, author:'Ioana R., An 4 FII',   avatar:'IR', upvotes:38,  cat:'Social',     verified:true,  text:'Liga Studenților FII are un server Discord activ cu ajutor pentru materii, proiecte comune și anunțuri de recuperări.' },
]

export const transportData = {
  tuiasi: {
    city: 'Iași',
    operator: 'CTP Iași',
    studentPass: { discount: '-90%', price: '~13 lei/lună (decontat)', note: 'TUIASI decontează 90% din abonament. Depui cerere la secretariat. Sau cumperi direct: bugetari ~6 lei, cu taxă ~40 lei. App: 24pay.' },
    lines: [
      { line: '46', name: 'TUIASI Mangeron → Centru → Piața Unirii', color: '#6366f1', stops: ['Bd. Mangeron (TUIASI/AC)', 'Piața Eminescu', 'Piața Unirii', 'Bd. Independenței', 'Podu Roș'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'Linia principală de la facultate spre centru.' },
      { line: '8',  name: 'TUIASI → Gară CFR → Podu Roș', color: '#10b981', stops: ['Bd. Mangeron (TUIASI)', 'Piața Eminescu', 'Bd. Independenței', 'Gara Iași CFR', 'Podu Roș'], studentPass: true, frequency: '~12 min', firstBus: '05:45', lastBus: '22:30', tip: 'Singura linie directă la gara CFR. Îmbarcă de pe Bd. Mangeron.' },
      { line: '28', name: 'TUIASI → Cămine Tudor → Tătărași', color: '#f59e0b', stops: ['Bd. Mangeron (AC)', 'Cămine Tudor Vladimirescu', 'Str. Arcu', 'Tătărași', 'Piața Nicolina'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '22:00', tip: 'Cel mai uzitat de studenții de la AC care stau în căminele Tudor.' },
      { line: '13', name: 'Palas Mall ↔ Centru ↔ TUIASI', color: '#ef4444', stops: ['Palas Mall', 'Piața Unirii', 'Bd. Carol I', 'Bd. Mangeron (TUIASI)'], studentPass: true, frequency: '~20 min', firstBus: '07:00', lastBus: '22:00', tip: 'Direct la Palas — supermarket MEGA IMAGE și Carrefour la 10 min.' },
      { line: '43', name: 'TUIASI → Al. cel Bun → Centru → Piața Unirii', color: '#a855f7', stops: ['Bd. Mangeron', 'Alexandru cel Bun', 'Str. Arcu', 'Piața Unirii'], studentPass: true, frequency: '~18 min', firstBus: '06:15', lastBus: '21:30', tip: 'Alternativă la linia 46, trece prin cartierul Alexandru cel Bun.' },
      { line: '102', name: 'Nocturnă: Centru ↔ Gară ↔ Campus Tudor', color: '#64748b', stops: ['Piața Unirii', 'Gara Iași', 'Bd. Independenței', 'Tudor Vladimirescu'], studentPass: true, frequency: '~40 min', firstBus: '23:15', lastBus: '04:45', tip: 'Singura linie activă noaptea. Circulă pe toate traseele principale.' },
    ],
  },
  uaic: {
    city: 'Iași',
    operator: 'CTP Iași',
    studentPass: { discount: '-90%', price: '~6–40 lei/lună', note: 'Bugetari sub 26 ani cu CI în Iași: ~6 lei/lună. Cu taxă: ~40 lei/lună. Ghișeu CTP Piața Unirii L-V 8-18 sau app 24pay.' },
    lines: [
      { line: '3',  name: 'Campus UAIC → Centru → Tătărași', color: '#6366f1', stops: ['Campus UAIC (Bd. Carol I)', 'Piața Eminescu', 'Piața Unirii', 'Str. Arcu', 'Tătărași'], studentPass: true, frequency: '~8 min',  firstBus: '05:30', lastBus: '23:00', tip: 'Cea mai frecventă linie. Merge direct din campus spre centru în ~7 min.' },
      { line: '8',  name: 'Campus → Gară CFR → Podu Roș', color: '#10b981', stops: ['Campus UAIC', 'Piața Eminescu', 'Bd. Independenței', 'Gara Iași CFR', 'Podu Roș'], studentPass: true, frequency: '~12 min', firstBus: '05:45', lastBus: '22:30', tip: 'Singura linie directă la gara CFR. Gara e la ~15 min.' },
      { line: '11', name: 'Campus → Grădina Botanică → Copou → Socola', color: '#f59e0b', stops: ['Campus UAIC', 'Grădina Botanică', 'Parcul Copou', 'Str. Simion Bărnuțiu', 'Spital Socola'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '21:30', tip: 'Trece prin Copou și Grădina Botanică. Ideal pentru relaxare după cursuri.' },
      { line: '13', name: 'Palas Mall ↔ Centru ↔ Campus UAIC', color: '#ef4444', stops: ['Palas Mall', 'Piața Unirii', 'Bd. Carol I', 'Campus UAIC'], studentPass: true, frequency: '~20 min', firstBus: '07:00', lastBus: '22:00', tip: 'Direct la Palas — Cinema, H&M, Carrefour la câteva stații.' },
      { line: '5',  name: 'Campus → Independenței → Bucium', color: '#a855f7', stops: ['Campus UAIC', 'Piața Unirii', 'Bd. Independenței', 'Str. Primăverii', 'Bucium'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '22:00', tip: 'Zonă liniștită spre Bucium. Bun dacă stai în chirie în zona de est.' },
      { line: '4',  name: 'Campus → Al. cel Bun → Gară → Moara de Vânt', color: '#14b8a6', stops: ['Campus UAIC', 'Alexandru cel Bun', 'Gara Iași', 'Podu Roș', 'Moara de Vânt'], studentPass: true, frequency: '~12 min', firstBus: '05:45', lastBus: '22:30', tip: 'Acoperă zona de est a orașului. Trece pe lângă Spitalul Sf. Spiridon.' },
    ],
  },
  'umf-iasi': {
    city: 'Iași',
    operator: 'CTP Iași',
    studentPass: { discount: '-90%', price: '~6–40 lei/lună', note: 'Bugetari sub 26 ani cu CI în Iași: ~6 lei/lună. Cu taxă: ~40 lei/lună. Ghișeu CTP Piața Unirii L-V 8-18 sau app 24pay.' },
    lines: [
      { line: '36', name: 'UMF Str. Universității → Centru → Nicolina', color: '#6366f1', stops: ['Str. Universității 16 (UMF)', 'Piața Unirii', 'Bd. Independenței', 'Nicolina'], studentPass: true, frequency: '~10 min', firstBus: '06:00', lastBus: '22:00', tip: 'Linia directă de la UMF spre centru și spre Nicolina.' },
      { line: '3',  name: 'UMF → Spital Sf. Spiridon → Campus UAIC', color: '#ef4444', stops: ['UMF Iași', 'Spitalul Sf. Spiridon', 'Bd. Carol I', 'Campus UAIC'], studentPass: true, frequency: '~8 min', firstBus: '05:30', lastBus: '23:00', tip: 'Traseu direct la Spitalul Sf. Spiridon — baza principală de practică.' },
      { line: '8',  name: 'UMF → Gară CFR Iași', color: '#10b981', stops: ['UMF Iași', 'Piața Eminescu', 'Bd. Independenței', 'Gara Iași CFR'], studentPass: true, frequency: '~12 min', firstBus: '05:45', lastBus: '22:30', tip: 'Spre gara CFR pentru deplasări. ~12 min.' },
      { line: '13', name: 'UMF → Palas Mall → Centru', color: '#f59e0b', stops: ['UMF Iași', 'Piața Unirii', 'Palas Mall'], studentPass: true, frequency: '~20 min', firstBus: '07:00', lastBus: '22:00', tip: 'Direct la Palas. Farmacii și magazine în zonă.' },
      { line: '43', name: 'UMF → Spital CJ Iași (Bd. Independenței)', color: '#a855f7', stops: ['Str. Universității', 'Bd. Carol I', 'Spital Clinic Județean Iași', 'Bd. Independenței'], studentPass: true, frequency: '~15 min', firstBus: '06:15', lastBus: '21:30', tip: 'Spre Spitalul Clinic Județean — secundar de practică pentru UMF.' },
    ],
  },
  ubb: {
    city: 'Cluj-Napoca',
    operator: 'CTP Cluj-Napoca',
    studentPass: { discount: 'GRATUIT', price: '0 lei/lună', note: 'Studenți sub 30 ani cu frecvență la universități din Cluj: transport 100% gratuit. Solicită adeverință de la secretariat și înregistrează-te pe ctpcj.ro.' },
    lines: [
      { line: '5',  name: 'UBB Piața Unirii → Bd. 21 Dec. → Mănăștur', color: '#6366f1', stops: ['Piața Unirii (UBB Drept)', 'Bd. 21 Decembrie', 'Piața Mihai Viteazu', 'Mănăștur'], studentPass: true, frequency: '~7 min', firstBus: '05:00', lastBus: '23:30', tip: 'Cel mai aglomerat. Evită 8:00–9:00 și 17:00–18:30.' },
      { line: '24', name: 'UBB → Gară CFR Cluj → Gruia', color: '#10b981', stops: ['Piața Unirii', 'Bd. Eroilor', 'Gara Cluj-Napoca CFR', 'Gruia'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'Direct la gara CFR. ~12 min din Piața Unirii.' },
      { line: '27', name: 'UBB → Zorilor → Bună Ziua', color: '#f59e0b', stops: ['Piața Unirii', 'Str. Clinicilor (UMF)', 'Zorilor', 'Bună Ziua'], studentPass: true, frequency: '~12 min', firstBus: '06:00', lastBus: '22:30', tip: 'Zona Zorilor — cartier studențesc cu multe chirii accesibile.' },
      { line: '38', name: 'UBB → Gheorgheni → Iulius Mall', color: '#ef4444', stops: ['Piața Unirii', 'Str. Observatorului', 'Gheorgheni', 'Iulius Mall Cluj'], studentPass: true, frequency: '~12 min', firstBus: '06:00', lastBus: '22:30', tip: 'Direct la Iulius Mall — cinema, H&M, Carrefour. ~20 min.' },
      { line: '35', name: 'UBB → Florești (zona de vest)', color: '#a855f7', stops: ['Piața Unirii', 'Bd. 1 Decembrie 1918', 'Autogara Florești', 'Florești'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '22:00', tip: 'Spre Florești — mulți studenți stau în chirie acolo.' },
      { line: '40', name: 'UBB → Spital Clinic UBB → Mărăști', color: '#14b8a6', stops: ['Piața Unirii', 'Spitalul Clinic Municipal Cluj', 'Piața Mărăști', 'Mărăști'], studentPass: true, frequency: '~15 min', firstBus: '06:15', lastBus: '22:00', tip: 'Trece pe lângă Piața Mărăști — cel mai mare piața din Cluj.' },
    ],
  },
  'umf-cluj': {
    city: 'Cluj-Napoca',
    operator: 'CTP Cluj-Napoca',
    studentPass: { discount: 'GRATUIT', price: '0 lei/lună', note: 'Studenți sub 30 ani cu frecvență la universități din Cluj: transport 100% gratuit. Solicită adeverință de la secretariat și înregistrează-te pe ctpcj.ro.' },
    lines: [
      { line: '5',  name: 'UMF V. Babeș → Centru → Mănăștur', color: '#6366f1', stops: ['Str. Victor Babeș 8 (UMF)', 'Piața Unirii', 'Piața Mihai Viteazu', 'Mănăștur'], studentPass: true, frequency: '~7 min', firstBus: '05:00', lastBus: '23:30', tip: 'Linia centrală, stație de UMF chiar pe Str. Clinicilor.' },
      { line: '27', name: 'UMF → Zorilor → Bună Ziua', color: '#10b981', stops: ['Str. Clinicilor (UMF)', 'Zorilor', 'Calea Turzii', 'Bună Ziua'], studentPass: true, frequency: '~12 min', firstBus: '06:00', lastBus: '22:30', tip: 'Trece pe lângă Spitalul Clinic Județean și secțiile UMF.' },
      { line: '29', name: 'UMF → Spital Județean Cluj → Cămine Hasdeu', color: '#ef4444', stops: ['UMF Cluj', 'Spitalul Clinic Județean Cluj', 'Bd. N. Titulescu', 'Cămine Hasdeu'], studentPass: true, frequency: '~12 min', firstBus: '06:00', lastBus: '22:00', tip: 'Direct între UMF și Spitalul Județean — principala bază de practică.' },
      { line: '24', name: 'UMF → Gară CFR Cluj', color: '#f59e0b', stops: ['Str. Clinicilor (UMF)', 'Bd. Eroilor', 'Piața Gării', 'Gara Cluj-Napoca CFR'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'La gara CFR în ~18 min. Ideal pentru weekenduri acasă.' },
      { line: '38', name: 'UMF → Gheorgheni → Iulius Mall', color: '#a855f7', stops: ['Str. Clinicilor', 'Piața Unirii', 'Str. Observatorului', 'Iulius Mall Cluj'], studentPass: true, frequency: '~12 min', firstBus: '06:00', lastBus: '22:30', tip: 'Direct la Iulius Mall — farmacii, magazine și cinema.' },
    ],
  },
  ub: {
    city: 'București',
    operator: 'STB + Metrorex',
    studentPass: { discount: '-90%', price: '8 lei/lună fiecare', note: 'STB (autobuze/tram/troleibuz) + Metrorex (metrou) câte 8 lei/lună fiecare, față de 80 lei. Carduri separate. Ghișee STB și stații metrou. Carnet vizat + CI.' },
    lines: [
      { line: 'M2', name: 'Metrou: Piața Unirii → Universitate → Piața Romană', color: '#ef4444', stops: ['Piața Unirii', 'Universitate (UB Drept)', 'Piața Romană', 'Aviatorilor', 'Pipera'], studentPass: true, frequency: '~4 min', firstBus: '05:00', lastBus: '23:30', tip: 'Stația Universitate este chiar la UB. Cel mai rapid mod de transport.' },
      { line: 'M3', name: 'Metrou: Piața Unirii → Timpuri Noi → Dristor', color: '#dc2626', stops: ['Piața Unirii (UB)', 'Timpuri Noi', 'Dristor 1', 'Dristor 2', 'Nicolae Grigorescu'], studentPass: true, frequency: '~5 min', firstBus: '05:00', lastBus: '23:30', tip: 'Spre zona de est. Schimb la Piața Unirii cu M1, M2.' },
      { line: '104', name: 'UB → Grozăvești → Militari Centru', color: '#6366f1', stops: ['Bd. Mihail Kogălniceanu (UB)', 'Eroilor', 'Grozăvești', 'Militari Centru'], studentPass: true, frequency: '~8 min', firstBus: '05:30', lastBus: '23:00', tip: 'Spre căminele studențești Grozăvești (Regie). ~15 min.' },
      { line: '85', name: 'UB → Piața Victoriei → Floreasca', color: '#10b981', stops: ['Universitate', 'Piața Romană', 'Piața Victoriei', 'Bd. Aviatorilor', 'Floreasca'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'Spre zona de nord — Aviatorilor, Dorobanți, Floreasca.' },
      { line: '336', name: 'UB → Gara de Nord → Basarab', color: '#f59e0b', stops: ['Bd. M. Kogălniceanu', 'Bd. Regina Elisabeta', 'Gara de Nord', 'Basarab'], studentPass: true, frequency: '~12 min', firstBus: '05:45', lastBus: '22:30', tip: 'La Gara de Nord pentru trenuri inter-city.' },
      { line: '69', name: 'UB → Piața Unirii → Dristor → Pantelimon', color: '#a855f7', stops: ['Bd. Kogălniceanu', 'Piața Unirii', 'Dristor', 'Pantelimon'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'Alternativă la metrou spre Dristor și Pantelimon.' },
    ],
  },
  ase: {
    city: 'București',
    operator: 'STB + Metrorex',
    studentPass: { discount: '-90%', price: '8 lei/lună fiecare', note: 'STB + Metrorex câte 8 lei/lună (față de 80 lei). Carduri separate la ghișeele STB și stații metrou. Carnet vizat + CI.' },
    lines: [
      { line: 'M2', name: 'Metrou: Piața Romană (ASE) → Universitate → Pipera', color: '#ef4444', stops: ['Piața Romană (ASE)', 'Universitate', 'Piața Unirii', 'Aviatorilor', 'Pipera'], studentPass: true, frequency: '~4 min', firstBus: '05:00', lastBus: '23:30', tip: 'Stația Piața Romană este la 2 min pe jos de ASE.' },
      { line: '79', name: 'ASE → Gara de Nord → Grozăvești', color: '#6366f1', stops: ['Piața Romană', 'Bd. Dacia', 'Calea Griviței', 'Gara de Nord', 'Grozăvești'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'Direct la Gara de Nord pentru trenuri. ~20 min.' },
      { line: '282', name: 'ASE → Piața Unirii → Berceni', color: '#10b981', stops: ['Piața Romană', 'Bd. Regina Elisabeta', 'Piața Unirii', 'Timpuri Noi', 'Berceni'], studentPass: true, frequency: '~12 min', firstBus: '05:30', lastBus: '22:30', tip: 'Traversează centrul complet pe axa nord-sud.' },
      { line: '301', name: 'ASE → Herăstrău → Băneasa', color: '#f59e0b', stops: ['Piața Romană', 'Piața Victoriei', 'Parcul Herăstrău', 'Băneasa'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '22:00', tip: 'Spre Parcul Herăstrău — ideal pentru ieșiri în natură.' },
      { line: '85', name: 'ASE → Floreasca → Pipera', color: '#a855f7', stops: ['Piața Romană', 'Piața Victoriei', 'Floreasca', 'Pipera'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'Spre zona nord — Pipera, Baneasa Mall, AFI Cotroceni.' },
    ],
  },
  upb: {
    city: 'București',
    operator: 'STB + Metrorex',
    studentPass: { discount: '-90%', price: '8 lei/lună fiecare', note: 'STB + Metrorex câte 8 lei/lună (față de 80 lei). Stația metrou Politehnica la 2 min de UPB. Carduri separate, carnet vizat + CI.' },
    lines: [
      { line: 'M1/M3', name: 'Metrou: Politehnica → Eroilor → Piața Unirii', color: '#ef4444', stops: ['Politehnica (UPB)', 'Eroilor', 'Izvor', 'Piața Unirii', 'Timpuri Noi'], studentPass: true, frequency: '~4 min', firstBus: '05:00', lastBus: '23:30', tip: 'Stația Politehnica este chiar la intrarea UPB. M1 și M3 circulă pe acest tronson.' },
      { line: 'M4', name: 'Metrou: Eroilor → Basarab → Gara de Nord', color: '#dc2626', stops: ['Eroilor (schimb M1)', 'Grozăvești', 'Basarab', '1 Mai', 'Gara de Nord'], studentPass: true, frequency: '~5 min', firstBus: '05:00', lastBus: '23:30', tip: 'Schimb la Eroilor. Direct la Gara de Nord în ~10 min.' },
      { line: '136', name: 'UPB → Grozăvești (Cămine) → Militari', color: '#6366f1', stops: ['Splaiul Independenței (UPB)', 'Grozăvești (Regie)', 'Bd. Geniului', 'Militari Centru'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'Direct la căminele studențești Grozăvești (Regie). ~8 min.' },
      { line: '385', name: 'UPB → Cotroceni → Piața Unirii', color: '#10b981', stops: ['UPB Rectorat', 'Cotroceni', 'Bd. M. Kogălniceanu', 'Piața Unirii'], studentPass: true, frequency: '~12 min', firstBus: '06:00', lastBus: '22:30', tip: 'Trece prin Cotroceni și Grădina Botanică București.' },
      { line: '368', name: 'UPB → Berceni → Piața Sudului', color: '#f59e0b', stops: ['Splaiul Independenței', 'Piața Unirii', 'Tineretului', 'Berceni', 'Piața Sudului'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '22:00', tip: 'Spre zona de sud. Trece pe lângă Parcul Tineretului.' },
    ],
  },
  'umf-buc': {
    city: 'București',
    operator: 'STB + Metrorex',
    studentPass: { discount: '-90%', price: '8 lei/lună fiecare', note: 'STB + Metrorex câte 8 lei/lună (față de 80 lei). Carduri separate la ghișeele STB și stații metrou. Carnet vizat + CI.' },
    lines: [
      { line: 'M2', name: 'Metrou: Piața Romană (UMF) → Universitate → Berceni', color: '#ef4444', stops: ['Piața Romană (UMF Carol Davila)', 'Universitate', 'Piața Unirii', 'Tineretului', 'Berceni'], studentPass: true, frequency: '~4 min', firstBus: '05:00', lastBus: '23:30', tip: 'UMF Carol Davila e la 5 min pe jos de stația Piața Romană M2.' },
      { line: '43', name: 'UMF → Spitalul Universitar → Fundeni', color: '#6366f1', stops: ['Str. Dionisie Lupu (UMF)', 'Spitalul Universitar de Urgență', 'Floreasca', 'Fundeni'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'Direct la Spitalul Universitar și Clinicile UMF.' },
      { line: '79', name: 'UMF → Gara de Nord', color: '#10b981', stops: ['Piața Romană', 'Bd. Dacia', 'Calea Griviței', 'Gara de Nord'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'Spre Gara de Nord pentru trenuri inter-city.' },
      { line: '282', name: 'UMF → Spitalul Floreasca → Piața Unirii', color: '#f59e0b', stops: ['Piața Romană', 'Spitalul Floreasca', 'Piața Victoriei', 'Piața Unirii'], studentPass: true, frequency: '~12 min', firstBus: '05:30', lastBus: '22:30', tip: 'Trece pe lângă Spitalul Floreasca — important pentru studenții la chirurgie.' },
      { line: '85', name: 'UMF → Piața Victoriei → Herăstrău', color: '#a855f7', stops: ['Piața Romană', 'Piața Victoriei', 'Parcul Herăstrău', 'Aviatorilor'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'Spre Parcul Herăstrău și zona nord a Bucureștiului.' },
    ],
  },
  upt: {
    city: 'Timișoara',
    operator: 'STPT Timișoara',
    studentPass: { discount: '-50%', price: '~20 lei/lună', note: 'Studenți UPT: ~50% reducere la abonamentele STPT. Card STPT student cu carnet vizat. Ghișee STPT Piața Victoriei sau online stpt.ro.' },
    lines: [
      { line: '11', name: 'UPT Bd. Vasile Pârvan → Centru → Lipova', color: '#6366f1', stops: ['Bd. Vasile Pârvan (UPT Rectorat)', 'Piața Victoriei', 'Bd. 16 Decembrie 1989', 'Calea Lipovei'], studentPass: true, frequency: '~8 min', firstBus: '05:00', lastBus: '23:30', tip: 'Linia centrală UPT. Directă spre Piața Victoriei în ~7 min.' },
      { line: '8',  name: 'UPT → Gara de Nord Timișoara', color: '#10b981', stops: ['Bd. Vasile Pârvan (UPT)', 'Piața Victoriei', 'Calea Bogdăneștilor', 'Gara de Nord Timișoara'], studentPass: true, frequency: '~12 min', firstBus: '05:30', lastBus: '23:00', tip: 'Direct la gara CFR. ~15 min. Esențial pentru weekenduri acasă.' },
      { line: 'T1', name: 'Tramvai 1: UPT → Piața Victoriei → Mehala', color: '#f59e0b', stops: ['Bd. Vasile Pârvan (UPT)', 'Piața Victoriei', 'Bd. Revoluției', 'Mehala'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:30', tip: 'Tramvaiul e mai rapid decât autobuzul în Timișoara. Linie istorică.' },
      { line: 'T8', name: 'Tramvai 8: Complex Studențesc → Centru → Ghiroda', color: '#ef4444', stops: ['Complex Studențesc Timișoara', 'Piața Victoriei', 'Bd. Vasile Pârvan (UPT)', 'Ghiroda'], studentPass: true, frequency: '~12 min', firstBus: '05:30', lastBus: '23:00', tip: 'Direct de la Complexul Studențesc (cămine) la UPT. Ruta studenților.' },
      { line: '33', name: 'UPT → Iulius Town → Dâmbovița', color: '#a855f7', stops: ['Bd. Vasile Pârvan', 'Piața Victoriei', 'Iulius Town Mall', 'Calea Dâmbovița'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '22:30', tip: 'Direct la Iulius Town — cel mai mare mall din Timișoara.' },
      { line: '3',  name: 'UPT → Spital Județean → Calea Dorobanților', color: '#14b8a6', stops: ['Bd. Vasile Pârvan', 'Spitalul Județean Timișoara', 'Calea Dorobanților', 'Piața 700'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '22:00', tip: 'Spre Spitalul Județean — util pentru studenții de la medicină în parteneriat.' },
    ],
  },
  uvt: {
    city: 'Timișoara',
    operator: 'STPT Timișoara',
    studentPass: { discount: 'GRATUIT', price: '0 lei/lună', note: 'Studenți UVT: 90% decontat de UVT + 10% de Primăria Timișoara = transport GRATUIT pe toată rețeaua STPT. Depui cerere la secretariatul UVT la înscrierea în an.' },
    lines: [
      { line: '11', name: 'UVT Piața Victoriei → Fabric → Circumvalațiunii', color: '#6366f1', stops: ['Piața Victoriei (UVT / Drept)', 'Bd. Revoluției', 'Fabric', 'Circumvalațiunii'], studentPass: true, frequency: '~8 min', firstBus: '05:00', lastBus: '23:30', tip: 'UVT are facultățile în centru — toate liniile pornesc din Piața Victoriei.' },
      { line: '9',  name: 'UVT → Gara de Nord Timișoara', color: '#10b981', stops: ['Piața Victoriei', 'Str. Gării', 'Gara de Nord Timișoara'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:00', tip: 'Gara CFR la ~8 minute. Cel mai rapid drum acasă.' },
      { line: 'T4', name: 'Tramvai 4: Centru → Complex Studențesc', color: '#f59e0b', stops: ['Piața Victoriei', 'Calea Torontalului', 'Str. Martir Petre Stoian', 'Complexul Studențesc'], studentPass: true, frequency: '~12 min', firstBus: '05:30', lastBus: '23:00', tip: 'Direct la căminele studențești UVT din Complexul Studențesc.' },
      { line: 'T1', name: 'Tramvai 1: Centru → Mehala → Ghiroda', color: '#ef4444', stops: ['Piața Victoriei', 'Bd. Take Ionescu', 'Mehala', 'Ghiroda'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '23:30', tip: 'Linie istorică de tramvai, acoperă vestul orașului.' },
      { line: '33', name: 'UVT → Iulius Town Mall', color: '#a855f7', stops: ['Piața Victoriei', 'Bd. Eroilor de la Tisa', 'Iulius Town Mall'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '22:30', tip: 'Iulius Town: cinema, restaurante, H&M, Carrefour.' },
    ],
  },
  'umf-tgm': {
    city: 'Târgu Mureș',
    operator: 'Mureș Transport',
    studentPass: { discount: '50%', price: '15 lei/lună', note: 'Carnet student vizat la ghișeul Mureș Transport, Piața Trandafirilor.' },
    lines: [
      { line: '5',  name: 'UMFST Gh. Marinescu → Piața Trandafirilor → Gară', color: '#6366f1', stops: ['Str. Gh. Marinescu 38 (UMFST)', 'Piața Trandafirilor (centru)', 'Bd. 1 Decembrie', 'Gara Târgu Mureș CFR'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '22:00', tip: 'Linia principală. Gara CFR la ~18 min de la UMFST.' },
      { line: '19', name: 'UMFST → Spital Clinic Județean Mureș', color: '#10b981', stops: ['UMFST Str. Gh. Marinescu', 'Str. Mihai Eminescu', 'Spitalul Clinic Județean Mureș', 'Cornișa'], studentPass: true, frequency: '~20 min', firstBus: '06:30', lastBus: '21:00', tip: 'Direct la spitalul de practică clinică UMFST.' },
      { line: '10', name: 'UMFST → Cartier Unirii → Cămine Studențești', color: '#f59e0b', stops: ['UMFST', 'Piața Victoriei', 'Cartier Unirii', 'Cămine Studențești UMFST'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '22:00', tip: 'Direct la căminele UMFST.' },
      { line: '2',  name: 'UMFST → Centru → Tudor Vladimirescu', color: '#a855f7', stops: ['Str. Gh. Marinescu', 'Piața Trandafirilor', 'Bd. 22 Decembrie', 'Tudor Vladimirescu'], studentPass: true, frequency: '~20 min', firstBus: '06:15', lastBus: '21:30', tip: 'Zonă rezidențială populară pentru chirii studențești.' },
    ],
  },
  'umf-craiova': {
    city: 'Craiova',
    operator: 'RAT Craiova',
    studentPass: { discount: '50%', price: '18 lei/lună', note: 'Card student RAT cu legitimație vizată. Ghișee RAT în Piața Centrală.' },
    lines: [
      { line: '1',  name: 'UMF Craiova → Piața Centrală → Rovine', color: '#6366f1', stops: ['Str. Petru Rareș 2 (UMF)', 'Piața Centrală', 'Bd. Dacia', 'Rovine'], studentPass: true, frequency: '~10 min', firstBus: '05:30', lastBus: '22:30', tip: 'Linia centrală Craiova. Conectează UMF cu centrul.' },
      { line: '11', name: 'UMF → Spital Județean de Urgență Craiova', color: '#10b981', stops: ['UMF Craiova', 'Piața Centrală', 'Spitalul Clinic Județean de Urgență', 'Calea București'], studentPass: true, frequency: '~15 min', firstBus: '06:00', lastBus: '21:30', tip: 'Direct la spitalul de practică. ~10 min.' },
      { line: '14', name: 'UMF → Gara CFR Craiova', color: '#f59e0b', stops: ['Str. Petru Rareș', 'Piața Centrală', 'Bd. Carol I', 'Gara Craiova CFR'], studentPass: true, frequency: '~12 min', firstBus: '05:45', lastBus: '22:00', tip: 'La gara CFR în ~15 min. Trenuri spre București, Timișoara.' },
      { line: '6',  name: 'UMF → Electroputere → Craiovița Nouă', color: '#a855f7', stops: ['UMF Craiova', 'Piața Centrală', 'Electroputere (Mall)', 'Craiovița Nouă'], studentPass: true, frequency: '~15 min', firstBus: '06:15', lastBus: '21:30', tip: 'Spre Electroputere Mall — cinema, magazine, restaurante.' },
      { line: '17', name: 'UMF → Cămine Studențești → Brazda lui Novac', color: '#14b8a6', stops: ['UMF Craiova', 'Str. Alexandru Ioan Cuza', 'Cămine Studențești UCv', 'Brazda lui Novac'], studentPass: true, frequency: '~18 min', firstBus: '06:30', lastBus: '21:00', tip: 'Direct la căminele Universității din Craiova.' },
    ],
  },
}

// fallback pentru universități necunoscute — date generice
export const DEFAULT_TRANSPORT = {
  city: 'Orașul tău',
  operator: 'Operator local',
  studentPass: { discount: '50%', price: 'variabil', note: 'Verifică reducerile studențești la operatorul local de transport.' },
  lines: [],
}

export const transportLines = [
  { line:'3',  name:'Campus → Centru → Tătărași', color:'#6366f1', stops:['Campus UAIC','Piața Mihai Eminescu','Piața Unirii','Piața Pache Protopopescu','Tătărași'], studentPass:true, frequency:'~8 min',  firstBus:'05:30', lastBus:'23:00', tip:'Cea mai rapidă linie spre centru.' },
  { line:'8',  name:'Campus → Gară → Podu Roș',   color:'#10b981', stops:['Campus UAIC','Independenței','Gara Iași','Podu Roș'],                                          studentPass:true, frequency:'~12 min', firstBus:'05:45', lastBus:'22:30', tip:'Singura linie directă la gara CFR.' },
  { line:'11', name:'Campus → Copou → Socola',     color:'#f59e0b', stops:['Campus UAIC','Parcul Copou','Str. Simion Bărnuțiu','Spital Socola'],                           studentPass:true, frequency:'~15 min', firstBus:'06:00', lastBus:'21:30', tip:'Trece prin parcul Copou — ideal pentru plimbări.' },
  { line:'13', name:'Palas Mall ↔ Campus',          color:'#ef4444', stops:['Palas Mall','Piața Unirii','Campus UAIC'],                                                     studentPass:true, frequency:'~20 min', firstBus:'07:00', lastBus:'22:00', tip:'Direct la Palas și supermarket-urile din zonă.' },
]

export const safetyZones = [
  { id:'campus',    name:'Campus UAIC',            level:'safe',     desc:'Zonă monitorizată 24/7, iluminat excelent, securitate proprie. Cel mai sigur loc.',  color:'#10b981' },
  { id:'copou',     name:'Cartier Copou',          level:'safe',     desc:'Zona universitară, populată de studenți, bine iluminată. Foarte sigur.',              color:'#10b981' },
  { id:'centru',    name:'Centrul Vechi',          level:'safe',     desc:'Zonă turistică și comercială, supravegheat video. Sigur până la ~24:00.',             color:'#10b981' },
  { id:'palas',     name:'Palas & Târgul Cucului', level:'safe',     desc:'Mall și zonă nouă, securizată și iluminată. Sigur la orice oră.',                     color:'#10b981' },
  { id:'tatarasi',  name:'Tătărași',               level:'moderate', desc:'Cartier rezidențial. Sigur pe artere principale, mai prudent pe străzi laterale.',    color:'#f59e0b' },
  { id:'ciurchi',   name:'Ciurchi',                level:'moderate', desc:'Zonă de tranziție. Evită parcările izolate noaptea.',                                 color:'#f59e0b' },
  { id:'nicolina',  name:'Nicolina',               level:'caution',  desc:'Zona industrială și blocuri vechi. Preferă rutele iluminate, evită noaptea tarziu.', color:'#ef4444' },
]

export const emergencyContacts = [
  { name:'Poliție', number:'112', icon:'🚔', available:'24/7' },
  { name:'Ambulanță', number:'112', icon:'🚑', available:'24/7' },
  { name:'Pompieri', number:'112', icon:'🚒', available:'24/7' },
  { name:'Securitate Campus', number:'0232 201 000', icon:'🏫', available:'24/7' },
  { name:'Medic Campus UAIC', number:'0232 201 200', icon:'🏥', available:'L-V 8-14' },
  { name:'Poliție Locală Iași', number:'0232 267 626', icon:'👮', available:'24/7' },
]

export const housingListings = [
  { id:1, type:'Cămin',     name:'Cămin 1 Campus', distance:'0 min', price:350, beds:2, amenities:['WiFi','Bucătărie','Spălătorie'], available:true,  scamRisk:'none',   desc:'Cel mai apropiat de facultate, wifi rapid, cameră dublă sau triplă.' },
  { id:2, type:'Cămin',     name:'Cămin 2 Campus', distance:'3 min', price:400, beds:1, amenities:['WiFi','Baie proprie','Bucătărie'], available:false, scamRisk:'none',   desc:'Camere cu baie proprie, mai puțin aglomerată.' },
  { id:3, type:'Chirie',    name:'Garsonieră Copou',distance:'15 min',price:750, beds:1, amenities:['WiFi','Mobilat complet','Aragaz'], available:true,  scamRisk:'low',    desc:'Cartier studențesc, aproape de parcul Copou, vecini studenți.' },
  { id:4, type:'Chirie',    name:'2 camere Centru', distance:'25 min',price:1200,beds:2, amenities:['WiFi','Centrală proprie','Parcare'], available:true,  scamRisk:'low',    desc:'Ideal pentru 2 studenți — împărțit e 600 lei/persoană.' },
  { id:5, type:'Coabitare', name:'Cameră în apartament',distance:'20 min',price:500, beds:1, amenities:['WiFi','Bucătărie comună','Spălătorie'], available:true, scamRisk:'medium', desc:'3 colegi de apartament. Verifică contractul înainte de avans!' },
]

export const SCAM_WARNINGS = [
  'Cere întotdeauna contract de închiriere înainte de orice plată.',
  'Nu trimite avans prin virament fără a vedea fizic apartamentul.',
  'Verifică identitatea proprietarului cu actul de proprietate.',
  'Chirii sub 400 lei în Iași sunt aproape întotdeauna fraudă.',
  'Grupul Facebook „Cazare studenți Iași" are anunțuri verificate de comunitate.',
]
