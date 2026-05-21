import { useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarClock, Plus } from 'lucide-react'
import { statusLabel } from '../utils/professorUtils'

export default function RecoveryView({ requests, onDecision }) {
  const [created, setCreated] = useState(false)

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={() => setCreated(true)}
        className="btn-primary inline-flex items-center gap-2 text-sm"
      >
        <Plus size={14} />
        Adauga slot de recuperare
      </button>

      <AnimatePresence>
        {created && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            Slot publicat: Structuri de Date, Vineri 14:00, sala C210.
          </motion.div>
        )}
      </AnimatePresence>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <CalendarClock size={32} className="mx-auto text-slate-700 mb-3" />
          <p className="text-sm font-semibold text-slate-400">Nu exista cereri de recuperare.</p>
          <p className="text-xs text-slate-700 mt-1">Studentii le trimit din Schedule Hub.</p>
        </div>
      ) : (
        requests.map(item => (
          <div key={item.id} className="premium-card p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="font-bold text-white">{item.studentName}</p>
              <p className="text-sm text-slate-500 mt-0.5">{item.subject} · Gr. {item.group} · {item.room} · {item.start}:00</p>
              <p className="text-xs text-slate-600 mt-1">{item.reason}</p>
            </div>
            {item.status === 'pending' && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onDecision(item.id, 'accepted', 'Cererea de recuperare a fost aprobata.')}
                  className="h-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all duration-150"
                >
                  Accepta
                </button>
                <button
                  onClick={() => onDecision(item.id, 'rejected', 'Nu exista locuri disponibile pentru slotul cerut.')}
                  className="h-9 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all duration-150"
                >
                  Respinge
                </button>
              </div>
            )}
            {item.status !== 'pending' && (
              <span className={clsx(
                'text-xs font-semibold rounded-full px-3 py-1 shrink-0',
                item.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300',
              )}>
                {statusLabel(item.status)}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  )
}
