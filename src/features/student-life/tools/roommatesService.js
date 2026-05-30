import { apiRequest } from '../../../shared/api/session'

const BASE = import.meta.env.VITE_API_URL || ''

const req = (path, method = 'GET', body = null) =>
  apiRequest(`${BASE}${path}`, { method, body })

export const roommatesApi = {
  getAll: ({ userId } = {}) => {
    const p = new URLSearchParams()
    if (userId) p.set('userId', userId)
    return req(`/api/roommates?${p}`)
  },
  post:   (data)        => req('/api/roommates', 'POST', data),
  delete: (id, userId)  => req(`/api/roommates/${id}`, 'DELETE', { userId }),
}
