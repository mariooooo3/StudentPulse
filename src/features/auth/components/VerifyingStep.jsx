import { Check, Loader2 } from 'lucide-react'
import { VERIFICATION_PROGRESS } from '../auth.constants'

export default function VerifyingStep({ email, university }) {
  return (
    <div className="text-center py-6 space-y-6">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
          <Loader2 size={24} className="text-indigo-400 animate-spin" strokeWidth={1.75} />
        </div>
      </div>
      <div>
        <p className="text-[15px] font-bold text-white mb-1">Se verifică identitatea...</p>
        <p className="text-[12px] text-slate-500 font-mono">
          {email}@{university.emailDomain}
        </p>
      </div>
      <div className="space-y-2.5 text-left bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
        {VERIFICATION_PROGRESS.map((s, i) => (
          <div key={i} className="flex items-center gap-3 text-[13px]">
            {s.done
              ? <Check size={13} className="text-emerald-400 shrink-0" strokeWidth={2} />
              : <Loader2 size={13} className="text-indigo-400 animate-spin shrink-0" strokeWidth={1.75} />}
            <span className={s.done ? 'text-slate-400' : 'text-slate-600'}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
