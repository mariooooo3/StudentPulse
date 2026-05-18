const NAVIGATION_ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
const API_URL = NAVIGATION_ENV.VITE_NAVIGATION_API_URL || '/api/navigation'

async function post(endpoint, body) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`Navigation API ${response.status}`)
  return response.json()
}

export async function askNavigationAssistant(message, history = []) {
  try {
    const data = await post('/assistant', { message, history })
    return data.answer
  } catch {
    return localAssistantAnswer(message)
  }
}

export async function askNavigationCopilot({ message, image, history = [], context = {} }) {
  try {
    return await post('/copilot', { message, image, history, context })
  } catch {
    return localCopilotAnswer(message, image)
  }
}

export async function analyzeNavigationPhoto({ base64, mimeType }) {
  try {
    const data = await post('/photo', { base64, mimeType })
    return data.answer
  } catch {
    return 'Analiza locala: imaginea a fost preluata. Cel mai probabil esti la Facultatea de Informatica, in zona intrarii principale. Pentru recunoastere reala porneste API-ul de navigatie cu cheia GROQ server-side.'
  }
}

export async function askRecoAssistant(message, history = []) {
  try {
    const data = await post('/reco-assistant', { message, history })
    return data.answer
  } catch {
    return localRecoAnswer(message)
  }
}

export async function getNavigationRecommendations(scheduleItems = []) {
  try {
    return await post('/recommendations', scheduleItems)
  } catch {
    return {
      briefing: 'Recomandare locala: evita intervalele aglomerate si pleaca cu 8 minute inainte de urmatorul curs.',
      cards: [
        {
          id: 'fallback-1',
          emoji: '🚶',
          title: 'Pleaca mai devreme',
          desc: 'Ai suficient timp sa ajungi fara graba la urmatorul curs daca iesi cu 8 minute inainte.',
          urgency: 'medium',
        },
      ],
    }
  }
}

function localRecoAnswer(message) {
  const n = message.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')

  if (n.includes('mananc') || n.includes('mancar') || n.includes('mancare') || n.includes('cantina') || n.includes('restaurant') || n.includes('pranz') || n.includes('optiuni')) {
    return 'La cantinele UAIC (Corp C și cămine) ai mese subvenționate de la 8–15 RON — cel mai ieftin prânz din campus. Evită intervalul 12:00–13:30 (aglomerat). Alternativ: bufetul din Corp A (sandwich-uri, cafea), sau restaurantele de pe Bd. Carol I la 5 min — Samsara, La Mama, Vivo. Cantina FII e deschisă 11:30–14:30.'
  }

  if (n.includes('sala') || n.includes('sali') || n.includes('liber') || n.includes('studiu') || n.includes('studiat') || n.includes('loc de') || n.includes('aglomat') || n.includes('aglomerat')) {
    return 'Cele mai bune locuri de studiu: 📚 Biblioteca Centrală UAIC (etaj 1 & 2, liniște, L–V 8:00–20:00, Sa 9:00–14:00) — trafic mic dimineața înainte de 10:00 și după 18:00. 🏛️ Holul Corp C după ora 17:00. 🛋️ Sălile de lectură din cămine. Pentru studiu în grup: verifică disponibilitatea sălilor de seminar la secretariat.'
  }

  if (n.includes('secretariat') || n.includes('acte') || n.includes('adeverinta') || n.includes('catalog') || n.includes('deschis')) {
    return 'Secretariatul FII — parter Corp C, hol principal. Program: Luni–Joi 9:00–12:00 și 13:00–15:00, Vineri 9:00–12:00. Evită primele zile din sesiune (coadă mare). Poți solicita adeverințe și online pe portal.uaic.ro. Adu carnetul de student la orice interacțiune.'
  }

  if (n.includes('cafea') || n.includes('cafenea') || n.includes('coffee') || n.includes('rapida')) {
    return 'Cele mai bune cafele lângă campus: ☕ Distribuitorul automat din holul Corp C (1,5–2 RON — rapid). Seeds Café (aproape de FII, preferata studenților, WiFi bun). Origo Café (Bd. Copou, atmosferă bună de studiu). Tucano Coffee (Palas, 10 min). Seeds și Origo au discount ~10% cu carnetul de student.'
  }

  if (n.includes('biblioteca') || n.includes('carte') || n.includes('imprumut') || n.includes('digital')) {
    return 'Biblioteca Centrală UAIC — 3 min de Corp C spre nord-est. Carnet de bibliotecă: ghișeu cu buletinul. Colecție digitală gratuită pe biblioteca.uaic.ro cu cont instituțional. Trafic redus: dimineața înainte de 10:00 și după 18:00. La etaj 1 găsești locuri de studiu individual cu prize.'
  }

  if (n.includes('examen') || n.includes('sesiune') || n.includes('pregatire') || n.includes('invatat') || n.includes('nota') || n.includes('sfaturi')) {
    return 'Sfaturi practice pentru sesiune: 🎯 Prioritizează materiile cu pondere mare. 📅 Tehnica Pomodoro: 25 min studiu intens + 5 min pauză. 📚 Biblioteca are secție de consultare fără împrumut. 💤 7–8h somn îmbunătățesc retenția cu 40%. 👥 Găsești grupuri de studiu în secțiunea Peer Tutoring din aplicație. 🧠 Recapitulează cu voce tare — ajută la consolidare.'
  }

  if (n.includes('transport') || n.includes('autobuz') || n.includes('ctp') || n.includes('tramvai') || n.includes('naveta') || n.includes('abonament')) {
    return 'Transport CTP Iași: studenții beneficiază de abonament lunar gratuit sau cu 90% reducere (Legea 199/2023). Ridică abonamentul de la punctele CTP cu carnetul de student vizat. Linii utile pentru Copou: 7, 13, 28 spre centru. Tracking în timp real: app iMaaS sau Google Maps.'
  }

  if (n.includes('reducere') || n.includes('discount') || n.includes('isic') || n.includes('spotify') || n.includes('apple') || n.includes('adobe') || n.includes('github') || n.includes('microsoft')) {
    return 'Reduceri pentru studenți: 🎵 Spotify Student 14 RON/lună (–46%). Apple Music 11,99 RON/lună. 💻 GitHub Student Pack — Pro, JetBrains, domenii .me (gratuit). 📐 Adobe Creative Cloud –65%. 📧 Microsoft 365 Education gratuit cu @student.uaic.ro. 🎭 Teatrul Național Iași –75%. 🎬 Cinema City cu carnet. Toate ofertele le găsești în secțiunea Student Life din aplicație.'
  }

  if (n.includes('eveniment') || n.includes('activitate') || n.includes('comunitate') || n.includes('voluntar') || n.includes('club') || n.includes('asii') || n.includes('esn') || n.includes('lsac')) {
    return 'Comunități active la UAIC Iași: 🖥️ ASII — hackathoane, workshopuri, proiecte IT (asii.ro). 🌍 ESN Iași — experiențe internaționale, Erasmus, petreceri interculturale. 💻 LSAC — tabere, proiecte, networking. 🚀 V7 Startup Studio — antreprenoriat studențesc. ⚖️ ELSA Iași (drept). Urmărește-le pe Instagram/Facebook pentru evenimente săptămânale — majoritate gratuite cu carnet.'
  }

  if (n.includes('wifi') || n.includes('internet') || n.includes('eduroam') || n.includes('retea')) {
    return 'WiFi gratuit pe campus prin eduroam (rețea academică europeană). Conectare: selectezi "eduroam", user: parola-institutionala@uaic.ro. Funcționează în toate universitățile europene cu eduroam. Semnal bun: Corp C hol & săli, Bibliotecă. Corp A etaj -1 are acoperire slabă.'
  }

  if (n.includes('cazare') || n.includes('camin') || n.includes('locuinta') || n.includes('chirie')) {
    return 'Cazare studențești: căminele UAIC sunt cel mai ieftin optiune (200–400 RON/lună) — cerere pe platforma UAIC la începutul anului. Cazare privată în zona Copou: 800–1200 RON/lună (garsonieră). Grupuri Facebook "Cazare Iași studenți" sau OLX sunt bune pentru oferte. Zona Copou și Tătărași sunt cele mai căutate de studenți.'
  }

  return 'Sunt asistentul tău pentru viața studențească! 😊 Pot ajuta cu: 🍽️ opțiuni de mâncare pe campus, 📚 locuri de studiu, 🎓 sfaturi pentru sesiune, 🚌 transport CTP, ☕ cafenele, 🎭 reduceri studenți, 📋 secretariat și acte, 🎉 comunități și evenimente. Ce te interesează?'
}

function localAssistantAnswer(message) {
  const normalized = message.toLowerCase()
  if (normalized.includes('cantina') || normalized.includes('mancare')) {
    return 'Cantina este aproape de axul Corp C. Evita intervalul 12:00-13:15 si foloseste ruta prin zona Corp C dupa pauza de pranz.'
  }
  if (normalized.includes('biblioteca')) {
    return 'Biblioteca este la nord-est de secretariat. Din camin mergi spre Corp C, apoi prin axul central pana la Secretariat si continua spre Biblioteca.'
  }
  if (normalized.includes('secretariat')) {
    return 'Secretariatul este in zona cladirii principale. Din Corp C urmeaza axul central si intra prin holul principal.'
  }
  return 'Pot ajuta cu rute intre Corp C, Corp A, biblioteca, cantina, secretariat si puncte de interes. Alege o destinatie pe harta sau intreaba despre un reper.'
}

function localCopilotAnswer(message, image) {
  const normalized = String(message || '').toLowerCase()
  const wantsC210 = normalized.includes('c210')
  const wantsC308 = normalized.includes('c308')
  const wantsC112 = normalized.includes('c112')
  const wantsSecretariat = normalized.includes('secretariat')
  const hasImage = Boolean(image?.base64)

  if (wantsC210 || wantsC308 || wantsC112 || wantsSecretariat) {
    const to = wantsC308 ? 'c308' : wantsC112 ? 'c112' : wantsSecretariat ? 'secretariat' : 'c210'
    const from = wantsC112 ? 'secretariat' : 'c112'
    return {
      answer: hasImage
        ? 'Am preluat poza. Te pozitionez la Facultatea de Informatica si iti pot trasa ruta interioara spre destinatie.'
        : 'Pot trasa ruta interioara in Facultatea de Informatica pe baza salii cerute.',
      detectedLocation: {
        type: 'indoor',
        label: hasImage ? 'Facultatea de Informatica' : 'Facultatea de Informatica',
        building: 'Facultatea de Informatica',
        room: from,
        confidence: hasImage ? 0.72 : 0.58,
      },
      destination: {
        type: 'indoor',
        label: to.toUpperCase(),
        room: to,
        buildingId: null,
      },
      actions: [
        'Check the floor indicator near the stairs.',
        'Follow the route marked on the indoor map.',
        'If you cannot find the room, take a photo of the corridor sign.',
      ],
      routeSuggestion: { type: 'indoor', from, to },
    }
  }

  if (normalized.includes('biblioteca') || normalized.includes('cantina') || normalized.includes('corp a') || normalized.includes('corp c')) {
    const to = normalized.includes('biblioteca') ? 'library' : normalized.includes('cantina') ? 'canteen' : normalized.includes('corp a') ? 'corp-a' : 'corp-c'
    return {
      answer: 'Am gasit o destinatie outdoor potrivita si pot porni ghidarea pe harta campusului.',
      detectedLocation: {
        type: 'outdoor',
        label: hasImage ? 'Facultatea de Informatica' : 'Pozitia curenta demo',
        building: hasImage ? 'Facultatea de Informatica' : null,
        room: null,
        confidence: hasImage ? 0.68 : 0.5,
      },
      destination: {
        type: 'outdoor',
        label: to,
        room: null,
        buildingId: to,
      },
      actions: [
        'Head towards the central campus path.',
        'Avoid crowded areas during class breaks.',
        'Open the map for the full route.',
      ],
      routeSuggestion: { type: 'outdoor', from: 'corp-c', to },
    }
  }

  return {
    answer: hasImage
      ? 'Recunosc zona demo: poza pare sa fie cu Facultatea de Informatica. Unde vrei sa ajungi de aici?'
      : localAssistantAnswer(message),
    detectedLocation: {
      type: hasImage ? 'outdoor' : 'unknown',
      label: hasImage ? 'Facultatea de Informatica' : 'Fara poza',
      building: hasImage ? 'Facultatea de Informatica' : null,
      room: null,
      confidence: hasImage ? 0.72 : 0,
    },
    destination: {
      type: 'unknown',
      label: null,
      room: null,
      buildingId: null,
    },
    actions: [
      hasImage ? 'Tell me your destination: C210, Secretary Office, Library or Canteen.' : 'Type your destination, e.g. C210 or Library.',
      'If you are in a corridor, send a photo of the room door or floor sign.',
    ],
    routeSuggestion: { type: 'none', from: null, to: null },
  }
}
