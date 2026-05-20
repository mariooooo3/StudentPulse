import { useState, useMemo } from 'react'
import { ChevronRight, ChevronLeft, Check, Compass, Search } from 'lucide-react'
import { ALL_FACULTY_QUESTIONS as FACULTY_QUESTIONS } from '../../shared/data/domainPersonalization'
import clsx from 'clsx'

function ProgressBar({ step, total }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={clsx('h-1.5 flex-1 rounded-full transition-all duration-500',
          i < step ? 'bg-indigo-500' : i === step ? 'bg-indigo-400/50' : 'bg-white/[0.07]')} />
      ))}
    </div>
  )
}

function SelectOption({ label, selected, onClick }) {
  return (
    <button onClick={onClick} className={clsx(
      'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 flex items-center gap-2',
      selected ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300'
               : 'bg-white/[0.03] border-white/[0.05] text-slate-300 hover:border-white/[0.1] hover:text-white',
    )}>
      {selected && <Check size={13} className="text-indigo-400 shrink-0" />}{label}
    </button>
  )
}

function CardOption({ opt, selected, onClick }) {
  return (
    <button onClick={onClick} className={clsx(
      'w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-150',
      selected ? 'bg-indigo-600/20 border-indigo-500/60' : 'bg-white/[0.03] border-white/[0.05] hover:border-white/[0.1]',
    )}>
      <div className={clsx('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
        selected ? 'border-indigo-500 bg-indigo-500' : 'border-white/[0.2]')}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <div>
        <p className={clsx('font-semibold text-sm', selected ? 'text-indigo-300' : 'text-slate-200')}>{opt.label}</p>
        {opt.desc && <p className="text-xs text-slate-500">{opt.desc}</p>}
      </div>
    </button>
  )
}

function TagOptions({ options, selected = [], onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(tag => {
        const sel = selected.includes(tag)
        return (
          <button key={tag} onClick={() => onToggle(tag)} className={clsx(
            'px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 flex items-center gap-1.5',
            sel ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                : 'bg-white/[0.03] border-white/[0.05] text-slate-400 hover:border-white/[0.1] hover:text-white',
          )}>
            {sel && <Check size={11} className="text-indigo-400" />}{tag}
          </button>
        )
      })}
    </div>
  )
}

// Faculty search step ──────────────────────────────────────────────────────────
function FacultyStep({ value, onChange, universityFaculties }) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() =>
    universityFaculties.filter(f => f.name.toLowerCase().includes(search.toLowerCase())),
    [search, universityFaculties])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2.5">
        <Search size={15} className="text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          className="bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none flex-1"
          placeholder="Caută facultatea ta..."
        />
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        {filtered.map(f => (
          <SelectOption key={f.code} label={f.name} selected={value?.code === f.code} onClick={() => onChange(f)} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">Nicio facultate găsită. Caută cu alți termeni.</p>
        )}
      </div>
    </div>
  )
}

// Step definitions (base + dynamic) ──────────────────────────────────────────
const BASE_AFTER = [
  {
    id: 'learning_style',
    emoji: '📚',
    question: 'Cum preferi să înveți?',
    subtitle: 'Vom adapta sugestiile de tutoring în funcție de stilul tău',
    type: 'cards',
    options: [
      { label: 'Individual', desc: 'Prefer să studiez singur, în ritmul meu' },
      { label: 'În grup', desc: 'Discuții, dezbateri, explicat colegilor' },
      { label: 'Mixt', desc: 'Combin studiul individual cu grupul' },
    ],
  },
  {
    id: 'schedule_pref',
    emoji: '⏰',
    question: 'Care este programul tău preferat?',
    subtitle: 'Vom prioritiza sesiunile și alertele în funcție de asta',
    type: 'cards',
    options: [
      { label: 'Dimineața', desc: '07:00 – 14:00' },
      { label: 'Seara', desc: '14:00 – 22:00' },
      { label: 'Flexibil', desc: 'Orice oră funcționează' },
    ],
  },
  {
    id: 'housing',
    emoji: '🏠',
    question: 'Unde locuiești?',
    subtitle: 'Vom adapta traseele și alertele de transport',
    type: 'cards',
    options: [
      { label: 'Cămin studențesc', desc: 'Pe campusul universitar' },
      { label: 'Chirie', desc: 'Apartament în afara campusului' },
      { label: 'Acasă (navetist)', desc: 'Vin zilnic din alt oraș' },
    ],
  },
  {
    id: 'notifications',
    emoji: '🔔',
    question: 'Cât de des vrei să fii notificat?',
    subtitle: 'Poți schimba oricând din setări',
    type: 'cards',
    options: [
      { label: 'Agresiv', desc: 'Toate alertele, inclusiv sugestii proactive' },
      { label: 'Moderat', desc: 'Notificări importante și urgente' },
      { label: 'Minimal', desc: 'Doar alertele critice' },
    ],
  },
]

export default function OnboardingFlow({ onComplete, session }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [done, setDone] = useState(false)

  const universityFaculties = session?.university?.faculties || []
  const university = session?.university

  const faculty = answers.faculty  // { code, name, type, years, emailPrefix }
  const facultyQ = faculty ? FACULTY_QUESTIONS[faculty.type] || null : null

  // Build steps dynamically
  const STEPS = useMemo(() => {
    const defaultYears = [
      { label: 'Anul 1', desc: 'Primul an de licență' },
      { label: 'Anul 2', desc: 'Al doilea an de licență' },
      { label: 'Anul 3', desc: 'Al treilea an de licență' },
      { label: 'Master', desc: 'Studii postuniversitare' },
    ]
    const steps = [
      { id: 'faculty', emoji: '🎓', question: 'La ce facultate ești înscris?', subtitle: university ? `Facultățile disponibile la ${university.shortName}` : 'Selectează sau caută facultatea ta', type: 'faculty' },
    ]

    if (faculty?.code === 'AC') {
      steps.push({
        id: 'specialization', emoji: '🖥️', question: 'Ce specializare urmezi?',
        subtitle: 'Fiecare specializare are materii, profesori și structură diferite',
        type: 'cards',
        options: [
          { label: 'CTI', desc: 'Calculatoare și Tehnologia Informației — Dep. Calculatoare (DC)' },
          { label: 'IS', desc: 'Informatică Aplicată / Automatică — Dep. Automatică și Informatică Aplicată (DAIA)' },
        ],
      })
    }

    steps.push({
      id: 'year', emoji: '📅', question: 'În ce an de studiu ești?',
      subtitle: 'Vom prioritiza informațiile relevante pentru anul tău',
      type: 'cards',
      options: faculty?.years || defaultYears,
    })

    if (facultyQ) {
      steps.push({
        id: 'interests', emoji: '💡',
        question: facultyQ.interestsLabel,
        subtitle: 'Selectează unul sau mai multe — personalizăm tutorii și tema de licență',
        type: 'tags',
        options: facultyQ.interests,
      })
      steps.push({ id: 'specific', emoji: '🔍', ...facultyQ.specific })
      steps.push({ id: 'experience', emoji: '⭐', ...facultyQ.experience })
    }

    return [...steps, ...BASE_AFTER.map(q => ({ ...q }))]
  }, [facultyQ, faculty, university])

  const total = STEPS.length
  const q = STEPS[step]
  const answer = answers[q?.id]

  const canProceed = () => {
    if (q?.type === 'faculty') return !!answers.faculty || universityFaculties.length === 0
    if (q?.type === 'tags') return (answers[q.id] || []).length > 0
    return answer !== undefined
  }

  function set(val) { setAnswers(p => ({ ...p, [q.id]: val })) }
  function toggleTag(tag) {
    setAnswers(p => {
      const curr = p[q.id] || []
      return { ...p, [q.id]: curr.includes(tag) ? curr.filter(t => t !== tag) : [...curr, tag] }
    })
  }

  function next() {
    if (!canProceed()) return
    if (step < total - 1) setStep(s => s + 1)
    else setDone(true)
  }
  function prev() { if (step > 0) setStep(s => s - 1) }

  if (done) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-8">
        <div className="text-center max-w-md animate-slide-up">
          <div className="p-[1.5px] rounded-full bg-gradient-to-b from-emerald-400/30 to-emerald-500/10 mx-auto w-fit mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Check size={36} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Profilul tău este gata!</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            StudentCompass a personalizat toate modulele în funcție de facultatea, anul și interesele tale.
            De acum, nu te mai pierzi.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[['🗺️','Navigator'],['📅','Orar'],['🎓','Licență'],['👥','Tutoring'],['🔄','Skill Swap'],['💬','Mesaje']].map(([e,l]) => (
              <div key={l} className="glass-card p-3 text-center">
                <div className="text-2xl mb-1">{e}</div>
                <div className="text-xs text-slate-400 font-medium">{l}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onComplete({
              faculty: answers.faculty?.name || university?.shortName || 'FII',
              facultyCode: answers.faculty?.code || '',
              facultyType: answers.faculty?.type || 'CS',
              specialization: answers.specialization?.label || null,
              year: answers.year?.label || 'Anul 1',
              interests: answers.interests || [],
              learningStyle: answers.learning_style?.label,
              housing: answers.housing?.label,
            })}
            className="btn-primary w-full text-base py-3"
          >
            Intră în StudentCompass →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-[1.5px] rounded-[0.85rem] bg-gradient-to-b from-white/10 to-white/[0.03]">
          <div className="w-10 h-10 rounded-[0.75rem] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Compass size={20} className="text-white" />
          </div>
        </div>
        <div>
          <p className="font-bold text-white text-[14px] tracking-tight">StudentCompass</p>
          <p className="text-xs text-slate-600">Setup profil — {step + 1} din {total}</p>
        </div>
      </div>

      <div className="w-full max-w-xl">
        <ProgressBar step={step} total={total} />

        <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02]" key={q.id}>
        <div className="rounded-[calc(1rem-1px)] bg-[#0c1120] border border-white/[0.04] p-8 animate-fade-in">
          <div className="text-4xl mb-4">{q.emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-2">{q.question}</h2>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">{q.subtitle}</p>

          {q.type === 'faculty' && (
            <FacultyStep value={answers.faculty} onChange={val => setAnswers(p => ({ ...p, faculty: val }))} universityFaculties={universityFaculties} />
          )}
          {q.type === 'select' && (
            <div className="space-y-2">
              {q.options.map(opt => (
                <SelectOption key={opt} label={opt} selected={answer === opt} onClick={() => set(opt)} />
              ))}
            </div>
          )}
          {q.type === 'cards' && (
            <div className="space-y-2">
              {q.options.map(opt => (
                <CardOption key={opt.label} opt={opt} selected={answer?.label === opt.label} onClick={() => set(opt)} />
              ))}
            </div>
          )}
          {q.type === 'tags' && (
            <TagOptions options={q.options} selected={answers[q.id] || []} onToggle={toggleTag} />
          )}
        </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={prev} disabled={step === 0} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft size={18} /> Înapoi
          </button>
          <span className="text-xs text-slate-600">{step + 1} / {total}</span>
          <button onClick={next} disabled={!canProceed()} className={clsx('flex items-center gap-2 btn-primary text-sm', !canProceed() && 'opacity-40 cursor-not-allowed')}>
            {step === total - 1 ? 'Finalizează' : 'Continuă'} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
