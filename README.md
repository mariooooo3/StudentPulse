# StudentCompass

> From feeling lost to feeling at home.

StudentCompass is a student platform built around the Romanian university experience. It combines campus navigation, academic planning, real-time communication, thesis coordination, tutoring, and student-life support in a single demo application.

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
- Professor-student messaging workspace
- Editable academic profile with:
  - coordination domain
  - office
  - phone
  - assistant
  - research directions
  - published courses
  - consultation hours

### Student-professor notifications
- Student thesis and recovery requests appear in the professor portal
- Professor decisions generate notifications for the student
- Professor-side notifications can deep-link into the relevant area:
  - thesis requests
  - recovery requests
  - messages
- Local event and storage-based synchronization keeps the demo stable even without a full backend

### Virtual Assistant
- Persistent support widget in the bottom-left corner of the app
- Available in both the student workspace and the professor portal
- Answers account, onboarding, module, schedule, thesis, messaging, campus, and basic student-life questions
- Uses the current role, active section, faculty, year, and university as context
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
- Short-lived message persistence through an in-memory TTL store

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
| State | React Context, local component state, custom hooks |
| Demo persistence | In-memory backend store and browser `localStorage` |
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
|                                                      |
|  WebSocket bridge                                    |
|    presence                                          |
|    direct messages                                   |
|    notifications                                     |
|    schedule swap events                              |
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

### Backend design

The backend is intentionally lightweight and framework-free.

- `server/index.js` boots the HTTP server, attaches WebSocket support, and serves `dist/` in production
- `server/handlers/navigation.js` contains the AI-backed navigation endpoints
- `server/handlers/messages.js`, `schedule.js`, `notifications.js`, and `session.js` handle realtime demo use cases
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

### Notes on persistence

This is still a hackathon-style prototype.

- Realtime messages and metrics use the custom in-memory backend
- Professor workflow data is also mirrored through `localStorage` for demo stability
- Several areas are ready to be replaced by a real database without rewriting the feature UI

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
- WebSocket server on `ws://localhost:8081` during development

Vite proxies `/api/navigation` requests to the backend. The development WebSocket URL is configured in `.env.development`.

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
- navigation endpoints are exposed from the same server process

The repository already includes `render.yaml` for Render deployment.

Required environment variable:
- `GROQ_API_KEY`

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
