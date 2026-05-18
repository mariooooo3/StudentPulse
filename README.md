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
- La logout, utilizatorul este redirecționat la pagina de welcome (nu la formularul de autentificare)
- Badge-ul de confirmare în onboarding afișează doar numele universității, nu și facultatea (aceasta se alege ulterior)

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
- **Cerințe licență** — fiecare profesor afișează o notă scurtă cu ce solicită (CV, plan cercetare, portofoliu etc.)
- Filtrare pe domeniu de teză
- Teme anterioare expandabile
- Modal de rezervare cu afișarea cerințelor profesorului și **atașare fișier real** (CV, portofoliu, plan de cercetare — `.pdf`, `.doc`, `.docx`)

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

### Student Life (`StudentLifeHub`) — date reale pentru Iași
- **Reduceri reale**: CTP Iași (–90%), Spotify Student (14 RON/lună), Apple Music (11,99 RON/lună), Adobe CC (–65%), GitHub Student Pack (gratuit), Microsoft 365 (gratuit cu @student.uaic.ro), Canva Pro, Notion, NordVPN (–76%), ISIC Card, Cinema City, Teatrul Național Iași (–75%), cantinele UAIC
- **Cariere reale Iași**: Amazon Development Center, Endava, Bitdefender, Cegeka, evozon, Spitalul Sf. Spiridon, Antibiotice SA, Deloitte, BCR, ELSA Iași
- **Comunități reale**: ASII, ESN Iași, LSAC, ELSA Iași, V7 Startup Studio, grupuri sport și cinefili

### Navigator Campus (`CampusNavigator`)
- Hartă interactivă Leaflet
- **AI Compass** (tab Chat) — răspunde exclusiv la întrebări de navigare și trasee pe campus
- **Recomandări Smart** (tab Recomandări) — Campus Pulse cu starea campusului în timp real
- **Asistent Campus** (zonă AI dedicată în Recomandări Smart) — AI separat care răspunde la întrebări despre viața studențească: mâncare, locuri de studiu, secretariat, reduceri, transport CTP, sesiune de examene, comunități, WiFi eduroam, cazare

---

## Universități & Facultăți suportate

Aplicația include date personalizate pentru **19+ universități** din România. UAIC Iași are suport complet pentru:

| Facultate | Cod | Date complete |
|-----------|-----|---------------|
| Facultatea de Matematică-Informatică | FMIM | ✅ Orar, profesori, tutori, teze, domenii |
| Facultatea de Informatică | FII | ✅ Orar, profesori, tutori, teze, domenii |

Și date generice (orar, profesori, teze) pentru: Drept, Geografie, Psihologie, Sport, Muzică, Teologie, Arhitectură, Teatru, Științe, Umaniste, Economie, Medicină, Farmacie, Inginerie, Arte.

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
    student-life/
  shared/               # Infrastructură comună
    api/                # HTTP client
    config/             # Universități, constante
    data/               # Mock data per facultate
    hooks/              # useMessages, useNow, useSocket, useOnlineCount
    services/           # Auth, Socket, AI, Cache
    utils/
  services/
    navigation/
      campusAI.js       # askCampusAI (navigare) + askRecoAI (campus life)
      navigationApi.js  # Fallback local cu răspunsuri per domeniu

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
