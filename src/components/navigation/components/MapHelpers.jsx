import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export function FlyTo({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 17, { duration: 1.2 })
  }, [coords, map])
  return null
}

export function FitRoute({ path }) {
  const map = useMap()
  useEffect(() => {
    if (path && path.length > 1) {
      map.fitBounds(L.latLngBounds(path), { padding: [50, 50], duration: 1 })
    }
  }, [path])
  return null
}
