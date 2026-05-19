# StudentCompass

> From feeling lost to feeling at home.

StudentCompass is a student platform built around the Romanian university experience. It combines campus navigation, academic planning, real-time communication, thesis coordination, tutoring, and student-life support in a single demo application.

The current version also includes a persistent professor workflow backed by SQLite, with live student-professor notifications, professor-side request management, and two-way portal conversations.

The project was built during **FiiPractic Hackathon 2026** as a fast, modular prototype that showcases both product thinking and technical range.

---

## Features

### Multi-role platform
- Separate student and professor flows inside the same application
- Institutional email-based access for students
- Dedicated professor portal with a different UX and navigation model
- Student onboarding remains active, while the professor demo skips onboarding

### Professor portal
- Live dashboard for thesis requests, recovery requests, accepted students, and active conversations
- Thesis request review with `Accept` / `Reject` actions and an optional note for the student
- Recovery request review with approval flows
- Professor-student messaging workspace backed by persistent portal threads
- Live professor notifications for new thesis requests, recovery requests, and incoming student messages
- Notification deep-links into thesis review, recovery review, or the relevant conversation
- `ProfessorCompass Assistant` support widget configured for the professor role
- Assistant-driven navigation for professor workflows:
  - thesis requests
  - recovery requests
  - messages
  - academic profile
  - dashboard
- Editable academic profile with:
  - coordination domain
  - office
  - phone
  - assistant
  - research directions
  - published courses
  - consultation hours

### Student-professor notifications
- Student thesis and recovery requests appear in the professor portal immediately
- New requests generate live professor notifications through WebSocket channels
- Professor decisions generate persistent notifications for the student
- Professor replies generate student notifications and update the student message thread
- Professor-side notifications can deep-link into the relevant area:
  - thesis requests
  - recovery requests
  - messages
- Student and professor workspaces subscribe to `portal:<userId>` channels for live thread refreshes
- Browser-local notification fallback keeps the demo usable when realtime is temporarily unavailable

### Virtual Assistant
- Persistent support widget in the bottom-right corner of the app
- Available in both the student workspace and the professor portal
- Uses role-aware branding:
  - `StudentCompass Assistant` for students
  - `ProfessorCompass Assistant` for professors
- Answers account, onboarding, module, schedule, thesis, messaging, campus, and basic student-life questions
- Uses the current role, active section, faculty, year, university, and portal context
- Can navigate inside the app from natural language prompts:
  - students can open campus navigation, schedule, thesis finder, tutoring, messages, city adaptation, and student-life areas
  - professors can open thesis requests, recovery requests, messages, academic profile, and dashboard
- Includes quick suggestions and local fallback answers when the AI endpoint is unavailable

### Campus Navigator
- Interactive campus map with real pedestrian routing through OSRM
- Live crowd heatmap for busier campus areas
- Points of interest such as cafes, pharmacy, supermarket, ATM, and copy shop
- AI photo recognition for location-aware guidance
- Guided route presentation with step-by-step voice narration

### Indoor navigation
- SVG-based floor plan for the Informatics building
- Indoor pathfinding across 5 levels
- Animated route drawing
- Click-to-select room navigation

### AI Campus Assistant
- Groq-powered campus assistant for route and location help
- Supports text guidance, image-assisted recognition, and structured route suggestions
- Returns normalized JSON for guided navigation flows
- Includes local fallbacks when the API is unavailable

### Smart recommendations
- Separate campus-life assistant inside the recommendations area
- Helps with food, study spots, transport, discounts, housing, Wi-Fi, and student routines
- Works with diacritic-insensitive matching
- Uses a built-in local knowledge base fallback

### Direct messages
- Real-time WebSocket chat between students
- Academic scoping: direct messages are limited to students from the same university and faculty
- Presence tracking for online users
- Persistent direct-message history through the backend repository
- Separate professor conversation list powered by portal threads
- Typing indicator with debounce — shows when the other person is writing
- Read receipts — confirms when a message has been seen
- Push notifications for new messages when the tab is not focused
- Group channels scoped to the current faculty: #general, #cursuri, #proiecte, #off-topic
- Mobile-responsive layout with back navigation between contact list and conversation

### Schedule Hub
- Weekly schedule experience
- Peer-to-peer slot swap matching
- Real-time notifications for successful swap matches
- Recovery slot request flows

### Thesis Finder
- Searchable professor catalog
- Filters by domain, availability, and keywords
- Professor cards include expectations such as CV, research plan, or portfolio
- Booking modal supports file attachment for submissions
- Requests sent to the demo professor are persisted in SQLite and appear in the professor portal
- Accepted or rejected requests update the student's request list and message thread

### Peer Tutoring
- Tutor marketplace with subjects, ratings, availability, and pricing
- Skill Swap matching for students who can teach each other different topics
- Group learning scenarios with academic context

### City Adaptation

| Module | Description |
|--------|-------------|
| Arrival Assistant | First-week checklist for students moving into the city |
| Student Housing | Dorm and rent guidance, plus scam awareness |
| Student Discounts | Local discount information |
| Student Transport | Transport routes and student pass guidance |
| Safe Zones | Safety-oriented map and emergency references |
| Local Tips | Practical advice from senior students |

### Student Life Hub
- Curated student-life information for UAIC-focused usage
- Covers food, libraries, clubs, events, transport, housing, and services
- Designed to work well with the recommendations assistant

| Section | Description |
|---------|-------------|
| Discounts | Local student discounts from shops, cafes, and services |
| Career | Job listings and internship opportunities |
| Community | Student clubs and organizations |
| Events | Campus events with RSVP (going / not going), saved to `localStorage` |
| Wellness | Pomodoro timer with SVG circular progress and work/break modes, plus mental health support contacts |
| Tools | Four utility sub-tabs: Budget Tracker, Book Exchange, Carpool, and Roommate Finder |

**Budget Tracker** — tracks monthly expenses per category and compares them against the average student spending. Persisted in `localStorage`.

**Book Exchange** — browse textbooks available from other students and send a request.

**Carpool** — find and join rides posted by other students for routes around the city.

**Roommate Finder** — browse student profiles by lifestyle preferences to find compatible roommates.

### UI & performance
- Shimmer skeleton loaders shown during lazy-loaded page transitions
- Mobile-first responsive layout throughout the student shell

### Auth and onboarding
- Institutional email validation per university
- Support for **8 Romanian universities**
- Faculty-aware onboarding with year-specific study options
- Profile setup for interests, learning style, housing, and preferences
- Landing page before sign-in

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Maps | Leaflet, react-leaflet, OSRM |
| AI | Groq API |
| Realtime | WebSocket (`ws`) |
| Backend | Node.js ESM, custom HTTP server |
| Database | SQLite via `better-sqlite3` |
| State | React Context, local component state, custom hooks |
| Demo persistence | SQLite, in-memory TTL store, browser `localStorage` fallback |
| PWA | Service Worker, Web App Manifest |

---

## Architecture

```text
+------------------------------------------------------+
|                  FRONTEND (React 18)                 |
|                                                      |
|  Landing -> Auth -> Onboarding -> App Shell          |
|                                                      |
|  Academic mode:                                      |
|    Dashboard                                         |
|    Campus Navigator                                  |
|    Schedule Hub                                      |
|    Thesis Finder                                     |
|    Peer Tutoring                                     |
|    Direct Messages                                   |
|                                                      |
|  Life mode:                                          |
|    Student Life Hub                                  |
|    City Adaptation                                   |
|                                                      |
|  Professor role:                                     |
|    Dedicated Professor Portal                        |
+-----------------------------+------------------------+
                              |
                              | HTTP + WebSocket
                              v
+------------------------------------------------------+
|                BACKEND (Node.js, custom)             |
|                                                      |
|  HTTP server                                         |
|    /api/navigation/assistant                         |
|    /api/navigation/photo                             |
|    /api/navigation/copilot                           |
|    /api/navigation/recommendations                   |
|    /api/navigation/support-assistant                 |
|    /api/portal/professor-profile                     |
|    /api/portal/thesis-requests                       |
|    /api/portal/recovery-requests                     |
|    /api/portal/threads                               |
|                                                      |
|  WebSocket bridge                                    |
|    presence                                          |
|    direct messages                                   |
|    notifications                                     |
|    schedule swap events                              |
|    portal refresh events                             |
|                                                      |
|  SQLite repository                                   |
|    professor profile                                 |
|    thesis requests                                   |
|    recovery requests                                 |
|    portal threads and messages                       |
|    notifications                                     |
|    direct messages                                   |
|    pending schedule swaps                            |
|                                                      |
|  Internal infrastructure                             |
|    Store (TTL key-value)                             |
|    PubSub                                            |
|    EventBus                                          |
|    TCP demo server (Redis-like protocol)             |
+------------------------------------------------------+
```

### Frontend design

`src/app` is the composition layer:
- `App.jsx` decides whether the user sees landing, auth, onboarding, the student shell, or the professor portal
- `providers/AuthContext.jsx` manages session and profile state
- `layout/` contains shell-level UI such as the sidebar and header

`src/features` holds domain slices:
- `auth`
- `landing`
- `onboarding`
- `dashboard`
- `schedule`
- `thesis`
- `tutoring`
- `messages`
- `city`
- `student-life`
- `professor`

`src/components/navigation` contains the most specialized UI area:
- campus map
- indoor navigation
- AI copilot interactions
- route presentation
- crowd overlays

`src/shared` contains reusable infrastructure:
- `config` for universities and constants
- `data` for demo datasets
- `hooks` for reusable behavior
- `services` for auth, sockets, caching, and professor portal logic
- `utils` for small helpers

The shared virtual assistant is role-aware. In the student shell it navigates between student modules; inside the professor portal it is mounted directly in `ProfessorApp.jsx` so it can switch between professor-only sections.

### Backend design

The backend is intentionally lightweight and framework-free.

- `server/index.js` boots the HTTP server, attaches WebSocket support, and serves `dist/` in production
- `server/handlers/navigation.js` contains the AI-backed navigation endpoints
- `server/handlers/portal.js` contains the professor portal HTTP API
- `server/handlers/messages.js`, `schedule.js`, `notifications.js`, and `session.js` handle realtime demo use cases
- `server/db/database.js` initializes the SQLite database and runs idempotent migrations
- `server/db/portalRepository.js` centralizes persistent professor workflow, notifications, direct messages, and schedule swap data
- `server/core/redis/Store.js` implements an in-memory key-value store with lazy TTL expiration
- `server/core/redis/PubSub.js` provides publish/subscribe semantics
- `server/core/realtime/WSBridge.js` enforces WebSocket messaging rules, including faculty-scoped direct messaging
- `server/core/realtime/TCPServer.js` exposes a Redis-like internal protocol for technical demo purposes
- `server/core/events/EventBus.js` distributes internal metrics and application events

### Realtime flow

```text
Feature component
  -> shared/services/socket.service.js
  -> WebSocket server
  -> WSBridge
  -> handler / store / pubsub / event bus
```

Portal-specific realtime flow:

```text
Student action
  -> /api/portal/*
  -> portalRepository
  -> SQLite
  -> notifications.push(...)
  -> PubSub channel:
       notifications:<userId>
       portal:<userId>
  -> student/professor UI refresh
```

### Notes on persistence

This is still a hackathon-style prototype, but the professor workflow now uses real local persistence.

- Professor profiles, thesis requests, recovery requests, portal threads, notifications, direct messages, and schedule swap requests are stored in SQLite
- The database is created automatically at `server/data/studentcompass.db`
- Migrations are idempotent and run when `server/db/database.js` is imported by the backend
- Browser `localStorage` is still used as a fallback for some local notification and profile demo behavior
- Some catalog and student-life areas still use static demo datasets and can be moved to database-backed endpoints later

---

## Project Structure

```text
studentcompass/
|-- public/
|   |-- manifest.json
|   `-- sw.js
|-- server/
|   |-- core/
|   |   |-- events/
|   |   |-- realtime/
|   |   `-- redis/
|   |-- db/
|   |   |-- database.js
|   |   `-- portalRepository.js
|   |-- handlers/
|   `-- index.js
|-- src/
|   |-- app/
|   |   |-- layout/
|   |   |-- providers/
|   |   `-- App.jsx
|   |-- components/
|   |   |-- navigation/
|   |   `-- ui/
|   |-- features/
|   |   |-- auth/
|   |   |-- city/
|   |   |-- dashboard/
|   |   |-- landing/
|   |   |-- messages/
|   |   |-- onboarding/
|   |   |-- professor/
|   |   |-- schedule/
|   |   |-- student-life/
|   |   |-- thesis/
|   |   `-- tutoring/
|   |-- hooks/
|   |-- services/
|   |-- shared/
|   `-- main.jsx
|-- ARCHITECTURE.md
|-- README.md
`-- package.json
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- A Groq API key for navigation AI features

### Install

```bash
npm install
```

Create a root `.env` file:

```env
GROQ_API_KEY=your_key_here
```

### Start the app

```bash
npm run dev:all
```

This runs:
- Vite frontend on `http://localhost:5173`
- Node backend on `http://localhost:3001`
- WebSocket server on `ws://localhost:3001` during development

Vite proxies `/api/navigation` and `/api/portal` requests to the backend. The development WebSocket URL is configured in `.env.development`:

```env
VITE_WS_URL=ws://localhost:3001
```

The SQLite database is created automatically on first backend startup:

```text
server/data/studentcompass.db
```

### Demo access

Student demo:
- Any valid institutional-style email for a supported university
- Access code: `0000`

Professor demo:
- Email: `andrei.munteanu@uaic.ro`
- Access code: `0000`

---

## Production Build

```bash
npm run build
npm start
```

In production:
- the frontend is built into `dist/`
- the Node server serves the static app
- navigation and portal endpoints are exposed from the same server process
- WebSocket is attached to the same HTTP server process
- SQLite is initialized automatically under `server/data/`

The repository already includes `render.yaml` for Render deployment.

Required environment variable:
- `GROQ_API_KEY`

Optional environment variable:
- `VITE_WS_URL` if the deployed frontend must connect to a separate WebSocket backend URL, for example `wss://your-backend.example.com`

---

## Team

| Name |
|------|
| Bighiu Rareș |
| Afrăsinei Mario |
| Mocanu Claudiu |
| Ignat Denis |

---

## License

Copyright (c) 2026 Bighiu Rareș, Afrăsinei Mario, Mocanu Claudiu, Ignat Denis.
All rights reserved.

See [LICENSE](LICENSE) for details.
