import { createHmac } from 'node:crypto'

// Base32 decode (RFC 4648) — no external deps needed
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

// ±1 fereastră (30s înainte/după) pentru toleranță la ceas
function verifyTotp(secret, token) {
  const counter = Math.floor(Date.now() / 1000 / 30)
  for (let w = -1; w <= 1; w++) {
    if (hotp(secret, counter + w) === token) return true
  }
  return false
}

// Secretul shared — setează TOTP_SECRET în env pentru producție
// Pentru demo, adaugă manual secretul în Google Authenticator:
//   Nume: OmeGo  |  Secret: NZFG63DBMJQXIYLC  |  Tip: TOTP  |  Cifre: 6  |  Interval: 30s
const TOTP_SECRET = process.env.TOTP_SECRET || 'NZFG63DBMJQXIYLC'

export function createAuthHandler() {
  return async function handleAuth(req, res) {
    if (req.method !== 'POST' || req.url !== '/api/auth/verify-totp') {
      res.writeHead(404); res.end(); return
    }

    let body = ''
    for await (const chunk of req) body += chunk

    let code
    try { ({ code } = JSON.parse(body)) } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ valid: false, error: 'Request invalid' }))
      return
    }

    if (!code || !/^\d{6}$/.test(code)) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ valid: false, error: 'Codul trebuie să fie de 6 cifre' }))
      return
    }

    const valid = verifyTotp(TOTP_SECRET, code)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ valid }))
  }
}
