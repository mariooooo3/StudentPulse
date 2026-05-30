// Shared HTTP helpers: CORS allow-list, security headers, safe body reader.
// In production the SPA and API are served from the same origin, so cross-origin
// requests only happen in development (Vite dev server) or from explicitly
// configured origins via the ALLOWED_ORIGINS env var (comma-separated).

const IS_PROD = process.env.NODE_ENV === 'production'

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5190',
  'http://localhost:3010',
  'http://127.0.0.1:5173',
]

const CONFIGURED = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

function allowList() {
  return IS_PROD ? CONFIGURED : [...CONFIGURED, ...DEV_ORIGINS]
}

// Returns CORS headers only for explicitly allowed origins. Same-origin requests
// (no Origin header) need no CORS headers and are never blocked by the browser.
export function corsHeaders(req) {
  const origin = req?.headers?.origin || ''
  if (!origin) return {}
  if (allowList().includes(origin)) {
    return { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' }
  }
  return {}
}

export function securityHeaders() {
  const h = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }
  if (IS_PROD) h['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
  return h
}

// Standard preflight responder used by all API handlers.
export function handlePreflight(req, res, methods = 'GET,POST,DELETE,OPTIONS') {
  res.writeHead(204, {
    ...corsHeaders(req),
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token, Authorization',
    'Access-Control-Max-Age': '86400',
  })
  res.end()
}

// JSON responder that always applies CORS + security headers.
export function sendJson(req, res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...corsHeaders(req),
    ...securityHeaders(),
  })
  res.end(JSON.stringify(data))
}

// Reads and parses a JSON body with a hard size cap (default 1 MB).
export function readBody(req, maxBytes = 64 * 1024) {
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
