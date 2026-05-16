import { createContext, useContext, useState, useEffect } from 'react'
import { restoreSession, persistSession, clearSession } from '../../shared/services/auth.service'
import { AUTH_STATE, PROFILE_STAGE } from '../../shared/config/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(AUTH_STATE.LOADING)
  const [session, setSession] = useState(null)      // { userId, email, university, detectedFaculty }
  const [profile, setProfile] = useState(null)
  const [profileStage, setProfileStage] = useState(PROFILE_STAGE.NONE)

  useEffect(() => {
    async function init() {
      try {
        const saved = await restoreSession()
        // sessionStorage = per-tab, so each tab has its own user
        const savedProfile = sessionStorage.getItem('sc_profile')
        if (saved) {
          setSession(saved)
          if (savedProfile) {
            setProfile(JSON.parse(savedProfile))
            setProfileStage(PROFILE_STAGE.COMPLETE)
          } else {
            setProfileStage(PROFILE_STAGE.ONBOARDING)
          }
          setAuthState(AUTH_STATE.AUTHENTICATED)
        } else {
          setAuthState(AUTH_STATE.UNAUTHENTICATED)
        }
      } catch {
        setAuthState(AUTH_STATE.UNAUTHENTICATED)
      }
    }
    init()
  }, [])

  function login(sessionData) {
    persistSession(sessionData)
    setSession(sessionData)
    setProfileStage(sessionData.isNewUser ? PROFILE_STAGE.ONBOARDING : PROFILE_STAGE.COMPLETE)
    setAuthState(AUTH_STATE.AUTHENTICATED)
  }

  function completeOnboarding(profileData) {
    const enriched = { ...profileData, university: session?.university, detectedFaculty: session?.detectedFaculty }
    sessionStorage.setItem('sc_profile', JSON.stringify(enriched))
    setProfile(enriched)
    setProfileStage(PROFILE_STAGE.COMPLETE)
  }

  function logout() {
    clearSession()
    setSession(null)
    setProfile(null)
    setProfileStage(PROFILE_STAGE.NONE)
    setAuthState(AUTH_STATE.UNAUTHENTICATED)
  }

  return (
    <AuthContext.Provider value={{ authState, session, profile, profileStage, login, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
