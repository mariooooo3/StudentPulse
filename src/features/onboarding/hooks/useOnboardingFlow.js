import { useEffect, useMemo, useRef, useState } from 'react'
import { ALL_FACULTY_QUESTIONS as FACULTY_QUESTIONS } from '../../../shared/data/domainPersonalization'
import { generateAdaptationProfile } from '../../../shared/services/ai.service'
import { BASE_AFTER } from '../onboarding.constants'

export function useOnboardingFlow(session) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState({})
  const [done, setDone] = useState(false)
  const [aiProfile, setAiProfile] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const answersRef = useRef(answers)

  const universityFaculties = session?.university?.faculties || []
  const university = session?.university

  const faculty = answers.faculty
  const facultyQ = faculty ? FACULTY_QUESTIONS[faculty.type] || null : null

  const STEPS = useMemo(() => {
    const defaultYears = [
      { label: 'Anul 1', desc: 'Primul an de licenÈ›Äƒ' },
      { label: 'Anul 2', desc: 'Al doilea an de licenÈ›Äƒ' },
      { label: 'Anul 3', desc: 'Al treilea an de licenÈ›Äƒ' },
      { label: 'Master', desc: 'Studii postuniversitare' },
    ]
    const steps = [
      {
        id: 'faculty',
        emoji: 'ðŸŽ“',
        question: 'La ce facultate eÈ™ti Ã®nscris?',
        subtitle: university ? `FacultÄƒÈ›ile disponibile la ${university.shortName}` : 'SelecteazÄƒ sau cautÄƒ facultatea ta',
        type: 'faculty',
      },
    ]

    if (faculty?.code === 'AC') {
      steps.push({
        id: 'specialization',
        emoji: 'ðŸ–¥ï¸',
        question: 'Ce specializare urmezi?',
        subtitle: 'Fiecare specializare are materii, profesori È™i structurÄƒ diferite',
        type: 'cards',
        options: [
          { label: 'CTI', desc: 'Calculatoare È™i Tehnologia InformaÈ›iei â€” Dep. Calculatoare (DC)' },
          { label: 'IS', desc: 'InformaticÄƒ AplicatÄƒ / AutomaticÄƒ â€” Dep. AutomaticÄƒ È™i InformaticÄƒ AplicatÄƒ (DAIA)' },
        ],
      })
    }

    steps.push({
      id: 'year',
      emoji: 'ðŸ“…',
      question: 'ÃŽn ce an de studiu eÈ™ti?',
      subtitle: 'Vom prioritiza informaÈ›iile relevante pentru anul tÄƒu',
      type: 'cards',
      options: faculty?.years || defaultYears,
    })

    if (facultyQ) {
      steps.push({
        id: 'interests',
        emoji: 'ðŸ’¡',
        question: facultyQ.interestsLabel,
        subtitle: 'SelecteazÄƒ unul sau mai multe â€” personalizÄƒm tutorii È™i tema de licenÈ›Äƒ',
        type: 'tags',
        options: facultyQ.interests,
      })
      steps.push({ id: 'specific', emoji: 'ðŸ”', ...facultyQ.specific })
      steps.push({ id: 'experience', emoji: 'â­', ...facultyQ.experience })
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

  function setAnswer(val) {
    setAnswers(p => ({ ...p, [q.id]: val }))
  }

  function setFaculty(val) {
    setAnswers(p => ({ ...p, faculty: val }))
  }

  function toggleTag(tag) {
    setAnswers(p => {
      const curr = p[q.id] || []
      return { ...p, [q.id]: curr.includes(tag) ? curr.filter(t => t !== tag) : [...curr, tag] }
    })
  }

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    if (!done) return
    let cancelled = false
    setAiLoading(true)
    generateAdaptationProfile(answersRef.current)
      .then(profile => { if (!cancelled) setAiProfile(profile) })
      .finally(() => { if (!cancelled) setAiLoading(false) })
    return () => { cancelled = true }
  }, [done])

  function next() {
    if (!canProceed()) return
    if (step < total - 1) {
      setDirection(1)
      setStep(s => s + 1)
    } else {
      setDone(true)
    }
  }

  function prev() {
    if (step > 0) {
      setDirection(-1)
      setStep(s => s - 1)
    }
  }

  return {
    step,
    direction,
    answers,
    done,
    aiProfile,
    aiLoading,
    university,
    universityFaculties,
    total,
    q,
    answer,
    canProceed,
    setAnswer,
    setFaculty,
    toggleTag,
    next,
    prev,
  }
}
