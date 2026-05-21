import L from 'leaflet'

export function makePOIIcon(label, color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="
          min-width:36px;height:36px;padding:0 6px;
          background:${color};
          border:2.5px solid #fff;
          border-radius:999px;
          display:flex;align-items:center;justify-content:center;
          font-size:10px;font-weight:800;color:#fff;
          box-shadow:0 2px 10px rgba(0,0,0,0.28);
        ">${label}</div>
        <div style="
          width:0;height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:8px solid ${color};
          margin-top:-1px;
        "></div>
      </div>`,
    iconSize: [42, 46],
    iconAnchor: [21, 46],
    popupAnchor: [0, -48],
  })
}

export const FLOOR_Y = [455, 352, 264, 176, 88]
export const STAIR_X = 510

export function bfsIndoor(start, end, graph) {
  if (start === end) return [start]
  const q = [[start]]
  const visited = new Set([start])
  while (q.length) {
    const path = q.shift()
    for (const next of graph[path[path.length - 1]] || []) {
      if (next === end) return [...path, next]
      if (!visited.has(next)) { visited.add(next); q.push([...path, next]) }
    }
  }
  return null
}

export function indoorPathPoints(nodePath, indRooms) {
  const pts = []
  for (let i = 0; i < nodePath.length; i++) {
    const id = nodePath[i]
    const room = indRooms.find(r => r.id === id)
    const cx = room ? room.cx : STAIR_X
    const cy = room ? FLOOR_Y[room.floor] : FLOOR_Y[parseInt(id.split('_')[1])]
    if (i === 0 && room) pts.push([room.cx, room.ry + room.rh / 2])
    pts.push([cx, cy])
    if (i === nodePath.length - 1 && room) pts.push([room.cx, room.ry + room.rh / 2])
  }
  return pts
}

export function makeLabel(letter, color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${letter}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

export function mapsQuery(item) {
  const name = item?.name || 'Universitate Iași'
  const coords = item?.coords || (item?.lat && item?.lng ? [item.lat, item.lng] : null)
  return coords ? `${name} ${coords[0]},${coords[1]}` : name
}

export function googleMapsUrl(item) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(item))}`
}

export function wazeUrl(item) {
  const coords = item?.coords || (item?.lat && item?.lng ? [item.lat, item.lng] : null)
  if (coords) return `https://waze.com/ul?ll=${coords[0]},${coords[1]}&navigate=yes`
  return `https://waze.com/ul?q=${encodeURIComponent(item?.name || 'Universitate Iași')}&navigate=yes`
}

export function openExternalMap(item, provider = 'google') {
  window.open(provider === 'waze' ? wazeUrl(item) : googleMapsUrl(item), '_blank', 'noopener,noreferrer')
}

export function coordsParam(item) {
  const coords = item?.coords || (item?.lat && item?.lng ? [item.lat, item.lng] : null)
  return coords ? `${coords[0]},${coords[1]}` : ''
}

export function googleDirectionsUrl(from, to, mode = 'foot') {
  const travelmode = mode === 'car' || mode === 'driving' ? 'driving' : mode === 'bike' ? 'bicycling' : 'walking'
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(coordsParam(from))}&destination=${encodeURIComponent(coordsParam(to))}&travelmode=${travelmode}`
}

export function wazeRouteUrl(to) {
  const coords = coordsParam(to)
  return coords
    ? `https://waze.com/ul?ll=${encodeURIComponent(coords)}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(to?.name || 'Universitate Iasi')}&navigate=yes`
}

export function openExternalRoute(from, to, provider = 'google', mode = 'foot') {
  window.open(provider === 'waze' ? wazeRouteUrl(to) : googleDirectionsUrl(from, to, mode), '_blank', 'noopener,noreferrer')
}
