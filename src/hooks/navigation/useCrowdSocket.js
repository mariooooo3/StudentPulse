import { useEffect, useRef, useState } from 'react'

const WS_URL = import.meta.env.VITE_CROWD_WS_URL || 'ws://localhost:8000/ws/crowd'
const GRID = 0.001
const DEFAULT_CAMPUS = [47.153886, 27.593992]
const DEFAULT_HOTSPOTS = [
  [47.153886, 27.593992],
  [47.155607, 27.603028],
  [47.154484, 27.609974],
  [47.157030, 27.590140],
]

class SimulatedUser {
  constructor(center = DEFAULT_CAMPUS, hotspots = DEFAULT_HOTSPOTS) {
    const safeHotspots = hotspots?.length ? hotspots : [center]
    const anchor = safeHotspots[Math.floor(Math.random() * safeHotspots.length)]
    const angle = Math.random() * 2 * Math.PI
    const radius = Math.random() * 0.0012
    this.center = center
    this.lat = anchor[0] + radius * Math.cos(angle)
    this.lng = anchor[1] + radius * Math.sin(angle)
    this.speed = 0.00003 + Math.random() * 0.00008
    this.direction = Math.random() * 2 * Math.PI
    this.target = Math.random() < 0.85 ? anchor : safeHotspots[Math.floor(Math.random() * safeHotspots.length)]
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

    const dlat = this.lat - this.target[0]
    const dlng = this.lng - this.target[1]
    const distance = Math.hypot(dlat, dlng)
    if (distance > 0.0024) {
      this.direction += Math.PI
      this.lat = this.target[0] + (dlat / distance) * 0.002
      this.lng = this.target[1] + (dlng / distance) * 0.002
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

function makeHotspotsFromCenter(center) {
  const [lat, lng] = center
  return [
    [lat,         lng        ],
    [lat + 0.001, lng + 0.001],
    [lat + 0.003, lng - 0.004],
    [lat - 0.001, lng - 0.001],
  ]
}

function startLocalSimulation(onUpdate, center, hotspots) {
  const users = Array.from({ length: 220 }, () => new SimulatedUser(center, hotspots))
  let timer = null
  const tick = () => {
    users.forEach((user) => user.step())
    onUpdate({ zones: toZones(users), total: users.length })
    timer = window.setTimeout(tick, 2200)
  }
  tick()
  return () => window.clearTimeout(timer)
}

export function useCrowdSocket(enabled, center = DEFAULT_CAMPUS, hotspots) {
  const [zones, setZones] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [connected, setConnected] = useState(false)
  const [mode, setMode] = useState(null)
  const cleanupRef = useRef(null)

  const resolvedHotspots = hotspots?.length ? hotspots : makeHotspotsFromCenter(center)

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
      }, center, resolvedHotspots)
    }

    const fallbackTimer = window.setTimeout(fallbackToLocal, 2500)

    try {
      ws = new WebSocket(WS_URL)
      ws.onopen = () => {
        if (stopped) {
          ws.close()
          return
        }
        wsAlive = true
        setMode('ws')
        setConnected(true)
      }
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (!stopped && data.type === 'crowd_update') {
            window.clearTimeout(fallbackTimer)
            cleanupRef.current?.()
            cleanupRef.current = null
            setMode('ws')
            setConnected(true)
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
        } else if (!cleanupRef.current) {
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
  }, [enabled, center, resolvedHotspots])

  return { zones, totalUsers, connected, mode }
}
