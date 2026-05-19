const MAX_NOTIFS = 50
const TTL_MS = 7 * 24 * 60 * 60 * 1000  // 7 days

export function createNotificationsHandler(store, pubsub, repository = null) {
  const notifKey = userId => `notif:${userId}`

  function getNotifications(userId) {
    if (repository) return repository.listNotifications(userId)
    const raw = store.get(notifKey(userId))
    if (!raw) return []
    try {
      const notifications = JSON.parse(raw)
      return Array.isArray(notifications) ? notifications : []
    } catch {
      return []
    }
  }

  function push(userId, notification) {
    if (repository) {
      const entry = repository.addNotification(userId, notification)
      pubsub.publish(`notifications:${userId}`, entry)
      return entry
    }
    const notifs = getNotifications(userId)
    const entry = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...notification,
      read: false,
      timestamp: new Date().toISOString(),
    }
    notifs.unshift(entry)
    if (notifs.length > MAX_NOTIFS) notifs.pop()
    store.set(notifKey(userId), JSON.stringify(notifs), TTL_MS)

    // Real-time delivery
    pubsub.publish(`notifications:${userId}`, entry)
    return entry
  }

  function markRead(userId, notifId) {
    if (repository) return repository.markNotificationRead(userId, notifId)
    const notifs = getNotifications(userId)
    const n = notifs.find(n => n.id === notifId)
    if (n) {
      n.read = true
      store.set(notifKey(userId), JSON.stringify(notifs), TTL_MS)
    }
    return !!n
  }

  function markAllRead(userId) {
    if (repository) {
      repository.markAllNotificationsRead(userId)
      return
    }
    const notifs = getNotifications(userId)
    notifs.forEach(n => { n.read = true })
    store.set(notifKey(userId), JSON.stringify(notifs), TTL_MS)
  }

  return { getNotifications, push, markRead, markAllRead }
}
