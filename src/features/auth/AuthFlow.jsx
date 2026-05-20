import { useState } from 'react'
import { Compass, Mail, ArrowRight, Check, Loader2, Shield, ChevronLeft, Zap, GraduationCap } from 'lucide-react'
import { UNIVERSITIES } from '../../shared/config/universities'
import { useAuth } from '../../app/providers/AuthContext'
import { createUserId } from '../../shared/services/auth.service'
import { DEMO_PROFESSOR } from '../../shared/services/professorPortal.service'
import clsx from 'clsx'

const STEP = { SELECT_UNI: 0, ENTER_EMAIL: 1, VERIFYING: 2, CONFIRMED: 3 }
const TUIASI = UNIVERSITIES.find(u => u.id === 'tuiasi')
const AC_FACULTY = TUIASI?.faculties.find(f => f.code === 'AC')

function UniversityGrid({ onSelect }) {
  const [search, setSearch] = useState('')
  const filtered = UNIVERSITIES.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.city.toLowerCase().includes(search.toLowerCase()) ||
    u.shortName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2.5 focus-within:border-white/[0.14] transition-colors">
        <Mail size={13} className="text-slate-600 shrink-0" strokeWidth={1.75} />
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Caută universitatea ta..."
          className="bg-transparent text-[13px] text-slate-300 placeholder-slate-700 outline-none flex-1 font-medium"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
        {filtered.map(u => (
          <button
            key={u.id}
            onClick={() => onSelect(u)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] text-left transition-all duration-150 group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: u.color + '22', border: `1.5px solid ${u.color}40` }}
            >
              <span style={{ color: u.color }}>{u.avatar}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-slate-300 group-hover:text-white truncate transition-colors">{u.shortName}</p>
              <p className="text-[10px] text-slate-600 truncate">{u.city}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function EmailStep({ university, email, setEmail, accessCode, setAccessCode, error, onSubmit, onDemoSkip, loading }) {
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
          Email instituțional
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
          Folosim email-ul instituțional pentru a detecta automat facultatea ta.
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
            maxLength={4}
            value={accessCode}
            onChange={e => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
            placeholder="0000"
            className="flex-1 bg-transparent px-3 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none tracking-[0.35em] font-mono"
          />
        </div>
        <p className="text-[11px] text-slate-700 mt-1.5 pl-1">
          Cod emis de universitate la crearea contului. Pentru demo: <span className="text-slate-500 font-mono">0000</span>.
        </p>
        {error && <p className="text-[11px] text-red-400 mt-1.5 pl-1">{error}</p>}
      </div>

      <button
        onClick={onSubmit}
        disabled={!email.trim() || accessCode.length !== 4 || loading}
        className={clsx(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[13px] transition-all duration-200',
          email.trim() && accessCode.length === 4 && !loading
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
            : 'bg-white/[0.03] text-slate-600 cursor-not-allowed border border-white/[0.06]',
        )}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
        {loading ? 'Se trimite...' : 'Continuă'}
      </button>

      <button
        onClick={onDemoSkip}
        className="w-full flex items-center justify-center gap-2 text-[12px] text-slate-700 hover:text-slate-400 text-center transition-colors py-1"
      >
        <Zap size={12} strokeWidth={2} /> Skip pentru demo
      </button>
    </div>
  )
}

function ProfessorLogin({ email, setEmail, accessCode, setAccessCode, error, onSubmit, loading }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
        <p className="text-[13px] font-semibold text-amber-200">{DEMO_PROFESSOR.name}</p>
        <p className="text-[11px] text-amber-200/70 mt-0.5">{DEMO_PROFESSOR.facultyName} – TUIASI</p>
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
            maxLength={4}
            value={accessCode}
            onChange={e => setAccessCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
            placeholder="0000"
            className="flex-1 bg-transparent px-3 py-3 text-[13px] text-slate-200 placeholder-slate-700 outline-none tracking-[0.35em] font-mono"
          />
        </div>
        <p className="text-[11px] text-slate-700 mt-1.5 pl-1">
          Demo: <span className="text-slate-500 font-mono">{DEMO_PROFESSOR.email}</span> / <span className="text-slate-500 font-mono">0000</span>
        </p>
        {error && <p className="text-[11px] text-red-400 mt-1.5 pl-1">{error}</p>}
      </div>

      <button
        onClick={onSubmit}
        disabled={!email.trim() || accessCode.length !== 4 || loading}
        className={clsx(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[13px] transition-all duration-200',
          email.trim() && accessCode.length === 4 && !loading
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

function VerifyingStep({ email, university }) {
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
        {[
          { label: 'Validare email instituțional', done: true },
          { label: 'Detectare facultate din baza de date', done: true },
          { label: 'Creare profil personalizat', done: false },
        ].map((s, i) => (
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

function ConfirmedStep({ university, detectedFaculty, onContinue }) {
  return (
    <div className="text-center space-y-5">
      <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto">
        <Check size={24} className="text-emerald-400" strokeWidth={2} />
      </div>
      <div>
        <p className="text-[17px] font-bold text-white mb-3">Bun venit la StudentAcademic!</p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[12px] font-semibold"
          style={{ background: university.color + '12', borderColor: university.color + '35', color: university.color }}
        >
          <span>{university.shortName}</span>
        </div>
      </div>
      <p className="text-[13px] text-slate-500 leading-relaxed">
        Am detectat profilul tău universitar. Urmează câteva întrebări rapide ca să personalizăm
        experiența în funcție de facultatea și nevoile tale.
      </p>
      <button
        onClick={onContinue}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-[13px] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]"
      >
        Începe setup-ul profilului <ArrowRight size={15} />
      </button>
    </div>
  )
}

export default function AuthFlow() {
  const { login } = useAuth()
  const [role, setRole] = useState('student')
  const [step, setStep] = useState(STEP.SELECT_UNI)
  const [university, setUniversity] = useState(null)
  const [email, setEmail] = useState('')
  const [professorEmail, setProfessorEmail] = useState(DEMO_PROFESSOR.email)
  const [accessCode, setAccessCode] = useState('')
  const [accessCodeError, setAccessCodeError] = useState('')
  const [loading, setLoading] = useState(false)
  const [detectedFaculty, setDetectedFaculty] = useState(null)

  function selectUniversity(u) { setUniversity(u); setStep(STEP.ENTER_EMAIL) }

  async function handleEmailSubmit() {
    if (accessCode !== '0000') { setAccessCodeError('Cod institutional invalid. Pentru demo foloseste 0000.'); return }
    setAccessCodeError(''); setLoading(true); setStep(STEP.VERIFYING)
    await new Promise(r => setTimeout(r, 2600))
    setDetectedFaculty(null)
    setLoading(false); setStep(STEP.CONFIRMED)
  }

  async function handleDemoSkip() {
    setAccessCode('0000'); setAccessCodeError(''); setLoading(true); setStep(STEP.VERIFYING)
    await new Promise(r => setTimeout(r, 2600))
    setDetectedFaculty(null)
    setLoading(false); setStep(STEP.CONFIRMED)
  }

  function handleContinue() {
    login({
      role: 'student',
      userId: createUserId('mock'),
      email: email ? `${email}@${university.emailDomain}` : `student@${university.emailDomain}`,
      university, detectedFaculty, isNewUser: true,
    })
  }

  async function handleProfessorSubmit() {
    if (professorEmail.trim().toLowerCase() !== DEMO_PROFESSOR.email || accessCode !== DEMO_PROFESSOR.password) {
      setAccessCodeError('Cont profesor invalid. Pentru demo folosește mihai.ciobanu@academic.tuiasi.ro și codul 0000.')
      return
    }
    setAccessCodeError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    login({
      role: 'professor',
      userId: DEMO_PROFESSOR.id,
      email: DEMO_PROFESSOR.email,
      university: TUIASI,
      detectedFaculty: AC_FACULTY,
      profile: {
        ...DEMO_PROFESSOR,
        university: TUIASI,
        detectedFaculty: AC_FACULTY,
        facultyCode: 'AC',
        facultyType: 'ENGINEERING_CS',
      },
      isNewUser: false,
    })
  }

  const STEP_LABELS = ['Universitate', 'Email', 'Verificare', 'Confirmat']

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[160px] animate-glow-pulse"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.32) 0%, rgba(139,92,246,0.14) 45%, transparent 70%)' }}
        />
        <div className="absolute inset-0 grid-lines" />
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div
          className="absolute bottom-0 inset-x-0 h-64"
          style={{ background: 'linear-gradient(to top, #050810 0%, transparent 100%)' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="relative w-fit mx-auto mb-5">
            {/* Outer glow */}
            <div
              className="absolute inset-[-8px] rounded-[1.5rem] blur-xl opacity-60 animate-glow-pulse"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6), transparent 70%)' }}
            />
            <div className="relative p-[2px] rounded-[1.4rem] bg-gradient-to-b from-white/25 to-white/[0.03]">
              <div
                className="w-16 h-16 rounded-[calc(1.4rem-2px)] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(140deg, #6366f1 0%, #4f46e5 40%, #7c3aed 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 20px rgba(99,102,241,0.4)',
                }}
              >
                <Compass size={26} className="text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
          <h1 className="text-[24px] font-bold text-white tracking-tight">StudentCompass</h1>
          <p className="text-slate-600 text-[12px] mt-1.5 font-medium">De la pierdut, la acasă.</p>
        </div>

        {/* Card — double bezel */}
        <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/[0.1] to-white/[0.02]">
          <div
            className="rounded-[calc(1rem-1px)] p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.9),0_2px_4px_rgba(0,0,0,0.5)]"
            style={{
              background: 'linear-gradient(160deg, #0d1426 0%, #0a0f1e 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                ['student', 'Student', Compass],
                ['professor', 'Profesor', GraduationCap],
              ].map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => {
                    setRole(id)
                    setAccessCodeError('')
                    setStep(STEP.SELECT_UNI)
                    if (id === 'professor') setAccessCode('0000')
                  }}
                  className={clsx(
                    'h-10 rounded-xl border text-[12px] font-bold flex items-center justify-center gap-2 transition-all',
                    role === id
                      ? id === 'professor' ? 'border-amber-500/40 bg-amber-500/15 text-amber-200' : 'border-indigo-500/40 bg-indigo-500/15 text-indigo-200'
                      : 'border-white/[0.06] bg-white/[0.03] text-slate-500 hover:text-slate-300',
                  )}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Step indicator */}
            {role === 'student' && (
              <div className="flex items-center gap-2 mb-6">
                {step > STEP.SELECT_UNI && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.12] transition-all mr-1"
                  >
                    <ChevronLeft size={13} className="text-slate-500" strokeWidth={1.75} />
                  </button>
                )}
                {STEP_LABELS.map((label, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div
                      title={label}
                      className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300',
                        i < step
                          ? 'text-white shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                          : i === step
                          ? 'border border-indigo-500/50 text-indigo-400 bg-indigo-500/10'
                          : 'bg-white/[0.03] border border-white/[0.07] text-slate-700',
                      )}
                      style={i < step ? { background: 'linear-gradient(135deg,#6366f1,#7c3aed)' } : undefined}
                    >
                      {i < step ? <Check size={10} strokeWidth={2.5} /> : i + 1}
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div
                        className="h-px w-5 rounded-full transition-all duration-500"
                        style={{
                          background: i < step
                            ? 'linear-gradient(90deg,#6366f1,#7c3aed)'
                            : 'rgba(255,255,255,0.07)',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step title */}
            <div className="mb-5">
              <h2 className="text-[16px] font-bold text-white">
                {role === 'professor' && 'Autentificare profesor'}
                {role === 'student' && step === STEP.SELECT_UNI && 'Selectează universitatea'}
                {role === 'student' && step === STEP.ENTER_EMAIL && 'Autentifică-te'}
                {role === 'student' && step === STEP.VERIFYING && 'Verificare în curs'}
                {role === 'student' && step === STEP.CONFIRMED && 'Identitate confirmată'}
              </h2>
              {role === 'student' && step === STEP.SELECT_UNI && (
                <p className="text-[11px] text-slate-600 mt-0.5">Disponibil pentru {UNIVERSITIES.length} universități din România</p>
              )}
              {role === 'professor' && (
                <p className="text-[11px] text-slate-600 mt-0.5">Profesorii intra direct cu contul emis de facultate.</p>
              )}
            </div>

            {role === 'professor' && (
              <ProfessorLogin
                email={professorEmail}
                setEmail={setProfessorEmail}
                accessCode={accessCode}
                setAccessCode={setAccessCode}
                error={accessCodeError}
                onSubmit={handleProfessorSubmit}
                loading={loading}
              />
            )}
            {role === 'student' && step === STEP.SELECT_UNI && <UniversityGrid onSelect={selectUniversity} />}
            {role === 'student' && step === STEP.ENTER_EMAIL && (
              <EmailStep university={university} email={email} setEmail={setEmail}
                accessCode={accessCode} setAccessCode={setAccessCode}
                error={accessCodeError} onSubmit={handleEmailSubmit}
                onDemoSkip={handleDemoSkip} loading={loading} />
            )}
            {role === 'student' && step === STEP.VERIFYING && <VerifyingStep email={email} university={university} />}
            {role === 'student' && step === STEP.CONFIRMED && (
              <ConfirmedStep university={university} detectedFaculty={detectedFaculty} onContinue={handleContinue} />
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-800 mt-6">
          Acces exclusiv prin email instituțional · Date protejate
        </p>
      </div>
    </div>
  )
}
