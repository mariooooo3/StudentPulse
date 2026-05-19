import { db, json, nowIso, parseJson } from './database.js'

const MAX_NOTIFICATIONS = 100

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
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
    read: row.read === 1,
    timestamp: row.timestamp,
  }
}

function mapThread(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    professorId: row.professor_id,
    professorName: row.professor_name,
    subject: row.subject,
    updatedAt: row.updated_at,
    messages: db.prepare(`
      SELECT * FROM portal_messages WHERE thread_id = ? ORDER BY timestamp ASC
    `).all(row.id).map(message => ({
      id: message.id,
      senderId: message.sender_id,
      senderName: message.sender_name,
      senderRole: message.sender_role,
      text: message.text,
      timestamp: message.timestamp,
    })),
  }
}

export function createPortalRepository() {
  return {
    getProfessorProfile(defaultProfile) {
      const row = db.prepare('SELECT data FROM professor_profiles WHERE id = ?').get(defaultProfile.id)
      return row ? { ...defaultProfile, ...parseJson(row.data, {}) } : defaultProfile
    },

    saveProfessorProfile(idValue, profile) {
      const updatedAt = nowIso()
      db.prepare(`
        INSERT INTO professor_profiles (id, data, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
      `).run(idValue, json(profile), updatedAt)
      return profile
    },

    listThesisRequests(userId = null) {
      const rows = userId
        ? db.prepare('SELECT * FROM thesis_requests WHERE student_id = ? ORDER BY updated_at DESC').all(userId)
        : db.prepare('SELECT * FROM thesis_requests ORDER BY updated_at DESC').all()
      return rows.map(mapThesis)
    },

    createThesisRequest({ professor, student, form, attachedFile }) {
      const createdAt = nowIso()
      const entry = {
        id: id('thesis'),
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
      db.prepare(`
        INSERT INTO thesis_requests (
          id, status, professor_id, professor_name, professor_domain, student_id,
          student_name, student_email, faculty_name, idea, motivation, file_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        entry.id, entry.status, entry.professorId, entry.professorName, entry.professorDomain,
        entry.studentId, entry.studentName, entry.studentEmail, entry.facultyName,
        entry.idea, entry.motivation, json(entry.file), entry.createdAt, entry.updatedAt,
      )
      return entry
    },

    updateThesisStatus(requestId, status, note = '') {
      const updatedAt = nowIso()
      db.prepare(`
        UPDATE thesis_requests SET status = ?, professor_note = ?, updated_at = ? WHERE id = ?
      `).run(status, note, updatedAt, requestId)
      return mapThesis(db.prepare('SELECT * FROM thesis_requests WHERE id = ?').get(requestId))
    },

    listRecoveryRequests(userId = null) {
      const rows = userId
        ? db.prepare('SELECT * FROM recovery_requests WHERE student_id = ? ORDER BY updated_at DESC').all(userId)
        : db.prepare('SELECT * FROM recovery_requests ORDER BY updated_at DESC').all()
      return rows.map(mapRecovery)
    },

    createRecoveryRequest({ slot, subject, reason, student }) {
      const createdAt = nowIso()
      const entry = {
        id: id('recovery'),
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
      db.prepare(`
        INSERT INTO recovery_requests (
          id, status, subject, reason, student_id, student_name, student_email,
          faculty_name, group_name, room, professor, day, start_hour, end_hour, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        entry.id, entry.status, entry.subject, entry.reason, entry.studentId, entry.studentName,
        entry.studentEmail, entry.facultyName, entry.group, entry.room, entry.professor,
        entry.day, entry.start, entry.end, entry.createdAt, entry.updatedAt,
      )
      return entry
    },

    updateRecoveryStatus(requestId, status, note = '') {
      const updatedAt = nowIso()
      db.prepare(`
        UPDATE recovery_requests SET status = ?, professor_note = ?, updated_at = ? WHERE id = ?
      `).run(status, note, updatedAt, requestId)
      return mapRecovery(db.prepare('SELECT * FROM recovery_requests WHERE id = ?').get(requestId))
    },

    listThreads(userId = null) {
      const rows = userId
        ? db.prepare(`
          SELECT * FROM portal_threads
          WHERE student_id = ? OR professor_id = ?
          ORDER BY updated_at DESC
        `).all(userId, userId)
        : db.prepare('SELECT * FROM portal_threads ORDER BY updated_at DESC').all()
      return rows.map(mapThread)
    },

    upsertThread({ student, professor, subject }) {
      if (!student?.userId) throw new Error('Student is required for portal thread')
      const professorId = professor?.id || professor?.name || 'prof-mihai-ciobanu'
      const professorName = professor?.name || 'Prof. dr. ing. Mihai Ciobanu'
      const existing = db.prepare(`
        SELECT * FROM portal_threads WHERE student_id = ? AND professor_id = ?
      `).get(student.userId, professorId)
      if (existing) return mapThread(existing)

      const updatedAt = nowIso()
      const entry = {
        id: id('thread'),
        studentId: student.userId,
        studentName: student.name,
        studentEmail: student.email,
        professorId,
        professorName,
        subject,
        updatedAt,
      }
      db.prepare(`
        INSERT INTO portal_threads (
          id, student_id, student_name, student_email, professor_id, professor_name, subject, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(entry.id, entry.studentId, entry.studentName, entry.studentEmail, entry.professorId, entry.professorName, entry.subject, entry.updatedAt)
      return { ...entry, messages: [] }
    },

    addPortalMessage(threadId, message) {
      const timestamp = nowIso()
      const entry = {
        id: id('msg'),
        timestamp,
        ...message,
      }
      db.prepare(`
        INSERT INTO portal_messages (id, thread_id, sender_id, sender_name, sender_role, text, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(entry.id, threadId, entry.senderId, entry.senderName, entry.senderRole, entry.text, entry.timestamp)
      db.prepare('UPDATE portal_threads SET updated_at = ? WHERE id = ?').run(timestamp, threadId)
      const thread = db.prepare('SELECT * FROM portal_threads WHERE id = ?').get(threadId)
      return mapThread(thread)
    },

    addNotification(userId, notification) {
      const entry = {
        id: id('notif'),
        title: notification.title,
        body: notification.body || notification.text,
        type: notification.type || 'info',
        action: notification.action,
        meta: notification.meta || null,
        read: false,
        timestamp: nowIso(),
      }
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, body, type, action, meta_json, read, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).run(entry.id, userId, entry.title, entry.body, entry.type, entry.action, json(entry.meta), entry.timestamp)

      const stale = db.prepare(`
        SELECT id FROM notifications WHERE user_id = ? ORDER BY timestamp DESC LIMIT -1 OFFSET ?
      `).all(userId, MAX_NOTIFICATIONS).map(row => row.id)
      if (stale.length) {
        db.prepare(`DELETE FROM notifications WHERE id IN (${stale.map(() => '?').join(',')})`).run(...stale)
      }
      return entry
    },

    listNotifications(userId) {
      return db.prepare(`
        SELECT * FROM notifications WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?
      `).all(userId, MAX_NOTIFICATIONS).map(mapNotification)
    },

    markNotificationRead(userId, notifId) {
      const result = db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND id = ?').run(userId, notifId)
      return result.changes > 0
    },

    markAllNotificationsRead(userId) {
      db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId)
    },

    getDirectMessages(channel) {
      return db.prepare(`
        SELECT * FROM direct_messages WHERE channel = ? ORDER BY timestamp ASC LIMIT 100
      `).all(channel).map(row => ({
        id: row.id,
        channel: row.channel,
        senderId: row.sender_id,
        senderName: row.sender_name,
        content: row.content,
        attachment: parseJson(row.attachment_json, null),
        timestamp: row.timestamp,
      }))
    },

    addDirectMessage(channel, message) {
      const entry = {
        ...message,
        channel,
        timestamp: message.timestamp || nowIso(),
      }
      db.prepare(`
        INSERT OR REPLACE INTO direct_messages (id, channel, sender_id, sender_name, content, attachment_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(entry.id, channel, entry.senderId, entry.senderName, entry.content, json(entry.attachment), entry.timestamp)
      return entry
    },

    listPendingSwaps() {
      return db.prepare('SELECT * FROM schedule_swaps ORDER BY submitted_at ASC').all().map(row => ({
        id: row.id,
        userId: row.user_id,
        course: row.course,
        offerSlot: row.offer_slot,
        needSlot: row.need_slot,
        message: row.message,
        submittedAt: row.submitted_at,
      }))
    },

    addPendingSwap(request) {
      const entry = { ...request, id: id('swap'), submittedAt: nowIso() }
      db.prepare(`
        INSERT INTO schedule_swaps (id, user_id, course, offer_slot, need_slot, message, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(entry.id, entry.userId, entry.course, entry.offerSlot, entry.needSlot, entry.message, entry.submittedAt)
      return entry
    },

    deletePendingSwap(swapId) {
      db.prepare('DELETE FROM schedule_swaps WHERE id = ?').run(swapId)
    },
  }
}
