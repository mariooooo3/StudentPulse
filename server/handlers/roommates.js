import { query, nowIso } from '../db/database.js'

function readBody(req, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let body = ''
    let size = 0
    req.on('data', chunk => {
      size += Buffer.byteLength(chunk)
      if (size > maxBytes) { req.destroy(); reject(new Error('Body too large')); return }
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function jsonRes(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })
  res.end(JSON.stringify(data))
}

export function createRoommatesHandler() {
  return async function handleRoommates(req, res) {
    const url = req.url || ''
    const method = req.method

    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      })
      res.end(); return
    }

    // GET /api/roommates?userId=
    if (method === 'GET' && url.startsWith('/api/roommates')) {
      const userId = new URL(url, 'http://localhost').searchParams.get('userId') || ''
      const now = new Date().toISOString()
      const { rows: listings } = await query(
        `SELECT * FROM roommate_listings WHERE expires_at > $1 ORDER BY created_at DESC`,
        [now]
      )
      return jsonRes(res, 200, {
        roommates: listings.map(r => ({ ...r, isOwn: r.user_id === userId })),
      })
    }

    // POST /api/roommates
    if (method === 'POST' && url === '/api/roommates') {
      let parsed
      try { parsed = JSON.parse(await readBody(req)) } catch {
        return jsonRes(res, 400, { error: 'JSON invalid' })
      }

      const { userId, name, faculty, year, budget, zone,
              smoking, pets, schedule, bio, contact } = parsed

      if (!userId || !name?.trim()) return jsonRes(res, 400, { error: 'userId și name necesare' })
      if (!zone?.trim())            return jsonRes(res, 400, { error: 'Zona este necesară' })
      if (!contact?.trim())         return jsonRes(res, 400, { error: 'Contactul este necesar' })

      const id = `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const now = nowIso()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

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
      return jsonRes(res, 201, { roommate: { ...rows[0], isOwn: true } })
    }

    // DELETE /api/roommates/:id
    const deleteMatch = url.match(/^\/api\/roommates\/([^/]+)$/)
    if (method === 'DELETE' && deleteMatch) {
      const id = deleteMatch[1]
      let body = {}
      try { body = JSON.parse(await readBody(req)) } catch {}

      const { rows } = await query('SELECT * FROM roommate_listings WHERE id = $1', [id])
      if (!rows[0]) return jsonRes(res, 404, { error: 'Anunț inexistent' })
      if (rows[0].user_id !== body.userId) return jsonRes(res, 403, { error: 'Nu poți șterge anunțul altcuiva' })

      await query('DELETE FROM roommate_listings WHERE id = $1', [id])
      return jsonRes(res, 200, { ok: true })
    }

    return jsonRes(res, 404, { error: 'Not found' })
  }
}
