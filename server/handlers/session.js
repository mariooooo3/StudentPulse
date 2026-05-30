import { randomBytes } from 'node:crypto'

const SESSION_TTL_MS = 60 * 60 * 1000  // 1h

export function createSessionHandler(store) {
  const sessionKey = token => `session:${token}`

  function createSession(userId, data) {
    // Cryptographically-random, unguessable token (256 bits of entropy).
    const token = `tok_${randomBytes(32).toString('hex')}`
    store.set(sessionKey(token), JSON.stringify({ userId, ...data }), SESSION_TTL_MS)
    return token
  }

  function validateToken(token) {
    if (!token) return null
    const raw = store.get(sessionKey(token))
    if (!raw) return null
    try {
      const session = JSON.parse(raw)
      // Sliding window: refresh TTL on each access
      store.pexpire(sessionKey(token), SESSION_TTL_MS)
      return session
    } catch { return null }
  }

  function revokeToken(token) {
    return store.del(sessionKey(token)) > 0
  }

  return { createSession, validateToken, revokeToken }
}
