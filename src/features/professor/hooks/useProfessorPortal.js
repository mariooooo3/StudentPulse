import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../shared/components/Toast'
import { socketService } from '../../../shared/services/socket.service'
import {
  DEMO_PROFESSOR,
  getProfessorProfile,
  listPortalThreads,
  listRecoveryRequests,
  listThesisRequests,
  saveProfessorProfile,
  sendPortalMessage,
  updateThesisRequestStatus,
  updateRecoveryRequestStatus,
  upsertPortalThread,
} from '../../../shared/services/professorPortal.service'

export function useProfessorPortal(profile) {
  const toast = useToast()
  const [professor, setProfessor] = useState(() => ({ ...(profile || DEMO_PROFESSOR) }))
  const [requests, setRequests] = useState([])
  const [recoveryRequests, setRecoveryRequests] = useState([])
  const [threads, setThreads] = useState([])

  const refreshRequests = async () => { setRequests(await listThesisRequests()) }
  const refreshRecoveryRequests = async () => { setRecoveryRequests(await listRecoveryRequests()) }
  const refreshThreads = async () => { setThreads(await listPortalThreads()) }

  const refreshPortalData = async () => {
    const [nextRequests, nextRecoveryRequests, nextThreads] = await Promise.all([
      listThesisRequests().catch(() => []),
      listRecoveryRequests().catch(() => []),
      listPortalThreads().catch(() => []),
    ])
    setRequests(nextRequests)
    setRecoveryRequests(nextRecoveryRequests)
    setThreads(nextThreads)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [nextProfessor, nextRequests, nextRecoveryRequests, nextThreads] = await Promise.all([
        getProfessorProfile().catch(() => profile || DEMO_PROFESSOR),
        listThesisRequests().catch(() => []),
        listRecoveryRequests().catch(() => []),
        listPortalThreads().catch(() => []),
      ])
      if (cancelled) return
      setProfessor({ ...(profile || DEMO_PROFESSOR), ...nextProfessor })
      setRequests(nextRequests)
      setRecoveryRequests(nextRecoveryRequests)
      setThreads(nextThreads)
    }
    load()
    return () => { cancelled = true }
  }, [profile])

  useEffect(() => {
    if (!professor?.id) return undefined
    const unsub = socketService.subscribe(`portal:${professor.id}`, () => { refreshPortalData() })
    return unsub
  }, [professor?.id])

  useEffect(() => {
    window.addEventListener('sc:thesis-requests', refreshRequests)
    return () => window.removeEventListener('sc:thesis-requests', refreshRequests)
  }, [])

  useEffect(() => {
    async function refreshProfessor(event) {
      const nextProfessor = event?.detail || await getProfessorProfile().catch(() => profile || DEMO_PROFESSOR)
      setProfessor({ ...(profile || DEMO_PROFESSOR), ...nextProfessor })
    }
    window.addEventListener('sc:professor-profile', refreshProfessor)
    return () => window.removeEventListener('sc:professor-profile', refreshProfessor)
  }, [profile])

  useEffect(() => {
    window.addEventListener('sc:recovery-requests', refreshRecoveryRequests)
    return () => window.removeEventListener('sc:recovery-requests', refreshRecoveryRequests)
  }, [])

  useEffect(() => {
    window.addEventListener('sc:portal-messages', refreshThreads)
    return () => window.removeEventListener('sc:portal-messages', refreshThreads)
  }, [])

  const sortedRequests = useMemo(
    () => [...requests].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [requests],
  )

  async function handleDecision(requestId, status, note) {
    const updated = await updateThesisRequestStatus(requestId, status, note)
    if (updated?.studentId) {
      const thread = await upsertPortalThread({
        student: { userId: updated.studentId, name: updated.studentName, email: updated.studentEmail },
        professor,
        subject: `Licenta: ${updated.idea}`,
      })
      await sendPortalMessage(thread.id, {
        senderId: professor.id,
        senderName: professor.name,
        senderRole: 'professor',
        text: status === 'accepted'
          ? `Am acceptat cererea ta pentru licenta. ${note || 'Stabilim detaliile la o discutie initiala.'}`
          : `Am respins cererea ta pentru licenta. ${note || 'Tema nu se potriveste directiei curente.'}`,
      })
      await refreshThreads()
    }
    await refreshRequests()
    toast({
      type: status === 'accepted' ? 'success' : 'info',
      title: status === 'accepted' ? 'Cerere acceptata' : 'Cerere respinsa',
      message: updated?.studentName ? `${updated.studentName} primeste notificare in contul de student.` : 'Status actualizat.',
    })
  }

  async function handleRecoveryDecision(requestId, status, note) {
    const updated = await updateRecoveryRequestStatus(requestId, status, note)
    if (updated?.studentId) {
      const thread = await upsertPortalThread({
        student: { userId: updated.studentId, name: updated.studentName, email: updated.studentEmail },
        professor,
        subject: `Recuperare: ${updated.subject}`,
      })
      await sendPortalMessage(thread.id, {
        senderId: professor.id,
        senderName: professor.name,
        senderRole: 'professor',
        text: status === 'accepted'
          ? `Recuperarea la ${updated.subject} a fost aprobata. ${note}`
          : `Recuperarea la ${updated.subject} a fost respinsa. ${note}`,
      })
    }
    await refreshRecoveryRequests()
    await refreshThreads()
    toast({ type: status === 'accepted' ? 'success' : 'info', title: 'Recuperare actualizata', message: `${updated?.studentName || 'Studentul'} primeste notificare.` })
  }

  async function handleSendMessage(threadId, text) {
    await sendPortalMessage(threadId, {
      senderId: professor.id,
      senderName: professor.name,
      senderRole: 'professor',
      text,
    })
    await refreshThreads()
  }

  async function handleProfessorSave(patch) {
    const updated = await saveProfessorProfile(patch)
    setProfessor({ ...(profile || DEMO_PROFESSOR), ...updated })
    toast({ type: 'success', title: 'Profil actualizat', message: 'Datele publice ale contului de profesor au fost salvate.' })
  }

  return {
    professor,
    sortedRequests,
    recoveryRequests,
    threads,
    handleDecision,
    handleRecoveryDecision,
    handleSendMessage,
    handleProfessorSave,
  }
}
