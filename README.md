# StudentPulse

> From feeling lost to feeling at home.

StudentPulse is a student platform for Romanian universities. It brings together academic planning, campus navigation, professor workflows, peer support, realtime communication, student-life utilities, and AI assistance in one web app.

The platform supports multiple universities with full tenant-scope personalization: content, professors, schedules, tutors, discounts, events, and community data are filtered automatically to the student's university and faculty. Student app, professor portal, backend APIs, realtime WebSocket flows, local persistence, and AI-powered guidance are all included.

---

## Table of Contents

- [Multi-University Support](#multi-university-support)
- [What It Does](#what-it-does)
- [Main Modules](#main-modules)
- [Student Features](#student-features)
- [Professor Features](#professor-features)
- [AI Features](#ai-features)
- [Realtime Features](#realtime-features)
- [Campus Navigation](#campus-navigation)
- [Student Life](#student-life)
- [Technical Stack](#technical-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Run Locally](#run-locally)
- [Demo Accounts](#demo-accounts)
- [Production Build](#production-build)
- [Team](#team)

---

## Multi-University Support

StudentPulse is built around a tenant-scope model. Every piece of content is tied to a `universityId:facultyCode` scope derived from the student's login.

Scoped content includes:

- thesis professors and domain options;
- schedule and recovery data;
- tutors, subjects, and skill-swap listings;
- student-life discounts, community groups, events, and tools;
- campus navigation maps and building configs;
- onboarding questions and domain personalization.

To add a new university or faculty, see [`docs/TENANT_SCOPE.md`](docs/TENANT_SCOPE.md).

---

## What It Does

StudentPulse helps a student handle the most common university workflows:

- find buildings, rooms, services, and campus points of interest;
- calculate outdoor and indoor routes;
- ask an AI assistant for navigation and student-life guidance;
- manage schedule, recovery requests, and group swaps;
- find thesis coordinators and submit requests;
- communicate with colleagues and professors;
- access tutoring and skill-swap opportunities;
- use focus, budgeting, books, carpool, housing, and city-adaptation tools;
- receive realtime notifications for messages, professor decisions, thesis requests, and schedule events.

The app supports both **student** and **professor** roles. Students use the main StudentPulse shell, while professors use a dedicated Professor Portal with their own dashboard, profile, request management, and messaging workspace.

---

## Main Modules

### Academic Mode

| Module | Purpose |
|--------|---------|
| Dashboard | Personalized academic overview, next course, stats, modules, and upcoming schedule |
| Campus Navigator | Map, route calculation, indoor navigation, AI Compass, photo recognition, crowd heatmap, and smart campus recommendations |
| Schedule Hub | Weekly timetable, upcoming courses, recovery requests, and group transfer/swap flows |
| Thesis Finder | Professor discovery, domain filters, availability, booking modal, and persistent thesis requests |
| Peer Tutoring | Tutor marketplace, subject filters, peer sessions, and Skill Swap |
| Messages | Realtime student chat, group channels, professor threads, typing, seen state, and notifications |

### Student Life Mode

| Module | Purpose |
|--------|---------|
| Campus Pulse | Live campus context, useful recommendations, crowd state, and moment-of-day insights |
| Reduceri & Beneficii | Student discounts, official benefits, software packs, transport and cultural discounts |
| Cariera & Internship-uri | Internships, practice resources, company opportunities, CCOC and faculty resources |
| Comunitate | Student organizations, clubs, groups, volunteering, hackathons, and project communities |
| Evenimente | Campus events, RSVP state, saved event intent, and reminders |
| Focus | Focus Forest, Pomodoro, study records, and mental-health support contacts |
| Unelte Studentesti | Budget Tracker, Book Exchange, Carpool, and Roommate Finder |
| Provocari | Daily, weekly, and monthly challenges with AI-verified text and screenshot proof |
| Viata in Oras | Arrival assistant, housing, transport, discounts, safety zones, and local tips |

### Professor Portal

| Module | Purpose |
|--------|---------|
| Dashboard | Overview of requests, accepted students, recovery requests, and active conversations |
| Profil academic | Editable academic profile, research areas, office, phone, assistant, courses, and consultation hours |
| Cereri licenta | Review thesis requests, accept/reject, and notify students |
| Recuperari | Review and approve recovery requests sent from Schedule Hub |
| Mesaje | Persistent student-professor conversations |

---

## Student Features

### Authentication and Onboarding

- Landing page before sign-in.
- Institutional-style email validation.
- University detection and faculty-aware onboarding.
- Support for multiple Romanian universities.
- Student profile setup:
  - faculty;
  - specialization;
  - year;
  - interests;
  - learning style;
  - schedule preference;
  - housing preference;
  - notification preference.
- Session restoration from browser storage.
- View state persistence so refresh keeps the current mode and active module.

### Dashboard

- Personalized greeting and faculty context.
- Current date and next course.
- Live upcoming schedule block.
- Quick access module grid.
- Academic stats and course overview.
- University-themed visual styling.

### Global Search

- Search across modules, professors, tutors, and app destinations.
- Keyboard navigation.
- Cross-mode navigation, including switching between Academic and Student Life.
- Stable result keys and safe empty-state handling.

### Virtual Assistant

- Persistent support widget.
- Role-aware context for students and professors.
- Natural-language navigation between modules.
- Local fallback answers when AI is unavailable.
- Context includes role, active module, faculty, university, and profile.

---

## Professor Features

The professor workflow is backed by the server and SQLite persistence.

### Professor Dashboard

- Summary cards for thesis requests, recovery requests, accepted students, and active threads.
- Recent activity view.
- Shortcuts into request and message sections.

### Thesis Request Management

- Students submit thesis requests from Thesis Finder.
- Requests are persisted on the backend.
- Professor can accept or reject requests.
- Optional decision notes are sent back to the student.
- Student request state updates after professor decision.

### Recovery Request Management

- Students submit recovery requests from Schedule Hub.
- Professor sees and handles them in the portal.
- Decisions generate student notifications.

### Professor Profile

Editable academic profile fields:

- coordination domain;
- office;
- phone;
- assistant;
- research directions;
- published courses;
- consultation hours.

### Professor Messaging

- Professor-student threads are persisted.
- Messages update live through portal channels.
- Threads support typing indicators and seen state.
- Professor and student UIs both refresh when messages arrive.

---

## AI Features

StudentPulse uses Groq-backed AI endpoints with local fallbacks where practical.

### AI Compass

- Text-based campus navigation help.
- Image-assisted recognition for buildings and surroundings.
- Structured route suggestions returned as normalized data.
- Route suggestions can start outdoor or indoor navigation.
- AI prompts are tuned for campus context, including TUIASI and UAIC.

### Photo Recognition

- Students can upload or capture a photo.
- The app analyzes visual context and suggests current location or destination.
- Works together with AI Compass route actions.

### Campus Recommendations

- Smart recommendation panel for:
  - food;
  - study areas;
  - campus services;
  - time-of-day suggestions;
  - session/exam preparation;
  - student routine guidance.

### Virtual Assistant

- Student and professor aware.
- Can answer questions and navigate to app modules.
- Falls back to built-in local knowledge if the AI endpoint fails.

---

## Realtime Features

Realtime behavior is implemented through WebSocket channels.

- Online presence.
- Direct student messages.
- Faculty-scoped group channels.
- Typing indicators.
- Read receipts.
- Portal thread refreshes.
- Professor notifications.
- Student notifications.
- Schedule swap events.
- Browser notification fallback.

Channel examples:

- `notifications:<userId>`
- `portal:<userId>`
- direct-message channels scoped by participants
- portal thread typing/read channels

---

## Campus Navigation

Campus Navigator is one of the largest modules in the app.

### Outdoor Map

- Leaflet and react-leaflet map.
- University-specific campus center.
- Building markers.
- POI markers.
- Selected building card.
- External actions for Google Maps and Waze.
- Route summary with distance, duration, and transport mode.

### Transport Modes

The route calculator supports:

- walking;
- biking;
- driving.

Route behavior:

- walking can use a campus pedestrian graph where available;
- biking uses OSRM bike routing;
- driving uses OSRM driving routing;
- if routing services are unavailable, the app shows a direct estimate as a fallback instead of pretending it is a real routed path.

### Pedestrian Graph

The walking graph uses:

- campus nodes;
- edges between walkable areas;
- Haversine distance for edge weights;
- Dijkstra pathfinding;
- route sanity checks to reject unrealistic walking paths.

### Indoor Navigation

- SVG-based building plan.
- Multiple floors.
- Room selection.
- BFS pathfinding through rooms and stairs.
- Animated route drawing.
- Start/destination markers.
- Click-to-select room behavior.

### AI Route Flow

- AI Compass can suggest outdoor or indoor route targets.
- Route IDs are normalized before use.
- Invalid destinations are rejected with a helpful message.
- Guided presentation can narrate step-by-step route instructions.

### Crowd Layer

- Optional live/simulated crowd layer.
- Campus hotspot list.
- Heatmap overlay.
- Online/crowd status display.

---

## Student Life

Student Life groups non-classroom workflows into a separate app mode.

### Campus Pulse

- Live campus context.
- Time-aware recommendation cards.
- Quick prompts for food, study areas, secretariat, coffee, exam preparation, and available rooms.
- Integrated mini assistant.

### Discounts and Benefits

- Transport benefits.
- Student software packs.
- Cultural discounts.
- CCOC and university support resources.

### Career

- Internship and practice resources.
- Company opportunities.
- Student career support.
- Official faculty and university resources.

### Community

- Student associations.
- Clubs.
- Volunteering.
- Hackathons and project groups.

### Events

- Event cards.
- RSVP state.
- Saved event intent in local storage.

### Focus

- Focus Forest.
- Pomodoro timer.
- Work/break modes.
- Focus records saved locally.
- Mental-health and support contacts.

### Tools

- Budget Tracker.
- Book Exchange.
- Carpool.
- Roommate Finder.

### Challenges

- Daily, weekly, and monthly challenges for students.
- Categories: health, academic, social, wellbeing, career, campus.
- Two verification modes: text description (AI-reviewed) and screenshot upload (AI Vision-reviewed).
- Points system with leaderboard potential.
- AI-powered proof verification — text proofs require specific details, screenshot proofs are analyzed visually.

### City Adaptation

- Arrival checklist.
- Student housing guidance.
- Local discounts.
- Transport guidance.
- Safe zones.
- Local tips.

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Animation | Framer Motion |
| Icons | lucide-react |
| Maps | Leaflet, react-leaflet, OSRM |
| AI | Groq SDK |
| Realtime | WebSocket with `ws` |
| Backend | Node.js ESM custom HTTP server |
| Database | SQLite through `better-sqlite3` |
| State | React Context, local state, custom hooks |
| Persistence | SQLite, localStorage, sessionStorage |
| PWA | Service worker and web manifest |

---

## Architecture

```text
Student / Professor Browser
        |
        | React UI
        v
App Shell
  |-- Academic Mode
  |-- Student Life Mode
  |-- Professor Portal
        |
        | HTTP + WebSocket
        v
Node Server
  |-- Navigation AI handlers
  |-- Portal handlers
  |-- Schedule handlers
  |-- Message handlers
  |-- Notification handlers
        |
        v
SQLite + in-memory realtime infrastructure
```

### Frontend

- `src/app` contains shell composition, routing state, providers, header, and sidebar.
- `src/features` contains feature modules such as dashboard, schedule, thesis, tutoring, messages, city, student-life, professor, onboarding, auth, and landing.
- `src/components/navigation` contains Campus Navigator, indoor navigation, heatmap, route rendering, and AI map interactions.
- `src/shared` contains reusable services, hooks, config, data, UI infrastructure, and utilities.

### Backend

- `server/index.js` starts the HTTP server and WebSocket bridge.
- `server/handlers` contains request handlers for navigation, portal, schedule, session, notifications, and messages.
- `server/db/database.js` initializes SQLite and migrations.
- `server/db/portalRepository.js` centralizes persistent demo data.
- `server/core/realtime` contains WebSocket connection and bridge logic.
- `server/core/redis` contains lightweight in-memory store/pubsub utilities.
- `server/core/events` contains internal event bus support.

---

## Project Structure

```text
studentpulse/
|-- public/
|   |-- manifest.json
|   `-- sw.js
|-- server/
|   |-- core/
|   |   |-- events/
|   |   |-- realtime/
|   |   `-- redis/
|   |-- db/
|   |-- handlers/
|   `-- index.js
|-- src/
|   |-- app/
|   |-- components/
|   |-- features/
|   |-- hooks/
|   |-- services/
|   |-- shared/
|   `-- main.jsx
|-- ARCHITECTURE.md
|-- README.md
|-- package.json
|-- tailwind.config.js
`-- vite.config.js
```

---

## Run Locally

### Prerequisites

- Node.js 18+
- npm
- optional Groq API key for AI features

### Install

```bash
npm install
```

### Environment

Create `.env` in the project root:

```env
GROQ_API_KEY=your_key_here
```

For development WebSocket URL, `.env.development` can contain:

```env
VITE_WS_URL=ws://localhost:3010
```

### Start Frontend and Backend

```bash
npm run dev:all
```

This starts:

- Vite frontend at `http://localhost:5173`
- Node backend at `http://localhost:3010`
- WebSocket server attached to the backend

### Frontend Only

```bash
npm run dev
```

### Backend Only

```bash
npm run dev:server
```

---

## Demo Accounts

### Student

- Use a supported institutional-style email.
- The demo shortcut can also fill the flow.

### Professor

- Email: `mihai.ciobanu@academic.tuiasi.ro`

---

## Production Build

```bash
npm run build
npm start
```

Production behavior:

- frontend builds into `dist/`;
- backend serves the built frontend;
- API endpoints are exposed by the same server;
- WebSocket runs from the same backend process;
- SQLite database is created automatically under `server/data/`.

The repository includes `render.yaml` for deployment.

Required environment variable:

```env
GROQ_API_KEY=your_key_here
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite frontend |
| `npm run dev:server` | Start backend with watch mode |
| `npm run dev:all` | Start frontend and backend together |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build with Vite |
| `npm start` | Start Node production server |

---

## Notes

- SQLite is initialized automatically on first run.
- Static demo datasets can be migrated to database-backed endpoints as the platform grows.
- If the AI API is unavailable, assistants fall back to built-in local knowledge.
- If WebSocket is unavailable, notification flows continue with browser-local fallback behavior.
- Tenant scope is enforced client-side; server-side enforcement should be added before exposing real user data.

---

## Team

| Name |
|------|
| Bighiu Rares |
| Afrasinei Mario |
| Mocanu Claudiu |
| Ignat Denis |

---

## License

Copyright (c) 2026 Bighiu Rares, Afrasinei Mario, Mocanu Claudiu, Ignat Denis.
All rights reserved.

See [LICENSE](LICENSE) for details.
