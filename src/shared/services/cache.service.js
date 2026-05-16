// In-memory browser cache with TTL — used for AI responses, profile data, chat history
class CacheService {
  #store = new Map()  // key → { value, expiresAt }

  set(key, value, ttlMs) {
    this.#store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  get(key) {
    const entry = this.#store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.#store.delete(key)
      return null
    }
    return entry.value
  }

  del(key) { this.#store.delete(key) }

  has(key) { return this.get(key) !== null }
}

export const cacheService = new CacheService()

const AI_TTL    = 60 * 60 * 1000   // 1h
const PROF_TTL  = 24 * 60 * 60 * 1000  // 24h
const HIST_TTL  = 5 * 60 * 1000    // 5 min (hot cache before WS load)

export const aiCache = {
  get: (prompt) => cacheService.get(`ai:${prompt}`),
  set: (prompt, response) => cacheService.set(`ai:${prompt}`, response, AI_TTL),
}

export const profileCache = {
  get: (userId) => cacheService.get(`profile:${userId}`),
  set: (userId, profile) => cacheService.set(`profile:${userId}`, profile, PROF_TTL),
  invalidate: (userId) => cacheService.del(`profile:${userId}`),
}

export const historyCache = {
  get: (channel) => cacheService.get(`hist:${channel}`),
  set: (channel, messages) => cacheService.set(`hist:${channel}`, messages, HIST_TTL),
}
