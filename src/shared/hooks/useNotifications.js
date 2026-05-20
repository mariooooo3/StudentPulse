import { useState, useEffect, useCallback } from 'react'
import { socketService } from '../services/socket.service'
import {
  addLocalNotification,
  getLocalNotifications,
  markAllLocalNotificationsRead,
  markLocalNotificationRead,
} from '../services/professorPortal.service'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    function mergeNotifications(list) {
      const merged = [...getLocalNotifications(userId), ...(Array.isArray(list) ? list : [])]
      const unique = merged
        .filter((item, index, arr) => arr.findIndex(other => other.id === item.id) === index)
        .sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0))
      setNotifications(unique)
      setUnreadCount(unique.filter(n => !n.read).length)
    }

    const channel = `notifications:${userId}`
    const unsub = socketService.subscribe(channel, (notif) => {
      setNotifications(prev => {
        if (prev.some(n => n.id === notif.id)) return prev
        const next = [notif, ...prev]
        setUnreadCount(next.filter(n => !n.read).length)
        return next
      })
    })

    function loadNotifications() {
      socketService.getNotifications(userId)
        .then(({ notifications: notifs }) => {
          mergeNotifications(notifs)
        })
        .catch(() => mergeNotifications([]))
    }
    function loadLocal(event) {
      if (event?.detail?.userId && event.detail.userId !== userId) return
      mergeNotifications([])
    }
    function loadStorage(event) {
      if (event.key === 'sc_local_notifications') mergeNotifications([])
    }
    function loadAfterAuth() {
      setTimeout(loadNotifications, 50)
    }

    loadNotifications()
    window.addEventListener('sc:notifications', loadLocal)
    window.addEventListener('storage', loadStorage)
    socketService.addEventListener('connect', loadNotifications)
    socketService.addEventListener('auth', loadAfterAuth)

    return () => {
      unsub()
      window.removeEventListener('sc:notifications', loadLocal)
      window.removeEventListener('storage', loadStorage)
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
          if (saved.read === false) setUnreadCount(c => c + 1)
        }
        return saved
      })
      .catch(() => {
        const saved = addLocalNotification(userId, notification)
        if (saved) {
          setNotifications(prev => prev.some(n => n.id === saved.id) ? prev : [saved, ...prev])
          if (saved.read === false) setUnreadCount(c => c + 1)
        }
        return saved
      })
  }, [userId])

  const markRead = useCallback((notifId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    )
    setUnreadCount(c => Math.max(0, c - 1))
    if (userId) markLocalNotificationRead(userId, notifId)
    if (userId) socketService.markNotificationRead(userId, notifId).catch(() => {})
  }, [userId])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    if (userId) markAllLocalNotificationsRead(userId)
    if (userId) socketService.markAllNotificationsRead(userId).catch(() => {})
  }, [userId])

  return { notifications, unreadCount, pushNotification, markRead, markAllRead }
}
