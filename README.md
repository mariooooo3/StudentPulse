# StudentCompass

StudentCompass este un demo pentru hackathon orientat pe onboarding universitar, navigare campus, orar, mesagerie, coordonatori de licenta, tutoring si adaptare in oras.

## Start rapid

```powershell
npm install
npm run dev:all
```

Frontend:

```text
http://localhost:5173
```

Backend realtime:

```text
WebSocket: ws://localhost:8080
TCP demo protocol: localhost:1234
```

## Structura

```text
src/
  main.jsx
  index.css
  app/
    App.jsx
    layout/
    providers/
  features/
    auth/
    onboarding/
    dashboard/
    navigator/
    schedule/
    thesis/
    tutoring/
    city/
    messages/
  shared/
    api/
    config/
    data/
    hooks/
    services/
    utils/

server/
  index.js
  core/
    events/
    realtime/
    redis/
  handlers/
```

## Arhitectura pe scurt

Frontend-ul este React + Vite + Tailwind. `src/app` contine shell-ul aplicatiei, provider-ele globale si layout-ul. `src/features` contine modulele vizibile in demo. `src/shared` contine cod reutilizabil: date mock, servicii, hook-uri, configurari si utilitare.

Backend-ul este Node.js si ofera un layer realtime prin WebSocket. Intern are un store in-memory de tip Redis, pub/sub, TTL si handler-e pentru mesaje, notificari, sesiune si schedule.

## Status demo

Aplicatia este optimizata pentru prezentare de hackathon. Datele sunt in mare parte mock/local, iar backend-ul realtime demonstreaza arhitectura si fluxul live fara sa impuna o baza de date externa.
