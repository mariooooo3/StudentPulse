import { existsSync, readFileSync } from 'node:fs'
import { KEY_FILES } from './navigation.constants.js'

let cachedKey = null

export function navigationKey() {
  if (cachedKey !== null) return cachedKey
  if (process.env.GROK_API_KEY) return (cachedKey = process.env.GROK_API_KEY.trim())
  if (process.env.GROQ_API_KEY) return (cachedKey = process.env.GROQ_API_KEY.trim())
  for (const keyFile of KEY_FILES) {
    if (!existsSync(keyFile)) continue
    const raw = readFileSync(keyFile, 'utf8').trim()
    const envKey = raw
      .split(/\r?\n/)
      .map(line => line.match(/^\s*(?:GROQ_API_KEY|GROK_API_KEY|VITE_GROQ_API_KEY)\s*=\s*(.+?)\s*$/)?.[1])
      .find(Boolean)
    return (cachedKey = envKey || raw)
  }
  return (cachedKey = '')
}

const MAX_NAV_BODY_BYTES = 256 * 1024 // navigation payloads are small JSON

export async function readJson(req) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > MAX_NAV_BODY_BYTES) {
      const error = new Error('Request body too large')
      error.statusCode = 413
      throw error
    }
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(statusCode === 204 ? '' : JSON.stringify(body))
}

async function callGroq(payload, attempt = 0) {
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

  if (response.status === 429 && attempt < 2) {
    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
    return callGroq(payload, attempt + 1)
  }

  if (!response.ok) {
    const error = new Error(`Grok API failed with ${response.status}`)
    error.statusCode = response.status
    error.details = await response.text().catch(() => '')
    throw error
  }

  return response
}

export async function grokChat(payload) {
  const response = await callGroq(payload)
  const data = await response.json()
  return data?.choices?.[0]?.message?.content || ''
}

export async function* grokStream(payload) {
  const response = await callGroq({ ...payload, stream: true })
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try {
        const chunk = JSON.parse(data)?.choices?.[0]?.delta?.content
        if (chunk) yield chunk
      } catch {}
    }
  }
}

export function startSSE(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
}

export function sendSSE(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}
