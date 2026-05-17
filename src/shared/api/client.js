/**
 * API Client — backend-ready abstraction layer.
 *
 * Currently returns mock data wrapped in Promise.resolve() so every
 * call site can already be written with await/async.
 * Swap the implementation body for real fetch/supabase calls
 * without touching any component.
 *
 * Future: replace with Supabase client or fetch wrapper.
 */

const CLIENT_ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
const BASE_URL = CLIENT_ENV.VITE_API_URL || 'http://localhost:3000/api'
const SUPABASE_URL = CLIENT_ENV.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = CLIENT_ENV.VITE_SUPABASE_ANON_KEY || ''

const IS_MOCK = !SUPABASE_URL  // true in prototype mode

// Simulates network latency in prototype mode for realistic UX feel
function mockDelay(ms = 400) {
  return new Promise(r => setTimeout(r, ms))
}

export async function apiGet(endpoint, params = {}) {
  if (IS_MOCK) {
    await mockDelay()
    return null // caller uses local mock data
  }
  const url = new URL(`${BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function apiPost(endpoint, body = {}) {
  if (IS_MOCK) {
    await mockDelay(600)
    return { success: true, mock: true }
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const IS_PROTOTYPE = IS_MOCK
