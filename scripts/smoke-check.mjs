import assert from 'node:assert/strict'

const nav = await import('../server/handlers/navigation.js')
assert.equal(typeof nav.createNavigationRequestHandler, 'function')
assert.equal(typeof nav.createNavigationApiServer, 'function')

const mockData = await import('../src/shared/data/mockData.js')
assert.ok(Array.isArray(mockData.FACULTIES))
assert.ok(Array.isArray(mockData.schedule))

const personalization = await import('../src/shared/data/domainPersonalization.js')
assert.ok(personalization.ALL_FACULTY_QUESTIONS && typeof personalization.ALL_FACULTY_QUESTIONS === 'object')

const lifeData = await import('../src/features/student-life/studentLifeData.js')
assert.ok(lifeData.studentLifeData && typeof lifeData.studentLifeData === 'object')

console.log('Smoke checks passed.')
