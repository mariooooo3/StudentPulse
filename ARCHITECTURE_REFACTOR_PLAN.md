# Architecture Refactor Plan

## Goal
Reduce oversized files and separate responsibilities by feature (UI, hooks, services, data, adapters).

## Phase 1 ✓ done
- Extracted shared message helpers/constants from `DirectMessages.jsx`:
  - `src/features/messages/messages.utils.js`

## Phase 2 ✓ done
- `src/components/navigation/CampusNavigator.jsx`
  - `hooks/useCampusNavigatorState.js` ✓
  - `hooks/useCampusNavigatorCamera.js` ✓
  - kept `CampusNavigator.jsx` as orchestrator/container ✓

- `src/features/schedule/ScheduleHub.jsx`
  - `components/ScheduleHubParts.jsx` ✓
  - `schedule.constants.js` ✓

- `server/handlers/navigation.js`
  - `navigation/copilot.handler.js` ✓
  - `navigation/photo.handler.js` ✓
  - `navigation/recommendations.handler.js` ✓
  - `navigation/support.handler.js` ✓
  - `navigation/assistant.handler.js` ✓
  - `navigation/prompts.js` ✓
  - `navigation.constants.js` ✓
  - `navigation.http.js` ✓
  - `navigation.validation.js` ✓
  - `ai/cv.handler.js` ✓
  - `ai/adaptation.handler.js` ✓
  - `ai/city.handler.js` ✓
  - `ai/matches.handler.js` ✓

## Phase 3 ✓ done
- `src/features/messages/DirectMessages.jsx`
  - `components/DirectMessagesParts.jsx` ✓ (ChatThread, GroupThread, PortalThread, rows)
  - `messages.utils.js` ✓

- `src/app/layout/Header.jsx`
  - `header.constants.js` ✓
  - `header.utils.js` ✓

- `src/shared/data/`
  - `mockData.datasets.js` ✓ (split din mockData.js)
  - `domainPersonalization.datasets.js` ✓ (split din domainPersonalization.js)
  - `studentLifeData.datasets.js` ✓ (split din studentLifeData.js)

## Guardrails
- Keep behavior identical after each split.
- Build and smoke-test after each module split.
- Limit container files to ~250-350 lines where practical.
