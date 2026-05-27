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
      const books = db.prepare(
        `SELECT * FROM book_listings WHERE expires_at > ? ORDER BY created_at DESC`
      ).all(now)
      return json(res, 200, {
        books: books.map(b => ({ ...b, isOwn: b.user_id === userId })),
      })
    }

    // POST /api/books
    if (method === 'POST' && url === '/api/books') {
      let parsed
      try { parsed = JSON.parse(await readBody(req)) } catch {
        return json(res, 400, { error: 'JSON invalid' })
      }

      const { userId, userName, title, author, subject, yearNeeded,
              condition, price, type, contact, faculty } = parsed

      if (!userId || !userName)  return json(res, 400, { error: 'userId și userName necesare' })
      if (!title?.trim())        return json(res, 400, { error: 'Titlul este necesar' })
      if (!subject?.trim())      return json(res, 400, { error: 'Materia este necesară' })
      if (!contact?.trim())      return json(res, 400, { error: 'Contactul este necesar' })
      if (!['vând', 'donez'].includes(type)) return json(res, 400, { error: 'Tip invalid' })

      const id = `book-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const now = nowIso()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      db.prepare(`
        INSERT INTO book_listings
          (id, user_id, user_name, title, author, subject, year_needed, condition,
           price, type, contact, faculty, created_at, expires_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        id, userId, userName, title.trim(), author?.trim() || null, subject.trim(),
        yearNeeded ? Number(yearNeeded) : null, condition?.trim() || null,
        Number(price) || 0, type, contact.trim(), faculty?.trim() || null, now, expiresAt,
      )

      const book = db.prepare('SELECT * FROM book_listings WHERE id = ?').get(id)
      return json(res, 201, { book: { ...book, isOwn: true } })
    }

    // DELETE /api/books/:id
    const deleteMatch = url.match(/^\/api\/books\/([^/]+)$/)
    if (method === 'DELETE' && deleteMatch) {
      const id = deleteMatch[1]
      let body = {}
      try { body = JSON.parse(await readBody(req)) } catch {}

      const book = db.prepare('SELECT * FROM book_listings WHERE id = ?').get(id)
      if (!book) return json(res, 404, { error: 'Anunț inexistent' })
      if (book.user_id !== body.userId) return json(res, 403, { error: 'Nu poți șterge anunțul altcuiva' })

      db.prepare('DELETE FROM book_listings WHERE id = ?').run(id)
      return json(res, 200, { ok: true })
    }

    return json(res, 404, { error: 'Not found' })
  }
}
