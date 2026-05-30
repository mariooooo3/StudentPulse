import { apiRequest } from '../../../shared/api/session'

const BASE = import.meta.env.VITE_API_URL || ''

const req = (path, method = 'GET', body = null) =>
  apiRequest(`${BASE}${path}`, { method, body })

export const carpoolApi = {
  getRides:      ({ userId, from, to, date } = {}) => {
    const p = new URLSearchParams()
    if (userId) p.set('userId', userId)
    if (from)   p.set('from', from)
    if (to)     p.set('to', to)
    if (date)   p.set('date', date)
    return req(`/api/carpool/rides?${p}`)
  },
  getMyRides:    (userId) => req(`/api/carpool/my-rides?userId=${encodeURIComponent(userId)}`),
  getMyRequests: (userId) => req(`/api/carpool/my-requests?userId=${encodeURIComponent(userId)}`),
  postRide:      (data)   => req('/api/carpool/rides', 'POST', data),
  cancelRide:    (rideId, userId) => req(`/api/carpool/rides/${rideId}`, 'DELETE', { userId }),
  joinRide:      (rideId, data)   => req(`/api/carpool/rides/${rideId}/join`, 'POST', data),
  acceptRequest: (reqId, userId)  => req(`/api/carpool/requests/${reqId}/accept`, 'POST', { userId }),
  rejectRequest: (reqId, userId)  => req(`/api/carpool/requests/${reqId}/reject`, 'POST', { userId }),
}
