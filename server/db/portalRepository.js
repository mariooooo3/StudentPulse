import { randomUUID } from 'node:crypto'
import { query, json, nowIso, parseJson } from './database.js'

const MAX_NOTIFICATIONS = 100

function genId(prefix) {
  return `${prefix}-${randomUUID()}`
}

function mapThesis(row) {
  if (!row) return null
  return {
    id: row.id,
    status: row.status,
    professorId: row.professor_id,
    professorName: row.professor_name,
    professorDomain: row.professor_domain,
    studentId: row.student_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    facultyName: row.faculty_name,
    idea: row.idea,
    motivation: row.motivation,
    file: parseJson(row.file_json, null),
    professorNote: row.professor_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRecovery(row) {
  if (!row) return null
  return {
    id: row.id,
    status: row.status,
    subject: row.subject,
    reason: row.reason,
    studentId: row.student_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    facultyName: row.faculty_name,
    group: row.group_name,
    room: row.room,
    professor: row.professor,
    day: row.day,
    start: row.start_hour,
    end: row.end_hour,
    professorNote: row.professor_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapNotification(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    action: row.action,
    meta: parseJson(row.meta_json, null),
    read: Boolean(row.read),
    timestamp: row.timestamp,
  }
}

async function mapThread(row) {
  const { rows: messages } = await query(
    `SELECT * FROM portal_messages WHERE thread_id = $1 ORDER BY timestamp ASC`,
    [row.id]
  )
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    professorId: row.professor_id,
    professorName: row.professor_name,
    subject: row.subject,
    updatedAt: row.updated_at,
    messages: messages.map(m => ({
      id: m.id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      senderRole: m.sender_role,
      text: m.text,
      timestamp: m.timestamp,
    })),
  }
}

export function createPortalRepository() {
  return {
    async getProfessorProfile(defaultProfile) {
      const { rows } = await query('SELECT data FROM professor_profiles WHERE id = $1', [defaultProfile.id])
      return rows[0] ? { ...defaultProfile, ...parseJson(rows[0].data, {}) } : defaultProfile
    },

    async saveProfessorProfile(idValue, profile) {
      const updatedAt = nowIso()
      await query(`
        INSERT INTO professor_profiles (id, data, updated_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
      `, [idValue, json(profile), updatedAt])
      return profile
    },

    async listThesisRequests(userId = null) {
      const { rows } = userId
        ? await query('SELECT * FROM thesis_requests WHERE student_id = $1 ORDER BY updated_at DESC', [userId])
        : await query('SELECT * FROM thesis_requests ORDER BY updated_at DESC')
      return rows.map(mapThesis)
    },

    async createThesisRequest({ professor, student, form, attachedFile }) {
      const createdAt = nowIso()
      const entry = {
        id: genId('thesis'),
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
        file: attachedFile ? { name: attachedFile.name, size: attachedFile.size, type: attachedFile.type } : null,
        createdAt,
        updatedAt: createdAt,
      }
      await query(`
        INSERT INTO thesis_requests (
          id, status, professor_id, professor_name, professor_domain, student_id,
          student_name, student_email, faculty_name, idea, motivation, file_json, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        entry.id, entry.status, entry.professorId, entry.professorName, entry.professorDomain,
        entry.studentId, entry.studentName, entry.studentEmail, entry.facultyName,
        entry.idea, entry.motivation, json(entry.file), entry.createdAt, entry.updatedAt,
      ])
      return entry
    },

    async updateThesisStatus(requestId, status, note = '') {
      const updatedAt = nowIso()
      await query(
        `UPDATE thesis_requests SET status = $1, professor_note = $2, updated_at = $3 WHERE id = $4`,
        [status, note, updatedAt, requestId]
      )
      const { rows } = await query('SELECT * FROM thesis_requests WHERE id = $1', [requestId])
      return mapThesis(rows[0] ?? null)
    },

    async listRecoveryRequests(userId = null) {
      const { rows } = userId
        ? await query('SELECT * FROM recovery_requests WHERE student_id = $1 ORDER BY updated_at DESC', [userId])
        : await query('SELECT * FROM recovery_requests ORDER BY updated_at DESC')
      return rows.map(mapRecovery)
    },

    async createRecoveryRequest({ slot, subject, reason, student }) {
      const createdAt = nowIso()
      const entry = {
        id: genId('recovery'),
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
        createdAt,
        updatedAt: createdAt,
      }
      await query(`
        INSERT INTO recovery_requests (
          id, status, subject, reason, student_id, student_name, student_email,
          faculty_name, group_name, room, professor, day, start_hour, end_hour, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        entry.id, entry.status, entry.subject, entry.reason, entry.studentId, entry.studentName,
        entry.studentEmail, entry.facultyName, entry.group, entry.room, entry.professor,
        entry.day, entry.start, entry.end, entry.createdAt, entry.updatedAt,
      ])
      return entry
    },

    async updateRecoveryStatus(requestId, status, note = '') {
      const updatedAt = nowIso()
      await query(
        `UPDATE recovery_requests SET status = $1, professor_note = $2, updated_at = $3 WHERE id = $4`,
        [status, note, updatedAt, requestId]
      )
      const { rows } = await query('SELECT * FROM recovery_requests WHERE id = $1', [requestId])
      return mapRecovery(rows[0] ?? null)
    },

    async listThreads(userId = null) {
      const { rows } = userId
        ? await query(
            `SELECT * FROM portal_threads WHERE student_id = $1 OR professor_id = $1 ORDER BY updated_at DESC`,
            [userId]
          )
        : await query('SELECT * FROM portal_threads ORDER BY updated_at DESC')
      return Promise.all(rows.map(mapThread))
    },

    async upsertThread({ student, professor, subject }) {
      if (!student?.userId) throw new Error('Student is required for portal thread')
      const professorId = professor?.id || professor?.name || 'prof-mihai-ciobanu'
      const professorName = professor?.name || 'Prof. dr. ing. Mihai Ciobanu'

      const { rows: existing } = await query(
        `SELECT * FROM portal_threads WHERE student_id = $1 AND professor_id = $2`,
        [student.userId, professorId]
      )
      if (existing[0]) return mapThread(existing[0])

      const updatedAt = nowIso()
      const entry = {
        id: genId('thread'),
        studentId: student.userId,
        studentName: student.name,
        studentEmail: student.email,
        professorId,
        professorName,
        subject,
        updatedAt,
      }
      await query(`
        INSERT INTO portal_threads (
          id, student_id, student_name, student_email, professor_id, professor_name, subject, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [entry.id, entry.studentId, entry.studentName, entry.studentEmail, entry.professorId, entry.professorName, entry.subject, entry.updatedAt])
      return { ...entry, messages: [] }
    },

    async addPortalMessage(threadId, message) {
      const timestamp = nowIso()
      const entry = { id: genId('msg'), timestamp, ...message }
      await query(
        `INSERT INTO portal_messages (id, thread_id, sender_id, sender_name, sender_role, text, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [entry.id, threadId, entry.senderId, entry.senderName, entry.senderRole, entry.text, entry.timestamp]
      )
      await query('UPDATE portal_threads SET updated_at = $1 WHERE id = $2', [timestamp, threadId])
      const { rows } = await query('SELECT * FROM portal_threads WHERE id = $1', [threadId])
      return mapThread(rows[0])
    },

    async addNotification(userId, notification) {
      const entry = {
        id: genId('notif'),
        title: notification.title,
        body: notification.body || notification.text,
        type: notification.type || 'info',
        action: notification.action,
        meta: notification.meta || null,
        read: false,
        timestamp: nowIso(),
      }
      await query(
        `INSERT INTO notifications (id, user_id, title, body, type, action, meta_json, read, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8)`,
        [entry.id, userId, entry.title, entry.body, entry.type, entry.action, json(entry.meta), entry.timestamp]
      )

      // Prune old notifications beyond MAX_NOTIFICATIONS
      const { rows: staleRows } = await query(
        `SELECT id FROM notifications WHERE user_id = $1 ORDER BY timestamp DESC OFFSET $2`,
        [userId, MAX_NOTIFICATIONS]
      )
      if (staleRows.length) {
        const staleIds = staleRows.map(r => r.id)
        await query(`DELETE FROM notifications WHERE id = ANY($1)`, [staleIds])
      }
      return entry
    },

    async listNotifications(userId) {
      const { rows } = await query(
        `SELECT * FROM notifications WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2`,
        [userId, MAX_NOTIFICATIONS]
      )
      return rows.map(mapNotification)
    },

    async markNotificationRead(userId, notifId) {
      const result = await query(
        'UPDATE notifications SET read = TRUE WHERE user_id = $1 AND id = $2',
        [userId, notifId]
      )
      return result.rowCount > 0
    },

    async markAllNotificationsRead(userId) {
      await query('UPDATE notifications SET read = TRUE WHERE user_id = $1', [userId])
    },

    async getDirectMessages(channel) {
      const { rows } = await query(
        `SELECT * FROM direct_messages WHERE channel = $1 ORDER BY timestamp ASC LIMIT 100`,
        [channel]
      )
      return rows.map(row => ({
        id: row.id,
        channel: row.channel,
        senderId: row.sender_id,
        senderName: row.sender_name,
        content: row.content,
        attachment: parseJson(row.attachment_json, null),
        timestamp: row.timestamp,
      }))
    },

    async addDirectMessage(channel, message) {
      const entry = {
        ...message,
        channel,
        timestamp: message.timestamp || nowIso(),
      }
      await query(`
        INSERT INTO direct_messages (id, channel, sender_id, sender_name, content, attachment_json, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          channel = EXCLUDED.channel,
          sender_id = EXCLUDED.sender_id,
          sender_name = EXCLUDED.sender_name,
          content = EXCLUDED.content,
          attachment_json = EXCLUDED.attachment_json,
          timestamp = EXCLUDED.timestamp
      `, [entry.id, channel, entry.senderId, entry.senderName, entry.content, json(entry.attachment), entry.timestamp])
      return entry
    },

    async listPendingSwaps() {
      const { rows } = await query('SELECT * FROM schedule_swaps ORDER BY submitted_at ASC')
      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        course: row.course,
        offerSlot: row.offer_slot,
        needSlot: row.need_slot,
        message: row.message,
        submittedAt: row.submitted_at,
      }))
    },

    async addPendingSwap(request) {
      const entry = { ...request, id: genId('swap'), submittedAt: nowIso() }
      await query(
        `INSERT INTO schedule_swaps (id, user_id, course, offer_slot, need_slot, message, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [entry.id, entry.userId, entry.course, entry.offerSlot, entry.needSlot, entry.message, entry.submittedAt]
      )
      return entry
    },

    async deletePendingSwap(swapId) {
      await query('DELETE FROM schedule_swaps WHERE id = $1', [swapId])
    },
  }
}
