import { useEffect, useState } from 'react'

export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(tick)
  }, [intervalMs])

  return now
}
