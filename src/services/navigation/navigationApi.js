const API_URL = import.meta.env.VITE_NAVIGATION_API_URL || 'http://localhost:3000/api/navigation'

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

export async function analyzeNavigationPhoto({ base64, mimeType }) {
  try {
    const data = await post('/photo', { base64, mimeType })
    return data.answer
  } catch {
    return 'Analiza locala: imaginea a fost preluata. Cel mai probabil esti in zona Corp C sau langa intrarea principala. Pentru recunoastere reala porneste API-ul de navigatie cu cheia GROQ server-side.'
  }
}

export async function getNavigationRecommendations(scheduleItems = []) {
  try {
    const data = await post('/recommendations', { schedule: scheduleItems })
    return data.answer
  } catch {
    return 'Recomandare locala: pleaca spre urmatorul curs cu 8 minute inainte, evita cantina intre 12:00 si 13:15 si foloseste biblioteca drept zona de lucru intre cursuri.'
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
