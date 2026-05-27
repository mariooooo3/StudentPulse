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

export function createBooksHandler() {
  return async function handleBooks(req, res) {
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

    // GET /api/books?userId=
    if (method === 'GET' && url.startsWith('/api/books')) {
      const userId = new URL(url, 'http://localhost').searchParams.get('userId') || ''
      const now = new Date().toISOString()
      const { rows: books } = await query(
        `SELECT * FROM book_listings WHERE expires_at > $1 ORDER BY created_at DESC`,
        [now]
      )
      return jsonRes(res, 200, {
        books: books.map(b => ({ ...b, isOwn: b.user_id === userId })),
      })
    }

    // POST /api/books
    if (method === 'POST' && url === '/api/books') {
      let parsed
      try { parsed = JSON.parse(await readBody(req)) } catch {
        return jsonRes(res, 400, { error: 'JSON invalid' })
      }

      const { userId, userName, title, author, subject, yearNeeded,
              condition, price, type, contact, faculty } = parsed

      if (!userId || !userName)  return jsonRes(res, 400, { error: 'userId și userName necesare' })
      if (!title?.trim())        return jsonRes(res, 400, { error: 'Titlul este necesar' })
      if (!subject?.trim())      return jsonRes(res, 400, { error: 'Materia este necesară' })
      if (!contact?.trim())      return jsonRes(res, 400, { error: 'Contactul este necesar' })
      if (!['vând', 'donez'].includes(type)) return jsonRes(res, 400, { error: 'Tip invalid' })

      const id = `book-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const now = nowIso()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

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
      return jsonRes(res, 201, { book: { ...rows[0], isOwn: true } })
    }

    // DELETE /api/books/:id
    const deleteMatch = url.match(/^\/api\/books\/([^/]+)$/)
    if (method === 'DELETE' && deleteMatch) {
      const id = deleteMatch[1]
      let body = {}
      try { body = JSON.parse(await readBody(req)) } catch {}

      const { rows } = await query('SELECT * FROM book_listings WHERE id = $1', [id])
      if (!rows[0]) return jsonRes(res, 404, { error: 'Anunț inexistent' })
      if (rows[0].user_id !== body.userId) return jsonRes(res, 403, { error: 'Nu poți șterge anunțul altcuiva' })

      await query('DELETE FROM book_listings WHERE id = $1', [id])
      return jsonRes(res, 200, { ok: true })
    }

    return jsonRes(res, 404, { error: 'Not found' })
  }
}
