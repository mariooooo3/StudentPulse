const API_URL = '/api/ai'

async function post(endpoint, body) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`AI API ${response.status}`)
  return response.json()
}

// ── Photo Navigation ──────────────────────────────────────────────────────────
export async function identifyLocationFromPhoto(imageFile) {
  const base64 = await fileToBase64(imageFile)
  const response = await fetch('/api/navigation/photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, mimeType: imageFile.type || 'image/jpeg' }),
  })
  if (!response.ok) throw new Error(`Photo API ${response.status}`)
  return response.json()
}

// ── Onboarding Personalization ─────────────────────────────────────────────────
export async function generateAdaptationProfile(answers) {
  try {
    return await post('/adaptation-profile', { answers })
  } catch {
    return {
      welcomeMessage: 'Bun venit în StudentPulse! Am personalizat platforma în funcție de profilul tău.',
      urgentTasks: ['Mergi la secretariat cu dosarul', 'Obține carnetul de student', 'Configurează orarul'],
      tips: ['Explorează Campus Navigator pentru a te orienta rapid', 'Verifică orarul în Schedule Hub'],
      personalityTag: 'Student motivat',
      recommendedModules: ['Campus Navigator', 'Schedule Hub', 'Peer Tutoring'],
    }
  }
}

// ── Smart Matching ─────────────────────────────────────────────────────────────
export async function findSmartMatches(userProfile, pool) {
  try {
    return await post('/smart-matches', { userProfile, pool })
  } catch {
    return pool.map(p => ({ ...p, match: true }))
  }
}

// ── Local Tips Ranking ─────────────────────────────────────────────────────────
export async function rankTipsForUser(tips, _userProfile) {
  return [...tips].sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0))
}

// ── City Adaptation Assistant ──────────────────────────────────────────────────
export async function askCityAssistant(question, userProfile, history = []) {
  const city = userProfile?.university?.city || 'orașul tău'
  try {
    return await post('/city-assistant', { question, userProfile, history })
  } catch {
    return {
      answer: `Ca student nou în ${city}, primul pas este să mergi la secretariat cu dosarul complet în prima săptămână.`,
      suggestedNext: ['Deschide cont bancar', 'Obține abonament transport'],
    }
  }
}

export async function* streamCityAssistant(question, userProfile, history = []) {
  const { readSSEStream } = await import('../utils/streamSSE.js')
  yield* readSSEStream('/api/ai/city-assistant', { question, userProfile, history })
}

// ── Helpers ────────────────────────────────────────────────────────────────────
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
  })
}
