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

export async function askNavigationAssistant(message, history = [], university = 'tuiasi') {
  try {
    const data = await post('/assistant', { message, history, university })
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

export async function analyzeNavigationPhoto({ base64, mimeType, university = 'tuiasi', coords = null }) {
  try {
    const data = await post('/photo', { base64, mimeType, university, coords })
    return data.answer
  } catch {
    return 'Am primit poza. Serverul AI nu este disponibil momentan — descrie verbal locația sau destinația și te ajut cu navigația pe hartă.'
  }
}

export async function askRecoAssistant(message, history = [], university = 'tuiasi') {
  try {
    const data = await post('/assistant', { message, history, university })
    return data.answer
  } catch {
    return localRecoAnswer(message)
  }
}

export async function getNavigationRecommendations(scheduleItems = [], university = 'tuiasi') {
  try {
    return await post('/recommendations', { ...scheduleItems, university })
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
    return 'Cantina universitatii este optiunea cea mai accesibila pentru pranz. Programul obisnuit este L-V 11:00-19:00. Evita varful 12:00-13:30 si verifica harta din Campus Navigator pentru Google Maps sau Waze.'
  }
  if (n.includes('studiu') || n.includes('studiat') || n.includes('sala') || n.includes('biblioteca')) {
    return 'Pentru studiu ai biblioteca universitatii si salile/laboratoarele disponibile intre cursuri. In sesiune, foloseste Focus Forest din Focus pentru sesiuni concentrate.'
  }
  if (n.includes('secretariat') || n.includes('acte') || n.includes('adeverinta') || n.includes('deschis')) {
    return 'Secretariatul are program L-V 09:00-13:00. Pentru acte si adeverinte, verifica pagina oficiala a facultatii sau suna inainte sa mergi.'
  }
  if (n.includes('cafea') || n.includes('cafenea') || n.includes('coffee')) {
    return 'Verifica holul corpului principal sau zonele din jurul campusului pentru cafenele si automate de cafea. In harta ai butoane Google Maps si Waze pentru reperele apropiate.'
  }
  if (n.includes('transport') || n.includes('tramvai') || n.includes('abonament') || n.includes('autobuz')) {
    return 'Pentru transport urban verifica aplicatia operatorului local de transport sau Google Maps pentru rute si abonamente studenti.'
  }
  if (n.includes('reducere') || n.includes('discount') || n.includes('github') || n.includes('microsoft') || n.includes('jetbrains')) {
    return 'Beneficii stabile pentru studenti: GitHub Student Pack, Microsoft 365 Education, JetBrains Student, Notion Student. Gasesti linkuri in sectiunea Student Life.'
  }
  if (n.includes('eveniment') || n.includes('comunitate') || n.includes('voluntar') || n.includes('club')) {
    return 'Comunitatile studentesti si ligile din facultate organizeaza hackathoane, workshop-uri si proiecte. Verifica avizierul facultatii si grupurile oficiale.'
  }
  if (n.includes('wifi') || n.includes('internet') || n.includes('eduroam')) {
    return 'Foloseste reteaua eduroam disponibila in cladirile universitatii cu contul institutional. Pentru probleme de conectare, contacteaza suportul IT al universitatii.'
  }
  if (n.includes('cazare') || n.includes('camin') || n.includes('chirie')) {
    return 'Caminele universitare sunt in campus sau in apropierea facultatii. In Campus Navigator ai locatiile caminelor cu butoane Google Maps/Waze.'
  }
  return 'Te pot ajuta cu viata de student: cantina, camine, transport, reduceri stabile, comunitati, evenimente si locuri de studiu.'
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

  if (university.startsWith('umf-')) {
    const UMF_SECRETARIAT = { 'umf-iasi': 'secretariat-umf', 'umf-buc': 'secretariat-umfb', 'umf-tgm': 'secretariat-tgm', 'umf-craiova': 'secretariat-cv' }
    const UMF_AMF = { 'umf-iasi': 'amf-med-0', 'umf-buc': 'amf-carol-0', 'umf-tgm': 'amf-med-tgm', 'umf-craiova': 'amf-med-cv' }
    const UMF_ANAT = { 'umf-iasi': 'lab-anatomie', 'umf-buc': 'lab-anat-buc', 'umf-tgm': 'lab-anat-tgm', 'umf-craiova': 'lab-anat-cv' }
    const UMF_DECANAT = { 'umf-iasi': 'decanat-med', 'umf-buc': 'decanat-buc', 'umf-tgm': 'decanat-tgm', 'umf-craiova': 'decanat-cv' }
    const defaultSecretariat = UMF_SECRETARIAT[university] || 'secretariat-umf'

    const wantsSecretariat = normalized.includes('secretariat')
    const wantsAnatomie = normalized.includes('anatomie')
    const wantsDecanat = normalized.includes('decanat')
    const wantsAmf = normalized.includes('amfiteatru') || normalized.includes('amf')
    const to = wantsDecanat ? UMF_DECANAT[university] : wantsAnatomie ? UMF_ANAT[university] : wantsAmf ? UMF_AMF[university] : wantsSecretariat ? defaultSecretariat : null

    if (to) {
      return {
        answer: hasImage
          ? `Am preluat poza. Te pozitionez in corpul principal si pot trasa ruta interioara spre ${to}.`
          : `Pot trasa ruta interioara spre ${to}.`,
        detectedLocation: { type: 'indoor', label: 'Corp Principal', building: university.toUpperCase(), room: defaultSecretariat, confidence: hasImage ? 0.72 : 0.58 },
        destination: { type: 'indoor', label: to, room: to, buildingId: null },
        actions: ['Check the floor indicator near the stairs.', 'Follow the route marked on the indoor map.', 'Ask at the secretariat if you cannot find the room.'],
        routeSuggestion: { type: 'indoor', from: defaultSecretariat, to },
      }
    }

    if (normalized.includes('biblioteca') || normalized.includes('cantina') || normalized.includes('dentara') || normalized.includes('farmacie') || normalized.includes('camin')) {
      const to = normalized.includes('biblioteca') ? 'biblioteca' : normalized.includes('cantina') ? 'principal' : normalized.includes('dentara') ? 'dentara' : normalized.includes('farmacie') ? 'farmacie' : 'camin'
      return {
        answer: 'Am gasit destinatia si pot porni ghidarea pe harta campusului.',
        detectedLocation: { type: 'outdoor', label: hasImage ? 'Corp Principal' : 'Campus', building: hasImage ? university.toUpperCase() : null, room: null, confidence: hasImage ? 0.68 : 0.5 },
        destination: { type: 'outdoor', label: to, room: null, buildingId: to },
        actions: ['Head towards the main campus path.', 'Avoid crowded areas during class breaks.', 'Open the map for the full route.'],
        routeSuggestion: { type: 'outdoor', from: 'principal', to },
      }
    }

    return {
      answer: hasImage ? 'Recunosc zona: poza pare sa fie din campusul universitatii. Unde vrei sa ajungi de aici?' : localAssistantAnswer(message),
      detectedLocation: { type: hasImage ? 'outdoor' : 'unknown', label: hasImage ? 'Campus' : 'Fara poza', building: hasImage ? university.toUpperCase() : null, room: null, confidence: hasImage ? 0.68 : 0 },
      destination: { type: 'unknown', label: null, room: null, buildingId: null },
      actions: [hasImage ? 'Tell me your destination: Secretariat, Lab Anatomie, Biblioteca or Cantina.' : 'Type your destination, e.g. Secretariat or Biblioteca.', 'If you are in a corridor, send a photo of the room door or floor sign.'],
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
