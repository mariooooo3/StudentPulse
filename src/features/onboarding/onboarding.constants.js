export const BASE_AFTER = [
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

export const ONBOARDING_MODULES = [
  ['🗺️', 'Navigator'],
  ['📅', 'Orar'],
  ['🎓', 'Licență'],
  ['👥', 'Tutoring'],
  ['🔄', 'Skill Swap'],
  ['💬', 'Mesaje'],
]
