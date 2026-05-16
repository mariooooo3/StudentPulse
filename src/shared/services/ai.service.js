/**
 * AI Service — abstraction for all AI API calls.
 * Currently mocked with realistic delays and fake responses.
 *
 * Future integrations:
 * - Claude Vision API: photo → location identification
 * - Claude/GPT: onboarding personalization
 * - Embedding API: semantic tip matching
 * - Vector DB: smart search across campus + city data
 */

const AI_DELAY = { fast: 800, medium: 2200, slow: 3500 }

// ── Photo Navigation ──────────────────────────────────────────────────────────
/**
 * Analyzes a campus photo and returns location + confidence.
 * Future: POST image to Claude Vision API with campus context prompt.
 */
export async function identifyLocationFromPhoto(imageFile) {
  await delay(AI_DELAY.medium)

  // Future:
  // const base64 = await fileToBase64(imageFile)
  // const response = await anthropic.messages.create({
  //   model: 'claude-opus-4-5',
  //   messages: [{ role: 'user', content: [{
  //     type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 }
  //   }, { type: 'text', text: CAMPUS_LOCATION_PROMPT }]}]
  // })

  return {
    building: 'C1',
    buildingName: 'Corp C1',
    floor: 0,
    floorLabel: 'Parter',
    description: 'Lângă intrarea principală, holul de la parter',
    confidence: 0.94,
    nearbyLandmarks: ['Intrare principală C1', 'Tablou informativ', 'Scara spre Etaj 1'],
  }
}

// ── Onboarding Personalization ─────────────────────────────────────────────────
/**
 * Generates personalized adaptation recommendations from onboarding answers.
 * Future: send answers to Claude with structured prompt, parse JSON response.
 */
export async function generateAdaptationProfile(answers) {
  await delay(AI_DELAY.fast)

  // Future: structured prompt → Claude → JSON profile
  return {
    adaptationNeeds: ['housing', 'social', 'academic'],
    recommendedModules: ['arrival_assistant', 'buddy_system', 'schedule_hub'],
    urgentTasks: ['register_secretariat', 'open_bank_account', 'get_student_card'],
    personalityTag: answers.learning_style?.label || 'Mixt',
    cityInsightLevel: answers.origin === 'local' ? 'high' : 'low',
  }
}

// ── Smart Matching ─────────────────────────────────────────────────────────────
/**
 * Finds compatible skill-swap or buddy matches using semantic similarity.
 * Future: generate embeddings for profile, query vector DB (pgvector).
 */
export async function findSmartMatches(userProfile, pool) {
  await delay(AI_DELAY.fast)
  // Future: embed userProfile.interests → cosine similarity against pool embeddings
  return pool.filter(p => p.match) // mock: return pre-flagged matches
}

// ── Local Tips Classification ──────────────────────────────────────────────────
/**
 * Classifies and ranks city tips by relevance to the user's profile.
 * Future: embed tip text → rank by vector similarity to user interests.
 */
export async function rankTipsForUser(tips, userProfile) {
  await delay(AI_DELAY.fast)
  return tips.sort((a, b) => b.upvotes - a.upvotes)
}

// ── City Adaptation Assistant ──────────────────────────────────────────────────
/**
 * Conversational assistant for city adaptation questions.
 * Future: Claude API with city context + user profile as system prompt.
 */
export async function askCityAssistant(question, userProfile) {
  await delay(AI_DELAY.medium)

  // Future: Claude API call with structured system prompt
  // including: user city, faculty, origin, language, urgentNeeds
  return {
    answer: `Bună întrebare! Ca student nou la ${userProfile?.university?.shortName || 'universitate'}, cel mai bun prim pas este să mergi la secretariat cu dosarul complet în prima săptămână.`,
    suggestedNext: ['open_bank_account', 'get_transport_pass'],
    sources: ['Ghidul studentului UAIC', 'Sfaturi verificate de studenți'],
  }
}

// ── Route Engine ───────────────────────────────────────────────────────────────
/**
 * Calculates optimal indoor route between two room nodes.
 * Future: graph traversal on building floor graph + cross-floor pathfinding.
 */
export async function calculateIndoorRoute(fromNode, toNode, buildingGraph) {
  await delay(AI_DELAY.fast)
  // Future: BFS/Dijkstra on buildingGraph.nodes with elevator/stair preferences
  return {
    steps: [
      { instruction: 'Ieși din sala curentă spre coridor', floor: fromNode.floor },
      { instruction: 'Urcă la etajul următor prin scara din dreapta', floor: fromNode.floor + 1 },
      { instruction: 'Mergi drept pe coridor ~30m', floor: toNode.floor },
      { instruction: `Intri în ${toNode.name}`, floor: toNode.floor },
    ],
    estimatedMinutes: 2,
    distance: '~80m',
    floors: [fromNode.floor, toNode.floor],
  }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
  })
}
