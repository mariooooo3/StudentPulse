import { ROUTE_PROFILES } from '../data/campusConfig'

export function formatDistance(meters) {
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`
}

export function haversineMeters(a, b) {
  const toRad = value => value * Math.PI / 180
  const [lat1, lon1] = a
  const [lat2, lon2] = b
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const s1 = Math.sin(dLat / 2)
  const s2 = Math.sin(dLon / 2)
  const h = s1 * s1 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * s2 * s2
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function fallbackRouteInfo(from, to, profile) {
  const distance = haversineMeters(from.coords, to.coords)
  const duration = Math.max(1, Math.ceil((distance / 1000) / profile.fallbackSpeedKmh * 60))
  return { distance: formatDistance(distance), duration: `${duration} min`, mode: profile.label, source: 'direct-estimate' }
}

export function routeDistance(path) {
  return path.slice(1).reduce((total, point, index) => total + haversineMeters(path[index], point), 0)
}

export function compactRoutePath(path) {
  return path.reduce((clean, point) => {
    const previous = clean[clean.length - 1]
    if (!previous || haversineMeters(previous, point) > 2) clean.push(point)
    return clean
  }, [])
}

export function nearestWalkNode(nodes, coords) {
  return nodes.reduce((best, node) => {
    const distance = haversineMeters(coords, node.coords)
    return !best || distance < best.distance ? { ...node, distance } : best
  }, null)
}

export function dijkstraWalkPath(nodes, edges, startId, endId) {
  const nodeIds = nodes.map(node => node.id)
  const distances = Object.fromEntries(nodeIds.map(id => [id, Infinity]))
  const previous = {}
  const unvisited = new Set(nodeIds)
  distances[startId] = 0

  while (unvisited.size) {
    const current = [...unvisited].sort((a, b) => distances[a] - distances[b])[0]
    if (!current || distances[current] === Infinity) break
    unvisited.delete(current)
    if (current === endId) break

    for (const edge of edges.filter(([a, b]) => a === current || b === current)) {
      const neighbor = edge[0] === current ? edge[1] : edge[0]
      if (!unvisited.has(neighbor)) continue
      const weight = edge[2] || haversineMeters(
        nodes.find(node => node.id === current).coords,
        nodes.find(node => node.id === neighbor).coords,
      )
      const nextDistance = distances[current] + weight
      if (nextDistance < distances[neighbor]) {
        distances[neighbor] = nextDistance
        previous[neighbor] = current
      }
    }
  }

  if (startId !== endId && !previous[endId]) return null
  const path = [endId]
  while (path[0] !== startId) {
    const prev = previous[path[0]]
    if (prev == null) return null
    path.unshift(prev)
  }
  return path
}

export function buildCampusWalkRoute(campus, from, to) {
  if (!campus.walkNodes?.length || !campus.walkEdges?.length) return null
  const start = nearestWalkNode(campus.walkNodes, from.coords)
  const end = nearestWalkNode(campus.walkNodes, to.coords)
  if (!start || !end) return null

  const nodePath = dijkstraWalkPath(campus.walkNodes, campus.walkEdges, start.id, end.id)
  if (!nodePath) return null

  const nodeById = Object.fromEntries(campus.walkNodes.map(node => [node.id, node]))
  const path = compactRoutePath([
    from.coords,
    ...nodePath.map(id => nodeById[id].coords),
    to.coords,
  ])
  const distance = routeDistance(path)
  const directDistance = haversineMeters(from.coords, to.coords)
  if (directDistance > 0 && distance > directDistance * 1.85) return null

  const duration = Math.max(1, Math.ceil((distance / 1000) / ROUTE_PROFILES.foot.fallbackSpeedKmh * 60))
  return {
    path,
    info: { distance: formatDistance(distance), duration: `${duration} min`, mode: ROUTE_PROFILES.foot.label, source: 'campus-walk' },
  }
}

export async function fetchOsrmRoute(from, to, profile) {
  const [lat1, lon1] = from.coords
  const [lat2, lon2] = to.coords
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/${profile.osrmProfile}/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`,
      { signal: controller.signal },
    )
    if (!res.ok) throw new Error(`OSRM ${res.status}`)
    const data = await res.json()
    const route = data.routes?.[0]
    if (!route?.geometry?.coordinates?.length) throw new Error('No OSRM route found')
    return {
      path: compactRoutePath(route.geometry.coordinates.map(([lng, lat]) => [lat, lng])),
      distance: route.distance,
    }
  } finally {
    window.clearTimeout(timeout)
  }
}
