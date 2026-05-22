import { ArrowRight, Loader2, Mail, Shield } from 'lucide-react'
import clsx from 'clsx'
import { DEMO_PROFESSOR } from '../../../shared/services/professorPortal.service'

export default function ProfessorLogin({ email, setEmail, accessCode, setAccessCode, error, onSubmit, loading }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
        <p className="text-[13px] font-semibold text-amber-200">{DEMO_PROFESSOR.name}</p>
        <p className="text-[11px] text-amber-200/70 mt-0.5">{DEMO_PROFESSOR.facultyName} â€“ TUIASI</p>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Email profesor</label>
        <div className="flex items-center bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden focus-within:border-white/[0.15] transition-colors">
          <Mail size={13} className="text-slate-600 ml-4 shrink-0" strokeWidth={1.75} />
          <input
            autoFocus
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
            className="flex-1 bg-transparent px-3 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none font-medium"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">Cod cont facultate</label>
        <div className="flex items-center bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden focus-within:border-white/[0.15] transition-colors">
          <Shield size={13} className="text-slate-600 ml-4 shrink-0" strokeWidth={1.75} />
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={accessCode}
            onChange={e => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
            placeholder="000000"
            className="flex-1 bg-transparent px-3 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none tracking-[0.35em] font-mono"
          />
        </div>
        <p className="text-[11px] text-slate-700 mt-1.5 pl-1">
          Cod de 6 cifre din Google Authenticator pentru <span className="text-slate-500 font-mono">{DEMO_PROFESSOR.email}</span>
        </p>
        {error && <p className="text-[11px] text-red-400 mt-1.5 pl-1">{error}</p>}
      </div>

      <button
        onClick={onSubmit}
        disabled={!email.trim() || accessCode.length !== 6 || loading}
        className={clsx(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[13px] transition-all duration-200',
          email.trim() && accessCode.length === 6 && !loading
            ? 'bg-amber-600 hover:bg-amber-500 text-white active:scale-[0.98]'
            : 'bg-white/[0.03] text-slate-600 cursor-not-allowed border border-white/[0.06]',
        )}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
        Intra in portalul profesorului
      </button>
    </div>
  )
}
