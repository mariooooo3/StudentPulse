const MAX_NOTIFS = 50
const TTL_MS = 7 * 24 * 60 * 60 * 1000  // 7 days

export function createNotificationsHandler(store, pubsub, repository = null) {
  const notifKey = userId => `notif:${userId}`

  async function getNotifications(userId) {
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

  async function push(userId, notification) {
    if (repository) {
      const entry = await repository.addNotification(userId, notification)
      pubsub.publish(`notifications:${userId}`, entry)
      return entry
    }
    const notifs = await getNotifications(userId)
    const entry = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...notification,
      read: false,
      timestamp: new Date().toISOString(),
    }
    notifs.unshift(entry)
    if (notifs.length > MAX_NOTIFS) notifs.pop()
    store.set(notifKey(userId), JSON.stringify(notifs), TTL_MS)

    pubsub.publish(`notifications:${userId}`, entry)
    return entry
  }

  async function markRead(userId, notifId) {
    if (repository) return repository.markNotificationRead(userId, notifId)
    const notifs = await getNotifications(userId)
    const n = notifs.find(n => n.id === notifId)
    if (n) {
      n.read = true
      store.set(notifKey(userId), JSON.stringify(notifs), TTL_MS)
    }
    return !!n
  }

  async function markAllRead(userId) {
    if (repository) {
      await repository.markAllNotificationsRead(userId)
      return
    }
    const notifs = await getNotifications(userId)
    notifs.forEach(n => { n.read = true })
    store.set(notifKey(userId), JSON.stringify(notifs), TTL_MS)
  }

  return { getNotifications, push, markRead, markAllRead }
}
