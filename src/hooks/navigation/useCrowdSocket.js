import { useEffect, useRef, useState } from 'react'

const WS_URL = import.meta.env.VITE_CROWD_WS_URL || 'ws://localhost:8000/ws/crowd'
const CAMPUS = [47.1764, 27.5733]
const RADIUS = 0.008
const GRID = 0.001
const HOTSPOTS = [
  [47.1771, 27.5742],
  [47.1758, 27.5728],
  [47.1753, 27.5747],
  [47.1783, 27.5718],
]

class SimulatedUser {
  constructor() {
    const angle = Math.random() * 2 * Math.PI
    const radius = Math.random() * RADIUS
    this.lat = CAMPUS[0] + radius * Math.cos(angle)
    this.lng = CAMPUS[1] + radius * Math.sin(angle)
    this.speed = 0.00003 + Math.random() * 0.00008
    this.direction = Math.random() * 2 * Math.PI
    this.target = Math.random() < 0.65 ? HOTSPOTS[Math.floor(Math.random() * HOTSPOTS.length)] : null
  }

  step() {
    if (Math.random() < 0.1) this.direction += (Math.random() - 0.5) * 0.8
    if (this.target && Math.random() < 0.28) {
      this.lat += (this.target[0] - this.lat) * 0.05
      this.lng += (this.target[1] - this.lng) * 0.05
    } else {
      this.lat += this.speed * Math.cos(this.direction)
      this.lng += this.speed * Math.sin(this.direction)
    }

    const dlat = this.lat - CAMPUS[0]
    const dlng = this.lng - CAMPUS[1]
    const distance = Math.hypot(dlat, dlng)
    if (distance > RADIUS) {
      this.direction += Math.PI
      this.lat = CAMPUS[0] + (dlat / distance) * RADIUS * 0.92
      this.lng = CAMPUS[1] + (dlng / distance) * RADIUS * 0.92
    }
  }
}

function toZones(users) {
  const grid = {}
  for (const user of users) {
    const latKey = (Math.round(user.lat / GRID) * GRID).toFixed(4)
    const lngKey = (Math.round(user.lng / GRID) * GRID).toFixed(4)
    const key = `${latKey}_${lngKey}`
    if (!grid[key]) grid[key] = { lat: Number(latKey), lng: Number(lngKey), users: [] }
    grid[key].users.push(user)
  }
  return Object.values(grid).map((cell) => {
    const count = cell.users.length
    return {
      lat: cell.users.reduce((sum, user) => sum + user.lat, 0) / count,
      lng: cell.users.reduce((sum, user) => sum + user.lng, 0) / count,
      count,
      level: count <= 10 ? 'low' : count <= 30 ? 'medium' : 'high',
      radius: Math.min(75 + count * 2.5, 210),
    }
  })
}

function startLocalSimulation(onUpdate) {
  const users = Array.from({ length: 220 }, () => new SimulatedUser())
  let timer = null
  const tick = () => {
    users.forEach((user) => user.step())
    onUpdate({ zones: toZones(users), total: users.length })
    timer = window.setTimeout(tick, 2200)
  }
  tick()
  return () => window.clearTimeout(timer)
}

export function useCrowdSocket(enabled) {
  const [zones, setZones] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [connected, setConnected] = useState(false)
  const [mode, setMode] = useState(null)
  const cleanupRef = useRef(null)

  useEffect(() => {
    if (!enabled) {
      cleanupRef.current?.()
      cleanupRef.current = null
      setZones([])
      setTotalUsers(0)
      setConnected(false)
      setMode(null)
      return undefined
    }

    let stopped = false
    let wsAlive = false
    let ws = null

    const fallbackToLocal = () => {
      if (stopped || cleanupRef.current) return
      setMode('local')
      setConnected(true)
      cleanupRef.current = startLocalSimulation(({ zones: nextZones, total }) => {
        if (stopped) return
        setZones(nextZones)
        setTotalUsers(total)
      })
    }

    const fallbackTimer = window.setTimeout(fallbackToLocal, 2500)

    try {
      ws = new WebSocket(WS_URL)
      ws.onopen = () => {
        if (stopped) {
          ws.close()
          return
        }
        window.clearTimeout(fallbackTimer)
        wsAlive = true
        setMode('ws')
        setConnected(true)
      }
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (!stopped && data.type === 'crowd_update') {
            setZones(data.zones || [])
            setTotalUsers(data.total_users || 0)
          }
        } catch {
          setMode((current) => current || 'local')
        }
      }
      ws.onerror = () => {
        if (!wsAlive) {
          window.clearTimeout(fallbackTimer)
          fallbackToLocal()
        }
      }
      ws.onclose = () => {
        if (!wsAlive && !stopped) {
          window.clearTimeout(fallbackTimer)
          fallbackToLocal()
        } else {
          setConnected(false)
        }
      }
    } catch {
      window.clearTimeout(fallbackTimer)
      fallbackToLocal()
    }

    return () => {
      stopped = true
      window.clearTimeout(fallbackTimer)
      ws?.close()
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [enabled])

  return { zones, totalUsers, connected, mode }
}
