# Architecture Refactor Plan

## Goal
Reduce oversized files and separate responsibilities by feature (UI, hooks, services, data, adapters).

## Phase 1 (done)
- Extracted shared message helpers/constants from `DirectMessages.jsx`:
  - `src/features/messages/messages.utils.js`

## Phase 2 (next)
- `src/components/navigation/CampusNavigator.jsx`
  - split into:
    - `hooks/useCampusNavigatorState.js`
    - `hooks/useCampusNavigatorAI.js`
    - `utils/camera.js`
    - keep `CampusNavigator.jsx` as orchestrator/container

- `src/features/schedule/ScheduleHub.jsx`
  - split into:
    - `components/WeeklyView.jsx`
    - `components/AllGroupsView.jsx`
    - `components/RecoveryGrid.jsx`
    - `components/SlotSwapView.jsx`
    - `components/RecoveryModal.jsx`
  - move local constants/variants to `schedule.constants.js`

- `server/handlers/navigation.js`
  - split into:
    - `navigation/copilot.handler.js`
    - `navigation/photo.handler.js`
    - `navigation/recommendations.handler.js`
    - `navigation/support.handler.js`
    - `career/cv.handler.js`
    - `ai/adaptation.handler.js`, `ai/city.handler.js`, `ai/matches.handler.js`
    - `shared/prompting.js`, `shared/normalize.js`, `shared/http.js`

## Phase 3
- `src/features/messages/DirectMessages.jsx`
  - split view components (`ChatThread`, `GroupThread`, `PortalThread`, rows) into `components/`
  - keep page-level state + orchestration in container

- `src/app/layout/Header.jsx`
  - split notifications/search controls into dedicated components + hooks

## Guardrails
- Keep behavior identical after each split.
- Build and smoke-test after each module split.
- Limit container files to ~250-350 lines where practical.
