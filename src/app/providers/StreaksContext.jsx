import { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'
import { useStreaks } from '../../shared/hooks/useStreaks'

const StreaksContext = createContext(null)

export function StreaksProvider({ children }) {
  const { session } = useAuth()
  const streaks = useStreaks(session?.userId)
  return <StreaksContext.Provider value={streaks}>{children}</StreaksContext.Provider>
}

export function useStreaksContext() {
  const ctx = useContext(StreaksContext)
  if (!ctx) throw new Error('useStreaksContext must be used within StreaksProvider')
  return ctx
}
