export const DEMO_PROFESSOR = {
  id: 'prof-andrei-munteanu',
  name: 'Conf. dr. Andrei Munteanu',
  email: 'andrei.munteanu@uaic.ro',
  password: '0000',
  universityId: 'uaic',
  universityName: 'UAIC Iasi',
  facultyCode: 'FMIM',
  facultyName: 'Facultatea de Matematica-Informatica',
  title: 'Conferentiar universitar',
  domain: 'Algoritmica, modele discrete si sisteme inteligente',
  room: 'Corp C, birou 312',
  phone: '+40 232 201 142',
  consultationHours: [
    { id: 'oh-1', day: 'Marti', time: '14:00-16:00', place: 'Corp C, birou 312', mode: 'Fizic', capacity: 6 },
    { id: 'oh-2', day: 'Joi', time: '10:00-11:30', place: 'Teams', mode: 'Online', capacity: 8 },
  ],
  courses: [
    { id: 'course-sd', name: 'Structuri de Date', groups: ['A1', 'A2'], room: 'Amf. A2', next: 'Marti 10:00' },
    { id: 'course-algo', name: 'Algoritmica', groups: ['B1'], room: 'C210', next: 'Joi 12:00' },
    { id: 'course-ai', name: 'Modele inteligente', groups: ['M1'], room: 'Lab 3', next: 'Vineri 14:00' },
  ],
  research: ['Optimizare combinatoriala', 'Grafuri', 'AI aplicat in educatie', 'Sisteme de recomandare'],
  assistant: 'Lect. dr. Ioana Pavel',
  avatar: 'AM',
}

const PROFESSOR_PROFILE_KEY = 'sc_professor_profile'
const THESIS_KEY = 'sc_thesis_requests'
const RECOVERY_KEY = 'sc_recovery_requests'
const MESSAGE_KEY = 'sc_portal_messages'
const NOTIF_KEY = 'sc_local_notifications'

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

export function listThesisRequests() {
  return readJson(THESIS_KEY, [])
}

export function getProfessorProfile() {
  return { ...DEMO_PROFESSOR, ...readJson(PROFESSOR_PROFILE_KEY, {}) }
}

export function saveProfessorProfile(patch) {
  const current = getProfessorProfile()
  const updated = { ...current, ...patch }
  writeJson(PROFESSOR_PROFILE_KEY, updated)
  emit('sc:professor-profile', updated)
  return updated
}

export function getThesisRequestsForUser(userId) {
  return listThesisRequests().filter(request => request.studentId === userId)
}

export function createThesisRequest({ professor, student, form, attachedFile }) {
  const requests = listThesisRequests()
  const request = {
    id: `thesis-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: 'pending',
    professorId: professor.id || professor.name,
    professorName: professor.name,
    professorDomain: professor.domain,
    studentId: student.userId,
    studentName: student.name,
    studentEmail: student.email,
    facultyName: student.facultyName,
    idea: form.idea,
    motivation: form.motivation,
    file: attachedFile ? {
      name: attachedFile.name,
      size: attachedFile.size,
      type: attachedFile.type,
    } : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  writeJson(THESIS_KEY, [request, ...requests])
  const thread = upsertPortalThread({
    student,
    professor: { id: DEMO_PROFESSOR.id, name: professor.name || DEMO_PROFESSOR.name },
    subject: `Licenta: ${form.idea}`,
  })
  sendPortalMessage(thread.id, {
    senderId: student.userId,
    senderName: student.name,
    senderRole: 'student',
    text: `Am trimis o cerere de licenta: ${form.idea}`,
  })
  emit('sc:thesis-requests', request)
  return request
}

export function updateThesisRequestStatus(requestId, status, note = '') {
  const requests = listThesisRequests()
  const updated = requests.map(request => request.id === requestId
    ? { ...request, status, professorNote: note, updatedAt: new Date().toISOString() }
    : request
  )
  writeJson(THESIS_KEY, updated)
  const request = updated.find(item => item.id === requestId)
  if (request?.studentId) {
    addLocalNotification(request.studentId, {
      title: status === 'accepted' ? 'Cerere licenta acceptata' : 'Cerere licenta respinsa',
      body: status === 'accepted'
        ? `${request.professorName} a acceptat cererea ta.`
        : `${request.professorName} a respins cererea ta.${note ? ` Motiv: ${note}` : ''}`,
      type: status === 'accepted' ? 'success' : 'warning',
      action: `thesis.request.${status}`,
      meta: { requestId, professorName: request.professorName },
    })
  }
  emit('sc:thesis-requests', request)
  return request
}

export function listRecoveryRequests() {
  return readJson(RECOVERY_KEY, [])
}

export function getRecoveryRequestsForUser(userId) {
  return listRecoveryRequests().filter(request => request.studentId === userId)
}

export function createRecoveryRequest({ slot, subject, reason, student }) {
  const requests = listRecoveryRequests()
  const request = {
    id: `recovery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: 'pending',
    subject,
    reason,
    studentId: student.userId,
    studentName: student.name,
    studentEmail: student.email,
    facultyName: student.facultyName,
    group: slot.group,
    room: slot.room,
    professor: slot.professor,
    day: slot.day,
    start: slot.start,
    end: slot.end,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  writeJson(RECOVERY_KEY, [request, ...requests])
  const thread = upsertPortalThread({
    student,
    subject: `Recuperare: ${subject}`,
  })
  sendPortalMessage(thread.id, {
    senderId: student.userId,
    senderName: student.name,
    senderRole: 'student',
    text: `Am trimis o cerere de recuperare pentru ${subject}. Motiv: ${reason}`,
  })
  emit('sc:recovery-requests', request)
  return request
}

export function updateRecoveryRequestStatus(requestId, status, note = '') {
  const requests = listRecoveryRequests()
  const updated = requests.map(request => request.id === requestId
    ? { ...request, status, professorNote: note, updatedAt: new Date().toISOString() }
    : request
  )
  writeJson(RECOVERY_KEY, updated)
  const request = updated.find(item => item.id === requestId)
  if (request?.studentId) {
    addLocalNotification(request.studentId, {
      title: status === 'accepted' ? 'Recuperare aprobata' : 'Recuperare respinsa',
      body: status === 'accepted'
        ? `Cererea pentru ${request.subject} a fost aprobata.`
        : `Cererea pentru ${request.subject} a fost respinsa.${note ? ` Motiv: ${note}` : ''}`,
      type: status === 'accepted' ? 'success' : 'warning',
      action: `recovery.request.${status}`,
      meta: { requestId, subject: request.subject },
    })
  }
  emit('sc:recovery-requests', request)
  return request
}

export function listPortalThreadsForUser(userId) {
  if (!userId) return []
  return readJson(MESSAGE_KEY, []).filter(thread => thread.studentId === userId || thread.professorId === userId)
}

export function listPortalThreads() {
  return readJson(MESSAGE_KEY, [])
}

export function upsertPortalThread({ student, professor = DEMO_PROFESSOR, subject = 'Discutie academica' }) {
  const threads = readJson(MESSAGE_KEY, [])
  const existing = threads.find(thread => thread.studentId === student.userId && thread.professorId === professor.id)
  if (existing) return existing
  const thread = {
    id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    studentId: student.userId,
    studentName: student.name,
    studentEmail: student.email,
    professorId: professor.id,
    professorName: professor.name,
    subject,
    updatedAt: new Date().toISOString(),
    messages: [],
  }
  writeJson(MESSAGE_KEY, [thread, ...threads])
  emit('sc:portal-messages', thread)
  return thread
}

export function sendPortalMessage(threadId, message) {
  const threads = readJson(MESSAGE_KEY, [])
  const updated = threads.map(thread => {
    if (thread.id !== threadId) return thread
    return {
      ...thread,
      updatedAt: new Date().toISOString(),
      messages: [
        ...thread.messages,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
          ...message,
        },
      ],
    }
  }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  writeJson(MESSAGE_KEY, updated)
  const thread = updated.find(item => item.id === threadId)
  if (thread && message.senderRole === 'professor') {
    addLocalNotification(thread.studentId, {
      title: `Mesaj de la ${thread.professorName}`,
      body: message.text,
      type: 'info',
      action: 'portal.message.received',
      meta: { threadId },
    })
  }
  emit('sc:portal-messages', thread)
  return thread
}

export function addLocalNotification(userId, notification) {
  if (!userId) return null
  const all = readJson(NOTIF_KEY, {})
  const saved = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    read: false,
    timestamp: new Date().toISOString(),
    ...notification,
  }
  all[userId] = [saved, ...(all[userId] || [])]
  writeJson(NOTIF_KEY, all)
  emit('sc:notifications', { userId, notification: saved })
  return saved
}

export function getLocalNotifications(userId) {
  if (!userId) return []
  return readJson(NOTIF_KEY, {})[userId] || []
}

export function markLocalNotificationRead(userId, notifId) {
  const all = readJson(NOTIF_KEY, {})
  all[userId] = (all[userId] || []).map(notification =>
    notification.id === notifId ? { ...notification, read: true } : notification
  )
  writeJson(NOTIF_KEY, all)
}

export function markAllLocalNotificationsRead(userId) {
  const all = readJson(NOTIF_KEY, {})
  all[userId] = (all[userId] || []).map(notification => ({ ...notification, read: true }))
  writeJson(NOTIF_KEY, all)
}
