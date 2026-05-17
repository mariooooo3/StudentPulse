import { useState } from 'react'
import { X, Send, CheckCircle, Loader2 } from 'lucide-react'
import { useNotifications } from '../../shared/hooks/useNotifications'
import { useToast } from '../../shared/components/Toast'

export default function BookingModal({ professor, onClose, session }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ idea: '', motivation: '', cv: false })
  const { pushNotification } = useNotifications(session?.userId)
  const toast = useToast()

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      pushNotification({
        title: 'Cerere licenta trimisa',
        body: `${professor.name} va raspunde in 2-5 zile lucratoare.`,
        type: 'info',
        action: 'thesis.booking.requested',
        meta: { professorId: professor.id, professorName: professor.name, domain: professor.domain },
      })
      toast({ type: 'success', title: 'Cerere trimisă!', message: `${professor.name} va răspunde în 2–5 zile.` })
      setLoading(false)
      setStep(2)
    }, 1400)
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
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setForm(p => ({ ...p, cv: !p.cv }))}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${form.cv ? 'bg-indigo-600 border-indigo-600' : 'border-white/[0.15] group-hover:border-white/[0.3]'}`}
                >
                  {form.cv && <CheckCircle size={10} className="text-white" />}
                </div>
                <span className="text-[13px] text-slate-500 group-hover:text-slate-400 transition-colors">Atașez CV (opțional)</span>
              </label>

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
