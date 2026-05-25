const WS_URL = import.meta.env.VITE_WS_URL || (() => {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/socket`
})()
const MAX_RECONNECT_DELAY = 30_000
const REQUEST_TIMEOUT = 5_000

class SocketService extends EventTarget {
  #ws = null
  #subscribers = new Map()   // channel → Set of handlers
  #pending = new Map()       // reqId → { resolve, reject, timer }
  #reconnectDelay = 1000
  #reconnectTimer = null
  #connected = false
  #reqCounter = 0
  #userId = null
  #userName = null
  #profile = null

  connect(url = WS_URL) {
    this.#url = url
    this.#open()
  }

  #url = WS_URL

  #open() {
    const s = this.#ws?.readyState
    if (s === WebSocket.OPEN || s === WebSocket.CONNECTING) return
    this.#ws = null
    try {
      this.#ws = new WebSocket(this.#url)
    } catch {
      this.#scheduleReconnect()
      return
    }

    this.#ws.onopen = () => {
      this.#connected = true
      this.#reconnectDelay = 1000
      clearTimeout(this.#reconnectTimer)

      // Re-auth after reconnect
      if (this.#userId) {
        this.#ws.send(JSON.stringify({ type: 'AUTH', userId: this.#userId, name: this.#userName, profile: this.#profile }))
        this.dispatchEvent(new Event('auth'))
      }
      // Re-subscribe all active channels
      for (const channel of this.#subscribers.keys()) {
        this.#ws.send(JSON.stringify({ type: 'SUBSCRIBE', channel }))
      }
      this.dispatchEvent(new Event('connect'))
    }

    this.#ws.onclose = () => {
      this.#connected = false
      this.#ws = null
      this.dispatchEvent(new Event('disconnect'))
      this.#scheduleReconnect()
    }

    this.#ws.onerror = (e) => {
      console.warn('[SocketService] WebSocket error:', e)
    }

    this.#ws.onmessage = ({ data }) => {
      let msg
      try { msg = JSON.parse(data) } catch { return }
      this.#handle(msg)
    }
  }

  #handle(msg) {
    switch (msg.type) {
      case 'REPLY': {
        const pending = this.#pending.get(msg.reqId)
        if (pending) {
          clearTimeout(pending.timer)
          this.#pending.delete(msg.reqId)
          msg.ok ? pending.resolve(msg) : pending.reject(new Error(msg.error || 'Request failed'))
        }
        break
      }
      case 'MESSAGE': {
        const handlers = this.#subscribers.get(msg.channel)
        if (handlers) for (const h of handlers) h(msg.data)
        break
      }
      case 'NOTIFICATION':
        this.dispatchEvent(Object.assign(new Event('notification'), { data: msg.data }))
        break
      case 'METRICS':
        this.dispatchEvent(Object.assign(new Event('metrics'), { data: msg.data }))
        break
      case 'SWAP_MATCH':
        this.dispatchEvent(Object.assign(new Event('swap_match'), { data: msg.data }))
        break
    }
  }

  #scheduleReconnect() {
    clearTimeout(this.#reconnectTimer)
    this.#reconnectTimer = setTimeout(() => {
      this.#open()
      this.#reconnectDelay = Math.min(this.#reconnectDelay * 2, MAX_RECONNECT_DELAY)
    }, this.#reconnectDelay)
  }

  #send(msg) {
    return new Promise((resolve, reject) => {
      if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('Not connected'))
      }
      const reqId = ++this.#reqCounter
      const timer = setTimeout(() => {
        this.#pending.delete(reqId)
        reject(new Error('Request timeout'))
      }, REQUEST_TIMEOUT)
      this.#pending.set(reqId, { resolve, reject, timer })
      this.#ws.send(JSON.stringify({ ...msg, reqId }))
    })
  }

  subscribe(channel, handler) {
    if (!this.#subscribers.has(channel)) {
      this.#subscribers.set(channel, new Set())
      if (this.#ws?.readyState === WebSocket.OPEN) {
        this.#ws.send(JSON.stringify({ type: 'SUBSCRIBE', channel }))
      }
    }
    this.#subscribers.get(channel).add(handler)

    return () => {
      const handlers = this.#subscribers.get(channel)
      if (!handlers) return
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.#subscribers.delete(channel)
        if (this.#ws?.readyState === WebSocket.OPEN) {
          this.#ws.send(JSON.stringify({ type: 'UNSUBSCRIBE', channel }))
        }
      }
    }
  }

  publish(channel, data) {
    return this.#send({ type: 'PUBLISH', channel, data })
  }

  get(key) {
    return this.#send({ type: 'GET', key })
  }

  set(key, value, ttl = 0) {
    return this.#send({ type: 'SET', key, value, ttl })
  }

  del(key) {
    return this.#send({ type: 'DEL', key })
  }

  pttl(key) {
    return this.#send({ type: 'PTTL', key })
  }

  getChatHistory(channel) {
    return this.#send({ type: 'CHAT_HISTORY', channel })
  }

  getNotifications(userId) {
    return this.#send({ type: 'NOTIFICATIONS', userId })
  }

  pushNotification(userId, data) {
    return this.#send({ type: 'PUSH_NOTIFICATION', userId, data })
  }

  markNotificationRead(userId, notifId) {
    return this.#send({ type: 'MARK_NOTIFICATION_READ', userId, data: { notifId } })
  }

  markAllNotificationsRead(userId) {
    return this.#send({ type: 'MARK_ALL_NOTIFICATIONS_READ', userId })
  }

  submitSwap(data) {
    return this.#send({ type: 'SWAP_REQUEST', data })
  }

  getPulseList() {
    return this.#send({ type: 'PULSE_LIST' })
  }

  createPulse(data) {
    return this.#send({ type: 'PULSE_CREATE', data })
  }

  reactPulse(id, reaction = 'confirm') {
    return this.#send({ type: 'PULSE_REACT', data: { id, reaction } })
  }

  get connected() { return this.#connected }

  auth(userId, name, profile = null) {
    this.#userId = userId
    this.#userName = name
    this.#profile = profile
    if (this.#ws?.readyState === WebSocket.OPEN) {
      this.#ws.send(JSON.stringify({ type: 'AUTH', userId, name, profile }))
      for (const channel of this.#subscribers.keys()) {
        this.#ws.send(JSON.stringify({ type: 'SUBSCRIBE', channel }))
      }
      this.dispatchEvent(new Event('auth'))
    }
  }

  presenceList() {
    return this.#send({ type: 'PRESENCE_LIST' })
  }
}

export const socketService = new SocketService()
socketService.connect()
