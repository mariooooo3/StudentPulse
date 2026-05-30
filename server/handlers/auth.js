import { createHmac, scrypt as _scrypt, randomBytes, timingSafeEqual, randomUUID } from 'node:crypto'
import { promisify } from 'node:util'
import { query, nowIso } from '../db/database.js'
import { sendJson, handlePreflight, readBody } from '../lib/http.js'
import { sessions } from '../lib/sessions.js'
import { checkRate } from '../lib/rateLimit.js'

const scrypt = promisify(_scrypt)

// ─── Password hashing (async, versioned, backward-compatible) ─────────────────
// New hashes: `scrypt$<N>$<r>$<p>$<saltHex>$<hashHex>`
// Legacy hashes: `<saltHex>:<hashHex>` (assumed N=16384,r=8,p=1) — still verifiable,
// and transparently upgraded on next successful login.
const SCRYPT = { N: 65536, r: 8, p: 1, keylen: 64, maxmem: 256 * 1024 * 1024 }

async function hashPassword(password) {
  const { N, r, p, keylen, maxmem } = SCRYPT
  const salt = randomBytes(16).toString('hex')
  const hash = (await scrypt(password, salt, keylen, { N, r, p, maxmem })).toString('hex')
  return `scrypt$${N}$${r}$${p}$${salt}$${hash}`
}

async function verifyPassword(password, stored) {
  if (!stored) return false
  let N = 16384, r = 8, p = 1, salt, hash
  if (stored.includes('$')) {
    const parts = stored.split('$')
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false
    N = +parts[1]; r = +parts[2]; p = +parts[3]; salt = parts[4]; hash = parts[5]
  } else {
    [salt, hash] = stored.split(':')
  }
  if (!salt || !hash) return false
  const hashBuffer = Buffer.from(hash, 'hex')
  let derived
  try {
    derived = await scrypt(password, salt, hashBuffer.length, { N, r, p, maxmem: SCRYPT.maxmem })
  } catch { return false }
  return hashBuffer.length === derived.length && timingSafeEqual(hashBuffer, derived)
}

function needsRehash(stored) {
  return !stored?.startsWith(`scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$`)
}

function validatePassword(password) {
  if (!password || password.length < 8) return 'Parola trebuie să aibă minim 8 caractere'
  if (password.length > 200)            return 'Parola este prea lungă'
  if (!/[A-Za-z]/.test(password))       return 'Parola trebuie să conțină cel puțin o literă'
  if (!/[0-9]/.test(password))          return 'Parola trebuie să conțină cel puțin o cifră'
  return null
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

const TOTP_SECRET = process.env.TOTP_SECRET
if (!TOTP_SECRET) console.warn('[Auth] TOTP_SECRET not set — professor TOTP endpoint disabled')

function issueToken(user) {
  return sessions().createSession(user.id, {
    username: user.username,
    email: user.email,
    role: user.role || 'student',
  })
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export function createAuthHandler() {
  return async function handleAuth(req, res) {
    const url = req.url || ''
    const method = req.method

    if (method === 'OPTIONS') {
      return handlePreflight(req, res, 'GET,POST,OPTIONS')
    }

    // ── POST /api/auth/register ───────────────────────────────────────────────
    if (method === 'POST' && url === '/api/auth/register') {
      const rl = checkRate(req, 'register', 5, 60_000)
      if (!rl.ok) return sendJson(req, res, 429, { error: 'Prea multe încercări. Reîncearcă mai târziu.' })

      let body
      try { body = JSON.parse(await readBody(req)) } catch {
        return sendJson(req, res, 400, { error: 'JSON invalid' })
      }

      const { username, email, password, universityId, facultyCode } = body

      const usernameError = validateUsername(username)
      if (usernameError)           return sendJson(req, res, 400, { error: usernameError })
      if (!email?.trim())          return sendJson(req, res, 400, { error: 'Email obligatoriu' })
      const passwordError = validatePassword(password)
      if (passwordError)           return sendJson(req, res, 400, { error: passwordError })

      const normalizedEmail    = email.trim().toLowerCase()
      const normalizedUsername = username.trim().toLowerCase()

      const emailLocal = normalizedEmail.split('@')[0]
      if (!emailLocal.includes('.') || emailLocal.startsWith('.') || emailLocal.endsWith('.'))
        return sendJson(req, res, 400, { error: 'Email-ul trebuie să fie în format prenume.nume@domeniu' })

      const { rows: emailRows } = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
      if (emailRows[0]) return sendJson(req, res, 409, { error: 'Există deja un cont cu acest email' })

      const { rows: usernameRows } = await query('SELECT id FROM users WHERE username = $1', [normalizedUsername])
      if (usernameRows[0]) return sendJson(req, res, 409, { error: 'Username-ul este deja folosit, alege altul' })

      const id = `user-${randomUUID()}`
      const passwordHash = await hashPassword(password)

      await query(
        `INSERT INTO users (id, username, email, password_hash, university_id, faculty_code, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'student', $7)`,
        [id, normalizedUsername, normalizedEmail, passwordHash,
         universityId || null, facultyCode || null, nowIso()]
      )

      const token = issueToken({ id, username: normalizedUsername, email: normalizedEmail, role: 'student' })
      return sendJson(req, res, 201, {
        user: { id, username: normalizedUsername, email: normalizedEmail, universityId, facultyCode },
        token,
      })
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────
    if (method === 'POST' && url === '/api/auth/login') {
      const rl = checkRate(req, 'login', 10, 60_000)
      if (!rl.ok) return sendJson(req, res, 429, { error: 'Prea multe încercări de autentificare. Reîncearcă în câteva minute.' })

      let body
      try { body = JSON.parse(await readBody(req)) } catch {
        return sendJson(req, res, 400, { error: 'JSON invalid' })
      }

      const { identifier, password } = body
      if (!identifier?.trim()) return sendJson(req, res, 400, { error: 'Email sau username obligatoriu' })
      if (!password)           return sendJson(req, res, 400, { error: 'Parola obligatorie' })

      const val = identifier.trim().toLowerCase()
      const { rows } = await query('SELECT * FROM users WHERE email = $1 OR username = $1', [val])
      const user = rows[0]

      // Always run a hash comparison to avoid leaking account existence via timing.
      const ok = user ? await verifyPassword(password, user.password_hash) : await verifyPassword(password, 'x:y')
      if (!user || !ok) return sendJson(req, res, 401, { error: 'Email/username sau parolă incorecte' })

      // Transparent hash upgrade to the current scrypt parameters.
      if (needsRehash(user.password_hash)) {
        try {
          const upgraded = await hashPassword(password)
          await query('UPDATE users SET password_hash = $1 WHERE id = $2', [upgraded, user.id])
        } catch { /* non-fatal */ }
      }

      const token = issueToken(user)
      return sendJson(req, res, 200, {
        user: {
          id:           user.id,
          username:     user.username,
          email:        user.email,
          universityId: user.university_id,
          facultyCode:  user.faculty_code,
        },
        token,
      })
    }

    // ── POST /api/auth/logout ─────────────────────────────────────────────────
    if (method === 'POST' && url === '/api/auth/logout') {
      const raw = req.headers['x-session-token'] || req.headers['authorization'] || ''
      const token = String(raw).replace(/^Bearer\s+/i, '').trim()
      if (token) sessions().revokeToken(token)
      return sendJson(req, res, 200, { ok: true })
    }

    // ── POST /api/auth/verify-totp (profesor demo) ────────────────────────────
    if (method === 'POST' && url === '/api/auth/verify-totp') {
      const rl = checkRate(req, 'totp', 10, 60_000)
      if (!rl.ok) return sendJson(req, res, 429, { valid: false, error: 'Prea multe încercări.' })

      let body
      try { body = JSON.parse(await readBody(req)) } catch {
        return sendJson(req, res, 400, { valid: false, error: 'Request invalid' })
      }
      const { code } = body
      if (!code || !/^\d{6}$/.test(code)) {
        return sendJson(req, res, 400, { valid: false, error: 'Codul trebuie să fie de 6 cifre' })
      }
      if (!TOTP_SECRET) return sendJson(req, res, 503, { valid: false, error: 'Professor login not configured' })
      return sendJson(req, res, 200, { valid: verifyTotp(TOTP_SECRET, code) })
    }

    return sendJson(req, res, 404, { error: 'Not found' })
  }
}
