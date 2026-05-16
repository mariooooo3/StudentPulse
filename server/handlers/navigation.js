import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { resolve } from 'node:path'

const TEXT_MODEL = 'llama-3.3-70b-versatile'
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const KEY_FILES = [
  resolve(process.cwd(), '..', '..', '..', 'navigatie', 'key.txt'),
  resolve(process.cwd(), '..', '..', '..', 'navigatie', 'navigator-export', 'key.txt'),
]

const SYSTEM_PROMPT = `Esti asistentul de navigatie pentru platforma StudentCompass.
Raspunzi concis in romana, doar despre campus, trasee, cladiri, servicii, intervale aglomerate si orientare indoor.
Nu inventa date sensibile si nu mentiona cheia API.`

function navigationKey() {
  if (process.env.GROK_API_KEY) return process.env.GROK_API_KEY.trim()
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY.trim()
  const keyFile = KEY_FILES.find((file) => existsSync(file))
  if (keyFile) return readFileSync(keyFile, 'utf8').trim()
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
  const answer = await grokChat({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Pe baza acestui orar JSON, ofera 3 recomandari concrete de navigatie si evitare aglomeratie: ${JSON.stringify(body.schedule || [])}`,
      },
    ],
    max_tokens: 320,
  })
  sendJson(res, 200, { answer })
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
