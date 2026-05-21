import { rollingDays } from '../../../shared/utils/dateTime'
import { normalizeCity } from './profileUtils'

export function offerScore(offer, lifeProfile) {
  return (
    (offer.city === 'all' || normalizeCity(offer.city) === lifeProfile.city ? 10 : 0) +
    (offer.verified ? 5 : 0) +
    (offer.popular ? 4 : 0) +
    (rollingDays(offer.id, 2, 30) < 20 ? 3 : 0) +
    (offer.discount >= 40 ? 6 : offer.discount >= 20 ? 3 : 1)
  )
}

export function jobMatch(job, lifeProfile) {
  let score = job.baseMatch

  if (lifeProfile.year < job.minYear) score -= (job.minYear - lifeProfile.year) * 14
  else if (lifeProfile.year >= 4) score += 6
  else if (lifeProfile.year === 3) score += 3
  else if (lifeProfile.year === 1) score -= 8

  const cities = job.cities.map(normalizeCity)
  if (!job.remote && !cities.includes('all') && !cities.includes(lifeProfile.city)) score -= 24
  if (lifeProfile.workPref === 'remote' && !job.remote) score -= 8
  if (lifeProfile.workPref === 'onsite' && job.remote) score -= 4

  score += { none: 0, projects: 5, internship: 11, multi: 17 }[lifeProfile.experience] || 0
  score += { below: -9, average: 0, above: 4, excellent: 9 }[lifeProfile.gpa] || 0

  return Math.min(99, Math.max(8, Math.round(score)))
}
