import { useState, useRef } from 'react'
import { X, Send, CheckCircle, Loader2, Paperclip, FileText, Info } from 'lucide-react'
import { useNotifications } from '../../shared/hooks/useNotifications'
import { useToast } from '../../shared/components/Toast'
import { createThesisRequest } from '../../shared/services/professorPortal.service'

export default function BookingModal({ professor, onClose, session }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ idea: '', motivation: '' })
  const [attachedFile, setAttachedFile] = useState(null)
  const fileInputRef = useRef(null)
  const { pushNotification } = useNotifications(session?.userId)
  const toast = useToast()

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) setAttachedFile(file)
  }

  function handleRemoveFile() {
    setAttachedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
        },
        form,
        attachedFile,
      })
      await pushNotification({
        title: 'Cerere licenta trimisa',
        body: `${professor.name} va raspunde in 2-5 zile lucratoare.`,
        type: 'info',
        action: 'thesis.booking.requested',
        meta: { professorId: professor.id, professorName: professor.name, domain: professor.domain },
      })
      toast({ type: 'success', title: 'Cerere trimisă!', message: `${professor.name} va răspunde în 2–5 zile.` })
      setStep(2)
    } catch {
      toast({ type: 'error', title: 'Cererea nu a fost trimisa', message: 'Verifica serverul si incearca din nou.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/[0.1] to-white/[0.03] w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="bg-[#0c1120] border border-white/[0.05] rounded-[calc(1rem-1px)] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="flex items-start justify-between p-5 border-b border-white/[0.06]">
            <div>
              <p className="section-label mb-1">Rezervare loc licență</p>
              <h3 className="font-bold text-white text-[15px]">{professor.name}</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">{professor.domain}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.08] transition-colors">
              <X size={14} className="text-slate-500" strokeWidth={1.75} />
            </button>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {professor.requirementsNote && (
                <div className="flex gap-2.5 bg-indigo-500/[0.08] border border-indigo-500/20 rounded-xl px-4 py-3">
                  <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <p className="text-[12px] text-indigo-200/80 leading-relaxed">{professor.requirementsNote}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Idee preliminară de temă *</label>
                  <span className="text-[10px] text-slate-700 font-mono">{form.idea.length}/300</span>
                </div>
                <textarea
                  required
                  maxLength={300}
                  rows={3}
                  value={form.idea}
                  onChange={e => setForm(p => ({ ...p, idea: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/[0.07] focus:border-indigo-500/40 rounded-xl px-4 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none resize-none transition-colors"
                  placeholder="Descrie pe scurt ideea ta de temă pentru licență..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Motivație *</label>
                  <span className="text-[10px] text-slate-700 font-mono">{form.motivation.length}/300</span>
                </div>
                <textarea
                  required
                  maxLength={300}
                  rows={3}
                  value={form.motivation}
                  onChange={e => setForm(p => ({ ...p, motivation: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/[0.07] focus:border-indigo-500/40 rounded-xl px-4 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none resize-none transition-colors"
                  placeholder="De ce vrei să lucrezi cu acest profesor și pe această temă?"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  Document atașat <span className="normal-case font-normal text-slate-700">(CV, portofoliu, plan — opțional)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {attachedFile ? (
                  <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
                    <FileText size={15} className="text-indigo-400 shrink-0" strokeWidth={1.5} />
                    <span className="text-[13px] text-slate-300 truncate flex-1">{attachedFile.name}</span>
                    <span className="text-[11px] text-slate-700 shrink-0">
                      {(attachedFile.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-slate-600 hover:text-slate-300 transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 bg-white/[0.03] border border-dashed border-white/[0.1] hover:border-white/[0.22] hover:bg-white/[0.05] rounded-xl px-4 py-3 transition-all group"
                  >
                    <Paperclip size={15} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" strokeWidth={1.75} />
                    <span className="text-[13px] text-slate-600 group-hover:text-slate-400 transition-colors text-left">
                      Adaugă fișier <span className="text-slate-700">(.pdf, .doc, .docx)</span>
                    </span>
                  </button>
                )}
              </div>

              <div className="pt-1 flex gap-3">
                <button type="button" onClick={onClose} disabled={loading} className="btn-secondary flex-1">Anulează</button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Se trimite...</> : <><Send size={14} /> Trimite cererea</>}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-emerald-400" strokeWidth={1.75} />
              </div>
              <h4 className="font-bold text-white text-[15px] mb-2">Cerere trimisă cu succes!</h4>
              <p className="text-[13px] text-slate-400 mb-2 leading-relaxed">
                {professor.name} va reveni cu un răspuns în 2–5 zile lucrătoare.
              </p>
              {attachedFile && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileText size={13} className="text-slate-600" strokeWidth={1.5} />
                  <p className="text-[11px] text-slate-600">
                    Document atașat: <span className="text-slate-500">{attachedFile.name}</span>
                  </p>
                </div>
              )}
              <p className="text-[11px] text-slate-600 mb-6">
                Vei primi o notificare prin email și în aplicație la acceptare sau refuz.
              </p>
              <button onClick={onClose} className="btn-primary w-full">Închide</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
