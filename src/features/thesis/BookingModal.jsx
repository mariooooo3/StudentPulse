import { useState, useRef } from 'react'
import { X, Send, CheckCircle, Loader2, FileText, Info, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '../../shared/hooks/useNotifications'
import { useToast } from '../../shared/components/Toast'
import { createThesisRequest } from '../../shared/services/professorPortal.service'
import { getTenantScope } from '../../shared/utils/tenantScope.js'

export default function BookingModal({ professor, onClose, session }) {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ idea: '', motivation: '' })
  const [attachedFile, setAttachedFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const { pushNotification } = useNotifications(session?.userId)
  const toast = useToast()

  const initials = professor.avatar ||
    professor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) setAttachedFile(file)
  }

  function handleRemoveFile() {
    setAttachedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) setAttachedFile(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      await createThesisRequest({
        professor,
        student: {
          userId: session?.userId,
          email: session?.email,
          name: session?.email?.split('@')[0]?.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || 'Student',
          facultyName: session?.detectedFaculty?.name || 'Facultatea de Matematica-Informatica',
          ...getTenantScope(null, session),
        },
        form,
        attachedFile,
      })
      await pushNotification({
        title: t('thesis.booking.notifyTitle'),
        body: t('thesis.booking.notifyBody', { name: professor.name }),
        type: 'info',
        action: 'thesis.booking.requested',
        meta: { professorId: professor.id, professorName: professor.name, domain: professor.domain },
      })
      toast({ type: 'success', title: t('thesis.booking.successTitle'), message: t('thesis.booking.successBody', { name: professor.name }) })
      setStep(2)
    } catch {
      toast({ type: 'error', title: t('thesis.booking.errorTitle'), message: t('thesis.booking.errorBody') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          className="bezel-card w-full max-w-md"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="bezel-inner overflow-hidden">

            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
              {/* Professor avatar */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${professor.color ?? 'from-indigo-600 to-violet-600'} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg`}>
                {initials}
              </div>

              {/* Name + label */}
              <div className="flex-1 min-w-0">
                <p className="section-label mb-0.5">{t('thesis.booking.headerLabel')}</p>
                <h3 className="font-bold text-white text-[14px] truncate leading-snug">{professor.name}</h3>
                <p className="text-[11px] text-slate-500 truncate">{professor.domain}</p>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.12] transition-all shrink-0"
              >
                <X size={13} className="text-slate-400" strokeWidth={2} />
              </button>
            </div>

            {/* ── Body ── */}
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.18 }}
                  className="p-5 space-y-4"
                >
                  {/* Info note */}
                  {professor.requirementsNote && (
                    <div className="flex gap-2.5 bg-indigo-500/[0.08] border border-indigo-500/20 rounded-xl px-4 py-3">
                      <Info size={13} className="text-indigo-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                      <p className="text-[11px] text-indigo-200/80 leading-relaxed">{t(professor.requirementsNote, { defaultValue: professor.requirementsNote })}</p>
                    </div>
                  )}

                  {/* Idea field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="section-label">{t('thesis.booking.ideaLabel')} <span className="text-indigo-400">*</span></label>
                      <span className="text-[10px] text-slate-700 font-mono">{form.idea.length}/300</span>
                    </div>
                    <textarea
                      required
                      maxLength={300}
                      rows={3}
                      value={form.idea}
                      onChange={e => setForm(p => ({ ...p, idea: e.target.value }))}
                      className="input-base resize-none leading-relaxed"
                      placeholder={t('thesis.booking.ideaPlaceholder')}
                    />
                  </div>

                  {/* Motivation field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="section-label">{t('thesis.booking.motivationLabel')} <span className="text-indigo-400">*</span></label>
                      <span className="text-[10px] text-slate-700 font-mono">{form.motivation.length}/300</span>
                    </div>
                    <textarea
                      required
                      maxLength={300}
                      rows={3}
                      value={form.motivation}
                      onChange={e => setForm(p => ({ ...p, motivation: e.target.value }))}
                      className="input-base resize-none leading-relaxed"
                      placeholder={t('thesis.booking.motivationPlaceholder')}
                    />
                  </div>

                  {/* File upload */}
                  <div>
                    <label className="section-label block mb-1.5">
                      {t('thesis.booking.attachLabel')}{' '}
                      <span className="normal-case font-normal text-slate-700 tracking-normal">{t('thesis.booking.attachNote')}</span>
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {attachedFile ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3"
                      >
                        <FileText size={15} className="text-indigo-400 shrink-0" strokeWidth={1.5} />
                        <span className="text-[13px] text-slate-300 truncate flex-1">{attachedFile.name}</span>
                        <span className="text-[10px] text-slate-600 shrink-0 font-mono">
                          {(attachedFile.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-slate-600 hover:text-slate-300 transition-colors shrink-0 ml-1"
                        >
                          <X size={13} />
                        </button>
                      </motion.div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`w-full flex flex-col items-center gap-2 border border-dashed rounded-xl px-4 py-5 transition-all group ${
                          dragOver
                            ? 'border-indigo-500/50 bg-indigo-500/[0.06]'
                            : 'border-white/[0.12] bg-white/[0.02] hover:border-indigo-500/30 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center group-hover:border-indigo-500/30 transition-colors">
                          <Upload size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" strokeWidth={1.75} />
                        </div>
                        <div className="text-center">
                          <p className="text-[12px] text-slate-500 group-hover:text-slate-300 transition-colors font-medium">
                            {t('thesis.booking.attachDragDrop')}
                          </p>
                          <p className="text-[10px] text-slate-700 mt-0.5">{t('thesis.booking.attachFormats')}</p>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} disabled={loading} className="btn-secondary flex-1 text-[13px]">
                      {t('thesis.booking.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1 text-[13px] flex items-center justify-center gap-2"
                    >
                      {loading
                        ? <><Loader2 size={14} className="animate-spin" /> {t('thesis.booking.submitting')}</>
                        : <><Send size={13} /> {t('thesis.booking.submit')}</>
                      }
                    </button>
                  </div>
                </motion.form>
              ) : (
                /* ── Success state ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                  className="p-8 text-center"
                >
                  {/* Animated check */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5"
                    style={{ boxShadow: '0 0 20px rgba(52,211,153,0.15)' }}
                  >
                    <CheckCircle size={28} className="text-emerald-400" strokeWidth={1.75} />
                  </motion.div>

                  <h4 className="font-bold text-white text-[16px] mb-2">{t('thesis.booking.successHeading')}</h4>
                  <p className="text-[13px] text-slate-400 mb-3 leading-relaxed">
                    {t('thesis.booking.successText', { name: professor.name })}
                  </p>

                  {attachedFile && (
                    <div className="flex items-center justify-center gap-2 mb-3 bg-white/[0.03] border border-white/[0.06] rounded-xl py-2.5 px-4">
                      <FileText size={12} className="text-slate-600" strokeWidth={1.5} />
                      <p className="text-[11px] text-slate-500 truncate">
                        {t('thesis.booking.attachedDoc')} <span className="text-slate-400">{attachedFile.name}</span>
                      </p>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 mb-6 leading-relaxed">
                    {t('thesis.booking.successNote')}
                  </p>

                  <button onClick={onClose} className="btn-primary w-full text-[13px]">
                    {t('thesis.booking.close')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
