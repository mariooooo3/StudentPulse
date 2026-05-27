import { createHmac } from 'node:crypto'
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'
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

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })
  res.end(JSON.stringify(data))
}

// ─── Password hashing ────────────────────────────────────────────────────────
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const hashBuffer = Buffer.from(hash, 'hex')
  const derived = scryptSync(password, salt, 64)
  return timingSafeEqual(hashBuffer, derived)
}

// ─── Username validation ─────────────────────────────────────────────────────
function validateUsername(u) {
  if (!u || u.length < 3)       return 'Minim 3 caractere'
  if (u.length > 30)             return 'Maxim 30 de caractere'
  if (!/^[a-z]/.test(u))        return 'Trebuie să înceapă cu o literă mică (a-z)'
  if (!/^[a-z0-9_]+$/.test(u))  return 'Doar litere mici, cifre și _ (ex: prenume_nume)'
  if (/__/.test(u))              return 'Fără _ consecutivi'
  if (/_$/.test(u))              return 'Nu poate termina cu _'
  return null
}

// ─── TOTP (kept for professor demo) ──────────────────────────────────────────
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
function base32Decode(str) {
  str = str.toUpperCase().replace(/[^A-Z2-7]/g, '')
  const bytes = []
  let bits = 0, value = 0
  for (const ch of str) {
    value = (value << 5) | B32.indexOf(ch)
    bits += 5
    if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 0xff); bits -= 8 }
  }
  return Buffer.from(bytes)
}

function hotp(secretB32, counter) {
  const key = base32Decode(secretB32)
  const buf = Buffer.alloc(8)
  let c = BigInt(counter)
  for (let i = 7; i >= 0; i--) { buf[i] = Number(c & 0xffn); c >>= 8n }
  const hmac = createHmac('sha1', key).update(buf).digest()
  const offset = hmac[19] & 0xf
  const code = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) |
               (hmac[offset + 2] << 8) | hmac[offset + 3]
  return String(code % 1_000_000).padStart(6, '0')
}

function verifyTotp(secret, token) {
  const counter = Math.floor(Date.now() / 1000 / 30)
  for (let w = -1; w <= 1; w++) {
    if (hotp(secret, counter + w) === token) return true
  }
  return false
}

const TOTP_SECRET = process.env.TOTP_SECRET || 'NZFG63DBMJQXIYLC'

// ─── Handler ─────────────────────────────────────────────────────────────────
export function createAuthHandler() {
  return async function handleAuth(req, res) {
    const url = req.url || ''
    const method = req.method

    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      })
      res.end(); return
    }

    // ── POST /api/auth/register ───────────────────────────────────────────────
    if (method === 'POST' && url === '/api/auth/register') {
      let body
      try { body = JSON.parse(await readBody(req)) } catch {
        return json(res, 400, { error: 'JSON invalid' })
      }

      const { username, email, password, universityId, facultyCode } = body

      const usernameError = validateUsername(username)
      if (usernameError)           return json(res, 400, { error: usernameError })
      if (!email?.trim())          return json(res, 400, { error: 'Email obligatoriu' })
      if (!password)               return json(res, 400, { error: 'Parola obligatorie' })
      if (password.length < 6)     return json(res, 400, { error: 'Parola trebuie să aibă minim 6 caractere' })

      const normalizedEmail    = email.trim().toLowerCase()
      const normalizedUsername = username.trim().toLowerCase()

      const emailLocal = normalizedEmail.split('@')[0]
      if (!emailLocal.includes('.') || emailLocal.startsWith('.') || emailLocal.endsWith('.'))
        return json(res, 400, { error: 'Email-ul trebuie să fie în format prenume.nume@domeniu' })

      const { rows: emailRows } = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
      if (emailRows[0]) return json(res, 409, { error: 'Există deja un cont cu acest email' })

      const { rows: usernameRows } = await query('SELECT id FROM users WHERE username = $1', [normalizedUsername])
      if (usernameRows[0]) return json(res, 409, { error: 'Username-ul este deja folosit, alege altul' })

      const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      await query(
        `INSERT INTO users (id, username, email, password_hash, university_id, faculty_code, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'student', $7)`,
        [id, normalizedUsername, normalizedEmail, hashPassword(password),
         universityId || null, facultyCode || null, nowIso()]
      )

      return json(res, 201, {
        user: { id, username: normalizedUsername, email: normalizedEmail, universityId, facultyCode },
      })
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────
    if (method === 'POST' && url === '/api/auth/login') {
      let body
      try { body = JSON.parse(await readBody(req)) } catch {
        return json(res, 400, { error: 'JSON invalid' })
      }

      const { identifier, password } = body
      if (!identifier?.trim()) return json(res, 400, { error: 'Email sau username obligatoriu' })
      if (!password)           return json(res, 400, { error: 'Parola obligatorie' })

      const val = identifier.trim().toLowerCase()
      const { rows } = await query('SELECT * FROM users WHERE email = $1 OR username = $1', [val])
      const user = rows[0]

      if (!user)                              return json(res, 401, { error: 'Cont inexistent' })
      if (!verifyPassword(password, user.password_hash))
        return json(res, 401, { error: 'Parolă incorectă' })

      return json(res, 200, {
        user: {
          id:           user.id,
          username:     user.username,
          email:        user.email,
          universityId: user.university_id,
          facultyCode:  user.faculty_code,
        },
      })
    }

    // ── POST /api/auth/verify-totp (profesor demo) ────────────────────────────
    if (method === 'POST' && url === '/api/auth/verify-totp') {
      let body = ''
      for await (const chunk of req) body += chunk
      let code
      try { ({ code } = JSON.parse(body)) } catch {
        return json(res, 400, { valid: false, error: 'Request invalid' })
      }
      if (!code || !/^\d{6}$/.test(code)) {
        return json(res, 400, { valid: false, error: 'Codul trebuie să fie de 6 cifre' })
      }
      return json(res, 200, { valid: verifyTotp(TOTP_SECRET, code) })
    }

    return json(res, 404, { error: 'Not found' })
  }
}
