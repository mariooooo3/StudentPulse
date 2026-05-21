export function nameFromEmail(email) {
  if (!email) return 'Utilizator'
  const local = email.split('@')[0]
  return local.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function avatarLetters(name) {
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2).toUpperCase()
}

const COLORS = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-yellow-500 to-orange-500',
]

export function colorFor(userId) {
  let hash = 0
  for (const c of userId || '') hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return COLORS[Math.abs(hash) % COLORS.length]
}

export const GROUP_CHANNELS = [
  { id: 'general', label: 'general', description: 'Discutii generale', members: null },
  { id: 'cursuri', label: 'cursuri', description: 'Intrebari despre cursuri', members: null },
  { id: 'proiecte', label: 'proiecte', description: 'Colaborare la proiecte', members: null },
  { id: 'off-topic', label: 'off-topic', description: 'Orice altceva', members: null },
]
