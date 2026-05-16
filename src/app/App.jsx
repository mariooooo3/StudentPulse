import { AuthProvider, useAuth } from './providers/AuthContext'
import { AUTH_STATE, PROFILE_STAGE } from '../shared/config/constants'
import AuthFlow from '../features/auth/AuthFlow'
import OnboardingFlow from '../features/onboarding/OnboardingFlow'
import Sidebar from './layout/Sidebar'
import Header from './layout/Header'
import Dashboard from '../features/dashboard/Dashboard'
import CampusNavigator from '../components/navigation/CampusNavigator'
import ScheduleHub from '../features/schedule/ScheduleHub'
import ThesisFinder from '../features/thesis/ThesisFinder'
import PeerTutoring from '../features/tutoring/PeerTutoring'
import DirectMessages from '../features/messages/DirectMessages'
import CityAdaptation from '../features/city/CityAdaptation'
import StudentLifeHub from '../features/student-life/StudentLifeHub'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { socketService } from '../shared/services/socket.service'
import { getUniversityTheme } from '../shared/utils/theme'

const DEFAULT_VIEW_BY_MODE = {
  academic: 'dashboard',
  life: 'discounts',
}

function AppShell() {
  const { authState, profileStage, session, profile, completeOnboarding } = useAuth()
  const [platformMode, setPlatformMode] = useState('academic')
  const [currentViewByMode, setCurrentViewByMode] = useState(DEFAULT_VIEW_BY_MODE)
  const theme = getUniversityTheme(session?.university)
  const currentView = currentViewByMode[platformMode]

  const handleModeChange = (mode) => {
    setPlatformMode(mode)
    setCurrentViewByMode((views) => ({
      ...views,
      [mode]: views[mode] || DEFAULT_VIEW_BY_MODE[mode],
    }))
  }

  const handleNavigate = (view) => {
    setCurrentViewByMode((views) => ({ ...views, [platformMode]: view }))
  }

  useEffect(() => {
    if (authState !== AUTH_STATE.AUTHENTICATED || !session?.userId) return
    const name = session.email?.split('@')[0] || session.userId
    socketService.auth(session.userId, name, {
      universityId: profile?.university?.id || session.university?.id || '',
      universityName: profile?.university?.shortName || session.university?.shortName || '',
      facultyCode: profile?.facultyCode || session.detectedFaculty?.code || '',
      facultyName: profile?.faculty || session.detectedFaculty?.name || '',
      scope: `${profile?.university?.id || session.university?.id || 'unknown-university'}:${profile?.facultyCode || session.detectedFaculty?.code || 'unknown-faculty'}`,
    })
  }, [authState, session, profile])

  if (authState === AUTH_STATE.LOADING) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-indigo-400 animate-spin" />
          <p className="text-slate-500 text-sm">Se încarcă...</p>
        </div>
      </div>
    )
  }

  if (authState === AUTH_STATE.UNAUTHENTICATED) {
    return <AuthFlow />
  }

  if (profileStage === PROFILE_STAGE.ONBOARDING) {
    return (
      <OnboardingFlow
        session={session}
        onComplete={(p) => completeOnboarding(p)}
      />
    )
  }

  return (
    <div
      className="relative flex h-screen bg-slate-950 text-slate-100 overflow-hidden"
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
        onNavigate={handleNavigate}
        profile={profile}
        session={session}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          platformMode={platformMode}
          onModeChange={handleModeChange}
          currentView={currentView}
          profile={profile}
          session={session}
        />
        <main className="flex-1 overflow-auto">
          {platformMode === 'academic' && currentView === 'dashboard'  && <Dashboard profile={profile} session={session} onNavigate={handleNavigate} />}
          {platformMode === 'academic' && currentView === 'navigator' && <CampusNavigator />}
          {platformMode === 'academic' && currentView === 'schedule'  && <ScheduleHub profile={profile} session={session} />}
          {platformMode === 'academic' && currentView === 'thesis'    && <ThesisFinder profile={profile} session={session} />}
          {platformMode === 'academic' && currentView === 'tutoring'  && <PeerTutoring profile={profile} />}
          {platformMode === 'academic' && currentView === 'messages'  && <DirectMessages session={session} profile={profile} />}

          {platformMode === 'life' && ['discounts', 'career', 'community'].includes(currentView) && (
            <StudentLifeHub activeSection={currentView} profile={profile} session={session} />
          )}
          {platformMode === 'life' && currentView === 'citylife' && <CityAdaptation profile={profile} session={session} />}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
