import { useState, useEffect, useCallback } from 'react'
import { getStreaks, incrementStreak } from '../services/streaks.service'

export function useStreaks(userId) {
  const [streaks, setStreaks] = useState({ focus: { count: 0, lastDate: null }, pulse: { count: 0, lastDate: null } })

  useEffect(() => {
    if (!userId) return
    getStreaks(userId).then(setStreaks).catch(() => {})
  }, [userId])

  const increment = useCallback(async (type) => {
    if (!userId) return null
    try {
      const result = await incrementStreak(userId, type)
      setStreaks(prev => ({ ...prev, [type]: { count: result.count, lastDate: result.lastDate } }))
      return result
    } catch {
      return null
    }
  }, [userId])

  return {
    focusStreak: streaks.focus?.count ?? 0,
    pulseStreak: streaks.pulse?.count ?? 0,
    incrementFocus: () => increment('focus'),
    incrementPulse: () => increment('pulse'),
  }
}
