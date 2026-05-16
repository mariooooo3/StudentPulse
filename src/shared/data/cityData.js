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
  { id:1,  name:'McDonald\'s Palas',    cat:'Mâncare',    discount:'20% cu carnet',  distance:'15 min',  verified:true,  hot:true,  desc:'Valabil L-V 10-16 cu carnet student fizic.',    address:'Palas Mall, Iași' },
  { id:2,  name:'KFC Podu Roș',         cat:'Mâncare',    discount:'15% cu carnet',  distance:'20 min',  verified:true,  hot:false, desc:'Meniu student 25 lei (burger + cartofi + suc).',address:'Str. Elena Doamna, Iași' },
  { id:3,  name:'Brutăria Moldovei',    cat:'Mâncare',    discount:'Cozonac 12 lei', distance:'5 min',   verified:true,  hot:true,  desc:'Cea mai apropiată brutărie de campus, pâine proaspătă dimineața.',address:'Bd. Carol I, lângă campus' },
  { id:4,  name:'CTP Iași',             cat:'Transport',  discount:'-50% abonament', distance:'0 min',   verified:true,  hot:false, desc:'Abonament lunar 30 lei față de 60 pentru toți studenții.',address:'Rețea urbană Iași' },
  { id:5,  name:'Veloiași',             cat:'Transport',  discount:'30 min gratuit', distance:'2 min',   verified:true,  hot:false, desc:'Bike-sharing cu prima jumătate de oră gratuită, stație lângă campus.',address:'Campus UAIC' },
  { id:6,  name:'Cinema Ateneu',         cat:'Cultură',    discount:'-40% cu carnet', distance:'25 min',  verified:true,  hot:false, desc:'Bilet student 15 lei față de 25. Valabil la orice proiecție.',address:'Str. Cuza Vodă 4, Iași' },
  { id:7,  name:'Teatrul Național Iași', cat:'Cultură',    discount:'-50% student',   distance:'20 min',  verified:true,  hot:true,  desc:'Program student cu reducere substanțială. Înregistrare online.',address:'Str. Agatha Bârsescu, Iași' },
  { id:8,  name:'Filarmonica Moldova',  cat:'Cultură',    discount:'10 lei bilet',   distance:'20 min',  verified:false, hot:false, desc:'Bilete cu preț redus pentru studenți, cantitate limitată.',address:'Str. Cuza Vodă, Iași' },
  { id:9,  name:'Iulius Mall Iași',     cat:'Shopping',   discount:'Card loyalty',   distance:'30 min',  verified:false, hot:false, desc:'Program Iulius Student cu puncte și reduceri la parteneri.',address:'Strada Anastasie Panu, Iași' },
  { id:10, name:'Gym Campus UAIC',      cat:'Sport',      discount:'Gratuit',        distance:'3 min',   verified:true,  hot:true,  desc:'Sala de sport din baza sportivă a universității, gratuită cu carnet.',address:'Campus UAIC' },
  { id:11, name:'Piscina Campus',       cat:'Sport',      discount:'10 lei/intrare', distance:'3 min',   verified:true,  hot:false, desc:'Piscina semi-olimpică disponibilă studenților UAIC.',address:'Campus UAIC' },
  { id:12, name:'Librăria Universității',cat:'Rechizite', discount:'-15% cu carnet', distance:'2 min',   verified:true,  hot:false, desc:'Manuale, rechizite, materiale didactice cu reducere.',address:'Bd. Carol I, campus' },
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
