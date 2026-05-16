import { indoorFloorY, indoorGraph, indoorRooms, indoorStairX, routeGraph, routeNodes } from './navigationData'

function bfs(graph, start, end) {
  if (!start || !end) return null
  if (start === end) return [start]
  const queue = [[start]]
  const visited = new Set([start])

  while (queue.length) {
    const path = queue.shift()
    const current = path[path.length - 1]
    for (const next of graph[current] || []) {
      if (next === end) return [...path, next]
      if (!visited.has(next)) {
        visited.add(next)
        queue.push([...path, next])
      }
    }
  }
  return null
}

function segmentDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function buildOutdoorRoute(fromId = 'current', toId) {
  const nodePath = bfs(routeGraph, fromId, toId)
  if (!nodePath) return null

  const points = nodePath.map((id) => routeNodes[id]).filter(Boolean)
  const d = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ')
  const pixelDistance = points.reduce((sum, point, index) => index === 0 ? sum : sum + segmentDistance(points[index - 1], point), 0)
  const meters = Math.max(80, Math.round(pixelDistance * 2.1))

  return {
    d,
    nodePath,
    points,
    distance: meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`,
    duration: `${Math.max(2, Math.ceil(meters / 82))} min`,
    steps: nodePath.map((id) => routeNodes[id]?.label || id),
  }
}

export function buildIndoorRoute(fromId, toId) {
  const nodePath = bfs(indoorGraph, fromId, toId)
  if (!nodePath) return null

  const points = []
  for (const [index, id] of nodePath.entries()) {
    const room = indoorRooms.find((item) => item.id === id)
    const cx = room ? room.cx : indoorStairX
    const cy = room ? indoorFloorY[room.floor] : indoorFloorY[Number(id.split('_')[1])]
    if (index === 0 && room) points.push([room.cx, room.ry + room.rh / 2])
    points.push([cx, cy])
    if (index === nodePath.length - 1 && room) points.push([room.cx, room.ry + room.rh / 2])
  }

  return {
    nodePath,
    points,
    d: points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`).join(' '),
  }
}

export function indoorNodeLabel(id) {
  const room = indoorRooms.find((item) => item.id === id)
  if (room) return room.label
  const floor = id.split('_')[1]
  return `Scara ${floor === '0' ? 'P' : `E${floor}`}`
}
