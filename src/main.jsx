import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.jsx'
import './index.css'

async function cleanupServiceWorkersAndCaches() {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  } catch {}

  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
  } catch {}
}

function renderBootError(error) {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050810;color:#e2e8f0;padding:24px;font-family:system-ui,sans-serif;">
      <div style="max-width:760px;width:100%;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:18px 20px;background:rgba(15,23,42,.55)">
        <h1 style="margin:0 0 10px;font-size:18px;line-height:1.3;">StudentPulse failed to start</h1>
        <p style="margin:0 0 10px;opacity:.9;">Open DevTools Console and share this error:</p>
        <pre style="margin:0;white-space:pre-wrap;word-break:break-word;opacity:.95;">${String(error?.stack || error?.message || error)}</pre>
      </div>
    </div>
  `
}

async function bootstrap() {
  await cleanupServiceWorkersAndCaches()
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

bootstrap().catch(renderBootError)
