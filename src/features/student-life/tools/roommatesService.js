const BASE = import.meta.env.VITE_API_URL || ''

async function req(path, method = 'GET', body = null) {
  const opts = { method, headers: {} }
  if (body) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Eroare server')
  return data
}

export const roommatesApi = {
  getAll: ({ userId } = {}) => {
    const p = new URLSearchParams()
    if (userId) p.set('userId', userId)
    return req(`/api/roommates?${p}`)
  },
  post:   (data)        => req('/api/roommates', 'POST', data),
  delete: (id, userId)  => req(`/api/roommates/${id}`, 'DELETE', { userId }),
}
