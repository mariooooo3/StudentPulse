export const DEMO_PROFESSOR = {
  id: 'prof-mihai-ciobanu',
  name: 'Prof. dr. ing. Mihai Ciobanu',
  email: 'mihai.ciobanu@academic.tuiasi.ro',
  password: null,
  universityId: 'tuiasi',
  universityName: 'Gheorghe Asachi',
  facultyCode: 'AC',
  facultyName: 'Facultatea de Automatică și Calculatoare',
  title: 'Profesor universitar',
  domain: 'Arhitectura Calculatoarelor și Sisteme Distribuite',
  room: 'Corp C, birou C2-5',
  phone: '+40 232 701 305',
  consultationHours: [
    { id: 'oh-1', day: 'Marți', time: '14:00-16:00', place: 'Corp C, birou C2-5', mode: 'Fizic', capacity: 6 },
    { id: 'oh-2', day: 'Joi', time: '10:00-12:00', place: 'Teams', mode: 'Online', capacity: 10 },
  ],
  courses: [
    { id: 'course-ac', name: 'Arhitectura Calculatoarelor', groups: ['CTI-A1', 'CTI-A2'], room: 'Amf. AC0-1', next: 'Marți 10:00' },
    { id: 'course-sd', name: 'Sisteme Distribuite', groups: ['CTI-B1'], room: 'Lab C2-1', next: 'Joi 14:00' },
    { id: 'course-vlsi', name: 'Circuite VLSI', groups: ['CTI-M1'], room: 'Lab C3-1', next: 'Vineri 12:00' },
  ],
  research: ['Arhitecturi de calcul avansate', 'Sisteme distribuite', 'Edge Computing', 'VLSI și circuite reconfigurabile'],
  assistant: 'Ș.l. dr. ing. Alexandru-Tudor Popovici',
  avatar: 'MC',
}

const API_BASE = '/api/portal'
const LOCAL_NOTIFICATIONS_KEY = 'sc_local_notifications'

function emit(name, detail) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(name, { detail }))
}

function readLocalNotifications() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_NOTIFICATIONS_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeLocalNotifications(data) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(data))
}

function localNotificationId() {
  return `local-notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function getLocalNotifications(userId) {
  if (!userId) return []
  const data = readLocalNotifications()
  return Array.isArray(data[userId]) ? data[userId] : []
}

export function addLocalNotification(userId, notification) {
  if (!userId || !notification) return null
  const data = readLocalNotifications()
  const entry = {
    id: notification.id || localNotificationId(),
    title: notification.title,
    body: notification.body || notification.text || '',
    type: notification.type || 'info',
    action: notification.action,
    meta: notification.meta || null,
    read: notification.read === true,
    timestamp: notification.timestamp || new Date().toISOString(),
  }
  data[userId] = [entry, ...getLocalNotifications(userId)].slice(0, 100)
  writeLocalNotifications(data)
  emit('sc:notifications', { userId })
  return entry
}

export function markLocalNotificationRead(userId, notificationId) {
  if (!userId || !notificationId) return false
  const data = readLocalNotifications()
  data[userId] = getLocalNotifications(userId).map(notification =>
    notification.id === notificationId ? { ...notification, read: true } : notification
  )
  writeLocalNotifications(data)
  emit('sc:notifications', { userId })
  return true
}

export function markAllLocalNotificationsRead(userId) {
  if (!userId) return
  const data = readLocalNotifications()
  data[userId] = getLocalNotifications(userId).map(notification => ({ ...notification, read: true }))
  writeLocalNotifications(data)
  emit('sc:notifications', { userId })
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) throw new Error(`Portal API error: ${res.status}`)
  return res.json()
}

export async function getProfessorProfile() {
  const { profile } = await api('/professor-profile')
  return profile || DEMO_PROFESSOR
}

export async function saveProfessorProfile(patch) {
  const { profile } = await api('/professor-profile', {
    method: 'POST',
    body: JSON.stringify({ patch }),
  })
  emit('sc:professor-profile', profile)
  return profile
}

export async function listThesisRequests() {
  const { requests } = await api('/thesis-requests')
  return requests || []
}

export async function getThesisRequestsForUser(userId) {
  if (!userId) return []
  const { requests } = await api(`/thesis-requests?userId=${encodeURIComponent(userId)}`)
  return requests || []
}

export async function createThesisRequest(payload) {
  const { request } = await api('/thesis-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  emit('sc:thesis-requests', request)
  emit('sc:portal-messages', request)
  return request
}

export async function updateThesisRequestStatus(requestId, status, note = '') {
  const { request } = await api(`/thesis-requests/${encodeURIComponent(requestId)}/status`, {
    method: 'POST',
    body: JSON.stringify({ status, note }),
  })
  emit('sc:thesis-requests', request)
  emit('sc:notifications', { userId: request?.studentId })
  return request
}

export async function listRecoveryRequests() {
  const { requests } = await api('/recovery-requests')
  return requests || []
}

export async function getRecoveryRequestsForUser(userId) {
  if (!userId) return []
  const { requests } = await api(`/recovery-requests?userId=${encodeURIComponent(userId)}`)
  return requests || []
}

export async function createRecoveryRequest(payload) {
  const { request } = await api('/recovery-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  emit('sc:recovery-requests', request)
  emit('sc:portal-messages', request)
  return request
}

export async function updateRecoveryRequestStatus(requestId, status, note = '') {
  const { request } = await api(`/recovery-requests/${encodeURIComponent(requestId)}/status`, {
    method: 'POST',
    body: JSON.stringify({ status, note }),
  })
  emit('sc:recovery-requests', request)
  emit('sc:notifications', { userId: request?.studentId })
  return request
}

export async function listPortalThreadsForUser(userId) {
  if (!userId) return []
  const { threads } = await api(`/threads?userId=${encodeURIComponent(userId)}`)
  return threads || []
}

export async function listPortalThreads() {
  const { threads } = await api('/threads')
  return threads || []
}

export async function upsertPortalThread(payload) {
  const { thread } = await api('/threads/upsert', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  emit('sc:portal-messages', thread)
  return thread
}

export async function sendPortalMessage(threadId, message) {
  const { thread } = await api(`/threads/${encodeURIComponent(threadId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
  emit('sc:portal-messages', thread)
  if (message.senderRole === 'professor') emit('sc:notifications', { userId: thread?.studentId })
  return thread
}
