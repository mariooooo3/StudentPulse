import { db } from '../db/database.js'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayDate() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function incrementStreak(userId, type) {
  const today = todayDate()
  const yesterday = yesterdayDate()
  const row = db.prepare('SELECT count, last_date FROM streaks WHERE user_id = ? AND type = ?').get(userId, type)

  if (!row) {
    db.prepare('INSERT INTO streaks (user_id, type, count, last_date) VALUES (?, ?, 1, ?)').run(userId, type, today)
    return { count: 1, lastDate: today, alreadyDoneToday: false }
  }

  if (row.last_date === today) {
    return { count: row.count, lastDate: today, alreadyDoneToday: true }
  }

  const newCount = row.last_date === yesterday ? row.count + 1 : 1
  db.prepare('UPDATE streaks SET count = ?, last_date = ? WHERE user_id = ? AND type = ?').run(newCount, today, userId, type)
  return { count: newCount, lastDate: today, alreadyDoneToday: false }
}

function getStreaks(userId) {
  const rows = db.prepare('SELECT type, count, last_date FROM streaks WHERE user_id = ?').all(userId)
  const result = { focus: { count: 0, lastDate: null }, pulse: { count: 0, lastDate: null } }
  for (const row of rows) {
    if (row.type === 'focus' || row.type === 'pulse') {
      result[row.type] = { count: row.count, lastDate: row.last_date }
    }
  }
  return result
}

export function createStreaksHandler() {
  return async function handleStreaks(req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')

    const getMatch = req.url?.match(/^\/api\/streaks\/([^/?]+)$/)
    if (req.method === 'GET' && getMatch) {
      const userId = decodeURIComponent(getMatch[1])
      res.writeHead(200)
      res.end(JSON.stringify(getStreaks(userId)))
      return
    }

    if (req.method === 'POST' && req.url === '/api/streaks/increment') {
      let body = ''
      for await (const chunk of req) body += chunk
      let userId, type
      try { ({ userId, type } = JSON.parse(body)) } catch {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
        return
      }
      if (!userId || !['focus', 'pulse'].includes(type)) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'userId and type (focus|pulse) required' }))
        return
      }
      res.writeHead(200)
      res.end(JSON.stringify(incrementStreak(userId, type)))
      return
    }

    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Not found' }))
  }
}
