import { useState } from 'react'
import { Check, Zap, MessageSquare, ArrowLeftRight, Repeat2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DAYS } from '../../../shared/data/mockData'
import { socketService } from '../../../shared/services/socket.service'
import { staggerContainer, staggerItem, fadeUp } from '../schedule.constants'
import clsx from 'clsx'

export default function SlotSwapView({ recoverySlots, swapRequests, userId, onNotify }) {
  const [swapOffer, setSwapOffer] = useState(null)
  const [swapWant, setSwapWant] = useState(null)
  const [message, setMessage] = useState('')
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
    <motion.div className="p-5 sm:p-6 space-y-5" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={staggerItem} className="premium-card p-4 border-violet-500/25 bg-violet-500/[0.04]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <ArrowLeftRight size={14} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-300 mb-1">Swap automat — chiar și fără locuri</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Propune un schimb cu un alt student. Dacă cerințele corespund, sistemul acceptă automat — fără intervenție manuală.
              Ideal pentru când slotul dorit e complet dar altcineva vrea exact ce oferi tu.
            </p>
          </div>
        </div>
      </motion.div>

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
              className={clsx('premium-card p-4', req.isMatch && 'border-indigo-500/30 bg-indigo-500/[0.04]')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
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

                <div className="shrink-0">
                  {matchAccepted[req.id] ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                      <Check size={13} /> Acceptat!
                    </div>
                  ) : req.isMatch ? (
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setMatchAccepted(p => ({ ...p, [req.id]: true }))
                        const acceptRequest = {
                          userId,
                          course: req.offersSubject,
                          offerSlot: `${DAYS[req.wantsSlot.day - 1]} ${req.wantsSlot.start}:00 Gr.${req.wantsSlot.group}`,
                          needSlot: `${DAYS[req.offersSlot.day - 1]} ${req.offersSlot.start}:00 Gr.${req.offersSlot.group}`,
                          matchId: req.id,
                          message: `Acceptat match cu ${req.name}`,
                        }
                        socketService.submitSwap(acceptRequest).catch(() => {})
                        onNotify?.({
                          title: 'Swap acceptat',
                          body: `${req.offersSubject} — schimb confirmat cu ${req.name}.`,
                          type: 'success',
                          action: 'schedule.swap.accepted',
                          meta: { matchId: req.id },
                        })
                      }}
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

      <motion.div variants={staggerItem}>
        <p className="section-label mb-3">Propune un swap nou</p>
        {submitted ? (
          <motion.div {...fadeUp} className="glass-card p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-emerald-400" />
            </div>
            <p className="font-bold text-white text-base mb-1">Cerere postată!</p>
            <p className="text-sm text-slate-400 mb-5 max-w-xs mx-auto leading-relaxed">
              Dacă un alt student are cerere compatibilă, swapul se acceptă automat.
            </p>
            <button onClick={() => { setSubmitted(false); setSwapOffer(null); setSwapWant(null); setMessage('') }} className="btn-secondary text-xs">
              Propune alt swap
            </button>
          </motion.div>
        ) : (
          <div className="glass-card p-5 space-y-5">
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
                      swapOffer?.subject === subject ? 'bg-indigo-600/15 border-indigo-500/50' : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]',
                    )}
                  >
                    <div className={clsx('w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-all', swapOffer?.subject === subject ? 'border-indigo-500 bg-indigo-500' : 'border-white/[0.2]')} />
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

            <AnimatePresence>
              {swapOffer && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ type: 'spring', stiffness: 100, damping: 20 }}>
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
                            swapWant === slot ? 'bg-violet-600/15 border-violet-500/50' : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]',
                          )}
                        >
                          <div className={clsx('w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-all', swapWant === slot ? 'border-violet-500 bg-violet-500' : 'border-white/[0.2]')} />
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

            <AnimatePresence>
              {swapOffer && swapWant && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ type: 'spring', stiffness: 100, damping: 20 }}>
                  <div className="gradient-separator mb-5" />
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[9px] font-bold mr-1.5">3</span>
                    Mesaj opțional
                  </p>
                  <textarea rows={2} value={message} onChange={e => setMessage(e.target.value)} className="input-base w-full resize-none" placeholder="Ex: Marțea nu pot, am practică..." />
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
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
                          onNotify?.({ title: 'Swap acceptat automat', body: `Ai primit match pentru ${swapOffer.subject}.`, type: 'success', action: 'schedule.swap.match', meta: result.match })
                        })
                        .catch(() => {
                          onNotify?.({ title: 'Swap salvat local', body: 'Serverul realtime nu a confirmat cererea, dar formularul ramane marcat ca trimis.', type: 'warning', action: 'schedule.swap.offline' })
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
