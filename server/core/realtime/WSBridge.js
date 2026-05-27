import { WebSocketServer } from 'ws'
import { eventBus } from '../events/EventBus.js'

const PORT = Number(process.env.WS_PORT || 8081)

export function parseDirectMessageChannel(channel) {
  if (!channel?.startsWith('dm:')) return null
  const parts = channel.split(':')
  if (parts.length !== 5) return null
  const scope = `${parts[1]}:${parts[2]}`
  const participants = parts.slice(3)
  if (new Set(participants).size !== 2) return null
  return { scope, participants }
}

export class WSBridge {
  #wss
  #pubsub
  #store
  #handlers
  #presence = new Map()
  #pulseEvents = []
  #pulseSeq = 0

  constructor(pubsub, store, handlers, httpServer = null) {
    this.#pubsub = pubsub
    this.#store = store
    this.#handlers = handlers

    if (httpServer) {
      this.#wss = new WebSocketServer({ server: httpServer })
      console.log('[WS] WebSocket bridge attached to HTTP server')
    } else {
      this.#wss = new WebSocketServer({ port: PORT })
      console.log(`[WS] WebSocket bridge listening on port ${PORT}`)
    }

    this.#wss.on('connection', ws => this.#onConnect(ws))

    eventBus.on('metrics', metrics => {
      this.#broadcast({ type: 'METRICS', data: metrics })
    })
    eventBus.on('notification', ({ userId, notification }) => {
      this.sendToUser(userId, { type: 'NOTIFICATION', data: notification })
    })
    eventBus.on('swap_match', matchData => {
      this.#broadcast({ type: 'SWAP_MATCH', data: matchData })
    })
  }

  #onConnect(ws) {
    ws.userId = null
    ws.userName = null
    ws.scope = null

    ws.on('message', raw => {
      let msg
      try { msg = JSON.parse(raw) } catch { return }
      this.#route(ws, msg).catch(err => console.error('[WS] route error:', err))
    })

    ws.on('close', () => this.#disconnect(ws))
    ws.on('error', () => this.#disconnect(ws))

    ws.send(JSON.stringify({ type: 'CONNECTED', data: { server: 'StudentPulse-Redis' } }))
  }

  #disconnect(ws) {
    this.#pubsub.unsubscribeAll(ws)
    if (ws.userId) {
      this.#presence.delete(ws.userId)
      this.#broadcastPresence()
    }
  }

  async #route(ws, msg) {
    const { type, reqId, channel, data, key, value, ttl, userId, name, profile } = msg

    const reply = (payload) => {
      if (!reqId) return
      ws.send(JSON.stringify({ type: 'REPLY', reqId, ...payload }))
    }

    switch (type) {
      case 'AUTH':
        ws.userId = userId
        ws.userName = name || userId
        ws.scope = profile?.scope || `${profile?.universityId || 'unknown-university'}:${profile?.facultyCode || 'unknown-faculty'}`
        ws.universityId = profile?.universityId || ''
        ws.universityName = profile?.universityName || ''
        ws.facultyCode = profile?.facultyCode || ''
        ws.facultyName = profile?.facultyName || ''
        this.#presence.set(userId, {
          userId,
          name: ws.userName,
          scope: ws.scope,
          universityId: ws.universityId,
          universityName: ws.universityName,
          facultyCode: ws.facultyCode,
          facultyName: ws.facultyName,
        })
        this.#broadcastPresence()
        reply({ ok: true })
        break

      case 'SUBSCRIBE':
        if (!this.#canAccessChannel(ws, channel)) {
          reply({ ok: false, error: 'Direct messages are limited to the same university and faculty' })
          break
        }
        this.#pubsub.subscribe(channel, ws)
        reply({ ok: true, channel })
        break

      case 'UNSUBSCRIBE':
        this.#pubsub.unsubscribe(channel, ws)
        reply({ ok: true, channel })
        break

      case 'PUBLISH': {
        if (!this.#canAccessChannel(ws, channel)) {
          reply({ ok: false, error: 'Direct messages are limited to the same university and faculty' })
          break
        }
        if (this.#isChatMessage(channel, data) && data.senderId !== ws.userId) {
          reply({ ok: false, error: 'Cannot send direct messages as another user' })
          break
        }
        const isChatMessage = this.#isChatMessage(channel, data)
        const message = isChatMessage
          ? await this.#handlers.messages.addMessage(channel, { ...data, senderName: data.senderName || ws.userName })
          : data
        const delivered = this.#pubsub.publish(channel, message)
        if (isChatMessage) this.#notifyChatParticipants(channel, message)
        reply({ ok: true, delivered, persisted: message !== data })
        break
      }

      case 'PRESENCE_LIST':
        reply({ ok: true, users: [...this.#presence.values()] })
        break

      case 'PULSE_LIST': {
        if (!ws.userId) {
          reply({ ok: false, error: 'Authentication required' })
          break
        }
        const events = this.#getPulseEvents(ws.scope)
        reply({ ok: true, channel: this.#pulseChannel(ws), events })
        break
      }

      case 'PULSE_CREATE': {
        if (!ws.userId) {
          reply({ ok: false, error: 'Authentication required' })
          break
        }
        const event = this.#createPulseEvent(ws, data)
        const events = this.#getPulseEvents(ws.scope)
        this.#pubsub.publish(this.#pulseChannel(ws), { kind: 'snapshot', events })
        reply({ ok: true, channel: this.#pulseChannel(ws), event, events })
        break
      }

      case 'PULSE_REACT': {
        if (!ws.userId) {
          reply({ ok: false, error: 'Authentication required' })
          break
        }
        const event = this.#reactPulseEvent(ws, data)
        if (!event) {
          reply({ ok: false, error: 'Pulse event not found' })
          break
        }
        const events = this.#getPulseEvents(ws.scope)
        this.#pubsub.publish(this.#pulseChannel(ws), { kind: 'snapshot', events })
        reply({ ok: true, channel: this.#pulseChannel(ws), event, events })
        break
      }

      case 'GET': {
        reply({ ok: false, error: 'Store commands are not available over WebSocket' })
        break
      }

      case 'SET': {
        reply({ ok: false, error: 'Store commands are not available over WebSocket' })
        break
      }

      case 'DEL': {
        reply({ ok: false, error: 'Store commands are not available over WebSocket' })
        break
      }

      case 'PEXPIRE': {
        reply({ ok: false, error: 'Store commands are not available over WebSocket' })
        break
      }

      case 'PTTL': {
        reply({ ok: false, error: 'Store commands are not available over WebSocket' })
        break
      }

      case 'KEYS': {
        reply({ ok: false, error: 'Store commands are not available over WebSocket' })
        break
      }

      case 'CHAT_HISTORY': {
        if (!this.#canAccessChannel(ws, channel)) {
          reply({ ok: false, error: 'Direct messages are limited to the same university and faculty' })
          break
        }
        const history = await this.#handlers.messages.getHistory(channel)
        reply({ ok: true, messages: history })
        break
      }

      case 'NOTIFICATIONS': {
        if (!this.#canAccessUser(ws, userId)) {
          reply({ ok: false, error: 'Cannot access notifications for another user' })
          break
        }
        reply({ ok: true, notifications: await this.#handlers.notifications.getNotifications(userId) })
        break
      }

      case 'PUSH_NOTIFICATION': {
        if (!this.#canAccessUser(ws, userId)) {
          reply({ ok: false, error: 'Cannot create notifications for another user' })
          break
        }
        const notification = await this.#handlers.notifications.push(userId, data)
        reply({ ok: true, notification })
        break
      }

      case 'MARK_NOTIFICATION_READ': {
        if (!this.#canAccessUser(ws, userId)) {
          reply({ ok: false, error: 'Cannot update notifications for another user' })
          break
        }
        reply({ ok: true, updated: await this.#handlers.notifications.markRead(userId, data?.notifId) })
        break
      }

      case 'MARK_ALL_NOTIFICATIONS_READ': {
        if (!this.#canAccessUser(ws, userId)) {
          reply({ ok: false, error: 'Cannot update notifications for another user' })
          break
        }
        await this.#handlers.notifications.markAllRead(userId)
        reply({ ok: true })
        break
      }

      case 'SWAP_REQUEST': {
        if (!ws.userId) {
          reply({ ok: false, error: 'Authentication required' })
          break
        }
        const result = await this.#handlers.schedule.submitSwap({ ...data, userId: ws.userId }, ws)
        reply({ ok: true, ...result })
        break
      }

      default:
        reply({ ok: false, error: 'Unknown message type' })
    }
  }

  #canAccessChannel(ws, channel) {
    if (!channel) return false
    if (channel.startsWith('notifications:')) {
      const [, userId] = channel.split(':')
      return this.#canAccessUser(ws, userId)
    }
    if (channel.startsWith('user:') && channel.endsWith(':swaps')) {
      const parts = channel.split(':')
      return parts.length === 3 && this.#canAccessUser(ws, parts[1])
    }
    if (!channel.startsWith('dm:')) return true
    const dm = parseDirectMessageChannel(channel)
    return Boolean(
      dm &&
      ws.userId &&
      ws.scope === dm.scope &&
      dm.participants.includes(ws.userId),
    )
  }

  #canAccessUser(ws, userId) {
    return Boolean(userId && ws.userId === userId)
  }

  #isChatMessage(channel, data) {
    const dm = parseDirectMessageChannel(channel)
    return Boolean(
      dm &&
      data &&
      typeof data.id === 'string' &&
      typeof data.senderId === 'string' &&
      typeof data.content === 'string',
    )
  }

  #notifyChatParticipants(channel, message) {
    const parts = channel.split(':')
    const participants = parts.slice(3)
    for (const participantId of participants) {
      if (participantId === message.senderId) continue
      this.#handlers.notifications.push(participantId, {
        title: `Mesaj nou de la ${message.senderName || 'coleg'}`,
        body: message.content.length > 120 ? `${message.content.slice(0, 117)}...` : message.content,
        type: 'message',
        action: 'messages.dm.received',
        meta: {
          channel,
          senderId: message.senderId,
          senderName: message.senderName,
          messageId: message.id,
        },
      })
    }
  }

  #pulseChannel(ws) {
    return `pulse:${ws.scope || 'unknown-university:unknown-faculty'}`
  }

  #cleanupPulseEvents() {
    const now = Date.now()
    this.#pulseEvents = this.#pulseEvents.filter(event => new Date(event.expiresAt).getTime() > now)
  }

  #getPulseEvents(scope) {
    this.#cleanupPulseEvents()
    return this.#pulseEvents
      .filter(event => event.scope === scope)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(event => ({
        ...event,
        confirmations: event.confirmedBy.length,
        confirmedBy: undefined,
      }))
  }

  #createPulseEvent(ws, data = {}) {
    this.#cleanupPulseEvents()
    const type = String(data.type || 'study').slice(0, 32)
    const location = String(data.location || 'Campus').slice(0, 80)
    const note = String(data.note || '').slice(0, 160)
    const ttlMinutes = Math.max(15, Math.min(Number(data.ttlMinutes) || 120, 360))
    const now = Date.now()
    const event = {
      id: `pulse-${now}-${++this.#pulseSeq}`,
      scope: ws.scope,
      type,
      location,
      note,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttlMinutes * 60_000).toISOString(),
      authorId: ws.userId,
      authorName: ws.userName || 'Student',
      confirmedBy: [ws.userId],
    }
    this.#pulseEvents.unshift(event)
    this.#pulseEvents = this.#pulseEvents.slice(0, 120)
    return {
      ...event,
      confirmations: event.confirmedBy.length,
      confirmedBy: undefined,
    }
  }

  #reactPulseEvent(ws, data = {}) {
    this.#cleanupPulseEvents()
    const event = this.#pulseEvents.find(item => item.scope === ws.scope && item.id === data.id)
    if (!event) return null
    if (data.reaction === 'confirm' && !event.confirmedBy.includes(ws.userId)) {
      event.confirmedBy.push(ws.userId)
    }
    return {
      ...event,
      confirmations: event.confirmedBy.length,
      confirmedBy: undefined,
    }
  }

  #broadcastPresence() {
    const users = [...this.#presence.values()]
    this.#pubsub.publish('presence:online', users)
  }

  #broadcast(data) {
    const str = JSON.stringify(data)
    for (const ws of this.#wss.clients) {
      if (ws.readyState === 1) ws.send(str)
    }
  }

  sendToUser(userId, data) {
    const str = JSON.stringify(data)
    for (const ws of this.#wss.clients) {
      if (ws.userId === userId && ws.readyState === 1) ws.send(str)
    }
  }

  get clientCount() { return this.#wss.clients.size }
}
