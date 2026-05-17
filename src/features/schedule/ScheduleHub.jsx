import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeftRight, X, Check, Send, Zap, MessageSquare } from 'lucide-react'
import { DAYS, HOURS } from '../../shared/data/mockData'
import { getScheduleData } from '../../shared/data/facultyCatalog'
import { useNotifications } from '../../shared/hooks/useNotifications'
import { socketService } from '../../shared/services/socket.service'
import clsx from 'clsx'

const TABS = ['Orarul Meu', 'Toate Grupele', 'Recuperări', 'Slot Swap']

// ── Availability helpers ──────────────────────────────────────────────────────
function availColor(slot) {
  if (slot.isMine) return 'bg-indigo-600/40 border-indigo-400 text-indigo-300'
  const free = slot.total - slot.enrolled
  if (free === 0) return 'bg-red-900/40 border-red-700/50 text-red-400'
  if (free <= 2) return 'bg-amber-900/40 border-amber-700/50 text-amber-300'
  return 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300'
}
function availLabel(slot) {
  if (slot.isMine) return 'ORAR TĂU'
  const free = slot.total - slot.enrolled
  if (free === 0) return 'COMPLET'
  return `${free} locuri`
}

// ── Recovery Modal ────────────────────────────────────────────────────────────
function RecoveryModal({ slot, subject, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/[0.1] to-white/[0.03] w-full max-w-md" onClick={e => e.stopPropagation()}>
      <div className="rounded-[calc(1rem-1px)] bg-[#0c1120] border border-white/[0.05]">
        <div className="p-6 border-b border-white/[0.05]">
          <h3 className="font-bold text-white">Cerere Recuperare</h3>
          <p className="text-sm text-slate-400 mt-1">{subject} — Grupa {slot.group}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[['Zi', DAYS[slot.day - 1]], ['Interval', `${slot.start}:00–${slot.end}:00`],
              ['Sală', slot.room], ['Profesor', slot.professor],
              ['Locuri rămase', `${slot.total - slot.enrolled}/${slot.total}`]].map(([k, v]) => (
              <div key={k} className="bg-white/[0.04] rounded-lg p-2.5">
                <p className="text-[9px] text-slate-600 uppercase font-semibold">{k}</p>
                <p className="text-xs text-slate-200 font-medium">{v}</p>
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Motivul recuperării *
            </label>
            <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 resize-none"
              placeholder="Ex: Am absentat din motive medicale / suprapunere cu alt curs..." />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Anulează</button>
            <button onClick={() => onConfirm(reason)} disabled={!reason.trim()}
              className={clsx('btn-primary flex-1 flex items-center justify-center gap-2', !reason.trim() && 'opacity-40 cursor-not-allowed')}>
              <Send size={14} /> Trimite cerere
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

// ── Excel Recovery Grid ───────────────────────────────────────────────────────
function RecoveryGrid({ recoverySlots, onNotify }) {
  const [pendingModal, setPendingModal] = useState(null)
  const [confirmed, setConfirmed] = useState({})

  const subjects = Object.keys(recoverySlots)

  // Collect all unique day+time combos and sort
  const allCombos = [...new Set(
    Object.values(recoverySlots).flat().map(s => `${s.day}|${s.start}`)
  )].sort((a, b) => {
    const [da, sa] = a.split('|').map(Number)
    const [db, sb] = b.split('|').map(Number)
    return da !== db ? da - db : sa - sb
  })

  // Group combos by day
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

  return (
    <div className="p-4 space-y-4">
      <div className="glass-card p-4 border-indigo-500/20 bg-indigo-500/5">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-600/40 border border-indigo-400" /> Ora ta curentă</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-900/40 border border-emerald-700/50" /> Locuri disponibile (click → recuperare)</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-900/40 border border-amber-700/50" /> Aproape plin (1-2 loc.)</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-900/40 border border-red-700/50" /> Complet</div>
        </div>
      </div>

      {/* Grid container */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="border-collapse w-full min-w-[700px]" style={{ tableLayout: 'auto' }}>
          <thead>
            {/* Day header row */}
            <tr className="bg-white/[0.04]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 border-b border-r border-white/[0.05] w-48 sticky left-0 bg-[#0c1120] z-10">
                Materie
              </th>
              {Object.entries(byDay).map(([day, combos]) => (
                <th key={day} colSpan={combos.length}
                  className="px-2 py-3 text-xs font-bold text-slate-300 border-b border-r border-white/[0.05] text-center bg-white/[0.02]">
                  {DAYS[Number(day) - 1]}
                </th>
              ))}
            </tr>
            {/* Time sub-header row */}
            <tr className="bg-white/[0.02]">
              <th className="border-b border-r border-white/[0.05] sticky left-0 bg-[#0c1120] z-10" />
              {allCombos.map(combo => {
                const [, start] = combo.split('|').map(Number)
                return (
                  <th key={combo} className="px-3 py-2 text-[10px] font-semibold text-slate-500 border-b border-r border-white/[0.04] text-center whitespace-nowrap">
                    {start}:00–{start + 2}:00
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj, ri) => (
              <tr key={subj} className={ri % 2 === 0 ? 'bg-[#070b14]' : 'bg-white/[0.01]'}>
                {/* Subject label */}
                <td className="px-4 py-3 border-r border-white/[0.04] sticky left-0 bg-inherit z-10">
                  <p className="text-xs font-semibold text-slate-200 max-w-[160px] leading-tight">{subj}</p>
                </td>
                {/* Cells */}
                {allCombos.map(combo => {
                  const slot = getSlot(subj, combo)
                  const key = `${subj}|${combo}`
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
                    <td key={combo} className="px-2 py-2 border-r border-slate-700/20 text-center">
                      <button
                        onClick={() => clickable && setPendingModal({ slot, subject: subj, key })}
                        disabled={!clickable}
                        className={clsx(
                          'px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all duration-150 w-full',
                          availColor(slot),
                          clickable ? 'hover:brightness-125 cursor-pointer active:scale-95' : 'cursor-default',
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
      </div>

      {pendingModal && (
        <RecoveryModal
          slot={pendingModal.slot}
          subject={pendingModal.subject}
          onClose={() => setPendingModal(null)}
          onConfirm={() => {
            setConfirmed(p => ({ ...p, [pendingModal.key]: true }))
            onNotify?.({
              title: 'Cerere recuperare trimisa',
              body: `${pendingModal.subject} - grupa ${pendingModal.slot.group}, ${DAYS[pendingModal.slot.day - 1]} ${pendingModal.slot.start}:00.`,
              type: 'info',
              action: 'schedule.recovery.requested',
              meta: {
                subject: pendingModal.subject,
                group: pendingModal.slot.group,
                room: pendingModal.slot.room,
              },
            })
            setPendingModal(null)
          }}
        />
      )}
    </div>
  )
}

// ── Slot Swap System ──────────────────────────────────────────────────────────
function SlotSwapView({ recoverySlots, swapRequests, userId, onNotify }) {
  const [swapOffer, setSwapOffer] = useState(null)  // { subject, slot }
  const [swapWant, setSwapWant]   = useState(null)
  const [message, setMessage]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [matchAccepted, setMatchAccepted] = useState({})

  const subjects = Object.keys(recoverySlots)

  function mySlots() {
    return Object.entries(recoverySlots).flatMap(([subj, slots]) =>
      slots.filter(s => s.isMine).map(s => ({ subject: subj, slot: s }))
    )
  }

  function otherSlots(subject) {
    return recoverySlots[subject]?.filter(s => !s.isMine) || []
  }

  return (
    <div className="p-4 space-y-5">
      {/* Info */}
      <div className="glass-card p-4 border-violet-500/20 bg-violet-500/5">
        <div className="flex items-start gap-3">
          <ArrowLeftRight size={16} className="text-violet-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-violet-300 mb-1">Swap automat — chiar și fără locuri</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Propune un schimb cu un alt student. Dacă cerințele corespund, sistemul acceptă automat —
              fără intervenție manuală. Ideal pentru când slotul dorit e complet dar altcineva vrea exact ce oferi tu.
            </p>
          </div>
        </div>
      </div>

      {/* Match-uri existente */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap size={13} className="text-amber-400" /> Match-uri disponibile
        </p>
        <div className="space-y-2">
          {swapRequests.map(req => (
            <div key={req.id} className={clsx('glass-card p-4', req.isMatch && 'border-indigo-500/30 bg-indigo-500/5')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {req.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-200">{req.name}</p>
                      {req.isMatch && <span className="badge-blue text-[9px] py-0 px-1.5 flex items-center gap-0.5"><Zap size={8} /> MATCH</span>}
                    </div>
                    <p className="text-xs text-slate-500 mb-1.5">{req.offersSubject}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-300">
                        Oferă: {DAYS[req.offersSlot.day - 1]} {req.offersSlot.start}:00 · Gr.{req.offersSlot.group}
                      </span>
                      <ArrowLeftRight size={12} className="text-slate-600" />
                      <span className="px-2 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
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
                <div className="shrink-0">
                  {matchAccepted[req.id] ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <Check size={13} /> Acceptat!
                    </div>
                  ) : req.isMatch ? (
                    <button
                      onClick={() => setMatchAccepted(p => ({ ...p, [req.id]: true }))}
                      className="btn-primary text-xs flex items-center gap-1.5">
                      <Check size={13} /> Acceptă swap
                    </button>
                  ) : (
                    <span className="text-xs text-slate-600">Incompatibil</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create new swap request */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Propune un swap nou</p>
        {submitted ? (
          <div className="glass-card p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-emerald-400" />
            </div>
            <p className="font-semibold text-white mb-1">Cerere postată!</p>
            <p className="text-sm text-slate-400 mb-4">Dacă un alt student are cerere compatibilă, swapul se acceptă automat.</p>
            <button onClick={() => { setSubmitted(false); setSwapOffer(null); setSwapWant(null); setMessage('') }}
              className="btn-secondary text-xs">Propune alt swap</button>
          </div>
        ) : (
          <div className="glass-card p-5 space-y-4">
            {/* Step 1 */}
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-2">1. Alege ora pe care o oferi (a ta actuală)</p>
              <div className="grid gap-2">
                {mySlots().map(({ subject, slot }) => (
                  <button key={subject + slot.day + slot.start}
                    onClick={() => setSwapOffer({ subject, slot })}
                    className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all',
                      swapOffer?.subject === subject ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-white/[0.03] border-white/[0.05] hover:border-white/[0.1]')}>
                    <div className={clsx('w-3 h-3 rounded-full border-2 shrink-0', swapOffer?.subject === subject ? 'border-indigo-500 bg-indigo-500' : 'border-white/[0.2]')} />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{subject}</p>
                      <p className="text-[10px] text-slate-500">{DAYS[slot.day - 1]} {slot.start}:00–{slot.end}:00 · {slot.room} · Gr.{slot.group}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            {swapOffer && (
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-2">2. Alege ora pe care o vrei în schimb</p>
                <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                  {otherSlots(swapOffer.subject).map(slot => {
                    const free = slot.total - slot.enrolled
                    return (
                      <button key={slot.day + '|' + slot.start}
                        onClick={() => setSwapWant(slot)}
                        className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all',
                          swapWant === slot ? 'bg-violet-600/20 border-violet-500/50' : 'bg-white/[0.03] border-white/[0.05] hover:border-white/[0.1]')}>
                        <div className={clsx('w-3 h-3 rounded-full border-2 shrink-0', swapWant === slot ? 'border-violet-500 bg-violet-500' : 'border-white/[0.2]')} />
                        <div className="flex-1">
                          <p className="text-[10px] text-slate-200 font-medium">{DAYS[slot.day - 1]} {slot.start}:00–{slot.end}:00 · {slot.room} · Gr.{slot.group}</p>
                          <p className="text-[9px] text-slate-600">{slot.professor}</p>
                        </div>
                        <span className={clsx('text-[9px] font-semibold px-1.5 py-0.5 rounded',
                          free === 0 ? 'bg-red-900/50 text-red-400' : free <= 2 ? 'bg-amber-900/50 text-amber-400' : 'bg-emerald-900/50 text-emerald-400')}>
                          {free === 0 ? 'COMPLET' : `${free} loc.`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {swapOffer && swapWant && (
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-2">3. Mesaj opțional</p>
                <textarea rows={2} value={message} onChange={e => setMessage(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 resize-none"
                  placeholder="Ex: Marțea nu pot, am practică..." />
                <button onClick={() => {
                  const request = {
                    userId,
                    course: swapOffer.subject,
                    offerSlot: `${DAYS[swapOffer.slot.day - 1]} ${swapOffer.slot.start}:00 Gr.${swapOffer.slot.group}`,
                    needSlot: `${DAYS[swapWant.day - 1]} ${swapWant.start}:00 Gr.${swapWant.group}`,
                    message,
                  }
                  socketService.submitSwap(request)
                    .then(result => {
                      if (!result?.matched) return
                      onNotify?.({
                        title: 'Swap acceptat automat',
                        body: `Ai primit match pentru ${swapOffer.subject}.`,
                        type: 'success',
                        action: 'schedule.swap.match',
                        meta: result.match,
                      })
                    })
                    .catch(() => {
                      onNotify?.({
                        title: 'Swap salvat local',
                        body: 'Serverul realtime nu a confirmat cererea, dar formularul ramane marcat ca trimis.',
                        type: 'warning',
                        action: 'schedule.swap.offline',
                      })
                    })
                  setSubmitted(true)
                }}
                  className="btn-primary w-full mt-3 flex items-center justify-center gap-2 text-sm">
                  <Send size={14} /> Postează cererea de swap
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Weekly View ───────────────────────────────────────────────────────────────
const ROW_H = 52

function WeeklyView({ schedule }) {
  return (
    <div className="flex overflow-x-auto">
      <div className="shrink-0 w-14 border-r border-white/[0.05]">
        <div className="h-10 border-b border-white/[0.05]" />
        {HOURS.map(h => (
          <div key={h} className="border-b border-white/[0.03] text-right pr-2 text-[10px] text-slate-600 flex items-start justify-end pt-1" style={{ height: ROW_H }}>
            {h}:00
          </div>
        ))}
      </div>
      {DAYS.map((day, di) => {
        const dayCourses = schedule.filter(c => c.day === di + 1)
        return (
          <div key={day} className="flex-1 min-w-[120px] relative border-r border-white/[0.04] last:border-r-0">
            <div className="h-10 border-b border-white/[0.05] flex items-center justify-center sticky top-0 bg-[#070b14] z-10">
              <span className={clsx('text-xs font-semibold', di === 0 ? 'text-indigo-400' : 'text-slate-400')}>{day}</span>
            </div>
            <div className="relative" style={{ height: HOURS.length * ROW_H }}>
              {HOURS.map(h => <div key={h} className="border-b border-white/[0.03] absolute left-0 right-0" style={{ top: (h - 8) * ROW_H, height: ROW_H }} />)}
              {dayCourses.map(c => (
                <div key={c.id}
                  className={clsx('absolute left-1 right-1 rounded-lg border-l-2 px-2 py-1.5 overflow-hidden cursor-pointer hover:brightness-110 transition-all', c.color)}
                  style={{ top: (c.start - 8) * ROW_H + 2, height: (c.end - c.start) * ROW_H - 4 }}>
                  <p className="text-[10px] font-bold text-white truncate">{c.short}</p>
                  <p className="text-[9px] text-white/70 truncate">{c.room}</p>
                  {(c.end - c.start) > 1 && <p className="text-[9px] text-white/60 truncate mt-0.5">{c.type}</p>}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── All Groups View ───────────────────────────────────────────────────────────
function AllGroupsView({ schedule }) {
  const [search, setSearch] = useState('')

  // Derive groups dynamically from the schedule data
  const groupMap = {}
  schedule.forEach(c => {
    const grp = c.group || 'A1'
    if (!groupMap[grp]) groupMap[grp] = []
    groupMap[grp].push({ name: c.short, day: DAYS[c.day - 1], time: `${c.start}:00–${c.end}:00`, room: c.room })
  })
  const ALL_GROUPS = Object.entries(groupMap).map(([group, courses]) => ({ group, courses }))

  const filtered = ALL_GROUPS.length > 0
    ? ALL_GROUPS.filter(g =>
        g.group.toLowerCase().includes(search.toLowerCase()) ||
        g.courses.some(c => c.name.toLowerCase().includes(search.toLowerCase()))
      )
    : [
        { group:'A1', courses: schedule.slice(0, 3).map(c => ({ name: c.short, day: DAYS[c.day-1], time: `${c.start}:00–${c.end}:00`, room: c.room })) },
        { group:'A2', courses: schedule.slice(3, 6).map(c => ({ name: c.short, day: DAYS[c.day-1], time: `${c.start}:00–${c.end}:00`, room: c.room })) },
      ]
  return (
    <div className="p-4 space-y-4">
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Caută materie sau grupă..."
        className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50" />
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map(g => (
          <div key={g.group} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-300">{g.group}</span>
              </div>
              <span className="text-sm font-semibold text-slate-200">Grupa {g.group}</span>
            </div>
            {g.courses.map((c, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-lg px-3 py-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-200 w-12">{c.name}</span>
                <span className="text-xs text-slate-500">{c.day} {c.time}</span>
                <span className="text-xs text-slate-600 ml-auto">{c.room}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ScheduleHub({ profile, session }) {
  const [tab, setTab] = useState(0)
  const [week, setWeek] = useState(0)
  const { pushNotification } = useNotifications(session?.userId)

  const facultyData = getScheduleData(profile) || { schedule: [], recoverySlots: [], swapRequests: [] }
  const { schedule, recoverySlots, swapRequests } = facultyData

  const weekLabel = week === 0 ? 'Săptămâna curentă' : week > 0 ? `+${week} săpt.` : `${week} săpt.`

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-4 bg-[#070b14]/90 backdrop-blur-xl shrink-0 flex-wrap gap-y-2">
        <div className="flex items-center gap-2">
          {[
            { key: 'prev', icon: <ChevronLeft />, dir: -1 },
            { key: 'label', icon: null },
            { key: 'next', icon: <ChevronRight />, dir: 1 },
          ].map(({ key, icon, dir }) => icon ? (
            <button key={key} onClick={() => setWeek(w => w + dir)}
              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.07] text-slate-400">
              {icon}
            </button>
          ) : (
            <span key={key} className="text-sm text-slate-300 w-36 text-center">{weekLabel}</span>
          ))}
        </div>
        <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-xl ml-auto">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                tab === i ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 0 && <WeeklyView schedule={schedule} />}
        {tab === 1 && <AllGroupsView schedule={schedule} />}
        {tab === 2 && <RecoveryGrid recoverySlots={recoverySlots} onNotify={pushNotification} />}
        {tab === 3 && (
          <SlotSwapView
            recoverySlots={recoverySlots}
            swapRequests={swapRequests}
            userId={session?.userId}
            onNotify={pushNotification}
          />
        )}
      </div>
    </div>
  )
}
