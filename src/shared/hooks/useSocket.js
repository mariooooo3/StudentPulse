import { useState, useEffect } from 'react'
import { socketService } from '../services/socket.service'

export function useSocket() {
  const [connected, setConnected] = useState(socketService.connected)

  useEffect(() => {
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socketService.addEventListener('connect', onConnect)
    socketService.addEventListener('disconnect', onDisconnect)
    return () => {
      socketService.removeEventListener('connect', onConnect)
      socketService.removeEventListener('disconnect', onDisconnect)
    }
  }, [])

  return { connected, socketService }
}
