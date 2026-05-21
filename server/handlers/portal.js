import { DEMO_PROFESSOR } from '../../src/shared/services/professorPortal.service.js'

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(payload))
}

export function createPortalRequestHandler(repository, notifications, pubsub = null) {
  return async function handlePortal(req, res) {
    const url = new URL(req.url, 'http://localhost')
    const path = url.pathname.replace('/api/portal', '') || '/'

    try {
      if (req.method === 'GET' && path === '/professor-profile') {
        return sendJson(res, 200, { profile: repository.getProfessorProfile(DEMO_PROFESSOR) })
      }

      if (req.method === 'POST' && path === '/professor-profile') {
        const { patch = {} } = await readJson(req)
        const current = repository.getProfessorProfile(DEMO_PROFESSOR)
        const updated = repository.saveProfessorProfile(DEMO_PROFESSOR.id, { ...current, ...patch })
        return sendJson(res, 200, { profile: updated })
      }

      if (req.method === 'GET' && path === '/thesis-requests') {
        return sendJson(res, 200, { requests: repository.listThesisRequests(url.searchParams.get('userId')) })
      }

      if (req.method === 'POST' && path === '/thesis-requests') {
        const request = repository.createThesisRequest(await readJson(req))
        const professorId = request.professorId || DEMO_PROFESSOR.id
        const thread = repository.upsertThread({
          student: { userId: request.studentId, name: request.studentName, email: request.studentEmail },
          professor: { id: professorId, name: request.professorName || DEMO_PROFESSOR.name },
          subject: `Licenta: ${request.idea}`,
        })
        repository.addPortalMessage(thread.id, {
          senderId: request.studentId,
          senderName: request.studentName,
          senderRole: 'student',
          text: `Am trimis o cerere de licenta: ${request.idea}`,
        })
        notifications.push(professorId, {
          title: 'Cerere licenta noua',
          body: `${request.studentName} a trimis o cerere: ${request.idea}`,
          type: 'info',
          action: 'professor.thesis.requested',
          meta: { requestId: request.id, threadId: thread.id, studentId: request.studentId },
        })
        pubsub?.publish(`portal:${professorId}`, { kind: 'thesis-request-created', request, thread })
        return sendJson(res, 201, { request })
      }

      const thesisStatus = path.match(/^\/thesis-requests\/([^/]+)\/status$/)
      if (req.method === 'POST' && thesisStatus) {
        const { status, note = '' } = await readJson(req)
        const request = repository.updateThesisStatus(thesisStatus[1], status, note)
        if (request?.studentId) {
          notifications.push(request.studentId, {
            title: status === 'accepted' ? 'Cerere licenta acceptata' : 'Cerere licenta respinsa',
            body: status === 'accepted'
              ? `${request.professorName} a acceptat cererea ta.`
              : `${request.professorName} a respins cererea ta.${note ? ` Motiv: ${note}` : ''}`,
            type: status === 'accepted' ? 'success' : 'warning',
            action: `thesis.request.${status}`,
            meta: { requestId: request.id, professorName: request.professorName },
          })
          pubsub?.publish(`portal:${request.studentId}`, { kind: 'thesis-request-updated', request })
        }
        return sendJson(res, 200, { request })
      }

      if (req.method === 'GET' && path === '/recovery-requests') {
        return sendJson(res, 200, { requests: repository.listRecoveryRequests(url.searchParams.get('userId')) })
      }

      if (req.method === 'POST' && path === '/recovery-requests') {
        const request = repository.createRecoveryRequest(await readJson(req))
        const professorId = request.professorId || DEMO_PROFESSOR.id
        const professorName = request.professorName || DEMO_PROFESSOR.name
        const thread = repository.upsertThread({
          student: { userId: request.studentId, name: request.studentName, email: request.studentEmail },
          professor: { id: professorId, name: professorName },
          subject: `Recuperare: ${request.subject}`,
        })
        repository.addPortalMessage(thread.id, {
          senderId: request.studentId,
          senderName: request.studentName,
          senderRole: 'student',
          text: `Am trimis o cerere de recuperare pentru ${request.subject}. Motiv: ${request.reason}`,
        })
        notifications.push(professorId, {
          title: 'Cerere recuperare noua',
          body: `${request.studentName} cere recuperare la ${request.subject}.`,
          type: 'info',
          action: 'professor.recovery.requested',
          meta: { requestId: request.id, threadId: thread.id, studentId: request.studentId },
        })
        pubsub?.publish(`portal:${professorId}`, { kind: 'recovery-request-created', request, thread })
        return sendJson(res, 201, { request })
      }

      const recoveryStatus = path.match(/^\/recovery-requests\/([^/]+)\/status$/)
      if (req.method === 'POST' && recoveryStatus) {
        const { status, note = '' } = await readJson(req)
        const request = repository.updateRecoveryStatus(recoveryStatus[1], status, note)
        if (request?.studentId) {
          notifications.push(request.studentId, {
            title: status === 'accepted' ? 'Recuperare aprobata' : 'Recuperare respinsa',
            body: status === 'accepted'
              ? `Cererea pentru ${request.subject} a fost aprobata.`
              : `Cererea pentru ${request.subject} a fost respinsa.${note ? ` Motiv: ${note}` : ''}`,
            type: status === 'accepted' ? 'success' : 'warning',
            action: `recovery.request.${status}`,
            meta: { requestId: request.id, subject: request.subject },
          })
          pubsub?.publish(`portal:${request.studentId}`, { kind: 'recovery-request-updated', request })
        }
        return sendJson(res, 200, { request })
      }

      if (req.method === 'GET' && path === '/threads') {
        return sendJson(res, 200, { threads: repository.listThreads(url.searchParams.get('userId')) })
      }

      if (req.method === 'POST' && path === '/threads/upsert') {
        const thread = repository.upsertThread(await readJson(req))
        return sendJson(res, 200, { thread })
      }

      const threadMessage = path.match(/^\/threads\/([^/]+)\/messages$/)
      if (req.method === 'POST' && threadMessage) {
        const { message } = await readJson(req)
        const thread = repository.addPortalMessage(threadMessage[1], message)
        if (thread && message.senderRole === 'professor') {
          notifications.push(thread.studentId, {
            title: `Mesaj de la ${thread.professorName}`,
            body: message.text,
            type: 'info',
            action: 'portal.message.received',
            meta: { threadId: thread.id },
          })
          pubsub?.publish(`portal:${thread.studentId}`, { kind: 'message-created', thread })
        }
        if (thread && message.senderRole === 'student') {
          notifications.push(thread.professorId, {
            title: `Mesaj de la ${thread.studentName}`,
            body: message.text,
            type: 'message',
            action: 'professor.message.received',
            meta: { threadId: thread.id, studentId: thread.studentId },
          })
          pubsub?.publish(`portal:${thread.professorId}`, { kind: 'message-created', thread })
        }
        return sendJson(res, 201, { thread })
      }

      return sendJson(res, 404, { error: 'Not found' })
    } catch (error) {
      console.error('[Portal API]', error)
      return sendJson(res, 500, { error: 'Portal API error' })
    }
  }
}
