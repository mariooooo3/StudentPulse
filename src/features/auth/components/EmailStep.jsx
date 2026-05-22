import { ArrowRight, Loader2, Mail, Shield } from 'lucide-react'
import clsx from 'clsx'

export default function EmailStep({ university, email, setEmail, accessCode, setAccessCode, error, onSubmit, loading }) {
  return (
    <div className="space-y-4">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border"
        style={{ background: university.color + '10', borderColor: university.color + '30' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: university.color + '25', color: university.color }}>
          {university.avatar}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-200">{university.shortName}</p>
          <p className="text-[11px] text-slate-500">{university.city}</p>
        </div>
        <Shield size={13} className="ml-auto text-slate-700" strokeWidth={1.75} />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">
          Email instituÈ›ional
        </label>
        <div className="flex items-center bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden focus-within:border-white/[0.15] transition-colors">
          <Mail size={13} className="text-slate-600 ml-4 shrink-0" strokeWidth={1.75} />
          <input
            autoFocus
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value.replace(/@.*/, ''))}
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
            placeholder="prenume.nume"
            className="flex-1 bg-transparent px-3 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none font-medium"
          />
          <span className="pr-4 text-[12px] text-slate-600 shrink-0 font-mono">@{university.emailDomain}</span>
        </div>
        <p className="text-[11px] text-slate-700 mt-1.5 pl-1">
          Folosim email-ul instituÈ›ional pentru a detecta automat facultatea ta.
        </p>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">
          Cod institutional
        </label>
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
          Cod de 6 cifre din aplicaÈ›ia de autentificare (Google Authenticator, Authy).
        </p>
        {error && <p className="text-[11px] text-red-400 mt-1.5 pl-1">{error}</p>}
      </div>

      <button
        onClick={onSubmit}
        disabled={!email.trim() || accessCode.length !== 6 || loading}
        className={clsx(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[13px] transition-all duration-200',
          email.trim() && accessCode.length === 6 && !loading
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
            : 'bg-white/[0.03] text-slate-600 cursor-not-allowed border border-white/[0.06]',
        )}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
        {loading ? 'Se trimite...' : 'Continua'}
      </button>
    </div>
  )
}

