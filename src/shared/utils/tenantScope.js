export function getTenantScope(profile, session) {
  const universityId = profile?.university?.id || session?.university?.id || profile?.universityId || 'unknown-university'
  const facultyCode = profile?.facultyCode || session?.detectedFaculty?.code || profile?.detectedFaculty?.code || 'unknown-faculty'
  const scope = `${universityId}:${facultyCode}`
  return { universityId, facultyCode, scope }
}

export function isKnownTenantScope(profile, session) {
  const { universityId, facultyCode } = getTenantScope(profile, session)
  return universityId !== 'unknown-university' && facultyCode !== 'unknown-faculty'
}

export function getScopeLabel(lifeProfile) {
  const uni = lifeProfile?.universityId ? lifeProfile.universityId.toUpperCase() : null
  const fac = lifeProfile?.facultyCode || null
  if (!uni && !fac) return null
  if (uni && fac) return `${uni} · ${fac}`
  return uni || fac
}
