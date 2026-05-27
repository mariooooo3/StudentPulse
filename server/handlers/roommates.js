import { db, nowIso } from '../db/database.js'

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

function json(res, status, data) {
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
      const listings = db.prepare(
        `SELECT * FROM roommate_listings WHERE expires_at > ? ORDER BY created_at DESC`
      ).all(now)
      return json(res, 200, {
        roommates: listings.map(r => ({ ...r, isOwn: r.user_id === userId })),
      })
    }

    // POST /api/roommates
    if (method === 'POST' && url === '/api/roommates') {
      let parsed
      try { parsed = JSON.parse(await readBody(req)) } catch {
        return json(res, 400, { error: 'JSON invalid' })
      }

      const { userId, name, faculty, year, budget, zone,
              smoking, pets, schedule, bio, contact } = parsed

      if (!userId || !name?.trim()) return json(res, 400, { error: 'userId și name necesare' })
      if (!zone?.trim())            return json(res, 400, { error: 'Zona este necesară' })
      if (!contact?.trim())         return json(res, 400, { error: 'Contactul este necesar' })

      const id = `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const now = nowIso()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      db.prepare(`
        INSERT INTO roommate_listings
          (id, user_id, name, faculty, year, budget, zone, smoking, pets,
           schedule, bio, contact, created_at, expires_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        id, userId, name.trim(), faculty?.trim() || null,
        year ? Number(year) : null, budget?.trim() || null, zone.trim(),
        smoking ? 1 : 0, pets ? 1 : 0,
        schedule?.trim() || null, bio?.trim() || null, contact.trim(), now, expiresAt,
      )

      const listing = db.prepare('SELECT * FROM roommate_listings WHERE id = ?').get(id)
      return json(res, 201, { roommate: { ...listing, isOwn: true } })
    }

    // DELETE /api/roommates/:id
    const deleteMatch = url.match(/^\/api\/roommates\/([^/]+)$/)
    if (method === 'DELETE' && deleteMatch) {
      const id = deleteMatch[1]
      let body = {}
      try { body = JSON.parse(await readBody(req)) } catch {}

      const listing = db.prepare('SELECT * FROM roommate_listings WHERE id = ?').get(id)
      if (!listing) return json(res, 404, { error: 'Anunț inexistent' })
      if (listing.user_id !== body.userId) return json(res, 403, { error: 'Nu poți șterge anunțul altcuiva' })

      db.prepare('DELETE FROM roommate_listings WHERE id = ?').run(id)
      return json(res, 200, { ok: true })
    }

    return json(res, 404, { error: 'Not found' })
  }
}
