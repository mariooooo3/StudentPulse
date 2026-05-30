import { apiRequest } from '../../../shared/api/session'

const BASE = import.meta.env.VITE_API_URL || ''

const req = (path, method = 'GET', body = null) =>
  apiRequest(`${BASE}${path}`, { method, body })

export const booksApi = {
  getAll: ({ userId } = {}) => {
    const p = new URLSearchParams()
    if (userId) p.set('userId', userId)
    return req(`/api/books?${p}`)
  },
  post:   (data)        => req('/api/books', 'POST', data),
  delete: (id, userId)  => req(`/api/books/${id}`, 'DELETE', { userId }),
}
