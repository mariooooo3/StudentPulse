import { facultyCareerKeys } from '../studentLifeData'

export function parseStudyYear(value) {
  const match = String(value || '').match(/\d+/)
  return match ? Number(match[0]) : 2
}

export function normalizeCity(value) {
  return String(value || 'Iasi')
    .replace('Iași', 'Iasi')
    .replace('Timișoara', 'Timisoara')
    .replace('Brașov', 'Brasov')
}

export function buildLifeProfile(profile, session) {
  const facultyType = profile?.facultyType || session?.detectedFaculty?.type || 'CS'
  const careerKey = facultyCareerKeys[facultyType] || 'CS'
  const interests = (profile?.interests || []).map((interest) => String(interest).toLowerCase())

  return {
    name: profile?.name || session?.email?.split('@')[0] || 'Student',
    facultyName: profile?.faculty || session?.detectedFaculty?.name || 'Computer Science',
    careerKey,
    year: parseStudyYear(profile?.year),
    city: normalizeCity(profile?.university?.city || session?.university?.city),
    universityId: profile?.university?.id || session?.university?.id || '',
    facultyCode: profile?.facultyCode || session?.detectedFaculty?.code || '',
    interests: interests.length ? interests : ['coding', 'coffee', 'study'],
    experience: profile?.experience ? 'projects' : 'projects',
    gpa: 'above',
    workPref: 'hybrid',
  }
}
