import { apiRequest } from '../api/session'

const BASE = '/api/streaks'

// userId is kept in the URL for routing only — the server derives the real
// identity from the session token, so it is safe to pass the client's id here.
export async function getStreaks(userId) {
  return apiRequest(`${BASE}/${encodeURIComponent(userId)}`)
}

export async function incrementStreak(userId, type) {
  return apiRequest(`${BASE}/increment`, { method: 'POST', body: { type } })
}
