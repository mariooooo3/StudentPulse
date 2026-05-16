import { useState, useEffect, useCallback } from 'react'
import { socketService } from '../services/socket.service'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    const channel = `notifications:${userId}`
    const unsub = socketService.subscribe(channel, (notif) => {
      setNotifications(prev => prev.some(n => n.id === notif.id) ? prev : [notif, ...prev])
      if (!notif.read) setUnreadCount(c => c + 1)
    })

    function loadNotifications() {
      socketService.getNotifications(userId)
        .then(({ notifications: notifs }) => {
          const list = Array.isArray(notifs) ? notifs : []
          setNotifications(list)
          setUnreadCount(list.filter(n => !n.read).length)
        })
        .catch(() => {})
    }
    function loadAfterAuth() {
      setTimeout(loadNotifications, 50)
    }

    loadNotifications()
    socketService.addEventListener('connect', loadNotifications)
    socketService.addEventListener('auth', loadAfterAuth)

    return () => {
      unsub()
      socketService.removeEventListener('connect', loadNotifications)
      socketService.removeEventListener('auth', loadAfterAuth)
    }
  }, [userId])

  const pushNotification = useCallback((notification) => {
    if (!userId) return Promise.resolve(null)
    return socketService.pushNotification(userId, notification)
      .then(({ notification: saved }) => {
        if (saved) {
          setNotifications(prev => prev.some(n => n.id === saved.id) ? prev : [saved, ...prev])
          if (!saved.read) setUnreadCount(c => c + 1)
        }
        return saved
      })
      .catch(() => null)
  }, [userId])

  const markRead = useCallback((notifId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    )
    setUnreadCount(c => Math.max(0, c - 1))
    if (userId) socketService.markNotificationRead(userId, notifId).catch(() => {})
  }, [userId])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    if (userId) socketService.markAllNotificationsRead(userId).catch(() => {})
  }, [userId])

  return { notifications, unreadCount, pushNotification, markRead, markAllRead }
}
