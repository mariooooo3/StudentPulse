import { WebSocketServer } from 'ws'
import { eventBus } from '../events/EventBus.js'

const PORT = 8080

export class WSBridge {
  #wss
  #pubsub
  #store
  #handlers
  #presence = new Map()

  constructor(pubsub, store, handlers) {
    this.#pubsub = pubsub
    this.#store = store
    this.#handlers = handlers

    this.#wss = new WebSocketServer({ port: PORT })
    console.log(`[WS] WebSocket bridge listening on port ${PORT}`)

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
      this.#route(ws, msg)
    })

    ws.on('close', () => this.#disconnect(ws))
    ws.on('error', () => this.#disconnect(ws))

    ws.send(JSON.stringify({ type: 'CONNECTED', data: { server: 'StudentCompass-Redis' } }))
  }

  #disconnect(ws) {
    this.#pubsub.unsubscribeAll(ws)
    if (ws.userId) {
      this.#presence.delete(ws.userId)
      this.#broadcastPresence()
    }
  }

  #route(ws, msg) {
    const { type, reqId, channel, data, key, value, ttl, userId, name, profile } = msg

    const reply = (payload) => {
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
          ? this.#handlers.messages.addMessage(channel, { ...data, senderName: data.senderName || ws.userName })
          : data
        const delivered = this.#pubsub.publish(channel, message)
        if (isChatMessage) this.#notifyChatParticipants(channel, message)
        reply({ ok: true, delivered, persisted: message !== data })
        break
      }

      case 'PRESENCE_LIST':
        reply({ ok: true, users: [...this.#presence.values()] })
        break

      case 'GET': {
        const val = this.#store.get(key)
        reply({ ok: true, value: val })
        break
      }

      case 'SET': {
        const result = this.#store.set(key, value, ttl)
        reply({ ok: true, result })
        break
      }

      case 'DEL': {
        const n = this.#store.del(key)
        reply({ ok: true, deleted: n })
        break
      }

      case 'PEXPIRE': {
        const n = this.#store.pexpire(key, ttl)
        reply({ ok: true, set: n })
        break
      }

      case 'PTTL': {
        const remaining = this.#store.pttl(key)
        reply({ ok: true, pttl: remaining })
        break
      }

      case 'KEYS': {
        const keys = this.#store.keys(key || '*')
        reply({ ok: true, keys })
        break
      }

      case 'CHAT_HISTORY': {
        if (!this.#canAccessChannel(ws, channel)) {
          reply({ ok: false, error: 'Direct messages are limited to the same university and faculty' })
          break
        }
        const history = this.#handlers.messages.getHistory(channel)
        reply({ ok: true, messages: history })
        break
      }

      case 'NOTIFICATIONS': {
        if (!this.#canAccessUser(ws, userId)) {
          reply({ ok: false, error: 'Cannot access notifications for another user' })
          break
        }
        reply({ ok: true, notifications: this.#handlers.notifications.getNotifications(userId) })
        break
      }

      case 'PUSH_NOTIFICATION': {
        if (!this.#canAccessUser(ws, userId)) {
          reply({ ok: false, error: 'Cannot create notifications for another user' })
          break
        }
        const notification = this.#handlers.notifications.push(userId, data)
        reply({ ok: true, notification })
        break
      }

      case 'MARK_NOTIFICATION_READ': {
        if (!this.#canAccessUser(ws, userId)) {
          reply({ ok: false, error: 'Cannot update notifications for another user' })
          break
        }
        reply({ ok: true, updated: this.#handlers.notifications.markRead(userId, data?.notifId) })
        break
      }

      case 'MARK_ALL_NOTIFICATIONS_READ': {
        if (!this.#canAccessUser(ws, userId)) {
          reply({ ok: false, error: 'Cannot update notifications for another user' })
          break
        }
        this.#handlers.notifications.markAllRead(userId)
        reply({ ok: true })
        break
      }

      case 'SWAP_REQUEST': {
        const result = this.#handlers.schedule.submitSwap(data, ws)
        reply({ ok: true, ...result })
        break
      }

      default:
        reply({ ok: false, error: 'Unknown message type' })
    }
  }

  #canAccessChannel(ws, channel) {
    if (!channel?.startsWith('dm:')) return true
    const parts = channel.split(':')
    if (parts.length < 5) return false
    const scope = `${parts[1]}:${parts[2]}`
    const participants = parts.slice(3)
    return Boolean(ws.userId && ws.scope === scope && participants.includes(ws.userId))
  }

  #canAccessUser(ws, userId) {
    return Boolean(userId && ws.userId === userId)
  }

  #isChatMessage(channel, data) {
    return Boolean(
      channel?.startsWith('dm:') &&
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
