import { useEffect, useRef, useState } from 'react'
import { X, Check, Send, Zap, MessageSquare, Users, CalendarClock, GraduationCap, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DAYS, HOURS } from '../../../shared/data/mockData'
import { socketService } from '../../../shared/services/socket.service'
import { createRecoveryRequest, getRecoveryRequestsForUser } from '../../../shared/services/professorPortal.service'
import { getTenantScope } from '../../../shared/utils/tenantScope.js'
import { staggerContainer, staggerItem } from '../schedule.constants'
import clsx from 'clsx'

export function availColor(slot) {
  if (slot.isMine) return 'bg-indigo-600/40 border-indigo-400 text-indigo-300'
  const free = slot.total - slot.enrolled
  if (free === 0) return 'bg-rose-900/40 border-rose-700/50 text-rose-400'
  if (free <= 2)  return 'bg-amber-900/40 border-amber-700/50 text-amber-300'
  return 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300'
}
export function availLabel(slot) {
  if (slot.isMine) return 'ORA TA'
  const free = slot.total - slot.enrolled
  if (free === 0) return 'COMPLET'
  return `${free} locuri`
}

// ── Recovery Modal ────────────────────────────────────────────────────────────
export function RecoveryModal({ slot, subject, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bezel-card w-full max-w-md"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="bezel-inner">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <div>
                <p className="section-label mb-1">Cerere Recuperare</p>
                <h3 className="font-bold text-white text-base">{subject}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Grupa {slot.group}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.08] transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Zi',             DAYS[slot.day - 1]],
                  ['Interval',       `${slot.start}:00–${slot.end}:00`],
                  ['Sală',           slot.room],
                  ['Profesor',       slot.professor],
                  ['Locuri rămase',  `${slot.total - slot.enrolled}/${slot.total}`],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                    <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider mb-0.5">{k}</p>
                    <p className="text-xs font-semibold text-slate-200 font-mono">{v}</p>
                  </div>
                ))}
              </div>

              {/* Reason */}
              <div>
                <label className="section-label block mb-2">Motivul recuperării *</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="input-base w-full resize-none"
                  placeholder="Ex: Am absentat din motive medicale / suprapunere cu alt curs..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="btn-secondary flex-1">Anulează</button>
                <button
                  onClick={() => onConfirm(reason)}
                  disabled={!reason.trim()}
                  className={clsx(
                    'btn-primary flex-1 flex items-center justify-center gap-2',
                    !reason.trim() && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  <Send size={13} /> Trimite cerere
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Excel Recovery Grid ───────────────────────────────────────────────────────
export function studentNameFromSession(session) {
  return session?.email?.split('@')[0]?.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || 'Student'
}

const STATUS_BADGE = {
  accepted: 'badge-green',
  rejected: 'badge-red',
}
const STATUS_LABEL = {
  accepted: 'Aprobată',
  rejected: 'Respinsă',
}

export function RecoveryGrid({ recoverySlots, onNotify, session }) {
  const [pendingModal, setPendingModal] = useState(null)
  const [confirmed, setConfirmed]       = useState({})
  const [studentRequests, setStudentRequests] = useState([])

  const subjects = Object.keys(recoverySlots)

  const allCombos = [...new Set(
    Object.values(recoverySlots).flat().map(s => `${s.day}|${s.start}`)
  )].sort((a, b) => {
    const [da, sa] = a.split('|').map(Number)
    const [db, sb] = b.split('|').map(Number)
    return da !== db ? da - db : sa - sb
  })

  const byDay = {}
  allCombos.forEach(combo => {
    const [day] = combo.split('|')
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(combo)
  })

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
    <motion.div
      className="p-5 sm:p-6 space-y-5"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* My requests */}
      {studentRequests.length > 0 && (
        <motion.div variants={staggerItem} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Cererile tale de recuperare</p>
            <span className="chip">{studentRequests.length}</span>
          </div>
          <div className="space-y-2">
            {studentRequests.slice(0, 3).map(request => (
              <motion.div
                key={request.id}
                whileHover={{ y: -1 }}
                className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.05] px-4 py-3 hover:border-white/[0.09] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">{request.subject}</p>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5 font-mono">
                    Gr. {request.group} · {request.room}
                  </p>
                </div>
                <span className={clsx(
                  'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                  STATUS_BADGE[request.status] ?? 'badge-amber',
                )}>
                  {STATUS_LABEL[request.status] ?? 'În așteptare'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <motion.div variants={staggerItem} className="premium-card p-4 border-indigo-500/20 bg-indigo-500/[0.04]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-indigo-600/40 border border-indigo-400" />
            Ora ta curentă
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-900/40 border border-emerald-700/50" />
            Locuri disponibile <span className="text-slate-600">(click → recuperare)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-900/40 border border-amber-700/50" />
            Aproape plin <span className="text-slate-600">(1–2 loc.)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-900/40 border border-rose-700/50" />
            Complet
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div variants={staggerItem} className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#080e1c]">
        <table className="border-collapse w-full min-w-[700px]" style={{ tableLayout: 'auto' }}>
          <thead>
            <tr className="bg-white/[0.03]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 border-b border-r border-white/[0.06] w-48 sticky left-0 bg-[#080e1c] z-10">
                Materie
              </th>
              {Object.entries(byDay).map(([day, combos]) => (
                <th
                  key={day}
                  colSpan={combos.length}
                  className="px-2 py-3 text-xs font-bold text-slate-300 border-b border-r border-white/[0.06] text-center"
                >
                  {DAYS[Number(day) - 1]}
                </th>
              ))}
            </tr>
            <tr className="bg-white/[0.01]">
              <th className="border-b border-r border-white/[0.05] sticky left-0 bg-[#080e1c] z-10" />
              {allCombos.map(combo => {
                const [, start] = combo.split('|').map(Number)
                return (
                  <th key={combo} className="px-3 py-2 text-[10px] font-semibold text-slate-600 border-b border-r border-white/[0.04] text-center whitespace-nowrap font-mono">
                    {start}:00–{start + 2}:00
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj, ri) => (
              <tr key={subj} className={ri % 2 === 0 ? 'bg-[#070b14]' : 'bg-white/[0.01]'}>
                <td className="px-4 py-3 border-r border-white/[0.04] sticky left-0 bg-inherit z-10">
                  <p className="text-xs font-semibold text-slate-200 max-w-[160px] leading-tight">{subj}</p>
                </td>
                {allCombos.map(combo => {
                  const slot = getSlot(subj, combo)
                  const key  = `${subj}|${combo}`
                  if (confirmed[key]) {
                    return (
                      <td key={combo} className="px-2 py-2 border-r border-white/[0.03] text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-semibold">
                          <Check size={10} /> Trimis
                        </div>
                      </td>
                    )
                  }
                  if (!slot) {
                    return <td key={combo} className="px-2 py-2 border-r border-white/[0.03]" />
                  }
                  const free = slot.total - slot.enrolled
                  const clickable = !slot.isMine && free > 0
                  return (
                    <td key={combo} className="px-2 py-2 border-r border-white/[0.04] text-center">
                      <button
                        onClick={() => clickable && setPendingModal({ slot, subject: subj, key })}
                        disabled={!clickable}
                        className={clsx(
                          'px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all duration-150 w-full font-mono',
                          availColor(slot),
                          clickable
                            ? 'hover:brightness-125 cursor-pointer active:scale-95'
                            : 'cursor-default',
                        )}
                        title={slot.isMine ? 'Ora ta curentă' : `${slot.room} · Gr. ${slot.group}`}
                      >
                        {availLabel(slot)}
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
            setConfirmed(p => ({ ...p, [pendingModal.key]: true }))
            await createRecoveryRequest({
              slot: pendingModal.slot,
              subject: pendingModal.subject,
              reason,
                student: {
                  userId:      session?.userId,
                  email:       session?.email,
                  name:        studentNameFromSession(session),
                  facultyName: session?.detectedFaculty?.name || 'Facultatea de Matematica-Informatica',
                  ...getTenantScope(null, session),
                },
            })
            await refreshRequests()
            onNotify?.({
              title:  'Cerere recuperare trimisă',
              body:   `${pendingModal.subject} - grupa ${pendingModal.slot.group}, ${DAYS[pendingModal.slot.day - 1]} ${pendingModal.slot.start}:00.`,
              type:   'info',
              action: 'schedule.recovery.requested',
              meta: {
                subject: pendingModal.subject,
                group:   pendingModal.slot.group,
                room:    pendingModal.slot.room,
              },
            })
            setPendingModal(null)
          }}
        />
      )}
    </motion.div>
  )
}

// ── Slot Swap System ──────────────────────────────────────────────────────────
export function SlotSwapView({ recoverySlots, swapRequests, userId, onNotify }) {
  const [swapOffer, setSwapOffer] = useState(null)
  const [swapWant,  setSwapWant]  = useState(null)
  const [message,   setMessage]   = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [matchAccepted, setMatchAccepted] = useState({})

  function mySlots() {
    return Object.entries(recoverySlots).flatMap(([subj, slots]) =>
      slots.filter(s => s.isMine).map(s => ({ subject: subj, slot: s }))
    )
  }

  function otherSlots(subject) {
    return recoverySlots[subject]?.filter(s => !s.isMine) || []
  }

  return (
    <motion.div
      className="p-5 sm:p-6 space-y-5"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Info banner */}
      <motion.div variants={staggerItem} className="premium-card p-4 border-violet-500/25 bg-violet-500/[0.04]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <ArrowLeftRight size={14} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-300 mb-1">Swap automat — chiar și fără locuri</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Propune un schimb cu un alt student. Dacă cerințele corespund, sistemul acceptă automat —
              fără intervenție manuală. Ideal pentru când slotul dorit e complet dar altcineva vrea exact ce oferi tu.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Existing matches */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-3">
          <p className="section-label flex items-center gap-2">
            <Zap size={12} className="text-amber-400" /> Match-uri disponibile
          </p>
          <span className="chip">{swapRequests.length}</span>
        </div>
        <div className="space-y-3">
          {swapRequests.length === 0 && (
            <div className="glass-card p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                <Repeat2 size={20} className="text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-400">Niciun match disponibil</p>
              <p className="text-xs text-slate-600 mt-1">Propune un swap mai jos pentru a găsi studenți compatibili.</p>
            </div>
          )}
          {swapRequests.map(req => (
            <motion.div
              key={req.id}
              variants={staggerItem}
              whileHover={{ y: -2 }}
              className={clsx(
                'premium-card p-4',
                req.isMatch && 'border-indigo-500/30 bg-indigo-500/[0.04]',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-indigo-500/20">
                    {req.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-200">{req.name}</p>
                      {req.isMatch && (
                        <span className="badge-blue text-[9px] py-0.5 px-1.5 flex items-center gap-0.5 uppercase">
                          <Zap size={8} /> MATCH
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{req.offersSubject}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-300 font-mono">
                        Oferă: {DAYS[req.offersSlot.day - 1]} {req.offersSlot.start}:00 · Gr.{req.offersSlot.group}
                      </span>
                      <ArrowLeftRight size={11} className="text-slate-600" />
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono">
                        Vrea: {DAYS[req.wantsSlot.day - 1]} {req.wantsSlot.start}:00 · Gr.{req.wantsSlot.group}
                      </span>
                    </div>
                    {req.message && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                        <MessageSquare size={10} /> {req.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0">
                  {matchAccepted[req.id] ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                      <Check size={13} /> Acceptat!
                    </div>
                  ) : req.isMatch ? (
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setMatchAccepted(p => ({ ...p, [req.id]: true }))}
                      className="btn-primary text-xs flex items-center gap-1.5"
                    >
                      <Check size={13} /> Acceptă swap
                    </motion.button>
                  ) : (
                    <span className="text-xs text-slate-600 font-medium">Incompatibil</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Propose new swap */}
      <motion.div variants={staggerItem}>
        <p className="section-label mb-3">Propune un swap nou</p>
        {submitted ? (
          <motion.div
            {...fadeUp}
            className="glass-card p-8 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-emerald-400" />
            </div>
            <p className="font-bold text-white text-base mb-1">Cerere postată!</p>
            <p className="text-sm text-slate-400 mb-5 max-w-xs mx-auto leading-relaxed">
              Dacă un alt student are cerere compatibilă, swapul se acceptă automat.
            </p>
            <button
              onClick={() => { setSubmitted(false); setSwapOffer(null); setSwapWant(null); setMessage('') }}
              className="btn-secondary text-xs"
            >
              Propune alt swap
            </button>
          </motion.div>
        ) : (
          <div className="glass-card p-5 space-y-5">
            {/* Step 1 */}
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600/30 text-indigo-400 text-[9px] font-bold mr-1.5">1</span>
                Alege ora pe care o oferi (a ta actuală)
              </p>
              <div className="grid gap-2">
                {mySlots().map(({ subject, slot }) => (
                  <motion.button
                    key={subject + slot.day + slot.start}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSwapOffer({ subject, slot })}
                    className={clsx(
                      'flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all',
                      swapOffer?.subject === subject
                        ? 'bg-indigo-600/15 border-indigo-500/50'
                        : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]',
                    )}
                  >
                    <div className={clsx(
                      'w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-all',
                      swapOffer?.subject === subject ? 'border-indigo-500 bg-indigo-500' : 'border-white/[0.2]',
                    )} />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{subject}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {DAYS[slot.day - 1]} {slot.start}:00–{slot.end}:00 · {slot.room} · Gr.{slot.group}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <AnimatePresence>
              {swapOffer && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                  <div className="gradient-separator mb-5" />
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-violet-600/30 text-violet-400 text-[9px] font-bold mr-1.5">2</span>
                    Alege ora pe care o vrei în schimb
                  </p>
                  <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                    {otherSlots(swapOffer.subject).map(slot => {
                      const free = slot.total - slot.enrolled
                      return (
                        <motion.button
                          key={slot.day + '|' + slot.start}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSwapWant(slot)}
                          className={clsx(
                            'flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all',
                            swapWant === slot
                              ? 'bg-violet-600/15 border-violet-500/50'
                              : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]',
                          )}
                        >
                          <div className={clsx(
                            'w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-all',
                            swapWant === slot ? 'border-violet-500 bg-violet-500' : 'border-white/[0.2]',
                          )} />
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-200 font-semibold font-mono">
                              {DAYS[slot.day - 1]} {slot.start}:00–{slot.end}:00 · {slot.room} · Gr.{slot.group}
                            </p>
                            <p className="text-[9px] text-slate-600 mt-0.5">{slot.professor}</p>
                          </div>
                          <span className={clsx(
                            'text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide',
                            free === 0 ? 'bg-rose-900/50 text-rose-400' : free <= 2 ? 'bg-amber-900/50 text-amber-400' : 'bg-emerald-900/50 text-emerald-400',
                          )}>
                            {free === 0 ? 'COMPLET' : `${free} loc.`}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3 */}
            <AnimatePresence>
              {swapOffer && swapWant && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                  <div className="gradient-separator mb-5" />
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[9px] font-bold mr-1.5">3</span>
                    Mesaj opțional
                  </p>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="input-base w-full resize-none"
                    placeholder="Ex: Marțea nu pot, am practică..."
                  />
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const request = {
                        userId,
                        course:     swapOffer.subject,
                        offerSlot:  `${DAYS[swapOffer.slot.day - 1]} ${swapOffer.slot.start}:00 Gr.${swapOffer.slot.group}`,
                        needSlot:   `${DAYS[swapWant.day - 1]} ${swapWant.start}:00 Gr.${swapWant.group}`,
                        message,
                      }
                      socketService.submitSwap(request)
                        .then(result => {
                          if (!result?.matched) return
                          onNotify?.({
                            title:  'Swap acceptat automat',
                            body:   `Ai primit match pentru ${swapOffer.subject}.`,
                            type:   'success',
                            action: 'schedule.swap.match',
                            meta:   result.match,
                          })
                        })
                        .catch(() => {
                          onNotify?.({
                            title:  'Swap salvat local',
                            body:   'Serverul realtime nu a confirmat cererea, dar formularul ramane marcat ca trimis.',
                            type:   'warning',
                            action: 'schedule.swap.offline',
                          })
                        })
                      setSubmitted(true)
                    }}
                    className="btn-primary w-full mt-3 flex items-center justify-center gap-2 text-sm"
                  >
                    <Send size={14} /> Postează cererea de swap
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Weekly View ───────────────────────────────────────────────────────────────
export const ROW_H = 52

// Color-coded border per course type
export const COURSE_TYPE_BORDER = {
  'Curs':       'border-l-indigo-500',
  'Seminar':    'border-l-emerald-500',
  'Laborator':  'border-l-amber-500',
  'Practică':   'border-l-rose-500',
}

export function WeeklyView({ schedule }) {
  return (
    <motion.div
      className="flex overflow-x-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Hour labels */}
      <div className="shrink-0 w-14 border-r border-white/[0.06]">
        <div className="h-10 border-b border-white/[0.05]" />
        {HOURS.map(h => (
          <div
            key={h}
            className="border-b border-white/[0.03] text-right pr-2 text-[10px] text-slate-600 font-mono flex items-start justify-end pt-1"
            style={{ height: ROW_H }}
          >
            {h}:00
          </div>
        ))}
      </div>

      {/* Day columns */}
      {DAYS.map((day, di) => {
        const dayCourses = schedule.filter(c => c.day === di + 1)
        return (
          <div key={day} className="flex-1 min-w-[120px] relative border-r border-white/[0.04] last:border-r-0">
            {/* Day header */}
            <div className="h-10 border-b border-white/[0.05] flex items-center justify-center sticky top-0 bg-[#070b14] z-10">
              <span className={clsx(
                'text-xs font-semibold tracking-wide',
                di === 0 ? 'text-indigo-400' : 'text-slate-400',
              )}>
                {day}
              </span>
            </div>

            {/* Grid + events */}
            <div className="relative" style={{ height: HOURS.length * ROW_H }}>
              {HOURS.map(h => (
                <div
                  key={h}
                  className="border-b border-white/[0.03] absolute left-0 right-0"
                  style={{ top: (h - 8) * ROW_H, height: ROW_H }}
                />
              ))}

              {dayCourses.map(c => {
                const borderClass = COURSE_TYPE_BORDER[c.type] || 'border-l-indigo-500'
                return (
                  <motion.div
                    key={c.id}
                    whileHover={{ scale: 1.02, y: -1 }}
                    className={clsx(
                      'absolute left-1 right-1 rounded-lg border-l-2 px-2 py-1.5 overflow-hidden cursor-pointer transition-all',
                      borderClass,
                      c.color,
                    )}
                    style={{
                      top:    (c.start - 8) * ROW_H + 2,
                      height: (c.end - c.start) * ROW_H - 4,
                    }}
                  >
                    <p className="text-[10px] font-bold text-white truncate">{c.short}</p>
                    <p className="text-[9px] text-white/70 truncate font-mono">{c.room}</p>
                    {(c.end - c.start) > 1 && (
                      <p className="text-[9px] text-white/50 truncate mt-0.5">{c.type}</p>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}

// ── All Groups View ───────────────────────────────────────────────────────────
export function AllGroupsView({ schedule }) {
  const [search, setSearch] = useState('')

  const groupMap = {}
  schedule.forEach(c => {
    const grp = c.group || 'A1'
    if (!groupMap[grp]) groupMap[grp] = []
    groupMap[grp].push({ name: c.short, day: DAYS[c.day - 1], time: `${c.start}:00–${c.end}:00`, room: c.room })
  })
  const ALL_GROUPS = Object.entries(groupMap).map(([group, courses]) => ({ group, courses }))

  const filtered = ALL_GROUPS.filter(g =>
    g.group.toLowerCase().includes(search.toLowerCase()) ||
    g.courses.some(c => c.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <motion.div
      className="p-5 sm:p-6 space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
    >
      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Caută materie sau grupă..."
        className="input-base w-full"
      />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
            <Users size={20} className="text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-400">Nicio grupă găsită</p>
          <p className="text-xs text-slate-600 mt-1">Încearcă alt termen de căutare.</p>
        </div>
      ) : (
        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {filtered.map(g => (
            <motion.div
              key={g.group}
              variants={staggerItem}
              whileHover={{ y: -2 }}
              className="glass-card p-4"
            >
              {/* Group header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-300">{g.group}</span>
                </div>
                <span className="text-sm font-semibold text-slate-200">Grupa {g.group}</span>
                <span className="chip ml-auto">{g.courses.length}</span>
              </div>

              {/* Course list */}
              <div className="space-y-1.5">
                {g.courses.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.04] rounded-lg px-3 py-2 hover:border-white/[0.07] transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-200 w-12 shrink-0">{c.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{c.day} {c.time}</span>
                    <span className="text-[11px] text-slate-600 ml-auto font-mono">{c.room}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

/* ─── ExamMapView ─────────────────────────────────────────────────────────── */
export function ExamMapView({ exams }) {
  const now = new Date()
  const sorted = [...exams].sort((a, b) => a.date - b.date)

  if (!sorted.length) {
    return (
      <motion.div className="flex flex-col items-center justify-center py-24 text-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
          <CalendarClock size={24} className="text-indigo-400" strokeWidth={1.75} />
        </div>
        <p className="text-white font-bold mb-1">Nicio sesiune detectată</p>
        <p className="text-slate-500 text-sm">Datele de examen apar automat din orarul tău.</p>
      </motion.div>
    )
  }

  return (
    <motion.div className="p-4 sm:p-6 space-y-3" variants={staggerContainer} initial="hidden" animate="show">
      <div className="flex items-center gap-2 mb-1">
        <CalendarClock size={14} className="text-indigo-400" strokeWidth={1.75} />
        <p className="section-label">Sesiune · Iunie 2026</p>
      </div>
      {sorted.map(exam => {
        const daysLeft = Math.ceil((exam.date - now) / 86400000)
        const isPast = daysLeft < 0
        const urgency = isPast ? 'past' : daysLeft <= 2 ? 'urgent' : daysLeft <= 7 ? 'soon' : 'ok'
        const cardCls = {
          past:   'border-white/[0.04] bg-white/[0.01] opacity-50',
          urgent: 'border-rose-500/25 bg-rose-500/[0.04]',
          soon:   'border-amber-500/25 bg-amber-500/[0.04]',
          ok:     'border-white/[0.06] bg-white/[0.02]',
        }[urgency]
        const pillCls = {
          past:   'text-slate-500 bg-slate-800/60',
          urgent: 'text-rose-300 bg-rose-500/15 border border-rose-500/30',
          soon:   'text-amber-300 bg-amber-500/15 border border-amber-500/30',
          ok:     'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30',
        }[urgency]
        const pillLabel = isPast ? 'Trecut' : daysLeft === 0 ? 'Azi' : daysLeft === 1 ? 'Mâine' : `${daysLeft} zile`

        return (
          <motion.div key={exam.id} variants={staggerItem} className={`relative rounded-xl border p-4 transition-all ${cardCls}`}>
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: exam.accent }} />
            <div className="pl-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-sm">{exam.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400">{exam.type}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-slate-500">
                  <span>{exam.date.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  <span>ora {exam.time}</span>
                  <span>{exam.room}</span>
                  <span className="hidden sm:inline">{exam.professor}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${pillCls}`}>{pillLabel}</span>
                <span className="text-[10px] text-slate-600">{exam.credits} ECTS</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/* ─── GradeCalculatorView ────────────────────────────────────────────────── */
export function GradeCalculatorView({ exams, session }) {
  const storageKey = `sc_grades_${session?.email || 'guest'}`

  const [grades, setGrades] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') }
    catch { return {} }
  })

  useEffect(() => {
    try { setGrades(JSON.parse(localStorage.getItem(storageKey) || '{}')) }
    catch { setGrades({}) }
  }, [storageKey])

  function updateGrade(name, raw) {
    const next = { ...grades, [name]: raw }
    setGrades(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const subjects = exams.map(e => ({ ...e, grade: parseFloat(grades[e.name]) || null }))
  const graded = subjects.filter(s => s.grade !== null && s.grade >= 1 && s.grade <= 10)
  const totalEcts = subjects.reduce((sum, s) => sum + s.credits, 0)
  const gradedEcts = graded.reduce((sum, s) => sum + s.credits, 0)
  const average = graded.length ? graded.reduce((sum, s) => sum + s.grade * s.credits, 0) / gradedEcts : null
  const avgColor = average === null ? 'text-slate-500' : average >= 8.5 ? 'text-emerald-300' : average >= 5 ? 'text-amber-300' : 'text-rose-300'

  if (!subjects.length) {
    return (
      <motion.div className="flex flex-col items-center justify-center py-24 text-center px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
          <GraduationCap size={24} className="text-indigo-400" strokeWidth={1.75} />
        </div>
        <p className="text-white font-bold mb-1">Nicio materie detectată</p>
        <p className="text-slate-500 text-sm">Materiile apar automat din orarul tău.</p>
      </motion.div>
    )
  }

  return (
    <motion.div className="p-4 sm:p-6 space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className={`text-2xl font-black ${avgColor}`}>{average ? average.toFixed(2) : '—'}</p>
          <p className="text-[11px] text-slate-500 mt-1">Medie ponderată</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-2xl font-black text-white">
            {gradedEcts}<span className="text-sm font-semibold text-slate-500">/{totalEcts}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">ECTS completate</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-2xl font-black text-white">
            {graded.length}<span className="text-sm font-semibold text-slate-500">/{subjects.length}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Note introduse</p>
        </div>
      </div>

      {/* Progress bar */}
      {graded.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progres sesiune</span>
            <span>{Math.round(gradedEcts / totalEcts * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${gradedEcts / totalEcts * 100}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 18 }}
            />
          </div>
        </div>
      )}

      {/* Subjects */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={13} className="text-slate-500" strokeWidth={1.75} />
          <p className="section-label">Note per materie</p>
        </div>
        {subjects.map(s => {
          const g = s.grade
          const inputCls = g === null ? 'text-slate-300' : g >= 5 ? 'text-emerald-300' : 'text-rose-300'
          return (
            <div key={s.name} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: s.accent }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                <p className="text-xs text-slate-500">{s.type} · {s.credits} ECTS</p>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={grades[s.name] || ''}
                onChange={e => updateGrade(s.name, e.target.value)}
                placeholder="—"
                className={`w-16 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm font-bold text-center outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-600 ${inputCls}`}
              />
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
