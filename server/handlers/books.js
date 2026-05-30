import { randomUUID } from 'node:crypto'
import { query, nowIso } from '../db/database.js'
import { sendJson, handlePreflight, readBody } from '../lib/http.js'
import { requireAuth } from '../lib/sessions.js'

const LISTING_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function createBooksHandler() {
  return async function handleBooks(req, res) {
    const url = req.url || ''
    const method = req.method

    if (method === 'OPTIONS') return handlePreflight(req, res, 'GET,POST,DELETE,OPTIONS')

    const session = requireAuth(req, res)
    if (!session) return
    const userId = session.userId

    // GET /api/books
    if (method === 'GET' && url.startsWith('/api/books')) {
      const now = new Date().toISOString()
      const { rows: books } = await query(
        `SELECT * FROM book_listings WHERE expires_at > $1 ORDER BY created_at DESC`,
        [now]
      )
      return sendJson(req, res, 200, {
        books: books.map(b => ({ ...b, isOwn: b.user_id === userId })),
      })
    }

    // POST /api/books
    if (method === 'POST' && url === '/api/books') {
      let parsed
      try { parsed = JSON.parse(await readBody(req)) } catch {
        return sendJson(req, res, 400, { error: 'JSON invalid' })
      }

      const { userName, title, author, subject, yearNeeded,
              condition, price, type, contact, faculty } = parsed

      if (!userName)             return sendJson(req, res, 400, { error: 'userName necesar' })
      if (!title?.trim())        return sendJson(req, res, 400, { error: 'Titlul este necesar' })
      if (!subject?.trim())      return sendJson(req, res, 400, { error: 'Materia este necesară' })
      if (!contact?.trim())      return sendJson(req, res, 400, { error: 'Contactul este necesar' })
      if (!['vând', 'donez'].includes(type)) return sendJson(req, res, 400, { error: 'Tip invalid' })

      const id = `book-${randomUUID()}`
      const now = nowIso()
      const expiresAt = new Date(Date.now() + LISTING_TTL_MS).toISOString()

      await query(`
        INSERT INTO book_listings
          (id, user_id, user_name, title, author, subject, year_needed, condition,
           price, type, contact, faculty, created_at, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        id, userId, userName, title.trim(), author?.trim() || null, subject.trim(),
        yearNeeded ? Number(yearNeeded) : null, condition?.trim() || null,
        Number(price) || 0, type, contact.trim(), faculty?.trim() || null, now, expiresAt,
      ])

      const { rows } = await query('SELECT * FROM book_listings WHERE id = $1', [id])
      return sendJson(req, res, 201, { book: { ...rows[0], isOwn: true } })
    }

    // DELETE /api/books/:id
    const deleteMatch = url.match(/^\/api\/books\/([^/]+)$/)
    if (method === 'DELETE' && deleteMatch) {
      const id = deleteMatch[1]

      const { rows } = await query('SELECT * FROM book_listings WHERE id = $1', [id])
      if (!rows[0]) return sendJson(req, res, 404, { error: 'Anunț inexistent' })
      if (rows[0].user_id !== userId) return sendJson(req, res, 403, { error: 'Nu poți șterge anunțul altcuiva' })

      await query('DELETE FROM book_listings WHERE id = $1', [id])
      return sendJson(req, res, 200, { ok: true })
    }

    return sendJson(req, res, 404, { error: 'Not found' })
  }
}
