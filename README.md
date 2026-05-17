# StudentCompass

> *"De la pierdut, la acasă."*

An all-in-one platform for Romanian university students — AI-powered campus navigation, real-time messaging, schedule management, and peer collaboration.

Built at **FiiPractic Hackathon 2026** in 48 hours.

---

## Features

### Campus Navigator
- Interactive map with **real pedestrian routing** via OSRM (not straight lines)
- **Live crowd heatmap** — know if the cafeteria has a queue before you go
- **8 points of interest** with hours and ratings (café, pharmacy, ATM, supermarket, etc.)
- **AI photo recognition** — take a photo of a building, the AI identifies where you are
- **Cinematic Guided Tour** — animated route walkthrough with step-by-step voice narration (Web Speech API, zero external dependencies)

### Indoor Navigation — Corp C
- SVG floor plan across 5 levels (Ground + Floors 1–4)
- **BFS pathfinding** — optimal route between any two rooms
- Animated path drawing with Framer Motion `pathLength`
- Click-to-select rooms

### AI Campus Assistant
- Powered by **Groq — Llama 3.3 70B** (text) + **Llama 4 Scout 17B** (vision)
- Knows the full UAIC campus: rooms, floors, schedules, restaurants, services
- Returns structured JSON: detected location, destination, route suggestion, action steps
- Sub-second responses

### Direct Messages
- Real-time WebSocket chat between students
- **Academic filter** — only students from the same university and faculty can DM each other
- Live presence (online/offline)
- 24h message history, TTL-based expiry in the in-memory store

### Schedule Hub
- Weekly interactive calendar
- **P2P Slot Swap** — the server auto-matches two students wanting each other's time slots; both get a real-time WebSocket notification
- Recovery slots — browse availability across other groups

### Thesis Finder
- Professor cards with: research domains, minimum GPA, language, available spots
- Dynamic filtering by thesis domain
- Booking modal for advisor slots

### Peer Tutoring
- Tutor marketplace with rating, price/session, subjects, availability
- **Skill Swap** — automatic bilateral matching: A teaches C++/wants Python, B is the inverse → instant match
- Group sessions with professors

### City Adaptation — 6 modules

| Module | Content |
|--------|---------|
| Arrival Assistant | Moving-in checklist for new students |
| Student Housing | Dorms, rent ranges, scam warnings |
| Student Discounts | 12+ verified local discounts |
| Student Transport | Routes, student transit passes |
| Safe Zones | Safety map, emergency contacts |
| Local Tips | Advice from senior students |

### Auth & Onboarding
- Institutional email validation per university (domain regex)
- **7 universities**: UAIC, UBB, UniBuc, Politehnica București, Politehnica Timișoara, UMF Cluj, UVT
- **50+ faculties** with study year specifics (3/4/5/6 year programs)
- Multi-step onboarding: year, interests, learning style, housing type, notification preferences

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Maps | Leaflet + react-leaflet, OSRM (real routing) |
| AI / LLM | Groq SDK — Llama 3.3 70B (text), Llama 4 Scout 17B (vision) |
| Realtime | WebSocket (ws), custom TCP protocol |
| Backend | Node.js ESM — no framework |
| State | React Context + custom hooks |
| PWA | Service Worker + Web Manifest |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (React 18)                 │
│  Auth → Onboarding → Dashboard                      │
│  CampusNavigator ←→ AI Chat (Groq)                  │
│  ScheduleHub     ←→ WebSocket (real-time)           │
│  DirectMessages  ←→ Presence & DM channels          │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP + WebSocket (single port)
          ┌────────────▼─────────────┐
          │     BACKEND (Node.js)    │
          │                          │
          │  Navigation API → Groq   │
          │  WebSocket Bridge        │
          │  TCP Server (Redis-like) │  ← internal
          │  In-memory Store + TTL   │
          │  PubSub + EventBus       │
          └──────────────────────────┘
```

### Server internals

**Store** — custom key-value store with lazy TTL expiry. Min-heap internally for O(log n) expiration. Inspired by Redis, implemented from scratch in ~200 lines.

**PubSub** — internal publish/subscribe. Decouples producers from consumers; used for DM delivery, swap matching, and presence broadcasting.

**WSBridge** — WebSocket server with academic scoping. DM channels are namespaced `dm:<universityId>:<facultyCode>:<userA>:<userB>`, enforced server-side. Users from different faculties cannot exchange messages.

**TCPServer** — Redis-like text protocol (`SET key value`, `GET key`, `SUBSCRIBE channel`) on an internal port. Demonstrates understanding of distributed systems primitives.

**EventBus** — internal event bus for `metrics`, `notification`, `swap_match` — propagated to connected WebSocket clients.

---

## Project Structure

```
studentcompass/
├── src/
│   ├── app/
│   │   ├── App.jsx                  # Router: Auth → Onboarding → App
│   │   ├── layout/Header.jsx + Sidebar.jsx
│   │   └── providers/AuthContext.jsx
│   │
│   ├── features/
│   │   ├── auth/AuthFlow.jsx
│   │   ├── onboarding/OnboardingFlow.jsx
│   │   ├── dashboard/Dashboard.jsx
│   │   ├── schedule/ScheduleHub.jsx
│   │   ├── thesis/ThesisFinder.jsx + BookingModal.jsx
│   │   ├── tutoring/PeerTutoring.jsx + SkillSwap.jsx
│   │   ├── messages/DirectMessages.jsx
│   │   └── city/ (6 sub-modules)
│   │
│   ├── components/navigation/
│   │   ├── CampusNavigator.jsx      # Map + AI Compass + Cinematic Tour
│   │   └── HeatmapLayer.jsx
│   │
│   └── shared/
│       ├── config/universities.js   # 7 universities, 50+ faculties
│       ├── hooks/                   # useSocket, useMessages, useNow
│       └── services/                # auth, socket, ai, cache
│
└── server/
    ├── index.js
    ├── core/
    │   ├── redis/Store.js           # Key-value + TTL (min-heap)
    │   ├── redis/PubSub.js
    │   ├── realtime/WSBridge.js     # WebSocket server
    │   ├── realtime/TCPServer.js    # Redis-like protocol
    │   └── events/EventBus.js
    └── handlers/
        ├── navigation.js            # REST API → Groq AI
        ├── messages.js              # 1-on-1 chat
        ├── schedule.js              # P2P slot swap matching
        ├── notifications.js
        └── session.js
```

---

## Running locally

**Prerequisites:** Node.js 18+, [Groq API key](https://console.groq.com)

```bash
git clone https://github.com/mariooooo3/FiiPractic-Hackathon.git
cd FiiPractic-Hackathon
npm install
```

Create `.env` in the project root:

```
GROQ_API_KEY=your_key_here
```

```bash
npm run dev:all     # Frontend + backend together
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |
| WebSocket | ws://localhost:8081 |

> Demo: any institutional email + code `0000`

---

## Deployment

Single-process deployment — frontend served directly from the Node.js backend.

```bash
npm run build   # Build frontend to dist/
npm start       # Serve everything on $PORT
```

Configured for **Render** via `render.yaml`. Set `GROQ_API_KEY` as an environment variable.

---

## Team

| Name |
|------|
| Bighiu Rareș |
| Afrasinei Mario |
| Mocanu Claudiu |
| Ignat Denis |

---

*FiiPractic Hackathon 2026 — UAIC Iași*
