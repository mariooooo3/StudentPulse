import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { DAYS } from '../../../shared/data/mockData'
import { createRecoveryRequest, getRecoveryRequestsForUser } from '../../../shared/services/professorPortal.service'
import { getTenantScope } from '../../../shared/utils/tenantScope.js'
import { staggerContainer, staggerItem } from '../schedule.constants'
import { STATUS_BADGE, buildSortedCombos, groupCombosByDay } from './scheduleHubParts.utils'
import RecoveryModal from './RecoveryModal'

function availColor(slot) {
  if (slot.isMine) return 'bg-indigo-600/40 border-indigo-400 text-indigo-300'
  const free = slot.total - slot.enrolled
  if (free === 0) return 'bg-rose-900/40 border-rose-700/50 text-rose-400'
  if (free <= 2) return 'bg-amber-900/40 border-amber-700/50 text-amber-300'
  return 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300'
}

function availLabel(slot, t) {
  if (slot.isMine) return t('schedule.recovery.mySlot')
  const free = slot.total - slot.enrolled
  if (free === 0) return t('schedule.recovery.full')
  return t('schedule.recovery.spots', { count: free })
}

function studentNameFromSession(session) {
  return session?.email?.split('@')[0]?.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || 'Student'
}

export default function RecoveryGrid({ recoverySlots, onNotify, session }) {
  const { t } = useTranslation()
  const [pendingModal, setPendingModal] = useState(null)
  const [confirmed, setConfirmed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`sc_recovery_${session?.userId}`) || '{}') } catch { return {} }
  })
  const [studentRequests, setStudentRequests] = useState([])

  const subjects = Object.keys(recoverySlots)
  const allCombos = buildSortedCombos(recoverySlots)
  const byDay = groupCombosByDay(allCombos)

  function getSlot(subject, combo) {
    const [day, start] = combo.split('|').map(Number)
    return recoverySlots[subject]?.find(s => s.day === day && s.start === start) || null
  }

  async function refreshRequests() {
    setStudentRequests(await getRecoveryRequestsForUser(session?.userId))
  }

  useEffect(() => {
    refreshRequests()
    function onChange() { refreshRequests() }
    window.addEventListener('sc:recovery-requests', onChange)
    return () => window.removeEventListener('sc:recovery-requests', onChange)
  }, [session?.userId])

  return (
    <motion.div className="p-5 sm:p-6 space-y-5" variants={staggerContainer} initial="hidden" animate="show">
      {studentRequests.length > 0 && (
        <motion.div variants={staggerItem} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">{t('schedule.recovery.yourRequests')}</p>
            <span className="chip">{studentRequests.length}</span>
          </div>
          <div className="space-y-2">
            {studentRequests.slice(0, 3).map(request => (
              <motion.div key={request.id} whileHover={{ y: -1 }} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.05] px-4 py-3 hover:border-white/[0.09] transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">{request.subject}</p>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5 font-mono">{t('schedule.recovery.group')} {request.group} · {request.room}</p>
                </div>
                <span className={clsx('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', STATUS_BADGE[request.status] ?? 'badge-amber')}>
                  {t(`schedule.recovery.status.${request.status || 'pending'}`)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="premium-card p-4 border-indigo-500/20 bg-indigo-500/[0.04]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-600/40 border border-indigo-400" />{t('schedule.recovery.mySlotLabel')}</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-900/40 border border-emerald-700/50" />{t('schedule.recovery.availableSlots')} <span className="text-slate-600">{t('schedule.recovery.clickToRecover')}</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-900/40 border border-amber-700/50" />{t('schedule.recovery.almostFull')} <span className="text-slate-600">{t('schedule.recovery.oneToTwo')}</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-900/40 border border-rose-700/50" />{t('schedule.recovery.fullLabel')}</div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#080e1c]">
        <table className="border-collapse w-full min-w-[700px]" style={{ tableLayout: 'auto' }}>
          <thead>
            <tr className="bg-white/[0.03]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 border-b border-r border-white/[0.06] w-48 sticky left-0 bg-[#080e1c] z-10">{t('schedule.recovery.subject')}</th>
              {Object.entries(byDay).map(([day, combos]) => (
                <th key={day} colSpan={combos.length} className="px-2 py-3 text-xs font-bold text-slate-300 border-b border-r border-white/[0.06] text-center">{DAYS[Number(day) - 1]}</th>
              ))}
            </tr>
            <tr className="bg-white/[0.01]">
              <th className="border-b border-r border-white/[0.05] sticky left-0 bg-[#080e1c] z-10" />
              {allCombos.map(combo => {
                const [, start] = combo.split('|').map(Number)
                return <th key={combo} className="px-3 py-2 text-[10px] font-semibold text-slate-600 border-b border-r border-white/[0.04] text-center whitespace-nowrap font-mono">{start}:00–{start + 2}:00</th>
              })}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj, ri) => (
              <tr key={subj} className={ri % 2 === 0 ? 'bg-[#070b14]' : 'bg-white/[0.01]'}>
                <td className="px-4 py-3 border-r border-white/[0.04] sticky left-0 bg-inherit z-10"><p className="text-xs font-semibold text-slate-200 max-w-[160px] leading-tight">{subj}</p></td>
                {allCombos.map(combo => {
                  const slot = getSlot(subj, combo)
                  const key = `${subj}|${combo}`
                  if (confirmed[key]) {
                    return <td key={combo} className="px-2 py-2 border-r border-white/[0.03] text-center"><div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-semibold"><Check size={10} /> {t('schedule.recovery.sent')}</div></td>
                  }
                  if (!slot) return <td key={combo} className="px-2 py-2 border-r border-white/[0.03]" />
                  const free = slot.total - slot.enrolled
                  const clickable = !slot.isMine && free > 0
                  return (
                    <td key={combo} className="px-2 py-2 border-r border-white/[0.04] text-center">
                      <button
                        onClick={() => clickable && setPendingModal({ slot, subject: subj, key })}
                        disabled={!clickable}
                        className={clsx('px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all duration-150 w-full font-mono', availColor(slot), clickable ? 'hover:brightness-125 cursor-pointer active:scale-95' : 'cursor-default')}
                        title={slot.isMine ? t('schedule.recovery.mySlotLabel') : `${slot.room} · ${t('schedule.recovery.group')} ${slot.group}`}
                      >
                        {availLabel(slot, t)}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {pendingModal && (
        <RecoveryModal
          slot={pendingModal.slot}
          subject={pendingModal.subject}
          onClose={() => setPendingModal(null)}
          onConfirm={async (reason) => {
            setConfirmed(p => {
              const next = { ...p, [pendingModal.key]: true }
              try { localStorage.setItem(`sc_recovery_${session?.userId}`, JSON.stringify(next)) } catch {}
              return next
            })
            await createRecoveryRequest({
              slot: pendingModal.slot,
              subject: pendingModal.subject,
              reason,
              student: {
                userId: session?.userId,
                email: session?.email,
                name: studentNameFromSession(session),
                facultyName: session?.detectedFaculty?.name || 'Facultatea de Matematica-Informatica',
                ...getTenantScope(null, session),
              },
            })
            await refreshRequests()
            onNotify?.({
              title: t('schedule.recovery.notifyTitle'),
              body: t('schedule.recovery.notifyBody', { subject: pendingModal.subject, group: pendingModal.slot.group, day: DAYS[pendingModal.slot.day - 1], time: pendingModal.slot.start }),
              type: 'info',
              action: 'schedule.recovery.requested',
              meta: { subject: pendingModal.subject, group: pendingModal.slot.group, room: pendingModal.slot.room },
            })
            setPendingModal(null)
          }}
        />
      )}
    </motion.div>
  )
}
