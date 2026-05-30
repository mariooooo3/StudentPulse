// Server-side session singleton. Initialised once in index.js with the shared
// Store, then used by every handler to issue / validate / revoke session tokens.
import { createSessionHandler } from '../handlers/session.js'
import { sendJson } from './http.js'

let mgr = null

export function initSessions(store) {
  mgr = createSessionHandler(store)
  return mgr
}

export function sessions() {
  if (!mgr) throw new Error('Sessions not initialised — call initSessions(store) first')
  return mgr
}

// Extract bearer / x-session-token from a request.
export function tokenFromReq(req) {
  const raw = req.headers['x-session-token'] || req.headers['authorization'] || ''
  return String(raw).replace(/^Bearer\s+/i, '').trim()
}

// Returns the decoded session ({ userId, ... }) or null.
export function authFromReq(req) {
  if (!mgr) return null
  return mgr.validateToken(tokenFromReq(req))
}

// Enforces authentication. Returns the session, or null after sending a 401.
export function requireAuth(req, res) {
  const session = authFromReq(req)
  if (!session) {
    sendJson(req, res, 401, { error: 'Sesiune expirată sau lipsă. Autentifică-te din nou.' })
    return null
  }
  return session
}
