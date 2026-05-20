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

const TUIASI_SYSTEM_PROMPT = `Ești Campus AI, asistentul inteligent al studenților de la Universitatea Tehnică "Gheorghe Asachi" din Iași (TUIASI).
Răspunzi ÎNTOTDEAUNA în română, concis și practic. Ești prietenos dar la obiect — nu filozofa, nu da răspunsuri vagi.

═══════════════════════════════════════
CORP C – DEP. CALCULATOARE (CTI)
═══════════════════════════════════════
PARTER: Secretariat AC (L-V 09:00-13:00), Amf. AC0-1, Lab. A0-1, Sala AC0-2
ETAJ 1: Lab. C1-1, Lab. C1-2
ETAJ 2: Lab. C2-1, Birou C2-5 (Prof. Ciobanu)
ETAJ 3: Lab. A3-1 (DAIA), Sala A3-2
ETAJ 4: Sala Conferințe
SCARA: la capătul coridorului principal.

═══════════════════════════════════════
CORP A – DEP. AUTOMATICĂ (IS/DAIA)
═══════════════════════════════════════
Birouri profesori DAIA, laboratoare de control și automatizare, săli de seminar.

═══════════════════════════════════════
ALTE CLĂDIRI TUIASI & SERVICII
═══════════════════════════════════════
- Biblioteca Gh. Asachi: L-V 08:00-20:00, S 09:00-14:00; ~9 min de la AC
- Cantina Studențească TUIASI: L-V 11:00-15:00, prânz ~15 lei; 2 min de la AC
- Facultatea ETTI: Bd. Carol I 11A; ~12 min cu tramvaiul
- Facultatea IEEIA: Bd. Prof. D. Mangeron, ~5 min pe jos
- Facultatea MEC: Bd. Prof. D. Mangeron, ~3 min pe jos
- Cămine Tudor Vladimirescu: ~500m de facultate, 7 min pe jos
- Iulius Mall: 2km nord-vest; acces tramvai, L-D 10:00-22:00
- ATM BRD Mangeron: la intrarea AC, 24/7
- Magazin Petru / Magazin Luca: L-D 07:00-22:00, 2 min de facultate
- Copisterie Mangeron: lângă AC, L-V 08:00-17:00
- Farmacie Dacia: Bd. Mangeron, L-V 08:00-20:00

═══════════════════════════════════════
REGULI DE RĂSPUNS
═══════════════════════════════════════
1. Sală (ex: "unde e Lab C1-1"): spune ETAJUL și cum se ajunge.
2. Traseu: pași clari și concreți.
3. Orar (secretariat, cantină, bibliotecă): ore exacte.
4. Mâncare: Cantina TUIASI (prânz ieftin), Magazin Petru/Luca (snacks).
5. Dacă NU e despre campus: "Nu am informații despre asta, dar te pot ajuta să navighezi campusul TUIASI."
6. NU inventa. Dacă nu știi sigur: "Nu am date exacte despre asta."
7. Maxim 4-5 propoziții. Fii specific.`

const UAIC_SYSTEM_PROMPT = `Ești Campus AI, asistentul inteligent al studenților de la Universitatea Alexandru Ioan Cuza din Iași (UAIC).
Răspunzi ÎNTOTDEAUNA în română, concis și practic. Ești prietenos dar la obiect — nu filozofa, nu da răspunsuri vagi.

═══════════════════════════════════════
CORP B – FACULTATEA DE INFORMATICĂ (FII)
═══════════════════════════════════════
PARTER: Secretariat FII (L-V 09:00-13:00), Amf. „E. Otelea", Lab. Info 0-1, Sala Info 0-2
ETAJ 1: Lab. Info 1-1, Lab. Info 1-2
ETAJ 2: Lab. Info 2-1, Birouri Profesori
ETAJ 3: Lab. Info 3-1, Decanat FII
ETAJ 4: Sala Conferințe
SCARĂ: la capătul coridorului principal.

═══════════════════════════════════════
CORP A – RECTORAT UAIC & ALTE FACULTĂȚI (Bd. Carol I 11)
═══════════════════════════════════════
Rectorat UAIC, Facultatea de Matematică, Fizică, Chimie, Biologie — toate pe Bd. Carol I nr. 11.

═══════════════════════════════════════
ALTE CLĂDIRI UAIC & SERVICII
═══════════════════════════════════════
- BCU Biblioteca Centrală „Mihai Eminescu": L-V 09:00-20:00, S 09:00-14:00; ~7 min de la FII
- Cantina UAIC: L-V 11:00-19:00; ~5 min de la FII
- FEAA (Facultatea de Economie): Bd. Carol I 22; ~3 min pe jos, ușor spre nord
- Facultatea de Drept: Bd. Carol I 11, în campus
- Cămine Codrescu (Aleea M. Sadoveanu): ~700m de FII; 10 min pe jos
- Piața Unirii: ~5 min pe jos, stații de transport, cafenele, bănci
- Parcul Copou: ~10 min pe jos; teiul lui Eminescu, studiu outdoor
- Minimarket Profi: Bd. Carol I; alimente și produse zilnice
- Farmacie Salvator: Bd. Carol I; L-V 08:00-20:00
- ATM BRD: Bd. Carol I, la intrarea principală UAIC; 24/7

═══════════════════════════════════════
REGULI DE RĂSPUNS
═══════════════════════════════════════
1. Sală (ex: "unde e Lab Info 1-1"): spune ETAJUL și cum se ajunge.
2. Traseu: pași clari și concreți.
3. Orar (secretariat, cantină, bibliotecă): ore exacte.
4. Mâncare: Cantina UAIC, cafenele pe Bd. Carol I, Minimarket Profi.
5. Dacă NU e despre campus: "Nu am informații despre asta, dar te pot ajuta să navighezi campusul UAIC."
6. NU inventa. Dacă nu știi sigur: "Nu am date exacte despre asta."
7. Maxim 4-5 propoziții. Fii specific.`

function getSystemPrompt(university) {
  return university === 'uaic' ? UAIC_SYSTEM_PROMPT : TUIASI_SYSTEM_PROMPT
}

// Keep SYSTEM_PROMPT as alias for backward compat
const SYSTEM_PROMPT = TUIASI_SYSTEM_PROMPT

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

const KNOWN_INDOOR_ROOMS_TUIASI = ['secretariat-ac', 'amf-ac0-1', 'lab-a0-1', 'sala-ac0-2', 'lab-c1-1', 'lab-c1-2', 'lab-c2-1', 'birou-c2-5', 'lab-a3-1', 'sala-a3-2', 'sala-conf']
const KNOWN_INDOOR_ROOMS_UAIC   = ['secretariat-fii', 'amf-otelea', 'lab-info-0', 'sala-info-0', 'lab-info-1a', 'lab-info-1b', 'lab-info-2a', 'birou-prof', 'lab-info-3a', 'decanat-fii', 'sala-conf-fii']
const KNOWN_INDOOR_ROOMS = [...KNOWN_INDOOR_ROOMS_TUIASI, ...KNOWN_INDOOR_ROOMS_UAIC]

const KNOWN_BUILDINGS_TUIASI = ['corp-c', 'corp-a', 'library', 'canteen', 'secretariat', 'etti', 'ieeia', 'mec', 'ci', 'icpm', 'arh', 'cmmi', 'hgim', 'sim', 'dima']
const KNOWN_BUILDINGS_UAIC   = ['rectorat-uaic', 'fii', 'matematica', 'fizica', 'chimie', 'biologie', 'drept', 'litere', 'filosofie', 'psihologie', 'feaa', 'geografie', 'bcu', 'secretariat-fii', 'camine-codrescu', 'canteen-uaic']
const KNOWN_BUILDINGS = [...KNOWN_BUILDINGS_TUIASI, ...KNOWN_BUILDINGS_UAIC]

function knownRooms(university)    { return university === 'uaic' ? KNOWN_INDOOR_ROOMS_UAIC   : KNOWN_INDOOR_ROOMS_TUIASI }
function knownBuildings(university) { return university === 'uaic' ? KNOWN_BUILDINGS_UAIC       : KNOWN_BUILDINGS_TUIASI }

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

function inferVisualLocation(text, university = 'tuiasi') {
  const normalized = String(text || '').toLowerCase()
  // For UAIC users, don't override — let the AI answer stand
  if (university === 'uaic') return null
  // For TUIASI: if the AI mistakenly says FII/Informatică, correct it to AC TUIASI
  if (
    normalized.includes('corp c') ||
    normalized.includes('automatica si calculatoare')
  ) {
    return {
      type: 'outdoor',
      label: 'Facultatea de Automatica si Calculatoare TUIASI',
      building: 'Facultatea de Automatica si Calculatoare TUIASI',
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

function applyVisualLocation(payload, visualAnswer, university = 'tuiasi') {
  const inferred = inferVisualLocation(visualAnswer, university)
  if (!inferred) return payload

  payload.detectedLocation = {
    ...(payload.detectedLocation || {}),
    ...inferred,
  }
  payload.answer = normalizeVisibleLocationText(payload.answer, inferred)
  return payload
}

function inferIndoorRoom(university, ...texts) {
  const normalized = texts.map(text => String(text || '').toLowerCase()).join(' ')
  const rooms = knownRooms(university)
  for (const room of rooms) {
    if (normalized.includes(room)) return room
  }
  if (university === 'uaic') {
    if (normalized.includes('secretariat') || normalized.includes('fii')) return 'secretariat-fii'
    if (normalized.includes('otelea') || normalized.includes('amfiteatru')) return 'amf-otelea'
    if (normalized.includes('decanat')) return 'decanat-fii'
    if ((normalized.includes('lab') || normalized.includes('laborator')) && normalized.includes('info')) return 'lab-info-1a'
    if (normalized.includes('birouri') || normalized.includes('profesori')) return 'birou-prof'
  } else {
    if (normalized.includes('c 210') || normalized.includes('c210') || normalized.includes('lab c2')) return 'lab-c2-1'
    if (normalized.includes('c 308') || normalized.includes('c308') || normalized.includes('a3') || normalized.includes('daia')) return 'lab-a3-1'
    if (normalized.includes('c 112') || normalized.includes('c112') || normalized.includes('lab c1')) return 'lab-c1-1'
    if (normalized.includes('secretariat')) return 'secretariat-ac'
  }
  return null
}

function inferOutdoorBuilding(university, ...texts) {
  const normalized = texts.map(text => String(text || '').toLowerCase()).join(' ')
  if (university === 'uaic') {
    if (normalized.includes('biblioteca') || normalized.includes('bcu')) return 'bcu'
    if (normalized.includes('cantina')) return 'canteen-uaic'
    if (normalized.includes('feaa') || normalized.includes('economie')) return 'feaa'
    if (normalized.includes('informatica') || normalized.includes('fii') || normalized.includes('corp b')) return 'fii'
    if (normalized.includes('rectorat')) return 'rectorat-uaic'
    if (normalized.includes('drept')) return 'drept'
    if (normalized.includes('matematica')) return 'matematica'
    if (normalized.includes('secretariat')) return 'secretariat-fii'
  } else {
    if (normalized.includes('biblioteca')) return 'library'
    if (normalized.includes('cantina')) return 'canteen'
    if (normalized.includes('corp a')) return 'corp-a'
    if (normalized.includes('corp c') || normalized.includes('informatic')) return 'corp-c'
    if (normalized.includes('secretariat')) return 'secretariat'
  }
  return null
}

function withImageOnlyPrompt(payload, visualAnswer, message, university = 'tuiasi') {
  const normalizedMessage = String(message || '').trim()
  const inferred = inferVisualLocation(visualAnswer, university)
  const hasDestination = payload.destination?.room || payload.destination?.buildingId

  applyVisualLocation(payload, visualAnswer, university)

  if (!hasDestination && !normalizedMessage) {
    const cleanVisionAnswer = normalizeVisibleLocationText(String(visualAnswer || '').trim(), inferred)
    const exampleDest = university === 'uaic'
      ? 'Lab Info 1-1, Secretariat FII, BCU sau Cantina.'
      : 'C210, Secretariat, Biblioteca sau Cantina.'
    payload.answer = inferred
      ? `${cleanVisionAnswer || `Recunosc zona: pare sa fie ${inferred.label}.`} Unde vrei sa ajungi de aici?`
      : `Am analizat poza. Unde vrei sa ajungi? De exemplu: ${exampleDest}`
    payload.destination = { type: 'unknown', label: null, room: null, buildingId: null }
    payload.routeSuggestion = { type: 'none', from: null, to: null }
    payload.actions = [
      `Spune destinatia, de exemplu ${exampleDest}`,
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

const PHOTO_PROMPT_UAIC = `Ești AI Compass pentru StudentCompass.
Studentul este înscris la UAIC (Universitatea Alexandru Ioan Cuza din Iași, Bd. Carol I 11).
Poza este din campusul UAIC. Identifică clădirea sau zona exactă.

Clădirile UAIC pe care le poți recunoaște:
• Facultatea de Informatică FII – Corp B, intrare separată, clădire modernă
• Rectorat UAIC – Corp A, clădire istorică, Bd. Carol I 11
• Facultatea de Matematică, Fizică, Chimie, Biologie, Drept, Litere, Filosofie, Psihologie – Bd. Carol I 11
• Facultatea de Economie FEAA – Bd. Carol I 22
• BCU Biblioteca Centrală „Mihai Eminescu" – Bd. Carol I
• Cantina UAIC – Bd. Carol I
• Cămine Codrescu – Aleea M. Sadoveanu
• Parcul Copou

Răspunde în română, în 2-3 fraze:
1. Universitatea: UAIC și locația probabilă (clădire sau reper)
2. Indiciile vizuale principale (arhitectură, plăcuțe, sigle, vegetație etc.)
3. Gradul de certitudine (sigur / probabil / nesigur)

Nu genera traseu și nu întreba destinația.`

const PHOTO_PROMPT_TUIASI = `Ești AI Compass pentru StudentCompass.
Studentul este înscris la TUIASI (Universitatea Tehnică "Gheorghe Asachi" din Iași, Bd. Mangeron).
Poza este din campusul TUIASI. Identifică clădirea sau zona exactă.

Clădirile TUIASI pe care le poți recunoaște:
• Facultatea de Automatică și Calculatoare (AC) – Corp C (CTI) sau Corp A (DAIA), Bd. Mangeron 27
• Facultatea ETTI – Bd. Carol I 11A
• Facultatea IEEIA – Bd. Mangeron
• Facultatea de Mecanică – Bd. Mangeron
• Facultatea CI, ICPM, Arhitectură, CMMI, HGIM, SIM, DIMA – Bd. Mangeron
• Biblioteca Gh. Asachi – Bd. Carol I
• Rectorat TUIASI – Bd. Carol I
• Cantina TUIASI – Campus Tudor Vladimirescu
• Cămine Tudor Vladimirescu (T1–T19)

Răspunde în română, în 2-3 fraze:
1. Universitatea: TUIASI și locația probabilă (clădire sau reper)
2. Indiciile vizuale principale (arhitectură, plăcuțe, sigle, vegetație etc.)
3. Gradul de certitudine (sigur / probabil / nesigur)

Nu genera traseu și nu întreba destinația.`

async function handlePhoto(req, res) {
  const body = await readJson(req)
  const mimeType = body.mimeType || 'image/jpeg'
  const university = body.university || 'tuiasi'
  const prompt = university === 'uaic' ? PHOTO_PROMPT_UAIC : PHOTO_PROMPT_TUIASI

  const rawAnswer = await grokChat({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${body.base64 || ''}` } },
          { type: 'text', text: prompt },
        ],
      },
    ],
    max_tokens: 480,
  })
  sendJson(res, 200, { answer: rawAnswer })
}

async function handleCopilot(req, res) {
  const body = await readJson(req)
  const message = String(body.message || '')
  const image = body.image || null
  const context = body.context || {}
  const university = String(context.university || body.university || 'tuiasi').toLowerCase()
  let visualAnswer = String(context.visualAnswer || '')

  const indoorRooms = knownRooms(university)
  const outdoorBuildings = knownBuildings(university)
  const defaultStart = university === 'uaic' ? 'secretariat-fii' : 'secretariat-ac'
  const outdoorDefaultStart = university === 'uaic' ? 'fii' : 'corp-c'
  const sysPrompt = getSystemPrompt(university)

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
              text: `${university === 'uaic' ? PHOTO_PROMPT_UAIC : PHOTO_PROMPT_TUIASI}

Dacă poți identifica o locație interioară (coridor, sală, panou), menționează și asta.
Dacă există un mesaj de la student care indică o destinație, ține cont de el în răspuns.`,
            },
          ],
        },
      ],
      max_tokens: 480,
    })
  }

  const text = `Mesaj student: "${message || 'Nu a scris mesaj.'}"
Analiza vizuala preliminara: ${visualAnswer || 'Nu exista poza atasata.'}

Context cunoscut:
- Campus: ${context.campus || (university === 'uaic' ? 'UAIC Iași' : 'TUIASI Gheorghe Asachi')}
- Universitate: ${university.toUpperCase()}
- Sali indoor disponibile: ${JSON.stringify(indoorRooms)}
- Cladiri outdoor disponibile: ${JSON.stringify(outdoorBuildings)}
- Orar apropiat: ${JSON.stringify(context.schedule || [])}
- Ora curenta: ${context.currentTime || new Date().toISOString()}

Comporta-te ca AI Compass pentru StudentCompass. Foloseste analiza vizuala ca sursa principala pentru locatie. Daca exista poza si nu exista destinatie in mesaj, recunoaste zona si intreaba explicit unde vrea studentul sa ajunga. Propune ruta indoor daca cere o sala, ruta outdoor daca cere o cladire.

Raspunde strict cu JSON valid in schema:
${COPILOT_JSON_SCHEMA}

IMPORTANT: Campul "actions" trebuie scris INTOTDEAUNA in engleza (ghidare vocala). Campul "answer" ramane in romana.`

  const raw = await grokChat({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: sysPrompt },
      ...(Array.isArray(body.history) ? body.history.slice(-6) : []),
      { role: 'user', content: text },
    ],
    max_tokens: 650,
    response_format: { type: 'json_object' },
  })

  const parsed = safeJson(raw, { answer: raw })
  const normalized = normalizeCopilotPayload(parsed, visualAnswer || raw)
  applyVisualLocation(normalized, visualAnswer, university)

  const inferredRoom = inferIndoorRoom(university, message, normalized.answer, normalized.destination.label)
  const inferredBuilding = inferOutdoorBuilding(university, message, normalized.answer, normalized.destination.label)
  if (inferredRoom && !normalized.destination.room) {
    normalized.destination = {
      ...normalized.destination,
      type: 'indoor',
      label: normalized.destination.label || inferredRoom.toUpperCase(),
      room: inferredRoom,
    }
  }
  if (inferredRoom && (!normalized.routeSuggestion.to || normalized.routeSuggestion.type === 'none')) {
    normalized.routeSuggestion = { type: 'indoor', from: normalized.detectedLocation.room || defaultStart, to: inferredRoom }
  }
  if (!inferredRoom && inferredBuilding && !normalized.destination.buildingId) {
    normalized.destination = {
      ...normalized.destination,
      type: 'outdoor',
      label: normalized.destination.label || inferredBuilding,
      buildingId: inferredBuilding,
    }
  }
  if (!inferredRoom && inferredBuilding) {
    normalized.routeSuggestion = { type: 'outdoor', from: outdoorDefaultStart, to: inferredBuilding }
  }

  if (normalized.routeSuggestion.type === 'indoor' && normalized.routeSuggestion.to && !normalized.routeSuggestion.from) {
    normalized.routeSuggestion.from = normalized.detectedLocation.room || defaultStart
  }
  if (normalized.routeSuggestion.type === 'outdoor' && normalized.routeSuggestion.to && !normalized.routeSuggestion.from) {
    normalized.routeSuggestion.from = outdoorDefaultStart
  }
  sendJson(res, 200, withImageOnlyPrompt(normalized, visualAnswer, message, university))
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

async function handleSupportAssistant(req, res) {
  const body = await readJson(req)
  const context = body.context || {}
  const fallbackSuggestions = context.role === 'professor'
    ? ['Ce pot gestiona aici?', 'Cum functioneaza cererile de licenta?', 'Cum functioneaza mesajele?']
    : ['Ce pot face aici?', 'Deschide Campus Navigator', 'Cum functioneaza cererile de licenta?']

  const raw = await grokChat({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: `Esti asistentul virtual de suport din StudentCompass.
Raspunde intotdeauna in romana. Fii concis, practic si orientat pe produs.

Poti ajuta cu:
- acces la cont, email institutional, onboarding si profil
- module de student: Dashboard, Campus Navigator, Schedule Hub, Thesis Finder, Peer Tutoring, Messages, Student Life, City Adaptation
- module de profesor: dashboard, profil academic, cereri de licenta, cereri de recuperare si mesaje
- intrebari de baza despre viata studenteasca

Reguli:
- Nu spune ca ai modificat datele contului daca utilizatorul nu a folosit un control din aplicatie.
- Nu inventa politici, note, sfaturi juridice/medicale/financiare sau date private.
- Daca intrebarea este in afara StudentCompass, raspunde scurt daca este ceva de baza; altfel redirectioneaza catre ce poate face aplicatia.
- Returneaza doar JSON cu forma: {"answer":"...", "suggestions":["...", "...", "..."]}.`,
      },
      {
        role: 'user',
        content: `Contextul curent al aplicatiei:
${JSON.stringify({
  role: context.role,
  university: context.university,
  faculty: context.faculty || context.detectedFaculty,
  year: context.year,
  platformMode: context.platformMode,
  currentView: context.currentView,
  currentLabel: context.currentLabel,
})}

Conversatia recenta:
${JSON.stringify(Array.isArray(body.history) ? body.history.slice(-8) : [])}

Intrebarea utilizatorului:
${String(body.message || '')}`,
      },
    ],
    max_tokens: 520,
    response_format: { type: 'json_object' },
  })

  const parsed = safeJson(raw, { answer: raw, suggestions: fallbackSuggestions })
  sendJson(res, 200, {
    answer: String(parsed.answer || raw || 'Te pot ajuta cu intrebari despre cont, module, mesaje, orar, cereri de licenta si viata studenteasca.'),
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions.slice(0, 3).map(String)
      : fallbackSuggestions,
  })
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
      if (req.url === '/api/navigation/support-assistant') { await handleSupportAssistant(req, res); return }
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
      if (req.url === '/api/navigation/support-assistant') {
        await handleSupportAssistant(req, res)
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
