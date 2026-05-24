import { useRef, useState } from 'react'
import { Compass, Mail, ArrowRight, Check, Loader2, Shield, ChevronLeft, GraduationCap } from 'lucide-react'
import { UNIVERSITIES } from '../../shared/config/universities'
import UniversityGrid from './components/UniversityGrid'
import VerifyingStep from './components/VerifyingStep'
import ConfirmedStep from './components/ConfirmedStep'
import ProfessorLogin from './components/ProfessorLogin'
import EmailStep from './components/EmailStep'
import { useAuth } from '../../app/providers/AuthContext'
import { createUserId, getUserProfile } from '../../shared/services/auth.service'
import { DEMO_PROFESSOR } from '../../shared/services/professorPortal.service'
import { STEP, STEP_LABELS } from './auth.constants'
import { buildUniversityEmail, verifyTotpCode } from './auth.utils'
import clsx from 'clsx'

const TUIASI = UNIVERSITIES.find(u => u.id === 'tuiasi')
const AC_FACULTY = TUIASI?.faculties.find(f => f.code === 'AC')

export default function AuthFlow() {
  const { login } = useAuth()
  const submitIdRef = useRef(0)
  const [role, setRole] = useState('student')
  const [step, setStep] = useState(STEP.SELECT_UNI)
  const [university, setUniversity] = useState(null)
  const [email, setEmail] = useState('')
  const [professorEmail, setProfessorEmail] = useState(DEMO_PROFESSOR.email)
  const [accessCode, setAccessCode] = useState('')
  const [accessCodeError, setAccessCodeError] = useState('')
  const [loading, setLoading] = useState(false)
  const [detectedFaculty, setDetectedFaculty] = useState(null)
  const [isReturning, setIsReturning] = useState(false)

  function selectUniversity(u) { setUniversity(u); setStep(STEP.ENTER_EMAIL) }

  async function handleEmailSubmit() {
    setAccessCodeError(''); setLoading(true)
    const opId = ++submitIdRef.current
    try {
      const valid = await verifyTotpCode(accessCode)
      if (!valid) { setAccessCodeError('Cod invalid sau expirat. Verifică aplicația de autentificare.'); setLoading(false); return }
    } catch {
      setAccessCodeError('Eroare de conexiune. Încearcă din nou.'); setLoading(false); return
    }
    setStep(STEP.VERIFYING)
    await new Promise(r => setTimeout(r, 2600))
    if (opId !== submitIdRef.current) return   // utilizatorul a apăsat înapoi
    setDetectedFaculty(null)
    const fullEmail = buildUniversityEmail(email, university.emailDomain)
    const returning = !!getUserProfile(fullEmail)
    setIsReturning(returning)
    setLoading(false); setStep(STEP.CONFIRMED)
  }

  function handleContinue() {
    login({
      role: 'student',
      userId: createUserId('mock'),
      email: buildUniversityEmail(email, university.emailDomain),
      university, detectedFaculty, isNewUser: !isReturning,
    })
  }

  async function handleProfessorSubmit() {
    if (professorEmail.trim().toLowerCase() !== DEMO_PROFESSOR.email) {
      setAccessCodeError('Email profesor invalid.')
      return
    }
    setAccessCodeError(''); setLoading(true)
    try {
      const valid = await verifyTotpCode(accessCode)
      if (!valid) { setAccessCodeError('Cod invalid sau expirat. Verifică aplicația de autentificare.'); setLoading(false); return }
    } catch {
      setAccessCodeError('Eroare de conexiune. Încearcă din nou.'); setLoading(false); return
    }
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
            {/* Logo waves */}
            <div className="logo-wave" />
            <div className="logo-wave logo-wave-delay" />
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
                    if (id === 'professor') setAccessCode('')
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
                {step === STEP.ENTER_EMAIL && (
                  <button
                    onClick={() => { submitIdRef.current++; setStep(STEP.SELECT_UNI) }}
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
                error={accessCodeError} onSubmit={handleEmailSubmit} loading={loading} />
            )}
            {role === 'student' && step === STEP.VERIFYING && <VerifyingStep email={email} university={university} />}
            {role === 'student' && step === STEP.CONFIRMED && (
              <ConfirmedStep university={university} onContinue={handleContinue} isReturning={isReturning} />
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





