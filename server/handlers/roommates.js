import { randomUUID } from 'node:crypto'
import { query, nowIso } from '../db/database.js'
import { sendJson, handlePreflight, readBody } from '../lib/http.js'
import { requireAuth } from '../lib/sessions.js'

const LISTING_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function createRoommatesHandler() {
  return async function handleRoommates(req, res) {
    const url = req.url || ''
    const method = req.method

    if (method === 'OPTIONS') return handlePreflight(req, res, 'GET,POST,DELETE,OPTIONS')

    const session = requireAuth(req, res)
    if (!session) return
    const userId = session.userId

    // GET /api/roommates
    if (method === 'GET' && url.startsWith('/api/roommates')) {
      const now = new Date().toISOString()
      const { rows: listings } = await query(
        `SELECT * FROM roommate_listings WHERE expires_at > $1 ORDER BY created_at DESC`,
        [now]
      )
      return sendJson(req, res, 200, {
        roommates: listings.map(r => ({ ...r, isOwn: r.user_id === userId })),
      })
    }

    // POST /api/roommates
    if (method === 'POST' && url === '/api/roommates') {
      let parsed
      try { parsed = JSON.parse(await readBody(req)) } catch {
        return sendJson(req, res, 400, { error: 'JSON invalid' })
      }

      const { name, faculty, year, budget, zone,
              smoking, pets, schedule, bio, contact } = parsed

      if (!name?.trim())    return sendJson(req, res, 400, { error: 'name necesar' })
      if (!zone?.trim())    return sendJson(req, res, 400, { error: 'Zona este necesară' })
      if (!contact?.trim()) return sendJson(req, res, 400, { error: 'Contactul este necesar' })

      const id = `room-${randomUUID()}`
      const now = nowIso()
      const expiresAt = new Date(Date.now() + LISTING_TTL_MS).toISOString()

      await query(`
        INSERT INTO roommate_listings
          (id, user_id, name, faculty, year, budget, zone, smoking, pets,
           schedule, bio, contact, created_at, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        id, userId, name.trim(), faculty?.trim() || null,
        year ? Number(year) : null, budget?.trim() || null, zone.trim(),
        Boolean(smoking), Boolean(pets),
        schedule?.trim() || null, bio?.trim() || null, contact.trim(), now, expiresAt,
      ])

      const { rows } = await query('SELECT * FROM roommate_listings WHERE id = $1', [id])
      return sendJson(req, res, 201, { roommate: { ...rows[0], isOwn: true } })
    }

    // DELETE /api/roommates/:id
    const deleteMatch = url.match(/^\/api\/roommates\/([^/]+)$/)
    if (method === 'DELETE' && deleteMatch) {
      const id = deleteMatch[1]

      const { rows } = await query('SELECT * FROM roommate_listings WHERE id = $1', [id])
      if (!rows[0]) return sendJson(req, res, 404, { error: 'Anunț inexistent' })
      if (rows[0].user_id !== userId) return sendJson(req, res, 403, { error: 'Nu poți șterge anunțul altcuiva' })

      await query('DELETE FROM roommate_listings WHERE id = $1', [id])
      return sendJson(req, res, 200, { ok: true })
    }

    return sendJson(req, res, 404, { error: 'Not found' })
  }
}
