import { useState, useEffect, useCallback, useRef } from 'react'
import { socketService } from '../services/socket.service'
import { historyCache } from '../services/cache.service'

function showPushNotif(title, body) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icon-192.png', silent: false })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') new Notification(title, { body, icon: '/icon-192.png' })
    })
  }
}

export function useMessages(channel, currentUserId) {
  const [messages, setMessages] = useState(() => historyCache.get(channel) || [])
  const [connected, setConnected] = useState(socketService.connected)
  const [typingUsers, setTypingUsers] = useState({})
  const [contactSeenAt, setContactSeenAt] = useState(null)
  const loadedRef = useRef(false)
  const typingTimers = useRef({})

  useEffect(() => {
    setMessages(historyCache.get(channel) || [])
    setTypingUsers({})
    setContactSeenAt(null)
    loadedRef.current = false
  }, [channel])

  // Load history from server once per channel
  useEffect(() => {
    if (loadedRef.current || !channel) return
    loadedRef.current = true

    socketService.getChatHistory(channel)
      .then(({ messages: hist }) => {
        if (hist?.length) {
          setMessages(hist)
          historyCache.set(channel, hist)
        }
      })
      .catch(() => {})
  }, [channel])

  // Subscribe to live messages + typing events
  useEffect(() => {
    if (!channel) return

    // Subscribe to chat messages — dedup by ID to prevent doubles
    const unsub = socketService.subscribe(channel, (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev
        // Push notification when tab not focused and message not from us
        if (msg.senderId !== currentUserId && document.hidden) {
          showPushNotif(
            `Mesaj nou de la ${msg.senderName || 'Coleg'}`,
            msg.content || 'Fișier atașat'
          )
        }
        const next = [...prev, msg]
        historyCache.set(channel, next)
        return next
      })
    })

    // Subscribe to read receipts
    const readChannel = `read:${channel}`
    const unsubRead = socketService.subscribe(readChannel, ({ userId, seenAt }) => {
      if (userId === currentUserId) return
      setContactSeenAt(seenAt)
    })

    // Subscribe to typing events on a separate sub-channel
    const typingChannel = `typing:${channel}`
    const unsubTyping = socketService.subscribe(typingChannel, ({ userId, name, isTyping }) => {
      if (userId === currentUserId) return
      clearTimeout(typingTimers.current[userId])
      if (isTyping) {
        setTypingUsers(prev => ({ ...prev, [userId]: name }))
        // Auto-clear after 3s in case "stop typing" event is missed
        typingTimers.current[userId] = setTimeout(() => {
          setTypingUsers(prev => { const n = { ...prev }; delete n[userId]; return n })
        }, 3000)
      } else {
        setTypingUsers(prev => { const n = { ...prev }; delete n[userId]; return n })
      }
    })

    const onConnect = () => {
      setConnected(true)
      // Reload history to catch messages missed during disconnect
      socketService.getChatHistory(channel)
        .then(({ messages: hist }) => {
          if (hist?.length) {
            setMessages(hist)
            historyCache.set(channel, hist)
          }
        })
        .catch(() => {})
    }
    const onDisconnect = () => setConnected(false)
    socketService.addEventListener('connect', onConnect)
    socketService.addEventListener('disconnect', onDisconnect)

    return () => {
      unsub()
      unsubRead()
      unsubTyping()
      Object.values(typingTimers.current).forEach(clearTimeout)
      socketService.removeEventListener('connect', onConnect)
      socketService.removeEventListener('disconnect', onDisconnect)
    }
  }, [channel, currentUserId])

  const sendRead = useCallback(() => {
    if (!channel || !currentUserId) return
    socketService.publish(`read:${channel}`, { userId: currentUserId, seenAt: new Date().toISOString() })
      .catch(() => {})
  }, [channel, currentUserId])

  const sendTyping = useCallback((isTyping, senderName = '') => {
    if (!channel || !currentUserId) return
    socketService.publish(`typing:${channel}`, { userId: currentUserId, name: senderName, isTyping })
      .catch(() => {})
  }, [channel, currentUserId])

  const sendMessage = useCallback((content, senderName, attachment = null) => {
    if ((!content?.trim() && !attachment) || !channel || !currentUserId) return

    const msg = {
      id: `${currentUserId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: currentUserId,
      senderName,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      channel,
      ...(attachment && { attachment }),
    }

    // Optimistic add — server will echo back but dedup check prevents duplicate
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev
      const next = [...prev, msg]
      historyCache.set(channel, next)
      return next
    })

    socketService.publish(channel, msg).catch(() => {
      setMessages(prev => {
        const next = prev.filter(m => m.id !== msg.id)
        historyCache.set(channel, next)
        return next
      })
    })
  }, [channel, currentUserId])

  return { messages, sendMessage, connected, typingUsers, sendTyping, contactSeenAt, sendRead }
}
