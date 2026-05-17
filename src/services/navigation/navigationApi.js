const NAVIGATION_ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
const API_URL = NAVIGATION_ENV.VITE_NAVIGATION_API_URL || 'http://localhost:3001/api/navigation'

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
