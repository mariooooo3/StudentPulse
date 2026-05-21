import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../app/providers/AuthContext'
import VirtualAssistant from '../../shared/components/VirtualAssistant'
import { NAV } from './constants/nav'
import { useProfessorPortal } from './hooks/useProfessorPortal'
import ProfessorSidebar from './components/ProfessorSidebar'
import ProfessorHeader from './components/ProfessorHeader'
import DashboardView from './views/DashboardView'
import ProfileView from './views/ProfileView'
import ThesisView from './views/ThesisView'
import RecoveryView from './views/RecoveryView'
import MessagesView from './views/MessagesView'

export default function ProfessorApp() {
  const { logout, profile } = useAuth()
  const [current, setCurrent] = useState('dashboard')
  const [selectedThreadId, setSelectedThreadId] = useState(null)

  const {
    professor,
    sortedRequests,
    recoveryRequests,
    threads,
    handleDecision,
    handleRecoveryDecision,
    handleSendMessage,
    handleProfessorSave,
  } = useProfessorPortal(profile)

  const pendingCount = sortedRequests.filter(r => r.status === 'pending').length
  const professorNotificationCount =
    pendingCount
    + recoveryRequests.filter(r => r.status === 'pending').length
    + threads.filter(t => t.messages.at(-1)?.senderRole === 'student').length

  function handleNavigate(target, options = {}) {
    if (target === 'messages' && options.threadId) setSelectedThreadId(options.threadId)
    setCurrent(target)
  }

  return (
    <div className="relative flex h-screen bg-[#050810] text-slate-100 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent z-50" />
      <div className="pointer-events-none absolute top-0 left-64 w-96 h-48 bg-amber-500/[0.03] blur-3xl rounded-full" />

      <ProfessorSidebar current={current} onNavigate={handleNavigate} onLogout={logout} profile={professor} />

      <div className="flex-1 min-w-0 flex flex-col">
        <ProfessorHeader
          current={current}
          pendingCount={professorNotificationCount}
          profile={professor}
          requests={sortedRequests}
          recoveryRequests={recoveryRequests}
          threads={threads}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="h-full"
            >
              {current === 'dashboard' && <DashboardView requests={sortedRequests} recoveryRequests={recoveryRequests} threads={threads} professor={professor} onNavigate={handleNavigate} />}
              {current === 'profile' && <ProfileView professor={professor} onSave={handleProfessorSave} />}
              {current === 'thesis' && <ThesisView requests={sortedRequests} onDecision={handleDecision} />}
              {current === 'recovery' && <RecoveryView requests={recoveryRequests} onDecision={handleRecoveryDecision} />}
              {current === 'messages' && <MessagesView threads={threads} onSend={handleSendMessage} selectedThreadId={selectedThreadId} onThreadSelect={setSelectedThreadId} professor={professor} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <VirtualAssistant
        session={{ role: 'professor', userId: professor.id, email: professor.email }}
        profile={professor}
        platformMode="professor"
        currentView={current}
        currentLabel={NAV.find(item => item.id === current)?.label || 'Professor Portal'}
        onNavigate={(view) => handleNavigate(view)}
      />
    </div>
  )
}
