import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Send, Loader2, CheckCircle2, XCircle,
  Upload, ImageIcon, Smartphone, AlertCircle,
} from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

const CATEGORY_COLORS = {
  sănătate:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.2)' },
  academic:  { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.2)' },
  social:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)' },
  wellbeing: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' },
  carieră:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)' },
  campus:    { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.2)'  },
}

const MAX_FILE_MB = 8

export default function SubmitProofModal({ challenge, onClose, onSubmit }) {
  const { t } = useTranslation()
  const isScreenshot = challenge.verifyType === 'screenshot'

  // text proof state
  const [proof, setProof] = useState('')

  // screenshot state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const [state, setState] = useState('idle') // idle | loading | success | error
  const [result, setResult] = useState(null)

  const accent = CATEGORY_COLORS[challenge.category] || CATEGORY_COLORS.academic
  const maxLen = 500

  // FIX: cleanup object URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  // ── Image handling ──────────────────────────────────────────────────────────
  function handleFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert(t('submitProof.errorOnlyImages'))
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      alert(t('submitProof.errorFileTooLarge', { max: MAX_FILE_MB }))
      return
    }
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function clearImage() {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (isScreenshot && !imageFile) return
    if (!isScreenshot && proof.trim().length < 15) return
    setState('loading')
    try {
      const res = await onSubmit({ proof: proof.trim(), imageFile })
      setResult(res)
      setState(res.approved ? 'success' : 'error')
    } catch (err) {
      setResult({ approved: false, feedback: err.message || t('submitProof.errorGeneric') })
      setState('error')
    }
  }

  function handleClose() {
    if (state === 'loading') return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    // FIX: pass result directly so caller can distinguish submitted (approved/rejected) from cancelled (null)
    onClose(result)
  }

  function retry() {
    setState('idle')
    setResult(null)
    setProof('')
    clearImage()
  }

  const canSubmit = isScreenshot ? !!imageFile : proof.trim().length >= 15

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="relative w-full max-w-md"
      >
        <div className="p-[1px] rounded-2xl"
             style={{ background: `linear-gradient(to bottom, ${accent.color}30, rgba(255,255,255,0.03))` }}>
          <div className="rounded-[calc(1rem-1px)] bg-[#0b1020] border border-white/[0.06] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)] overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: accent.color + 'bb' }}>
                    {t(`submitProof.typeLabels.${challenge.type}`)} · {challenge.points} {t('career.challengePoints')}
                  </span>
                  {/* Verify type badge */}
                  <span className={clsx(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide',
                    isScreenshot
                      ? 'border-violet-400/20 bg-violet-400/10 text-violet-300'
                      : 'border-slate-400/20 bg-slate-400/10 text-slate-400',
                  )}>
                    {isScreenshot ? <><Smartphone size={9} /> Screenshot</> : <><Send size={9} /> Text</>}
                  </span>
                </div>
                <p className="text-[14px] font-bold text-white leading-tight">{challenge.title}</p>
              </div>
              <button onClick={handleClose} disabled={state === 'loading'}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-colors disabled:opacity-40">
                <X size={15} strokeWidth={1.75} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Challenge description */}
              <p className="text-sm text-slate-400 leading-relaxed">{challenge.description}</p>

              <AnimatePresence mode="wait">
                {/* Result */}
                {(state === 'success' || state === 'error') && result ? (
                  <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                              className={clsx(
                                'rounded-xl border p-4 space-y-2',
                                state === 'success' ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-amber-400/20 bg-amber-400/10',
                              )}>
                    <div className="flex items-center gap-2">
                      {state === 'success'
                        ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        : <XCircle size={18} className="text-amber-400 shrink-0" />}
                      <p className={clsx('text-sm font-bold', state === 'success' ? 'text-emerald-300' : 'text-amber-300')}>
                        {state === 'success'
                          ? t('submitProof.approved', { points: result.points })
                          : isScreenshot ? t('submitProof.screenshotRejected') : t('submitProof.rejected')}
                      </p>
                    </div>
                    <p className={clsx('text-sm leading-relaxed', state === 'success' ? 'text-emerald-200/80' : 'text-amber-200/80')}>
                      {result.feedback}
                    </p>
                    {state === 'error' && (
                      <button onClick={retry}
                              className="text-xs font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200 transition-colors">
                        {isScreenshot ? t('submitProof.retryScreenshot') : t('submitProof.retry')}
                      </button>
                    )}
                  </motion.div>
                ) : isScreenshot ? (
                  /* ── Screenshot upload flow ── */
                  <motion.form key="screenshot-form" onSubmit={handleSubmit} className="space-y-4">

                    {/* Instructions */}
                    <div className="rounded-xl border border-violet-400/15 bg-violet-400/[0.06] p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={14} className="text-violet-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-violet-200/80 leading-relaxed">
                          {challenge.screenshotHint || t('submitProof.screenshotHintDefault')}
                        </p>
                      </div>
                    </div>

                    {/* Drop zone / preview */}
                    {!imagePreview ? (
                      <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={clsx(
                          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all',
                          dragOver
                            ? 'border-violet-400/60 bg-violet-400/10'
                            : 'border-white/[0.10] bg-white/[0.02] hover:border-white/[0.20] hover:bg-white/[0.04]',
                        )}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                          <Upload size={20} className="text-slate-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-300">{t('submitProof.dragOrClick')}</p>
                          <p className="text-xs text-slate-600 mt-1">JPG, PNG, WebP · max {MAX_FILE_MB}MB</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                        />
                      </div>
                    ) : (
                      /* Image preview */
                      <div className="relative rounded-xl overflow-hidden border border-white/[0.08]">
                        <img src={imagePreview} alt="Preview screenshot" className="w-full max-h-64 object-contain bg-black/40" />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-white hover:bg-black/90 transition-colors"
                        >
                          <X size={13} />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                          <p className="text-[11px] text-slate-300 truncate">
                            <ImageIcon size={10} className="inline mr-1" />
                            {imageFile?.name}
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!canSubmit || state === 'loading'}
                      className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
                    >
                      {state === 'loading'
                        ? <><Loader2 size={15} className="animate-spin" /> {t('submitProof.analyzingVision')}</>
                        : <><Send size={14} /> {t('submitProof.verifyScreenshot')}</>}
                    </button>
                  </motion.form>
                ) : (
                  /* ── Text proof flow ── */
                  <motion.form key="text-form" onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block mb-2">
                        {t('submitProof.describeLabel')}
                      </label>
                      <textarea
                        value={proof}
                        onChange={e => setProof(e.target.value.slice(0, maxLen))}
                        disabled={state === 'loading'}
                        rows={4}
                        placeholder={t('submitProof.proofPlaceholder')}
                        className="input-base resize-none w-full disabled:opacity-50"
                      />
                      <div className="flex justify-between mt-1.5">
                        <p className="text-[10px] text-slate-600">{t('submitProof.minChars')}</p>
                        <p className={clsx('text-[10px] font-mono font-semibold', proof.length > maxLen * 0.9 ? 'text-amber-400' : 'text-slate-600')}>
                          {proof.length}/{maxLen}
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit || state === 'loading'}
                      className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
                    >
                      {state === 'loading'
                        ? <><Loader2 size={15} className="animate-spin" /> {t('submitProof.analyzingAI')}</>
                        : <><Send size={14} /> {t('submitProof.submit')}</>}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Footer note */}
              {state === 'idle' && (
                <p className="text-[11px] text-slate-600 text-center leading-relaxed">
                  {isScreenshot
                    ? t('submitProof.footerScreenshot')
                    : t('submitProof.footerText')}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
