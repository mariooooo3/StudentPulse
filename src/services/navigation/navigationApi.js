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

export async function askNavigationAssistant(message, history = [], university = '') {
  try {
    const data = await post('/assistant', { message, history, university })
    return data.answer
  } catch {
    return localAssistantAnswer(message)
  }
}

export async function analyzeNavigationPhoto({ base64, mimeType, university = '' }) {
  try {
    const data = await post('/photo', { base64, mimeType, university })
    return data.answer
  } catch {
    return 'Analiza locala: imaginea a fost preluata. Cel mai probabil esti in zona Corp C sau langa intrarea principala. Pentru recunoastere reala porneste API-ul de navigatie cu cheia GROQ server-side.'
  }
}

export async function getNavigationRecommendations({ hour, totalUsers, schedule, university = '' } = {}) {
  try {
    return await post('/recommendations', { hour, totalUsers, schedule, university })
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
