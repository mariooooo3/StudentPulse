# Tenant Scope Personalization

## Data model
- `universityId`: source of truth from `session.university.id`
- `facultyCode`: source of truth from `profile.facultyCode` or `session.detectedFaculty.code`
- `scope`: `${universityId}:${facultyCode}`

Implemented in `src/shared/utils/tenantScope.js`.

## Where filtering is applied
- Academic data selectors:
  - `src/shared/data/facultyCatalog.js`
  - Functions now consume `profile, session` and return empty/fallback data when scope is unknown or invalid.
- Thesis:
  - `src/features/thesis/ThesisFinder.jsx`
  - Demo professor appears only for `tuiasi:AC`.
- Schedule:
  - `src/features/schedule/ScheduleHub.jsx`
  - Uses scoped schedule selector.
- Tutoring:
  - `src/features/tutoring/PeerTutoring.jsx`
  - `src/features/tutoring/SkillSwap.jsx`
  - Uses scoped tutors, subjects, skill swap and group sessions.
- Student Life:
  - `src/features/student-life/studentLifeData.js`
  - Scoped selectors for discounts, community groups, events and tools.
  - Wired into sections/tabs in `DiscountsSection`, `CommunitySection`, `EventsSection`, `ToolsSection`.
- API payload consistency:
  - Thesis and recovery requests include tenant fields in student payloads.

## Add a new faculty
1. Add university/faculty to `src/shared/config/universities.js`.
2. Map faculty code in `FACULTY_CODE_KEY` (`src/shared/data/facultyCatalog.js`).
3. Add domain data in `domainPersonalization` datasets for the mapped faculty key.
4. (Optional) Add student-life scoped data entries with `scope`/`city`/`faculty`.
5. Run scope tests in `scripts/scope-personalization-test.mjs`.
