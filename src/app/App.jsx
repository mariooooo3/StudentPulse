import { lazy, Suspense, useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './providers/AuthContext'
import { AUTH_STATE, PROFILE_STAGE } from '../shared/config/constants'
import Sidebar from './layout/Sidebar'
import Header from './layout/Header'
import { Loader2 } from 'lucide-react'
import { PageSkeleton } from '../shared/components/Skeleton'
import { getUniversityTheme } from '../shared/utils/theme'
import { ToastProvider } from '../shared/components/Toast'
import GlobalSearch from '../shared/components/GlobalSearch'
import VirtualAssistant from '../shared/components/VirtualAssistant'
import { OnlineCountProvider, useOnlineCount } from '../shared/hooks/useOnlineCount'
import { socketService } from '../shared/services/socket.service'
import LandingPage from '../features/landing/LandingPage'

const AuthFlow       = lazy(() => import('../features/auth/AuthFlow'))
const OnboardingFlow = lazy(() => import('../features/onboarding/OnboardingFlow'))
const Dashboard      = lazy(() => import('../features/dashboard/Dashboard'))
const CampusNavigator = lazy(() => import('../components/navigation/CampusNavigator'))
const ScheduleHub    = lazy(() => import('../features/schedule/ScheduleHub'))
const ThesisFinder   = lazy(() => import('../features/thesis/ThesisFinder'))
const PeerTutoring   = lazy(() => import('../features/tutoring/PeerTutoring'))
const DirectMessages = lazy(() => import('../features/messages/DirectMessages'))
const CityAdaptation = lazy(() => import('../features/city/CityAdaptation'))
const StudentLifeHub = lazy(() => import('../features/student-life/StudentLifeHub'))
const ProfessorApp = lazy(() => import('../features/professor/ProfessorApp'))

function PageLoader() {
  return <PageSkeleton />
}

const DEFAULT_VIEW_BY_MODE = {
  academic: 'dashboard',
  life: 'discounts',
}

function loadViewState() {
  try {
    const raw = sessionStorage.getItem('sc_view_state')
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function AppShell() {
  const { authState, profileStage, session, profile, completeOnboarding } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const savedViewState = loadViewState()
  const [platformMode, setPlatformMode] = useState(savedViewState?.platformMode || 'academic')
  const [currentViewByMode, setCurrentViewByMode] = useState(savedViewState?.currentViewByMode || DEFAULT_VIEW_BY_MODE)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { count: onlineCount } = useOnlineCount()

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (authState === AUTH_STATE.UNAUTHENTICATED) setShowAuth(false)
  }, [authState])
  const theme = getUniversityTheme(session?.university)
  const currentView = currentViewByMode[platformMode]

  useEffect(() => {
    if (!session?.userId || authState !== AUTH_STATE.AUTHENTICATED) return
    const faculty = profile || session?.detectedFaculty || {}
    const university = session?.university || profile?.university || {}
    const socketProfile = {
      universityId: university.id || profile?.universityId || '',
      universityName: university.name || profile?.universityName || '',
      facultyCode: profile?.facultyCode || session?.detectedFaculty?.code || faculty.code || '',
      facultyName: profile?.faculty || profile?.facultyName || session?.detectedFaculty?.name || faculty.name || '',
      scope: `${university.id || profile?.universityId || 'unknown-university'}:${profile?.facultyCode || session?.detectedFaculty?.code || faculty.code || 'unknown-faculty'}`,
    }
    const name = profile?.name || session.email?.split('@')[0]?.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || session.email
    socketService.auth(session.userId, name, socketProfile)
  }, [authState, session?.userId, session?.email, session?.university, session?.detectedFaculty, profile])

  const persistViewState = (mode, views) => {
    try {
      sessionStorage.setItem('sc_view_state', JSON.stringify({ platformMode: mode, currentViewByMode: views }))
    } catch {}
  }

  const handleModeChange = (mode) => {
    setPlatformMode(mode)
    setCurrentViewByMode((views) => {
      const updated = { ...views, [mode]: views[mode] || DEFAULT_VIEW_BY_MODE[mode] }
      persistViewState(mode, updated)
      return updated
    })
  }

  const handleNavigate = (view, mode) => {
    const targetMode = mode || platformMode
    if (mode && mode !== platformMode) {
      setPlatformMode(mode)
    }
    setCurrentViewByMode((views) => {
      const updated = { ...views, [targetMode]: view }
      persistViewState(targetMode, updated)
      return updated
    })
  }

  const handleNotificationNavigate = (view, mode = 'academic') => {
    handleNavigate(view, mode)
  }

  if (authState === AUTH_STATE.LOADING) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-indigo-400 animate-spin" />
          <p className="text-slate-600 text-sm">Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (authState === AUTH_STATE.UNAUTHENTICATED) {
    if (!showAuth) return <LandingPage onStart={() => setShowAuth(true)} />
    return <Suspense fallback={null}><AuthFlow /></Suspense>
  }

  if (profileStage === PROFILE_STAGE.ONBOARDING) {
    return (
      <Suspense fallback={null}>
        <OnboardingFlow session={session} onComplete={(p) => completeOnboarding(p)} />
      </Suspense>
    )
  }

  if (session?.role === 'professor') {
    return (
      <Suspense fallback={<PageLoader />}>
        <ProfessorApp />
      </Suspense>
    )
  }

  return (
    <div
      className="relative flex h-screen bg-[#050810] text-slate-100 overflow-hidden"
      style={theme.shellStyle}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute -top-32 left-56 h-72 w-72 rounded-full blur-3xl opacity-20"
        style={{ background: theme.accent }}
      />
      <Sidebar
        platformMode={platformMode}
        currentView={currentView}
        onNavigate={(v) => { handleNavigate(v); setSidebarOpen(false) }}
        profile={profile}
        session={session}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onlineCount={onlineCount}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          platformMode={platformMode}
          onModeChange={handleModeChange}
          currentView={currentView}
          profile={profile}
          session={session}
          onMenuClick={() => setSidebarOpen(true)}
          onSearchOpen={() => setSearchOpen(true)}
          onNavigate={handleNotificationNavigate}
        />
        <main className="flex-1 overflow-auto flex flex-col">
          <Suspense fallback={<PageLoader />}>
            <div className="flex-1 flex flex-col">
              {platformMode === 'academic' && currentView === 'dashboard'  && <Dashboard profile={profile} session={session} onNavigate={handleNavigate} />}
              {platformMode === 'academic' && currentView === 'navigator' && <CampusNavigator />}
              {platformMode === 'academic' && currentView === 'schedule'  && <ScheduleHub profile={profile} session={session} />}
              {platformMode === 'academic' && currentView === 'thesis'    && <ThesisFinder profile={profile} session={session} />}
              {platformMode === 'academic' && currentView === 'tutoring'  && <PeerTutoring profile={profile} />}
              {platformMode === 'academic' && currentView === 'messages'  && <DirectMessages session={session} profile={profile} />}

              {platformMode === 'life' && ['discounts', 'career', 'community', 'events', 'wellness', 'tools'].includes(currentView) && (
                <StudentLifeHub activeSection={currentView} profile={profile} session={session} />
              )}
              {platformMode === 'life' && currentView === 'citylife' && <CityAdaptation profile={profile} session={session} />}
            </div>
          </Suspense>
        </main>
      </div>

      {searchOpen && (
        <GlobalSearch
          profile={profile}
          onNavigate={(view, mode) => {
            handleNavigate(view, mode)
            setSearchOpen(false)
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}

      <VirtualAssistant
        session={session}
        profile={profile}
        platformMode={platformMode}
        currentView={currentView}
        onNavigate={(view, mode) => handleNavigate(view, mode)}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <OnlineCountProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </OnlineCountProvider>
    </AuthProvider>
  )
}
