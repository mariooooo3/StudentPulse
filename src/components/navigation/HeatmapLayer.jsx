import { memo, useMemo, Fragment } from 'react'
import { Circle, Tooltip } from 'react-leaflet'

const PALETTE = {
  low:    { fill: '#22c55e', stroke: '#16a34a' },
  medium: { fill: '#f97316', stroke: '#ea580c' },
  high:   { fill: '#ef4444', stroke: '#dc2626' },
}

const MERGE_DIST = 0.0016

function approxDist(lat1, lng1, lat2, lng2) {
  const dlat = lat1 - lat2
  const dlng = (lng1 - lng2) * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180))
  return Math.hypot(dlat, dlng)
}

function clusterZones(rawZones) {
  if (!rawZones || rawZones.length === 0) return []

  const used = new Set()
  const result = []
  const sorted = [...rawZones].sort((a, b) => b.count - a.count)

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue
    used.add(i)
    const members = [sorted[i]]

    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue
      const d = approxDist(sorted[i].lat, sorted[i].lng, sorted[j].lat, sorted[j].lng)
      if (d < MERGE_DIST) {
        members.push(sorted[j])
        used.add(j)
      }
    }

    const total = members.reduce((s, m) => s + m.count, 0)
    const wLat   = members.reduce((s, m) => s + m.lat * m.count, 0) / total
    const wLng   = members.reduce((s, m) => s + m.lng * m.count, 0) / total

    result.push({
      lat: wLat,
      lng: wLng,
      count: total,
      level: total <= 15 ? 'low' : total <= 40 ? 'medium' : 'high',
      radius: Math.min(110 + total * 3.2, 340),
    })
  }

  return result
}

function HeatmapLayer({ zones }) {
  const clustered = useMemo(() => clusterZones(zones), [zones])

  const circles = useMemo(() => {
    return clustered.map(zone => {
      const { fill, stroke } = PALETTE[zone.level] ?? PALETTE.low
      const isHot = zone.level === 'high'
      const opacity = isHot ? 0.42 : zone.level === 'medium' ? 0.33 : 0.25
      const key = `${zone.lat.toFixed(5)},${zone.lng.toFixed(5)}`

      return (
        <Fragment key={key}>
          {isHot && (
            <Circle
              center={[zone.lat, zone.lng]}
              radius={zone.radius * 1.55}
              pathOptions={{ color: 'transparent', fillColor: fill, fillOpacity: 0.09, weight: 0 }}
            />
          )}
          <Circle
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              color: stroke,
              fillColor: fill,
              fillOpacity: opacity,
              weight: 1.5,
              opacity: 0.85,
            }}
          >
            <Tooltip>
              <span style={{ fontSize: 12, fontWeight: 500 }}>
                {zone.count} {zone.count === 1 ? 'persoană' : 'persoane'} în zonă
              </span>
            </Tooltip>
          </Circle>
        </Fragment>
      )
    })
  }, [clustered])

  return <>{circles}</>
}

export default memo(HeatmapLayer)
