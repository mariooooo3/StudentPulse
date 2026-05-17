# StudentCompass

**Platformă de onboarding universitar** construită pentru hackathon. Ajută studenții noi să navigheze campusul, să-și gestioneze orarul, să găsească coordonatori de licență, tutori și să se adapteze în orașul universitar.

---

## Tech Stack

| Layer | Tehnologii |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Realtime | WebSocket (ws), TCP demo protocol |
| Hărți | Leaflet + react-leaflet |
| AI | Groq SDK (LLM) |
| Backend | Node.js, in-memory store cu TTL + PubSub |

---

## Start rapid

```powershell
npm install
npm run dev:all
```

| Serviciu | URL |
|---------|-----|
| Frontend | http://127.0.0.1:5173 |
| WebSocket | ws://localhost:8080 |
| Navigation API | http://localhost:3001/api/navigation |
| TCP demo | localhost:1234 |

> **Demo credentials:** orice email instituțional + cod `0000`

---

## Funcționalități

### Autentificare & Onboarding
- Selectare din 19+ universități din România cu validare email instituțional
- Onboarding personalizat pe bază de facultate: an de studiu, interese, stil de învățare, tip cazare, preferințe notificări
- Session persistată în `AuthContext`

### Dashboard
- Curs următor în timp real
- Statistici academice: credite, medii, ore, cursuri
- Acces rapid la toate modulele
- Program zilei + notificări academice
- Temă vizuală per universitate

### Orar (`ScheduleHub`)
- **Orarul meu** — calendar interactiv săptămânal
- **Toate grupele** — vizualizare comparativă
- **Recuperări** — grid cu disponibilități alte grupe + cerere în timp real
- **Slot Swap** — sistem P2P: dacă A oferă ce B vrea și invers, swap-ul se acceptă automat

### Găsire Coordonator Licență (`ThesisFinder`)
- Carduri profesori cu domenii, medie minimă, limbă, locuri disponibile
- Filtrare pe domeniu de teză
- Teme anterioare expandabile
- Modal de rezervare loc

### Tutoring Peer-to-Peer (`PeerTutoring`)
- Marketplace tutori: rating, preț/sesiune, materii, disponibilitate
- **Skill Swap**: matching automat — A predă C++ și vrea Python, B face invers → match instant
- Sesiuni de grup cu profesor

### Mesagerie (`DirectMessages`)
- Chat 1-la-1 cu colegi din aceeași universitate și facultate
- Prezență live (online/offline)
- Istoric 24h, maxim 100 mesaje per canal

### Adaptare în Oraș (`CityAdaptation`)
- Checklist sosire
- Ghid locuințe (cămine, chirii, avertismente escrocherii)
- 12+ locuri cu reduceri studențești verificate
- Sfaturi de la studenți
- Rute transport + abonament student
- Harta zone sigure + contacte urgență

### Navigator Campus
- Hartă interactivă Leaflet
- AI-powered (Groq) pentru descrieri clădiri și rute

---

## Arhitectură

```
src/
  main.jsx
  index.css
  app/
    App.jsx              # Routing principal: Auth → Onboarding → App
    layout/
      Header.jsx
      Sidebar.jsx
    providers/
      AuthContext.jsx    # Session + profil utilizator global
  features/             # Module independente per funcționalitate
    auth/
    onboarding/
    dashboard/
    schedule/
    thesis/
    tutoring/
    messages/
    city/
  shared/               # Infrastructură comună
    api/                # HTTP client
    config/             # Universități, constante
    data/               # Mock data per facultate
    hooks/              # useMessages, useNow, useSocket, useOnlineCount
    services/           # Auth, Socket, AI, Cache
    utils/

server/
  index.js              # Entry point — inițializare Store, PubSub, TCP, WS
  core/
    realtime/
      TCPServer.js      # Protocol Redis-like pe port 1234 (demo tehnic)
      WSBridge.js       # WebSocket bridge pe port 8080
    events/             # EventBus intern
  handlers/
    messages.js         # Istoric + trimitere mesaje
    schedule.js         # Swap matching logic
    notifications.js    # Push + markRead
    session.js          # Auth state
    navigation.js       # REST API campus (port 3001)
```

### Flux realtime

```
Component
  → socketService.sendMessage()
  → WebSocket ws://localhost:8080
  → WSBridge → Handler
  → Store (in-memory + TTL) / PubSub
  → publish(channel)
  → Client re-render
```

---

## Variabile de mediu

Creează un fișier `.env` în rădăcina proiectului:

```env
GROQ_API_KEY=your_groq_api_key
```

---

## Scripts

| Comandă | Descriere |
|---------|-----------|
| `npm run dev` | Doar frontend Vite |
| `npm run dev:server` | Doar backend Node.js |
| `npm run dev:all` | Frontend + backend în paralel |
| `npm run build` | Build producție → `dist/` |
| `npm run preview` | Preview build local |

---

## Status

Proiect demo pentru hackathon. Datele sunt mock/locale — backend-ul realtime demonstrează arhitectura și fluxul live fără bază de date externă. Structura este pregătită pentru migrare la Supabase/Postgres.
