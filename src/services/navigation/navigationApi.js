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
    return localCopilotAnswer(message, image, context?.university)
  }
}

export async function analyzeNavigationPhoto({ base64, mimeType, university = 'tuiasi' }) {
  try {
    const data = await post('/photo', { base64, mimeType, university })
    return data.answer
  } catch {
    return 'Recunoaștere indisponibilă momentan (API offline). Trimite poza din nou sau descrie verbal locația — te ajut cu navigația pe hartă.'
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
  const n = message.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

  if (n.includes('mananc') || n.includes('mancar') || n.includes('cantina') || n.includes('restaurant') || n.includes('pranz')) {
    return 'Pentru AC TUIASI, cea mai sigura recomandare este Cantina TUIASI din Campus Tudor Vladimirescu, Aleea Prof. Vasile Petrescu nr. 29. Programul oficial este L-V 11:00-19:00. Evita varful 12:00-13:30 si verifica harta pentru Google Maps sau Waze.'
  }
  if (n.includes('studiu') || n.includes('studiat') || n.includes('sala') || n.includes('biblioteca')) {
    return 'Pentru studiu ai Biblioteca Gh. Asachi, biblioteca Facultatii AC si salile/laboratoarele libere din Corp C. In sesiune, foloseste Focus Forest din Focus pentru sesiuni fara schimbat tabul.'
  }
  if (n.includes('secretariat') || n.includes('acte') || n.includes('adeverinta') || n.includes('deschis')) {
    return 'Secretariatul AC este in Facultatea de Automatica si Calculatoare, Str. Prof. dr. doc. Dimitrie Mangeron nr. 27. Pentru program exact si acte, verifica pagina oficiala AC sau intreaba secretariatul inainte sa mergi.'
  }
  if (n.includes('cafea') || n.includes('cafenea') || n.includes('coffee')) {
    return 'Pentru cafea si pauze rapide langa AC, verifica zonele din jurul Corp A/Corp C si Iulius Mall. In harta ai butoane Google Maps si Waze pentru reperele apropiate.'
  }
  if (n.includes('transport') || n.includes('ctp') || n.includes('tramvai') || n.includes('abonament')) {
    return 'Pentru transport in Iasi, verifica CTP Iasi si abonamentele pentru studenti. Din Campus Tudor spre Mangeron ai conexiuni rapide si poti folosi Google Maps sau Waze din harta aplicatiei.'
  }
  if (n.includes('reducere') || n.includes('discount') || n.includes('github') || n.includes('microsoft') || n.includes('jetbrains')) {
    return 'In Student Life pastrez doar beneficii stabile: CTP Iasi, GitHub Student Pack, Microsoft 365 Education, JetBrains Student, Notion Student, Cantina/Campus TUIASI si CCOC. Linkurile nesigure au fost eliminate.'
  }
  if (n.includes('eveniment') || n.includes('comunitate') || n.includes('voluntar') || n.includes('club') || n.includes('lsac')) {
    return 'Pentru AC TUIASI, cele mai relevante comunitati sunt LSAC Iasi, CCOC TUIASI, grupurile de practica AC, grupurile de studiu si proiectele tehnice intre studenti.'
  }
  if (n.includes('wifi') || n.includes('internet') || n.includes('eduroam')) {
    return 'Pentru internet foloseste reteaua academica disponibila in TUIASI si contul institutional. Daca nu merge, verifica instructiunile DICD/TUIASI sau cere suport IT.'
  }
  if (n.includes('cazare') || n.includes('camin') || n.includes('chirie')) {
    return 'Caminele TUIASI sunt in Campus Tudor Vladimirescu. In Campus Navigator ai grupari de camine si butoane Google Maps/Waze pentru orientare.'
  }
  return 'Te pot ajuta cu viata de student la AC TUIASI: cantina, camine, transport, reduceri stabile, practica, comunitati, evenimente, locuri de studiu si Focus Forest.'
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

function localCopilotAnswer(message, image, university = 'tuiasi') {
  const normalized = String(message || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const hasImage = Boolean(image?.base64)
  const isUAIC = university === 'uaic'

  if (isUAIC) {
    const wantsSecretariat = normalized.includes('secretariat')
    const wantsLab = normalized.includes('lab') || normalized.includes('laborator')
    const wantsDecanat = normalized.includes('decanat')
    const defaultRoom = wantsDecanat ? 'decanat-fii' : wantsSecretariat ? 'secretariat-fii' : wantsLab ? 'lab-info-1a' : null

    if (defaultRoom) {
      return {
        answer: hasImage
          ? `Am preluat poza. Te pozitionez la Facultatea de Informatica FII (UAIC) si pot trasa ruta interioara spre ${defaultRoom}.`
          : `Pot trasa ruta interioara in FII spre ${defaultRoom}.`,
        detectedLocation: { type: 'indoor', label: 'Facultatea de Informatica FII – UAIC', building: 'FII UAIC', room: 'secretariat-fii', confidence: hasImage ? 0.72 : 0.58 },
        destination: { type: 'indoor', label: defaultRoom, room: defaultRoom, buildingId: null },
        actions: ['Check the floor indicator near the stairs.', 'Follow the route marked on the indoor map.', 'Ask at the secretariat if you cannot find the room.'],
        routeSuggestion: { type: 'indoor', from: 'secretariat-fii', to: defaultRoom },
      }
    }

    const wantsBCU = normalized.includes('biblioteca') || normalized.includes('bcu')
    const wantsCantina = normalized.includes('cantina')
    const wantsFEAA = normalized.includes('feaa') || normalized.includes('economie')
    if (wantsBCU || wantsCantina || wantsFEAA) {
      const to = wantsBCU ? 'bcu' : wantsCantina ? 'canteen-uaic' : 'feaa'
      return {
        answer: `Am gasit destinatia si pot porni ghidarea pe harta campusului UAIC.`,
        detectedLocation: { type: 'outdoor', label: hasImage ? 'Facultatea de Informatica FII – UAIC' : 'Campus UAIC', building: hasImage ? 'FII UAIC' : null, room: null, confidence: hasImage ? 0.68 : 0.5 },
        destination: { type: 'outdoor', label: to, room: null, buildingId: to },
        actions: ['Head towards Bd. Carol I.', 'Avoid crowded areas during class breaks.', 'Open the map for the full route.'],
        routeSuggestion: { type: 'outdoor', from: 'fii', to },
      }
    }

    return {
      answer: hasImage ? 'Recunosc zona: poza pare sa fie din campusul UAIC (Bd. Carol I). Unde vrei sa ajungi de aici?' : localAssistantAnswer(message),
      detectedLocation: { type: hasImage ? 'outdoor' : 'unknown', label: hasImage ? 'Campus UAIC – Bd. Carol I' : 'Fara poza', building: hasImage ? 'FII UAIC' : null, room: null, confidence: hasImage ? 0.68 : 0 },
      destination: { type: 'unknown', label: null, room: null, buildingId: null },
      actions: [hasImage ? 'Tell me your destination: Secretariat FII, Lab Info, BCU Library or Cantina.' : 'Type your destination, e.g. Secretariat FII or BCU.', 'If you are in a corridor, send a photo of the room door or floor sign.'],
      routeSuggestion: { type: 'none', from: null, to: null },
    }
  }

  // TUIASI fallback
  const wantsSecretariat = normalized.includes('secretariat')
  const wantsC2 = normalized.includes('c2') || normalized.includes('c 2') || normalized.includes('lab c2')
  const wantsC1 = normalized.includes('c1') || normalized.includes('c 1') || normalized.includes('lab c1')
  const wantsA3 = normalized.includes('a3') || normalized.includes('daia')

  if (wantsSecretariat || wantsC2 || wantsC1 || wantsA3) {
    const to = wantsSecretariat ? 'secretariat-ac' : wantsA3 ? 'lab-a3-1' : wantsC1 ? 'lab-c1-1' : 'lab-c2-1'
    return {
      answer: hasImage
        ? 'Am preluat poza. Te pozitionez la Facultatea de Automatica si Calculatoare TUIASI si pot trasa ruta interioara.'
        : 'Pot trasa ruta interioara in Facultatea de Automatica si Calculatoare TUIASI pe baza destinatiei cerute.',
      detectedLocation: { type: 'indoor', label: 'Facultatea de Automatica si Calculatoare TUIASI', building: 'AC TUIASI', room: 'secretariat-ac', confidence: hasImage ? 0.72 : 0.58 },
      destination: { type: 'indoor', label: to, room: to, buildingId: null },
      actions: ['Check the floor indicator near the stairs.', 'Follow the route marked on the indoor map.', 'If you cannot find the room, take a photo of the corridor sign.'],
      routeSuggestion: { type: 'indoor', from: 'secretariat-ac', to },
    }
  }

  if (normalized.includes('biblioteca') || normalized.includes('cantina') || normalized.includes('corp a') || normalized.includes('corp c') || normalized.includes('rectorat')) {
    const to = normalized.includes('biblioteca') ? 'library' : normalized.includes('cantina') ? 'canteen' : normalized.includes('corp a') ? 'corp-a' : 'corp-c'
    return {
      answer: 'Am gasit o destinatie outdoor potrivita si pot porni ghidarea pe harta campusului TUIASI.',
      detectedLocation: { type: 'outdoor', label: hasImage ? 'Facultatea de Automatica si Calculatoare TUIASI' : 'Pozitia curenta demo', building: hasImage ? 'AC TUIASI' : null, room: null, confidence: hasImage ? 0.68 : 0.5 },
      destination: { type: 'outdoor', label: to, room: null, buildingId: to },
      actions: ['Head towards the central campus path.', 'Avoid crowded areas during class breaks.', 'Open the map for the full route.'],
      routeSuggestion: { type: 'outdoor', from: 'corp-c', to },
    }
  }

  return {
    answer: hasImage ? 'Recunosc zona demo: poza pare sa fie cu Facultatea de Automatica si Calculatoare TUIASI. Unde vrei sa ajungi de aici?' : localAssistantAnswer(message),
    detectedLocation: { type: hasImage ? 'outdoor' : 'unknown', label: hasImage ? 'Facultatea de Automatica si Calculatoare TUIASI' : 'Fara poza', building: hasImage ? 'AC TUIASI' : null, room: null, confidence: hasImage ? 0.72 : 0 },
    destination: { type: 'unknown', label: null, room: null, buildingId: null },
    actions: [hasImage ? 'Tell me your destination: Secretariat, Lab C1, Lab C2, Library or Canteen.' : 'Type your destination, e.g. Secretariat or Library.', 'If you are in a corridor, send a photo of the room door or floor sign.'],
    routeSuggestion: { type: 'none', from: null, to: null },
  }
}
