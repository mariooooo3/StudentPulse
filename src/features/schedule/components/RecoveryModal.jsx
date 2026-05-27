import { X, Send } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { DAYS } from '../../../shared/data/mockData'

export default function RecoveryModal({ slot, subject, onClose, onConfirm }) {
  const { t } = useTranslation()
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
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <div>
                <p className="section-label mb-1">{t('schedule.recoveryModal.title')}</p>
                <h3 className="font-bold text-white text-base">{subject}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t('schedule.recoveryModal.group')} {slot.group}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.08] transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  [t('schedule.recoveryModal.day'), DAYS[slot.day - 1]],
                  [t('schedule.recoveryModal.interval'), `${slot.start}:00–${slot.end}:00`],
                  [t('schedule.recoveryModal.room'), slot.room],
                  [t('schedule.recoveryModal.professor'), slot.professor],
                  [t('schedule.recoveryModal.spotsLeft'), `${slot.total - slot.enrolled}/${slot.total}`],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                    <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider mb-0.5">{k}</p>
                    <p className="text-xs font-semibold text-slate-200 font-mono">{v}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="section-label block mb-2">{t('schedule.recoveryModal.reasonLabel')}</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="input-base w-full resize-none"
                  placeholder={t('schedule.recoveryModal.reasonPlaceholder')}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="btn-secondary flex-1">{t('schedule.recoveryModal.cancel')}</button>
                <button
                  onClick={() => onConfirm(reason)}
                  disabled={!reason.trim()}
                  className={clsx(
                    'btn-primary flex-1 flex items-center justify-center gap-2',
                    !reason.trim() && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  <Send size={13} /> {t('schedule.recoveryModal.send')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
