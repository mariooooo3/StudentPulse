import { useState } from 'react'
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, AtSign, Shield } from 'lucide-react'
import clsx from 'clsx'

const BASE = import.meta.env.VITE_API_URL || ''

const USERNAME_HINT = 'ex: claudiu_mocanu — litere mici, cifre, _ (fără spații)'

function validateUsername(u) {
  if (!u || u.length < 3)       return 'Minim 3 caractere'
  if (u.length > 30)             return 'Maxim 30 de caractere'
  if (!/^[a-z]/.test(u))        return 'Trebuie să înceapă cu o literă mică'
  if (!/^[a-z0-9_]+$/.test(u))  return 'Doar litere mici (a-z), cifre și _'
  if (/__/.test(u))              return 'Fără _ consecutivi'
  if (/_$/.test(u))              return 'Nu poate termina cu _'
  return null
}

export default function RegisterDetailsStep({ university, onSuccess, onBack }) {
  const [emailPrefix, setEmailPrefix] = useState('')
  const [username,    setUsername]    = useState('')
  const [password,    setPassword]    = useState('')
  const [confirmPwd,  setConfirmPwd]  = useState('')
  const [showPwd,     setShowPwd]     = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const usernameError = username ? validateUsername(username) : null
  const fullEmail = emailPrefix ? `${emailPrefix}@${university.emailDomain}` : ''
  const detectedFaculty = university.faculties?.find(f =>
    fullEmail.includes(f.emailPrefix || f.code?.toLowerCase())
  ) || university.faculties?.[0] || null

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!emailPrefix.trim()) { setError('Introduceți prefixul email-ului'); return }
    const uErr = validateUsername(username)
    if (uErr) { setError(uErr); return }
    if (password.length < 6) { setError('Parola trebuie să aibă minim 6 caractere'); return }
    if (password !== confirmPwd) { setError('Parolele nu coincid'); return }

    setLoading(true); setError('')
    try {
      const res  = await fetch(`${BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username:    username.trim().toLowerCase(),
          email:       fullEmail.toLowerCase(),
          password,
          universityId: university.id,
          facultyCode: detectedFaculty?.code || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Eroare la înregistrare'); return }
      onSuccess(data.user, detectedFaculty)
    } catch {
      setError('Nu s-a putut conecta la server')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = emailPrefix.trim() && !usernameError && username.length >= 3 &&
                    password.length >= 6 && password === confirmPwd && !loading

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* University badge */}
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

      {/* Email instituțional */}
      <div>
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">
          Email instituțional *
        </label>
        <div className="flex items-center bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden focus-within:border-indigo-500/40 transition-colors">
          <Mail size={13} className="text-slate-600 ml-4 shrink-0" strokeWidth={1.75} />
          <input
            autoFocus
            type="text"
            value={emailPrefix}
            onChange={e => { setEmailPrefix(e.target.value.replace(/@.*/, '')); setError('') }}
            autoComplete="off"
            placeholder="prenume.nume"
            className="flex-1 bg-transparent px-3 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none font-medium"
          />
          <span className="pr-4 text-[12px] text-slate-600 shrink-0 font-mono">@{university.emailDomain}</span>
        </div>
      </div>

      {/* Username */}
      <div>
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">
          Username *
        </label>
        <div className={clsx(
          'flex items-center bg-white/[0.03] border rounded-xl overflow-hidden transition-colors',
          usernameError && username
            ? 'border-rose-500/40 focus-within:border-rose-500/60'
            : 'border-white/[0.07] focus-within:border-indigo-500/40',
        )}>
          <AtSign size={13} className="text-slate-600 ml-4 shrink-0" strokeWidth={1.75} />
          <input
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); setError('') }}
            autoComplete="username"
            placeholder="claudiu_mocanu"
            className="flex-1 bg-transparent px-3 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none font-medium"
          />
          {username && !usernameError && (
            <span className="pr-4 text-emerald-400 text-[11px] font-bold">✓</span>
          )}
        </div>
        <p className={clsx(
          'text-[11px] mt-1.5 pl-1',
          usernameError && username ? 'text-rose-400' : 'text-slate-700',
        )}>
          {usernameError && username ? usernameError : USERNAME_HINT}
        </p>
      </div>

      {/* Parolă */}
      <div>
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">
          Parolă * <span className="normal-case font-normal">(minim 6 caractere)</span>
        </label>
        <div className="flex items-center bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden focus-within:border-indigo-500/40 transition-colors">
          <Lock size={13} className="text-slate-600 ml-4 shrink-0" strokeWidth={1.75} />
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            autoComplete="new-password"
            placeholder="••••••••"
            className="flex-1 bg-transparent px-3 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none"
          />
          <button type="button" onClick={() => setShowPwd(p => !p)}
            className="pr-4 text-slate-600 hover:text-slate-400 transition-colors">
            {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
      </div>

      {/* Confirmă parola */}
      <div>
        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2">
          Confirmă parola *
        </label>
        <div className={clsx(
          'flex items-center bg-white/[0.03] border rounded-xl overflow-hidden transition-colors',
          confirmPwd && confirmPwd !== password
            ? 'border-rose-500/40'
            : 'border-white/[0.07] focus-within:border-indigo-500/40',
        )}>
          <Lock size={13} className="text-slate-600 ml-4 shrink-0" strokeWidth={1.75} />
          <input
            type={showPwd ? 'text' : 'password'}
            value={confirmPwd}
            onChange={e => { setConfirmPwd(e.target.value); setError('') }}
            autoComplete="new-password"
            placeholder="••••••••"
            className="flex-1 bg-transparent px-3 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none"
          />
          {confirmPwd && (
            <span className={clsx('pr-4 text-[11px] font-bold', confirmPwd === password ? 'text-emerald-400' : 'text-rose-400')}>
              {confirmPwd === password ? '✓' : '✗'}
            </span>
          )}
        </div>
      </div>

      {error && <p className="text-[11px] text-red-400 pl-1">{error}</p>}

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
        {loading ? 'Se creează contul...' : 'Creează cont'}
      </button>
    </form>
  )
}
