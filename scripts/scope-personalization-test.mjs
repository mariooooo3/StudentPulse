import assert from 'node:assert/strict'
import {
  getFacultyKey,
  getProfessors,
  getScheduleData,
  getTutors,
} from '../src/shared/data/facultyCatalog.js'
import {
  eventsData,
  getScopedEvents,
  studentLifeData,
  getScopedDiscountOffers,
  getScopedCommunityGroups,
  booksData,
  roommateData,
  getScopedToolsData,
  carpoolData,
} from '../src/features/student-life/studentLifeData.js'

// ── Profiles & sessions ──────────────────────────────────────────────────────
const tuiasiSession = { university: { id: 'tuiasi', city: 'Iasi' }, detectedFaculty: { code: 'AC', name: 'AC' } }
const uaicSession   = { university: { id: 'uaic',   city: 'Iasi' }, detectedFaculty: { code: 'FII', name: 'FII' } }

const tuiasiProfile = { facultyCode: 'AC',  facultyType: 'ENGINEERING_CS', university: { id: 'tuiasi', city: 'Iasi' } }
const uaicProfile   = { facultyCode: 'FII', facultyType: 'CS',             university: { id: 'uaic',   city: 'Iasi' } }

// ── 1. Faculty key isolation ─────────────────────────────────────────────────
assert.ok(getFacultyKey(tuiasiProfile, tuiasiSession)?.startsWith('ENGINEERING_CS'), 'TUIASI AC key should start with ENGINEERING_CS')
assert.equal(getFacultyKey(uaicProfile, uaicSession), 'CS', 'UAIC FII key should be CS')
assert.notEqual(getFacultyKey(tuiasiProfile, tuiasiSession), getFacultyKey(uaicProfile, uaicSession), 'Faculty keys must differ')

// ── 2. Professors cross-scope isolation ──────────────────────────────────────
const tuiasiProfs = getProfessors(tuiasiProfile, tuiasiSession)
const uaicProfs   = getProfessors(uaicProfile, uaicSession)
assert.ok(Array.isArray(tuiasiProfs) && tuiasiProfs.length > 0, 'TUIASI must have professors')
assert.ok(Array.isArray(uaicProfs)   && uaicProfs.length > 0,   'UAIC must have professors')
assert.notDeepEqual(tuiasiProfs.map(p => p.domain), uaicProfs.map(p => p.domain), 'Professor domains must differ between universities')

// ── 3. Schedule cross-scope isolation ────────────────────────────────────────
const tuiasiSchedule = getScheduleData(tuiasiProfile, tuiasiSession)
const uaicSchedule   = getScheduleData(uaicProfile, uaicSession)
assert.ok(Array.isArray(tuiasiSchedule.schedule) && tuiasiSchedule.schedule.length > 0, 'TUIASI must have schedule')
assert.ok(Array.isArray(uaicSchedule.schedule)   && uaicSchedule.schedule.length > 0,   'UAIC must have schedule')
assert.notEqual(tuiasiSchedule.schedule[0]?.name, uaicSchedule.schedule[0]?.name, 'Schedules must have different courses')

// ── 4. Tutors cross-scope isolation ──────────────────────────────────────────
const tuiasiTutors = getTutors(tuiasiProfile, tuiasiSession)
const uaicTutors   = getTutors(uaicProfile, uaicSession)
assert.ok(tuiasiTutors.length > 0, 'TUIASI must have tutors')
assert.ok(uaicTutors.length   > 0, 'UAIC must have tutors')
assert.notEqual(tuiasiTutors[0]?.name, uaicTutors[0]?.name, 'Tutor lists must differ')

// ── 5. Discounts scoping ─────────────────────────────────────────────────────
const tuiasiOffers = getScopedDiscountOffers({ city: 'Iasi', universityId: 'tuiasi' }, studentLifeData)
const uaicOffers   = getScopedDiscountOffers({ city: 'Iasi', universityId: 'uaic' },   studentLifeData)
assert.ok(tuiasiOffers.length > 0, 'TUIASI must have discount offers')
assert.ok(uaicOffers.length   > 0, 'UAIC must have discount offers')
// UAIC students must NOT see TUIASI-branded offers
assert.equal(uaicOffers.some(o => /tuiasi/i.test(`${o.brand} ${o.description}`)), false, 'UAIC must not see TUIASI-branded offers')
// TUIASI students must NOT see UAIC-branded offers
assert.equal(tuiasiOffers.some(o => /\buaic\b/i.test(`${o.brand} ${o.description}`)), false, 'TUIASI must not see UAIC-branded offers')

// ── 6. Events scope isolation ────────────────────────────────────────────────
const tuiasiEvents = getScopedEvents({ city: 'Iasi', universityId: 'tuiasi' }, eventsData)
const uaicEvents   = getScopedEvents({ city: 'Iasi', universityId: 'uaic' },   eventsData)
assert.ok(Array.isArray(tuiasiEvents) && tuiasiEvents.length > 0, 'TUIASI must have events')
assert.ok(Array.isArray(uaicEvents)   && uaicEvents.length   > 0, 'UAIC must have events')
// No TUIASI event must appear for UAIC students
assert.equal(tuiasiEvents.some(e => uaicEvents.map(x => x.id).includes(e.id)), false, 'No TUIASI event must appear in UAIC events list')
// No UAIC event must appear for TUIASI students
assert.equal(uaicEvents.some(e => tuiasiEvents.map(x => x.id).includes(e.id)), false, 'No UAIC event must appear in TUIASI events list')

// ── 7. Community groups scope isolation ──────────────────────────────────────
const tuiasiGroups = getScopedCommunityGroups({ city: 'Iasi', universityId: 'tuiasi' }, studentLifeData)
const uaicGroups   = getScopedCommunityGroups({ city: 'Iasi', universityId: 'uaic' },   studentLifeData)
assert.ok(tuiasiGroups.length > 0, 'TUIASI must have community groups')
assert.ok(uaicGroups.length   > 0, 'UAIC must have community groups')
// No group must appear in both lists
const tuiasiGroupIds = new Set(tuiasiGroups.map(g => g.id))
assert.equal(uaicGroups.some(g => tuiasiGroupIds.has(g.id)), false, 'Community groups must not overlap between universities')

// ── 8. Tools (books, roommates) scope isolation ──────────────────────────────
const tuiasiTools = getScopedToolsData({ facultyCode: 'AC',  city: 'Iasi' }, { booksData, carpoolData, roommateData })
const uaicTools   = getScopedToolsData({ facultyCode: 'FII', city: 'Iasi' }, { booksData, carpoolData, roommateData })
// Books must be faculty-specific
assert.ok(tuiasiTools.books.length > 0, 'TUIASI AC must have books')
assert.ok(uaicTools.books.length   > 0, 'UAIC FII must have books')
assert.equal(tuiasiTools.books.some(b => b.faculty === 'FII'), false, 'TUIASI books must not contain FII books')
assert.equal(uaicTools.books.some(b => b.faculty === 'AC'),    false, 'UAIC books must not contain AC books')
// Roommates must be faculty-specific
assert.ok(tuiasiTools.roommates.length > 0, 'TUIASI must have roommates')
assert.ok(uaicTools.roommates.length   > 0, 'UAIC must have roommates')
assert.equal(tuiasiTools.roommates.some(r => r.faculty === 'FII'), false, 'TUIASI roommates must not contain FII entries')
assert.equal(uaicTools.roommates.some(r => r.faculty === 'AC'),    false, 'UAIC roommates must not contain AC entries')

console.log('✓ All scope personalization tests passed.')
console.log(`  TUIASI AC: ${tuiasiEvents.length} events, ${tuiasiGroups.length} groups, ${tuiasiProfs.length} professors, ${tuiasiTools.books.length} books`)
console.log(`  UAIC FII:  ${uaicEvents.length} events, ${uaicGroups.length} groups, ${uaicProfs.length} professors, ${uaicTools.books.length} books`)
