import { useState, useEffect, useCallback, useRef } from 'react'
import { socketService } from '../services/socket.service'
import { historyCache } from '../services/cache.service'

export function useMessages(channel, currentUserId) {
  const [messages, setMessages] = useState(() => historyCache.get(channel) || [])
  const [connected, setConnected] = useState(socketService.connected)
  const loadedRef = useRef(false)

  useEffect(() => {
    setMessages(historyCache.get(channel) || [])
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

  // Subscribe to live messages — dedup by ID to prevent doubles
  useEffect(() => {
    if (!channel) return
    const unsub = socketService.subscribe(channel, (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev  // already have it (optimistic or echo)
        const next = [...prev, msg]
        historyCache.set(channel, next)
        return next
      })
    })

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socketService.addEventListener('connect', onConnect)
    socketService.addEventListener('disconnect', onDisconnect)

    return () => {
      unsub()
      socketService.removeEventListener('connect', onConnect)
      socketService.removeEventListener('disconnect', onDisconnect)
    }
  }, [channel])

  const sendMessage = useCallback((content, senderName) => {
    if (!content?.trim() || !channel || !currentUserId) return

    const msg = {
      id: `${currentUserId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: currentUserId,
      senderName,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      channel,
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

  return { messages, sendMessage, connected }
}
