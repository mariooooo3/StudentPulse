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
  const answer = await grokChat({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${body.base64 || ''}` } },
          {
            type: 'text',
            text: 'Analizeaza imaginea ca ghid de campus. Identifica posibila cladire sau reper, descrie ce vezi si da urmatorul pas de orientare. Raspunde concis in romana.',
          },
        ],
      },
    ],
    max_tokens: 420,
  })
  sendJson(res, 200, { answer })
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
