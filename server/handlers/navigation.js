import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { resolve } from 'node:path'

const TEXT_MODEL = 'llama-3.3-70b-versatile'
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const KEY_FILES = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '..', '..', 'navigatie', 'key.txt'),
  resolve(process.cwd(), '..', '..', '..', 'navigatie', 'navigator-export', 'key.txt'),
]

const SYSTEM_PROMPT = `Ești Campus AI, asistentul inteligent al studenților de la UAIC Iași (Universitatea Alexandru Ioan Cuza).
Răspunzi ÎNTOTDEAUNA în română, concis și practic. Ești prietenos dar la obiect — nu filozofa, nu da răspunsuri vagi.

═══════════════════════════════════════
CORP C — FACULTATEA DE INFORMATICĂ
═══════════════════════════════════════
PARTER:
- Secretariat FII: intrare stânga, program L-V 09:00-13:00
- C2 (Aula Mare): 250 locuri, amfiteatru principal, parter dreapta
- Lab 101, Lab 102: laboratoare PC, parter mijloc

ETAJ 1: C112, C114, C116, C118 (~80 locuri), birouri profesori
ETAJ 2: C210, C212 (~60 locuri), Lab 205, Lab 206
ETAJ 3: C308, C310, C315 (~60 locuri), Sala consiliu C305
ETAJ 4: C420 Amfiteatru Mare (300 locuri), C418 conferințe
SCARA: dreapta intrării principale. LIFT: lângă secretariat.

═══════════════════════════════════════
ALTE CLĂDIRI & SERVICII
═══════════════════════════════════════
- Corp A (Matematică): 5 min pe jos prin curtea interioară
- Biblioteca Centrală: L-V 08:00-20:00, S 09:00-14:00; 3 min din Corp C (ușa din spate); necesită legitimație
- Cantina Studențească: L-V 11:00-15:00, prânz ~15 lei; 8 min din Corp C
- Coffee Campus (cafenea): L-V 07:30-19:00, Wi-Fi gratuit
- Magazin Petru Luca (minimarket): L-D 07:00-22:00, 2 min de Corp C
- Kebab & Pizza Express: L-D 10:00-24:00
- Profi Copou (supermarket): 5 min pe jos, L-D 07:00-22:00
- ATM BRD: lângă Corp C, 24/7
- Copisterie FII: Corp C, L-V 08:00-17:00
- Farmacia Catena: Bd. Carol I, L-V 08:00-20:00

═══════════════════════════════════════
REGULI DE RĂSPUNS
═══════════════════════════════════════
1. Sală (ex: "unde e C310"): spune ETAJUL și cum se ajunge.
2. Traseu: pași clari și concreți.
3. Orar (secretariat, cantină, bibliotecă): ore exacte.
4. Mâncare: Cantina (prânz ieftin), Kebab (non-stop), Coffee Campus (mic dejun/gustare), Profi (supermarket).
5. Dacă NU e despre campus: "Nu am informații despre asta, dar te pot ajuta să navighezi campusul UAIC."
6. NU inventa. Dacă nu știi sigur: "Nu am date exacte despre asta."
7. Maxim 4-5 propoziții. Fii specific.`

const COPILOT_JSON_SCHEMA = `{
  "answer": "Raspuns scurt, conversational, in romana.",
  "detectedLocation": {
    "type": "indoor|outdoor|unknown",
    "label": "Locatia probabila",
    "building": "Cladirea probabila sau null",
    "room": "id sala cunoscuta sau null",
    "confidence": 0.82
  },
  "destination": {
    "type": "indoor|outdoor|unknown",
    "label": "Destinatia ceruta sau null",
    "room": "id sala cunoscuta sau null",
    "buildingId": "id cladire cunoscuta sau null"
  },
  "actions": ["Pas concret 1", "Pas concret 2", "Pas concret 3"],
  "routeSuggestion": {
    "type": "indoor|outdoor|none",
    "from": "id start sau null",
    "to": "id destinatie sau null"
  }
}`

const KNOWN_INDOOR_ROOMS = ['secretariat', 'lab101', 'lab102', 'c2', 'c112', 'c118', 'c210', 'c308', 'c315', 'c420']
const KNOWN_BUILDINGS = ['corp-c', 'corp-a', 'library', 'canteen', 'secretariat']

function safeJson(raw, fallback) {
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    const match = String(raw || '').match(/\{[\s\S]*\}/)
    if (!match) return fallback
    try {
      const parsed = JSON.parse(match[0])
      return parsed && typeof parsed === 'object' ? parsed : fallback
    } catch {
      return fallback
    }
  }
}

function normalizeCopilotPayload(payload, fallbackAnswer = '') {
  const detected = payload.detectedLocation || {}
  const destination = payload.destination || {}
  const route = payload.routeSuggestion || {}

  const routeType = ['indoor', 'outdoor', 'none'].includes(route.type) ? route.type : 'none'
  const from = typeof route.from === 'string' ? route.from : null
  const to = typeof route.to === 'string' ? route.to : null

  return {
    answer: String(payload.answer || fallbackAnswer || 'Am analizat contextul, dar am nevoie de o poza mai clara sau o destinatie.'),
    detectedLocation: {
      type: ['indoor', 'outdoor', 'unknown'].includes(detected.type) ? detected.type : 'unknown',
      label: detected.label ? String(detected.label) : 'Locatie neconfirmata',
      building: detected.building ? String(detected.building) : null,
      room: KNOWN_INDOOR_ROOMS.includes(detected.room) ? detected.room : null,
      confidence: Math.max(0, Math.min(1, Number(detected.confidence) || 0)),
    },
    destination: {
      type: ['indoor', 'outdoor', 'unknown'].includes(destination.type) ? destination.type : 'unknown',
      label: destination.label ? String(destination.label) : null,
      room: KNOWN_INDOOR_ROOMS.includes(destination.room) ? destination.room : null,
      buildingId: KNOWN_BUILDINGS.includes(destination.buildingId) ? destination.buildingId : null,
    },
    actions: Array.isArray(payload.actions) ? payload.actions.slice(0, 4).map(String) : [],
    routeSuggestion: {
      type: routeType,
      from: routeType === 'indoor' && KNOWN_INDOOR_ROOMS.includes(from) ? from : routeType === 'outdoor' && KNOWN_BUILDINGS.includes(from) ? from : null,
      to: routeType === 'indoor' && KNOWN_INDOOR_ROOMS.includes(to) ? to : routeType === 'outdoor' && KNOWN_BUILDINGS.includes(to) ? to : null,
    },
  }
}

function inferVisualLocation(text) {
  const normalized = String(text || '').toLowerCase()
  if (
    normalized.includes('informatic') ||
    normalized.includes('corp c') ||
    normalized.includes('facultatea de info') ||
    normalized.includes('fii')
  ) {
    return {
      type: 'outdoor',
      label: 'Facultatea de Informatica',
      building: 'Facultatea de Informatica',
      room: null,
      confidence: 0.82,
    }
  }
  return null
}

function normalizeVisibleLocationText(text, inferredLocation) {
  if (!inferredLocation?.label) return String(text || '')
  return String(text || '')
    .replace(/\bCorpul C\b/gi, inferredLocation.label)
    .replace(/\bCorp C\b/gi, inferredLocation.label)
}

function applyVisualLocation(payload, visualAnswer) {
  const inferred = inferVisualLocation(visualAnswer)
  if (!inferred) return payload

  payload.detectedLocation = {
    ...(payload.detectedLocation || {}),
    ...inferred,
  }
  payload.answer = normalizeVisibleLocationText(payload.answer, inferred)
  return payload
}

function inferIndoorRoom(...texts) {
  const normalized = texts.map(text => String(text || '').toLowerCase()).join(' ')
  for (const room of KNOWN_INDOOR_ROOMS) {
    if (normalized.includes(room)) return room
  }
  if (normalized.includes('c 210')) return 'c210'
  if (normalized.includes('c 308')) return 'c308'
  if (normalized.includes('c 112')) return 'c112'
  return null
}

function inferOutdoorBuilding(...texts) {
  const normalized = texts.map(text => String(text || '').toLowerCase()).join(' ')
  if (normalized.includes('biblioteca')) return 'library'
  if (normalized.includes('cantina')) return 'canteen'
  if (normalized.includes('corp a')) return 'corp-a'
  if (normalized.includes('corp c') || normalized.includes('informatic') || normalized.includes('fii')) return 'corp-c'
  if (normalized.includes('secretariat')) return 'secretariat'
  return null
}

function withImageOnlyPrompt(payload, visualAnswer, message) {
  const normalizedMessage = String(message || '').trim()
  const inferred = inferVisualLocation(visualAnswer)
  const hasDestination = payload.destination?.room || payload.destination?.buildingId

  applyVisualLocation(payload, visualAnswer)

  if (!hasDestination && !normalizedMessage) {
    const cleanVisionAnswer = normalizeVisibleLocationText(String(visualAnswer || '').trim(), inferred)
    payload.answer = inferred
      ? `${cleanVisionAnswer || `Recunosc zona: pare sa fie ${inferred.label}.`} Unde vrei sa ajungi de aici?`
      : 'Am analizat poza, dar am nevoie de un reper mai clar. Unde vrei sa ajungi?'
    payload.destination = { type: 'unknown', label: null, room: null, buildingId: null }
    payload.routeSuggestion = { type: 'none', from: null, to: null }
    payload.actions = [
      'Spune destinatia, de exemplu C210, Secretariat, Biblioteca sau Cantina.',
      'Daca esti pe coridor, trimite o poza cu usa salii sau cu indicatorul de etaj.',
    ]
  }

  return payload
}

function navigationKey() {
  if (process.env.GROK_API_KEY) return process.env.GROK_API_KEY.trim()
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY.trim()
  for (const keyFile of KEY_FILES) {
    if (!existsSync(keyFile)) continue
    const raw = readFileSync(keyFile, 'utf8').trim()
    const envKey = raw
      .split(/\r?\n/)
      .map(line => line.match(/^\s*(?:GROQ_API_KEY|GROK_API_KEY|VITE_GROQ_API_KEY)\s*=\s*(.+?)\s*$/)?.[1])
      .find(Boolean)
    return envKey || raw
  }
  return ''
}

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(statusCode === 204 ? '' : JSON.stringify(body))
}

async function grokChat(payload) {
  const key = navigationKey()
  if (!key) {
    const error = new Error('Navigation AI key is not configured.')
    error.statusCode = 503
    throw error
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = new Error(`Grok API failed with ${response.status}`)
    error.statusCode = response.status
    throw error
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

async function handleAssistant(req, res) {
  const body = await readJson(req)
  const answer = await grokChat({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(Array.isArray(body.history) ? body.history.slice(-8) : []),
      { role: 'user', content: String(body.message || '') },
    ],
    max_tokens: 420,
  })
  sendJson(res, 200, { answer })
}

async function handlePhoto(req, res) {
  const body = await readJson(req)
  const mimeType = body.mimeType || 'image/jpeg'
  const rawAnswer = await grokChat({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${body.base64 || ''}` } },
          {
            type: 'text',
            text: `Esti AI Compass pentru StudentCompass.
Analizeaza imaginea strict ca recunoastere de locatie in campus.
Daca poza arata cladirea Facultatii de Informatica / FII / zona Corpului C de la Informatica, raspunde vizibil cu numele "Facultatea de Informatica", nu doar "Corp C".
Raspunde in romana, in 1-2 fraze: locatia probabila si indiciul vizual care te-a facut sa o recunosti.
Nu genera traseu si nu intreba destinatia; aplicatia va intreba automat dupa raspunsul tau.`,
          },
        ],
      },
    ],
    max_tokens: 420,
  })
  const inferred = inferVisualLocation(rawAnswer)
  const answer = normalizeVisibleLocationText(rawAnswer, inferred)
  sendJson(res, 200, { answer })
}

async function handleCopilot(req, res) {
  const body = await readJson(req)
  const message = String(body.message || '')
  const image = body.image || null
  const context = body.context || {}
  let visualAnswer = String(context.visualAnswer || '')

  if (image?.base64 && !visualAnswer) {
    visualAnswer = await grokChat({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${image.mimeType || 'image/jpeg'};base64,${image.base64}` } },
            {
              type: 'text',
              text: `Analizeaza imaginea ca ghid de campus UAIC.
Identifica daca este Facultatea de Informatica, Corp C, o intrare, un coridor, o sala sau un panou.
Raspunde concis in romana cu:
- locatia probabila
- indicii vizuale observate
- cat de sigur esti
- daca nu exista destinatie in mesaj, intreaba unde vrea studentul sa ajunga.`,
            },
          ],
        },
      ],
      max_tokens: 420,
    })
  }

  const text = `Mesaj student: "${message || 'Nu a scris mesaj.'}"
Analiza vizuala preliminara: ${visualAnswer || 'Nu exista poza atasata.'}

Context cunoscut:
- Campus: ${context.campus || 'UAIC'}
- Sali indoor disponibile: ${JSON.stringify(KNOWN_INDOOR_ROOMS)}
- Cladiri outdoor disponibile: ${JSON.stringify(KNOWN_BUILDINGS)}
- Orar apropiat: ${JSON.stringify(context.schedule || [])}
- Ora curenta: ${context.currentTime || new Date().toISOString()}

Comporta-te ca AI Compass pentru StudentCompass. Foloseste analiza vizuala preliminara ca sursa principala pentru locatie. Daca exista poza si nu exista destinatie in mesaj, recunoaste zona si intreaba explicit unde vrea studentul sa ajunga. Daca utilizatorul cere C210, C308, C112, secretariat sau alta sala cunoscuta, propune ruta indoor. Daca cere biblioteca, cantina, Corp A sau Corp C, propune ruta outdoor.

Raspunde strict cu JSON valid in schema:
${COPILOT_JSON_SCHEMA}

IMPORTANT: Campul "actions" trebuie scris INTOTDEAUNA in engleza (este folosit pentru ghidare vocala). Campul "answer" ramane in romana.`

  const raw = await grokChat({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(Array.isArray(body.history) ? body.history.slice(-6) : []),
      { role: 'user', content: text },
    ],
    max_tokens: 650,
    response_format: { type: 'json_object' },
  })

  const parsed = safeJson(raw, { answer: raw })
  const normalized = normalizeCopilotPayload(parsed, visualAnswer || raw)
  applyVisualLocation(normalized, visualAnswer)

  const inferredRoom = inferIndoorRoom(message, normalized.answer, normalized.destination.label)
  const inferredBuilding = inferOutdoorBuilding(message, normalized.answer, normalized.destination.label)
  if (inferredRoom && !normalized.destination.room) {
    normalized.destination = {
      ...normalized.destination,
      type: 'indoor',
      label: normalized.destination.label || inferredRoom.toUpperCase(),
      room: inferredRoom,
    }
  }
  if (inferredRoom && (!normalized.routeSuggestion.to || normalized.routeSuggestion.type === 'none')) {
    normalized.routeSuggestion = { type: 'indoor', from: normalized.detectedLocation.room || 'c112', to: inferredRoom }
  }
  if (!inferredRoom && inferredBuilding && !normalized.destination.buildingId) {
    normalized.destination = {
      ...normalized.destination,
      type: 'outdoor',
      label: normalized.destination.label || inferredBuilding,
      buildingId: inferredBuilding,
    }
  }
  if (!inferredRoom && inferredBuilding && (!normalized.routeSuggestion.to || normalized.routeSuggestion.type === 'none')) {
    normalized.routeSuggestion = { type: 'outdoor', from: 'corp-c', to: inferredBuilding }
  }

  if (normalized.routeSuggestion.type === 'indoor' && normalized.routeSuggestion.to && !normalized.routeSuggestion.from) {
    normalized.routeSuggestion.from = normalized.detectedLocation.room || 'c112'
  }
  if (normalized.routeSuggestion.type === 'outdoor' && normalized.routeSuggestion.to && !normalized.routeSuggestion.from) {
    normalized.routeSuggestion.from = 'corp-c'
  }
  sendJson(res, 200, withImageOnlyPrompt(normalized, visualAnswer, message))
}

async function handleRecommendations(req, res) {
  const body = await readJson(req)
  const hour = Number.isFinite(Number(body.hour)) ? Number(body.hour) : new Date().getHours()
  const totalUsers = Number.isFinite(Number(body.totalUsers)) ? Number(body.totalUsers) : 0
  const crowdLevel = totalUsers === 0 ? 'necunoscut' : totalUsers < 80 ? 'scazut' : totalUsers < 160 ? 'moderat' : 'ridicat'
  const timeSlot = hour < 10 ? 'dimineata' : hour < 13 ? 'la pranz' : hour < 17 ? 'dupa-amiaza' : 'seara'

  const fallback = {
    briefing: `Campusul este ${crowdLevel}, iar tu esti in intervalul ${timeSlot}.`,
    cards: [
      {
        id: 'route-now',
        emoji: '🧭',
        title: 'Pleaca acum',
        desc: 'Porneste spre urmatorul curs cu 8 minute inainte pentru a evita pauzele aglomerate.',
        urgency: 'medium',
      },
      {
        id: 'quiet-zone',
        emoji: '📚',
        title: 'Zona linistita',
        desc: 'Biblioteca este o alegere buna intre cursuri daca vrei lucru concentrat.',
        urgency: 'low',
      },
      {
        id: 'canteen-window',
        emoji: '🍽️',
        title: 'Evita cantina',
        desc: 'Intervalul de la pranz este cel mai aglomerat; mergi mai devreme sau mai tarziu.',
        urgency: 'high',
      },
      {
        id: 'next-stop',
        emoji: '📍',
        title: 'Urmatorul reper',
        desc: `Verifica traseul dupa orar pentru ${Array.isArray(body.schedule) && body.schedule.length ? 'urmatorul curs' : 'urmatorul reper'}.`,
        urgency: 'low',
      },
    ],
  }

  try {
    const raw = await grokChat({
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Ora curenta: ${hour}:00 (${timeSlot}). Trafic campus: ${crowdLevel} (${totalUsers} studenti activi).
Orar student: ${JSON.stringify(body.schedule || [])}.

Genereaza exact 4 recomandari smart si practice. Raspunde doar cu JSON valid in formatul:
{
  "briefing": "O propozitie scurta despre starea campusului acum.",
  "cards": [
    {
      "id": "unic-id",
      "emoji": "emoji relevant",
      "title": "Titlu scurt",
      "desc": "Descriere practica, specifica.",
      "urgency": "low|medium|high"
    }
  ]
}`,
        },
      ],
      max_tokens: 600,
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.cards)) throw new Error('Invalid recommendations payload')
    sendJson(res, 200, {
      briefing: parsed.briefing || fallback.briefing,
      cards: parsed.cards.slice(0, 4),
    })
  } catch {
    sendJson(res, 200, fallback)
  }
}

export function createNavigationRequestHandler() {
  return async (req, res) => {
    try {
      if (req.method === 'OPTIONS') { sendJson(res, 204, {}); return }
      if (req.method !== 'POST') { sendJson(res, 404, { error: 'Not found' }); return }
      if (req.url === '/api/navigation/assistant') { await handleAssistant(req, res); return }
      if (req.url === '/api/navigation/photo') { await handlePhoto(req, res); return }
      if (req.url === '/api/navigation/copilot') { await handleCopilot(req, res); return }
      if (req.url === '/api/navigation/recommendations') { await handleRecommendations(req, res); return }
      sendJson(res, 404, { error: 'Not found' })
    } catch (error) {
      sendJson(res, error.statusCode || 500, { error: error.message || 'Navigation API error' })
    }
  }
}

export function createNavigationApiServer(port = 3000) {
  const server = createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') {
        sendJson(res, 204, {})
        return
      }
      if (req.method !== 'POST') {
        sendJson(res, 404, { error: 'Not found' })
        return
      }
      if (req.url === '/api/navigation/assistant') {
        await handleAssistant(req, res)
        return
      }
      if (req.url === '/api/navigation/photo') {
        await handlePhoto(req, res)
        return
      }
      if (req.url === '/api/navigation/copilot') {
        await handleCopilot(req, res)
        return
      }
      if (req.url === '/api/navigation/recommendations') {
        await handleRecommendations(req, res)
        return
      }
      sendJson(res, 404, { error: 'Not found' })
    } catch (error) {
      sendJson(res, error.statusCode || 500, { error: error.message || 'Navigation API error' })
    }
  })

  server.listen(port, () => {
    console.log(`[StudentCompass] Navigation API started - HTTP:${port}`)
  })

  return server
}
