import { existsSync, readFileSync } from 'node:fs'
import { KEY_FILES } from './navigation.constants.js'

export function navigationKey() {
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

export async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
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

export async function grokChat(payload) {
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
    error.details = await response.text().catch(() => '')
    throw error
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content || ''
}
