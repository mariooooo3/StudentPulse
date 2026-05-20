import { useState, useMemo } from 'react'
import { ChevronRight, ChevronLeft, Check, Compass, Search, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALL_FACULTY_QUESTIONS as FACULTY_QUESTIONS } from '../../shared/data/domainPersonalization'
import clsx from 'clsx'

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total }) {
  const pct = Math.round(((step) / total) * 100)
  return (
    <div className="mb-8 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">Progres</span>
        <span className="text-[11px] font-bold text-indigo-400">{pct}%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        />
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'h-0.5 flex-1 rounded-full transition-all duration-500',
              i < step ? 'bg-indigo-500' : i === step ? 'bg-indigo-400/40' : 'bg-white/[0.05]',
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Select option ─────────────────────────────────────────────────────────────
function SelectOption({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2',
        selected
          ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.12)]'
          : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:border-white/[0.12] hover:text-white hover:bg-white/[0.05] hover:-translate-y-px',
      )}
    >
      <span className={clsx(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
        selected ? 'border-indigo-500 bg-indigo-500' : 'border-white/[0.2]',
      )}>
        {selected && <Check size={9} className="text-white" />}
      </span>
      {label}
    </button>
  )
}

// ─── Card option ───────────────────────────────────────────────────────────────
function CardOption({ opt, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all duration-200',
        selected
          ? 'bg-indigo-600/20 border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.13)] -translate-y-px'
          : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] hover:-translate-y-px',
      )}
    >
      <div className={clsx(
        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
        selected ? 'border-indigo-500 bg-indigo-500' : 'border-white/[0.2]',
      )}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <div>
        <p className={clsx('font-semibold text-sm', selected ? 'text-indigo-300' : 'text-slate-200')}>{opt.label}</p>
        {opt.desc && <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>}
      </div>
    </button>
  )
}

// ─── Tag / chip options ────────────────────────────────────────────────────────
function TagOptions({ options, selected = [], onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(tag => {
        const sel = selected.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={clsx(
              'chip transition-all duration-200',
              sel
                ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.18)]'
                : 'hover:border-white/[0.14] hover:text-white',
            )}
          >
            {sel && <Check size={10} className="text-indigo-400" />}
            {tag}
          </button>
        )
      })}
    </div>
  )
}

// ─── Faculty search step ───────────────────────────────────────────────────────
function FacultyStep({ value, onChange, universityFaculties }) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(
    () => universityFaculties.filter(f => f.name.toLowerCase().includes(search.toLowerCase())),
    [search, universityFaculties],
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 focus-within:border-indigo-500/40 transition-colors">
        <Search size={14} className="text-slate-500 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          className="bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none flex-1"
          placeholder="Caută facultatea ta..."
        />
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
        {filtered.map(f => (
          <SelectOption
            key={f.code}
            label={f.name}
            selected={value?.code === f.code}
            onClick={() => onChange(f)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-600 text-center py-6">
            Nicio facultate găsită. Încearcă alți termeni.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Step definitions (base + dynamic) ────────────────────────────────────────
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
      { label: 'Acasă', desc: 'Locuiesc cu familia' },
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

// ─── Main component ────────────────────────────────────────────────────────────
export default function OnboardingFlow({ onComplete, session }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [answers, setAnswers] = useState({})
  const [done, setDone] = useState(false)

  const universityFaculties = session?.university?.faculties || []
  const university = session?.university

  const faculty = answers.faculty
  const facultyQ = faculty ? FACULTY_QUESTIONS[faculty.type] || null : null

  const STEPS = useMemo(() => {
    const defaultYears = [
      { label: 'Anul 1', desc: 'Primul an de licență' },
      { label: 'Anul 2', desc: 'Al doilea an de licență' },
      { label: 'Anul 3', desc: 'Al treilea an de licență' },
      { label: 'Master', desc: 'Studii postuniversitare' },
    ]
    const steps = [
      {
        id: 'faculty',
        emoji: '🎓',
        question: 'La ce facultate ești înscris?',
        subtitle: university ? `Facultățile disponibile la ${university.shortName}` : 'Selectează sau caută facultatea ta',
        type: 'faculty',
      },
    ]

    if (faculty?.code === 'AC') {
      steps.push({
        id: 'specialization',
        emoji: '🖥️',
        question: 'Ce specializare urmezi?',
        subtitle: 'Fiecare specializare are materii, profesori și structură diferite',
        type: 'cards',
        options: [
          { label: 'CTI', desc: 'Calculatoare și Tehnologia Informației — Dep. Calculatoare (DC)' },
          { label: 'IS', desc: 'Informatică Aplicată / Automatică — Dep. Automatică și Informatică Aplicată (DAIA)' },
        ],
      })
    }

    steps.push({
      id: 'year',
      emoji: '📅',
      question: 'În ce an de studiu ești?',
      subtitle: 'Vom prioritiza informațiile relevante pentru anul tău',
      type: 'cards',
      options: faculty?.years || defaultYears,
    })

    if (facultyQ) {
      steps.push({
        id: 'interests',
        emoji: '💡',
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
    if (step < total - 1) { setDirection(1); setStep(s => s + 1) }
    else setDone(true)
  }
  function prev() {
    if (step > 0) { setDirection(-1); setStep(s => s - 1) }
  }

  // ─── Done screen ─────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-[#050810] dot-grid flex items-center justify-center p-8 overflow-hidden">
        {/* Top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />

        <motion.div
          className="text-center max-w-md relative"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        >
          {/* Check icon */}
          <div className="mx-auto w-fit mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl scale-150" />
            <div className="p-[1.5px] rounded-full bg-gradient-to-b from-emerald-400/40 to-emerald-500/10 relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <Check size={36} className="text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Profilul tău este gata!</h2>
          <p className="text-slate-400 mb-10 leading-relaxed text-sm">
            StudentCompass a personalizat toate modulele în funcție de facultatea, anul și interesele tale.
            De acum, nu te mai pierzi.
          </p>

          {/* Module grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-8">
            {[['🗺️','Navigator'],['📅','Orar'],['🎓','Licență'],['👥','Tutoring'],['🔄','Skill Swap'],['💬','Mesaje']].map(([e, l], i) => (
              <motion.div
                key={l}
                className="glass-card p-3 text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, type: 'spring', stiffness: 80, damping: 18 }}
              >
                <div className="text-2xl mb-1">{e}</div>
                <div className="text-[11px] text-slate-400 font-semibold">{l}</div>
              </motion.div>
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
            className="btn-primary w-full text-base py-3 gap-2"
          >
            <Sparkles size={16} />
            Intră în StudentCompass
          </button>
        </motion.div>
      </div>
    )
  }

  // ─── Step card variants ───────────────────────────────────────────────────────
  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
  }

  // ─── Main flow ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050810] dot-grid flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Top glow orb */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-500/10 via-indigo-500/[0.03] to-transparent" />
      <div className="pointer-events-none absolute top-[-8rem] left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] rounded-full bg-indigo-500/[0.07] blur-3xl" />

      {/* Logo */}
      <motion.div
        className="flex items-center gap-3 mb-10 relative"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      >
        <div className="p-[1.5px] rounded-[0.85rem] bg-gradient-to-b from-white/[0.12] to-white/[0.03]">
          <div className="w-10 h-10 rounded-[0.75rem] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Compass size={20} className="text-white" />
          </div>
        </div>
        <div>
          <p className="font-bold text-white text-[14px] tracking-tight">StudentCompass</p>
          <p className="text-xs text-slate-600">Setup profil · pas {step + 1} din {total}</p>
        </div>
      </motion.div>

      <div className="w-full max-w-md relative">
        <ProgressBar step={step} total={total} />

        {/* Step card with slide transition */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={q.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* bezel-card */}
            <div className="bezel-card">
              <div className="bezel-inner p-8">
                {/* Emoji */}
                <div className="text-4xl mb-5 select-none">{q.emoji}</div>

                {/* Title + subtitle */}
                <h2 className="text-[1.35rem] font-bold text-white mb-1.5 tracking-tight leading-snug">
                  {q.question}
                </h2>
                <p className="text-slate-500 mb-7 text-sm leading-relaxed">{q.subtitle}</p>

                {/* Step body */}
                {q.type === 'faculty' && (
                  <FacultyStep
                    value={answers.faculty}
                    onChange={val => setAnswers(p => ({ ...p, faculty: val }))}
                    universityFaculties={universityFaculties}
                  />
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
                      <CardOption
                        key={opt.label}
                        opt={opt}
                        selected={answer?.label === opt.label}
                        onClick={() => set(opt)}
                      />
                    ))}
                  </div>
                )}
                {q.type === 'tags' && (
                  <TagOptions
                    options={q.options}
                    selected={answers[q.id] || []}
                    onToggle={toggleTag}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={17} />
            Înapoi
          </button>

          <span className="text-[11px] font-mono text-slate-700">
            {step + 1} / {total}
          </span>

          <button
            onClick={next}
            disabled={!canProceed()}
            className={clsx(
              'flex items-center gap-2 btn-primary text-sm transition-opacity',
              !canProceed() && 'opacity-35 cursor-not-allowed',
            )}
          >
            {step === total - 1 ? 'Finalizează' : 'Continuă'}
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
