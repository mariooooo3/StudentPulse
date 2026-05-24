const BASE = '/api/streaks'

export async function getStreaks(userId) {
  const res = await fetch(`${BASE}/${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error('Failed to fetch streaks')
  return res.json()
}

export async function incrementStreak(userId, type) {
  const res = await fetch(`${BASE}/increment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, type }),
  })
  if (!res.ok) throw new Error('Failed to increment streak')
  return res.json()
}
