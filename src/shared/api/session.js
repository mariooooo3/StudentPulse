/**
 * Session token helper — single source of truth for attaching the
 * authenticated student's token to API requests.
 *
 * The token is issued by the backend at login/register and stored inside the
 * persisted session object (see auth.service.persistSession). Handlers read it
 * from the `x-session-token` header and derive the acting user identity from it,
 * so every protected call must go through authHeaders().
 */

const SESSION_KEY = 'sc_session'
const SESSION_PERSISTENT_KEY = 'sc_session_persistent'

export function getToken() {
  if (typeof window === 'undefined') return null
  try {
    const raw =
      sessionStorage.getItem(SESSION_KEY) ||
      localStorage.getItem(SESSION_PERSISTENT_KEY)
    if (!raw) return null
    return JSON.parse(raw).token || null
  } catch {
    return null
  }
}

/** Returns headers merged with the auth token (when present). */
export function authHeaders(extra = {}) {
  const token = getToken()
  return token ? { ...extra, 'x-session-token': token } : { ...extra }
}

/**
 * Signals a global "session expired" event. Components/providers can listen for
 * `sc:unauthorized` and force a logout so the user re-authenticates cleanly.
 */
export function notifyUnauthorized() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sc:unauthorized'))
  }
}

/**
 * Shared fetch wrapper: attaches the auth token, parses JSON, throws on non-2xx,
 * and emits `sc:unauthorized` on 401 so the app can log the user out.
 */
export async function apiRequest(url, { method = 'GET', body = null, headers = {} } = {}) {
  const opts = { method, headers: authHeaders(headers) }
  if (body != null) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = typeof body === 'string' ? body : JSON.stringify(body)
  }
  const res = await fetch(url, opts)
  if (res.status === 401) notifyUnauthorized()
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Eroare server')
  return data
}
