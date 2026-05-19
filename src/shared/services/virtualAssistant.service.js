const API_URL = import.meta.env.VITE_NAVIGATION_API_URL || '/api/navigation'

const FEATURE_GUIDE = {
  dashboard: 'Dashboard gives the student a summary of modules, next class, schedule, and notifications.',
  navigator: 'Campus Navigator helps with outdoor routes, indoor room paths, photo-based location help, and guided tours.',
  schedule: 'Schedule Hub manages weekly classes, recovery slots, and peer-to-peer slot swaps.',
  thesis: 'Thesis Finder helps students search professors, review requirements, and submit thesis requests.',
  tutoring: 'Peer Tutoring helps students find tutors or exchange skills with classmates.',
  messages: 'Messages are scoped to students from the same university and faculty.',
  discounts: 'Student Life contains discounts, benefits, events, and student community information.',
  career: 'Career contains internship and student opportunity information.',
  citylife: 'City Adaptation covers housing, transport, safe zones, local tips, and first-week guidance.',
  professor: 'The Professor Portal handles thesis requests, recovery requests, academic profile data, and professor-student conversations.',
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function profileLine(context) {
  if (context?.role === 'professor') {
    return 'You are in the professor portal. You can review student requests, update your academic profile, and answer messages.'
  }
  const faculty = context?.faculty || context?.detectedFaculty || 'your faculty'
  const year = context?.year || 'your current study year'
  return `You are using the student workspace for ${faculty}, ${year}.`
}

export function localVirtualAssistantAnswer(message, context = {}) {
  const q = normalize(message)
  const current = context?.currentView
  const currentGuide = FEATURE_GUIDE[current]

  if (!q.trim()) {
    return {
      answer: `Ask me about your account, app modules, thesis requests, schedules, messages, campus navigation, or basic student-life questions. ${profileLine(context)}`,
      suggestions: defaultSuggestions(context),
    }
  }

  if (q.includes('cont') || q.includes('account') || q.includes('profil') || q.includes('profile')) {
    return {
      answer: context?.role === 'professor'
        ? 'Your professor account stores your academic profile, published courses, consultation hours, thesis requests, recovery requests, and message threads. Use the profile section to update public academic details.'
        : 'Your student account is built from your institutional email, detected university, detected faculty, and onboarding profile. For demo access, students use code 0000. If onboarding appears again, complete it once and the profile is saved for later sessions.',
      suggestions: ['How do notifications work?', 'Where are my messages?', 'How do I change sections?'],
    }
  }

  if (q.includes('parola') || q.includes('cod') || q.includes('login') || q.includes('logare') || q.includes('sign in')) {
    return {
      answer: 'For this demo, access uses an institutional-style email and the code 0000. The professor demo uses andrei.munteanu@uaic.ro with the same code.',
      suggestions: ['What can a student do?', 'What can a professor do?'],
    }
  }

  if (q.includes('notific')) {
    return {
      answer: 'Notifications are used for professor decisions, recovery request updates, direct messages, and schedule swap matches. Student-professor notifications are also mirrored locally so the demo remains usable without a database.',
      suggestions: ['Open messages', 'How do thesis requests work?'],
    }
  }

  if (q.includes('mesaj') || q.includes('message') || q.includes('chat')) {
    return {
      answer: context?.role === 'professor'
        ? 'In the professor portal, Messages contains conversations started from thesis or recovery flows. You can select a student thread and reply directly.'
        : 'Student direct messages work through WebSocket channels and are limited to classmates from the same university and faculty. Professor conversations are handled through the professor portal workflow.',
      suggestions: ['How do notifications work?', 'Open messages'],
    }
  }

  if (q.includes('licenta') || q.includes('thesis') || q.includes('profesor')) {
    return {
      answer: context?.role === 'professor'
        ? 'In the professor portal, the thesis area lets you review incoming student requests, read each thesis idea and motivation, accept or reject the request, add an optional note, notify the student, and continue the discussion in Messages.'
        : 'Thesis Finder lets students filter professors by domain and availability, review each professor requirements, and send a request with an optional file. Professors can accept or reject requests and send a note back.',
      suggestions: context?.role === 'professor'
        ? ['Open thesis requests', 'How do messages work?', 'How do notifications work?']
        : ['Open Thesis Finder', 'How do professor notifications work?'],
    }
  }

  if (q.includes('orar') || q.includes('schedule') || q.includes('recuper')) {
    return {
      answer: 'Schedule Hub shows weekly classes, recovery options, and peer-to-peer slot swaps. When two compatible swap requests match, the app sends a real-time event.',
      suggestions: ['Open Schedule Hub', 'How do notifications work?'],
    }
  }

  if (q.includes('harta') || q.includes('campus') || q.includes('navig') || q.includes('sala') || q.includes('room')) {
    return {
      answer: 'Campus Navigator supports outdoor campus routes, indoor routes between known rooms, photo-based location help, and guided presentations with voice narration.',
      suggestions: ['Open Campus Navigator', 'How does photo recognition work?'],
    }
  }

  if (q.includes('camin') || q.includes('transport') || q.includes('reduc') || q.includes('oras') || q.includes('city')) {
    return {
      answer: 'City Adaptation and Student Life cover housing, transport, student discounts, safe zones, local tips, clubs, events, and practical services around the student experience.',
      suggestions: ['Open City Adaptation', 'Open Student Life'],
    }
  }

  if (q.includes('pagina') || q.includes('unde sunt') || q.includes('current') || q.includes('sectiune')) {
    return {
      answer: currentGuide
        ? `You are currently in ${context.currentLabel || current}. ${currentGuide}`
        : profileLine(context),
      suggestions: defaultSuggestions(context),
    }
  }

  return {
    answer: `I can help with account questions, navigation inside StudentCompass, module explanations, thesis requests, schedules, messages, and basic student-life topics. ${currentGuide ? `Current area: ${currentGuide}` : profileLine(context)}`,
    suggestions: defaultSuggestions(context),
  }
}

export function defaultSuggestions(context = {}) {
  if (context.role === 'professor') {
    return ['What can I manage here?', 'How do thesis requests work?', 'How do messages work?']
  }
  return ['What can I do here?', 'Open Campus Navigator', 'How do thesis requests work?']
}

export async function askVirtualAssistant({ message, context, history }) {
  try {
    const response = await fetch(`${API_URL}/support-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, history }),
    })
    if (!response.ok) throw new Error(`Assistant API ${response.status}`)
    const data = await response.json()
    return {
      answer: data.answer || localVirtualAssistantAnswer(message, context).answer,
      suggestions: Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : defaultSuggestions(context),
    }
  } catch {
    return localVirtualAssistantAnswer(message, context)
  }
}
