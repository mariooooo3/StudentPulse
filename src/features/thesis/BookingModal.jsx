import { useState } from 'react'
import { X, Send, CheckCircle } from 'lucide-react'
import { useNotifications } from '../../shared/hooks/useNotifications'

export default function BookingModal({ professor, onClose, session }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ idea: '', motivation: '', cv: false })
  const { pushNotification } = useNotifications(session?.userId)

  function handleSubmit(e) {
    e.preventDefault()
    pushNotification({
      title: 'Cerere licenta trimisa',
      body: `${professor.name} va raspunde in 2-5 zile lucratoare.`,
      type: 'info',
      action: 'thesis.booking.requested',
      meta: {
        professorId: professor.id,
        professorName: professor.name,
        domain: professor.domain,
      },
    })
    setStep(2)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700/50">
          <div>
            <p className="text-xs text-slate-500 mb-1">Rezervare loc licență</p>
            <h3 className="font-bold text-white text-lg">{professor.name}</h3>
            <p className="text-sm text-slate-400">{professor.domain}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Idee preliminară de temă *
              </label>
              <textarea
                required
                rows={3}
                value={form.idea}
                onChange={e => setForm(p => ({ ...p, idea: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 resize-none"
                placeholder="Descrie pe scurt ideea ta de temă pentru licență..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Motivație *
              </label>
              <textarea
                required
                rows={3}
                value={form.motivation}
                onChange={e => setForm(p => ({ ...p, motivation: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 resize-none"
                placeholder="De ce vrei să lucrezi cu acest profesor și pe această temă?"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm(p => ({ ...p, cv: !p.cv }))}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.cv ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600'}`}
              >
                {form.cv && <CheckCircle size={12} className="text-white" />}
              </div>
              <span className="text-sm text-slate-400">Atașez CV (opțional)</span>
            </label>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Anulează</button>
              <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Send size={15} /> Trimite cererea
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-400" />
            </div>
            <h4 className="font-bold text-white text-lg mb-2">Cerere trimisă cu succes!</h4>
            <p className="text-sm text-slate-400 mb-2">
              {professor.name} va reveni cu un răspuns în 2–5 zile lucrătoare.
            </p>
            <p className="text-xs text-slate-500 mb-6">
              Vei primi o notificare prin email și în aplicație la acceptare sau refuz.
            </p>
            <button onClick={onClose} className="btn-primary w-full">Închide</button>
          </div>
        )}
      </div>
    </div>
  )
}
