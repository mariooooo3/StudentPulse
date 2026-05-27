import { useState } from 'react'
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'

const BASE = import.meta.env.VITE_API_URL || ''
const REMEMBER_KEY = 'sp_remember_identifier'

export default function LoginStep({ onSuccess, onGoRegister }) {
  const [identifier, setIdentifier] = useState('')
  const [password,   setPassword]   = useState('')
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem(REMEMBER_KEY))
  const [showPwd,    setShowPwd]    = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!identifier.trim() || !password) return
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Eroare la autentificare'); return }
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, identifier.trim())
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
      onSuccess(data.user)
    } catch {
      setError('Nu s-a putut conecta la server')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = identifier.trim().length > 0 && password.length > 0 && !loading

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email / username */}
      <div>
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">
          Email sau username
        </label>
        <div className="flex items-center bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden focus-within:border-indigo-500/40 transition-colors">
          <Mail size={13} className="text-slate-600 ml-4 shrink-0" strokeWidth={1.75} />
          <input
            autoFocus
            type="text"
            value={identifier}
            onChange={e => { setIdentifier(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="off"
            placeholder="username sau email@uni.ro"
            className="flex-1 bg-transparent px-3 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none autofill-dark"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">
          Parolă
        </label>
        <div className="flex items-center bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden focus-within:border-indigo-500/40 transition-colors">
          <Lock size={13} className="text-slate-600 ml-4 shrink-0" strokeWidth={1.75} />
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="off"
            placeholder="••••••••"
            className="flex-1 bg-transparent px-3 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none autofill-dark"
          />
          <button
            type="button"
            onClick={() => setShowPwd(p => !p)}
            className="pr-4 text-slate-600 hover:text-slate-400 transition-colors"
          >
            {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
      </div>

      {/* Remember me */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
        <div
          onClick={() => setRememberMe(p => !p)}
          className={clsx(
            'w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0',
            rememberMe
              ? 'bg-indigo-600 border-indigo-500'
              : 'bg-white/[0.03] border-white/[0.12] hover:border-white/25',
          )}
        >
          {rememberMe && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className="text-[12px] text-slate-500">Ține-mă minte</span>
      </label>

      {error && (
        <p className="text-[11px] text-red-400 pl-1">{error}</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className={clsx(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[13px] transition-all duration-200',
          canSubmit
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
            : 'bg-white/[0.03] text-slate-600 cursor-not-allowed border border-white/[0.06]',
        )}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
        {loading ? 'Se verifică...' : 'Intră în cont'}
      </button>

      <div className="text-center pt-1">
        <span className="text-[12px] text-slate-600">Nu ai cont? </span>
        <button
          type="button"
          onClick={onGoRegister}
          className="text-[12px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
        >
          Înregistrează-te
        </button>
      </div>
    </form>
  )
}
