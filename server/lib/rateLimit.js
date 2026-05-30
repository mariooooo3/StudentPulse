// Simple in-memory fixed-window rate limiter keyed by client IP.
// Good enough for a single-instance deployment; swap for Redis if scaled out.

const buckets = new Map() // key -> { count, resetAt }

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (fwd) return String(fwd).split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

// Returns { ok: true } or { ok: false, retryAfter: <seconds> }.
export function checkRate(req, name, maxRequests, windowMs) {
  const key = `${name}:${clientIp(req)}`
  const now = Date.now()
  let entry = buckets.get(key)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs }
    buckets.set(key, entry)
  }
  entry.count++
  if (entry.count > maxRequests) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  return { ok: true }
}

// Periodic cleanup so the map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of buckets) {
    if (now > entry.resetAt) buckets.delete(key)
  }
}, 60_000).unref?.()
