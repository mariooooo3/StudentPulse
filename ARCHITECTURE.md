# Architecture

## Intentie

StudentPulse este organizat ca un demo modular. Scopul structurii este ca fiecare zona din pitch sa poata fi gasita rapid si modificata independent.

## Frontend

```text
src/main.jsx
  -> src/app/App.jsx
     -> AuthProvider
     -> SettingsProvider
     -> LandingPage
     -> AuthFlow
     -> OnboardingFlow
     -> AppShell
        -> Sidebar
        -> Header
        -> SettingsPanel
        -> feature view
        -> VirtualAssistant
        -> GlobalSearch
```

`src/app` este zona de compozitie:

- `App.jsx` decide starea principala a aplicatiei: loading, landing, login, onboarding sau dashboard.
- `providers/AuthContext.jsx` tine sesiunea si profilul curent.
- `providers/SettingsContext.jsx` tine setarile de tema si accesibilitate per-cont.
- `hooks/useAppNavigation.js` gestioneaza navigarea intre moduri (academic/life) si view-uri.
- `layout/` contine elementele stabile ale interfetei (Header, Sidebar, SettingsPanel).

`src/features` este impartit dupa functionalitate:

- `landing` - pagina de prezentare inainte de autentificare.
- `auth` - autentificare demo cu email institutional.
- `onboarding` - profil initial student.
- `dashboard` - ecranul principal.
- `navigator` - harta campus si indoor map.
- `schedule` - orar si schimburi.
- `thesis` - cautare coordonatori.
- `tutoring` - peer tutoring si skill swap.
- `city` - adaptare in oras.
- `messages` - mesagerie realtime.
- `student-life` - hub viata studenteasca: cariera, reduceri, evenimente, comunitate, wellness, tools.
- `professor` - portal profesor: gestionare teze, mesaje cu studentii.

`src/shared` contine infrastructura comuna:

- `api` - client API mock/backend-ready.
- `config` - constante si universitati.
- `data` - date demo.
- `hooks` - hook-uri reutilizabile.
- `services` - auth, cache, socket, AI, virtualAssistant, professorPortal.
- `utils` - helper-e mici (theme, tenantScope, dateTime, cn).

## Backend

```text
server/index.js
  -> Store
  -> PubSub
  -> TCPServer
  -> WSBridge
  -> handlers
```

Backend-ul ruleaza doua interfete:

- TCP pe portul `1234`, cu protocol Redis-like pentru demo tehnic.
- WebSocket pe portul `8080`, folosit de frontend.

`server/core` contine infrastructura generica:

- `redis/Store.js` - key-value store in memorie cu TTL.
- `redis/PubSub.js` - publish/subscribe.
- `redis/Protocol.js` - encoding pentru protocolul TCP.
- `realtime/WSBridge.js` - protocol JSON pentru browser.
- `events/EventBus.js` - evenimente interne si metrics.

`server/handlers` contine use case-uri demo:

- messages
- notifications
- schedule
- session

## Flux realtime

```text
Feature component
  -> shared/services/socket.service.js
  -> WebSocket ws://localhost:8081
  -> server/core/realtime/WSBridge.js
  -> handler
  -> Store / PubSub / EventBus
```

## Directie dupa hackathon

Pentru o versiune completa, pasul urmator ar fi alegerea persistentei reale: Supabase/Postgres sau backend Node cu baza de date proprie. Structura actuala permite inlocuirea datelor mock din `shared/data` si a clientului din `shared/api` fara sa fie rescrise feature-urile.
