import { useState } from 'react'
import { Compass, Mail, ArrowRight, Check, Loader2, Shield, ChevronLeft } from 'lucide-react'
import { UNIVERSITIES } from '../../shared/config/universities'
import { useAuth } from '../../app/providers/AuthContext'
import clsx from 'clsx'

const STEP = { SELECT_UNI: 0, ENTER_EMAIL: 1, VERIFYING: 2, CONFIRMED: 3 }

// ── University grid ───────────────────────────────────────────────────────────
function UniversityGrid({ onSelect }) {
  const [search, setSearch] = useState('')
  const filtered = UNIVERSITIES.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.city.toLowerCase().includes(search.toLowerCase()) ||
    u.shortName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <input
        autoFocus
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Caută universitatea ta..."
        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
      />
      <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
        {filtered.map(u => (
          <button
            key={u.id}
            onClick={() => onSelect(u)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/50 border border-slate-700/40 hover:border-slate-600 hover:bg-slate-800 text-left transition-all duration-150 group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: u.color + '33', border: `1.5px solid ${u.color}60` }}
            >
              <span style={{ color: u.color }}>{u.avatar}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate transition-colors">{u.shortName}</p>
              <p className="text-[10px] text-slate-600 truncate">{u.city}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Email input step ──────────────────────────────────────────────────────────
function EmailStep({ university, email, setEmail, accessCode, setAccessCode, error, onSubmit, onDemoSkip, loading }) {
  return (
    <div className="space-y-4">
      {/* University confirmation chip */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border"
        style={{ background: university.color + '15', borderColor: university.color + '40' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: university.color + '30', color: university.color }}>
          {university.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">{university.shortName}</p>
          <p className="text-xs text-slate-500">{university.city}</p>
        </div>
        <Shield size={14} className="ml-auto text-slate-600" />
      </div>

      {/* Email input with domain suffix */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Email instituțional
        </label>
        <div className="flex items-center bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden focus-within:border-indigo-500/60 transition-colors">
          <Mail size={15} className="text-slate-500 ml-4 shrink-0" />
          <input
            autoFocus
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value.replace(/@.*/, ''))}
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
            placeholder="prenume.nume"
            className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none"
          />
          <span className="pr-4 text-sm text-slate-500 shrink-0">@{university.emailDomain}</span>
        </div>
        <p className="text-xs text-slate-600 mt-1.5 pl-1">
          Folosim email-ul instituțional pentru a detecta automat facultatea ta.
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Cod institutional
        </label>
        <div className="flex items-center bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden focus-within:border-indigo-500/60 transition-colors">
          <Shield size={15} className="text-slate-500 ml-4 shrink-0" />
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={accessCode}
            onChange={e => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
            placeholder="0000"
            className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none tracking-[0.35em]"
          />
        </div>
        <p className="text-xs text-slate-600 mt-1.5 pl-1">
          Cod emis de universitate la crearea contului. Pentru demo: 0000.
        </p>
        {error && <p className="text-xs text-red-400 mt-1.5 pl-1">{error}</p>}
      </div>

      <button
        onClick={onSubmit}
        disabled={!email.trim() || accessCode.length !== 4 || loading}
        className={clsx(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
          email.trim() && accessCode.length === 4 && !loading
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98]'
            : 'bg-slate-800 text-slate-600 cursor-not-allowed',
        )}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        {loading ? 'Se trimite...' : 'Continuă'}
      </button>

      {/* Demo shortcut */}
      <button
        onClick={onDemoSkip}
        className="w-full text-xs text-slate-600 hover:text-slate-400 text-center transition-colors py-1"
      >
        ⚡ Skip pentru demo
      </button>
    </div>
  )
}

// ── Verifying / detecting ─────────────────────────────────────────────────────
function VerifyingStep({ email, university }) {
  return (
    <div className="text-center py-6 space-y-6">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
          <Loader2 size={26} className="text-indigo-400 animate-spin" />
        </div>
      </div>
      <div>
        <p className="text-lg font-bold text-white mb-1">Se verifică identitatea...</p>
        <p className="text-sm text-slate-400">
          {email}@{university.emailDomain}
        </p>
      </div>
      <div className="space-y-2 text-left bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
        {[
          { label: 'Validare email instituțional', done: true },
          { label: 'Detectare facultate din baza de date', done: true },
          { label: 'Creare profil personalizat', done: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            {step.done
              ? <Check size={14} className="text-emerald-400 shrink-0" />
              : <Loader2 size={14} className="text-indigo-400 animate-spin shrink-0" />}
            <span className={step.done ? 'text-slate-300' : 'text-slate-500'}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Confirmed / welcome ───────────────────────────────────────────────────────
function ConfirmedStep({ university, detectedFaculty, onContinue }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
        <Check size={28} className="text-emerald-400" />
      </div>
      <div>
        <p className="text-xl font-bold text-white mb-2">Bun venit la StudentAcademic!</p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium"
          style={{ background: university.color + '15', borderColor: university.color + '40', color: university.color }}
        >
          <span>{university.shortName}</span>
          {detectedFaculty && <><span className="opacity-40">·</span><span>{detectedFaculty.name}</span></>}
        </div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">
        Am detectat profilul tău universitar. Urmează câteva întrebări rapide ca să personalizăm
        experiența în funcție de facultatea și nevoile tale.
      </p>
      <button
        onClick={onContinue}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        Începe setup-ul profilului <ArrowRight size={16} />
      </button>
    </div>
  )
}

// ── Main AuthFlow ─────────────────────────────────────────────────────────────
export default function AuthFlow() {
  const { login } = useAuth()
  const [step, setStep] = useState(STEP.SELECT_UNI)
  const [university, setUniversity] = useState(null)
  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [accessCodeError, setAccessCodeError] = useState('')
  const [loading, setLoading] = useState(false)
  const [detectedFaculty, setDetectedFaculty] = useState(null)

  function selectUniversity(u) {
    setUniversity(u)
    setStep(STEP.ENTER_EMAIL)
  }

  async function handleEmailSubmit() {
    if (accessCode !== '0000') {
      setAccessCodeError('Cod institutional invalid. Pentru demo foloseste 0000.')
      return
    }
    setAccessCodeError('')
    setLoading(true)
    setStep(STEP.VERIFYING)
    // Simulate verification + faculty detection
    await new Promise(r => setTimeout(r, 2600))
    const faculty = university.faculties[0] || null // mock: always detects first faculty
    setDetectedFaculty(faculty)
    setLoading(false)
    setStep(STEP.CONFIRMED)
  }

  async function handleDemoSkip() {
    setAccessCode('0000')
    setAccessCodeError('')
    setLoading(true)
    setStep(STEP.VERIFYING)
    await new Promise(r => setTimeout(r, 2600))
    const faculty = university.faculties[0] || null
    setDetectedFaculty(faculty)
    setLoading(false)
    setStep(STEP.CONFIRMED)
  }

  function handleContinue() {
    login({
      userId: `mock-${Date.now()}`,
      email: email ? `${email}@${university.emailDomain}` : `student@${university.emailDomain}`,
      university,
      detectedFaculty,
      isNewUser: true,
    })
  }

  const STEP_LABELS = ['Universitate', 'Email', 'Verificare', 'Confirmat']

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-500/40">
            <Compass size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">StudentAcademic</h1>
          <p className="text-slate-500 text-sm mt-1">De la pierdut, la acasă.</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {step > STEP.SELECT_UNI && (
              <button onClick={() => setStep(s => s - 1)} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors mr-1">
                <ChevronLeft size={14} className="text-slate-400" />
              </button>
            )}
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all',
                  i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-500/30 border border-indigo-500/60 text-indigo-300' : 'bg-slate-800 border border-slate-700 text-slate-600')}>
                  {i < step ? <Check size={10} /> : i + 1}
                </div>
                {i < STEP_LABELS.length - 1 && <div className={clsx('h-px w-4', i < step ? 'bg-indigo-600' : 'bg-slate-700')} />}
              </div>
            ))}
          </div>

          {/* Step title */}
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">
              {step === STEP.SELECT_UNI && 'Selectează universitatea'}
              {step === STEP.ENTER_EMAIL && 'Autentifică-te'}
              {step === STEP.VERIFYING && 'Verificare în curs'}
              {step === STEP.CONFIRMED && 'Identitate confirmată'}
            </h2>
            {step === STEP.SELECT_UNI && (
              <p className="text-xs text-slate-500 mt-0.5">Disponibil pentru {UNIVERSITIES.length} universități din România</p>
            )}
          </div>

          {/* Step content */}
          {step === STEP.SELECT_UNI && <UniversityGrid onSelect={selectUniversity} />}
          {step === STEP.ENTER_EMAIL && (
            <EmailStep
              university={university}
              email={email}
              setEmail={setEmail}
              accessCode={accessCode}
              setAccessCode={setAccessCode}
              error={accessCodeError}
              onSubmit={handleEmailSubmit}
              onDemoSkip={handleDemoSkip}
              loading={loading}
            />
          )}
          {step === STEP.VERIFYING && <VerifyingStep email={email} university={university} />}
          {step === STEP.CONFIRMED && (
            <ConfirmedStep university={university} detectedFaculty={detectedFaculty} onContinue={handleContinue} />
          )}
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          Acces exclusiv prin email instituțional · Date protejate
        </p>
      </div>
    </div>
  )
}
