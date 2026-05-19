import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Store } from './core/redis/Store.js'
import { PubSub } from './core/redis/PubSub.js'
import { eventBus } from './core/events/EventBus.js'
import { createTCPServer } from './core/realtime/TCPServer.js'
import { WSBridge } from './core/realtime/WSBridge.js'
import { createDispatcher } from './handlers/CommandDispatch.js'
import { createMessagesHandler } from './handlers/messages.js'
import { createScheduleHandler } from './handlers/schedule.js'
import { createNotificationsHandler } from './handlers/notifications.js'
import { createSessionHandler } from './handlers/session.js'
import { createNavigationRequestHandler } from './handlers/navigation.js'

const PORT = Number(process.env.PORT || 3001)
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST = resolve(__dirname, '..', 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
}

function serveStatic(req, res) {
  const url = req.url.split('?')[0]
  let filePath = join(DIST, url === '/' ? 'index.html' : url)

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(DIST, 'index.html')
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
    return
  }

  const mime = MIME[extname(filePath)] || 'application/octet-stream'
  const headers = { 'Content-Type': mime }
  const path = filePath.replaceAll('\\', '/')
  if (path.endsWith('/index.html') || path.endsWith('/sw.js')) {
    headers['Cache-Control'] = 'no-cache'
  } else if (path.includes('/assets/')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable'
  }

  res.writeHead(200, headers)
  res.end(readFileSync(filePath))
}

const store = new Store()
const pubsub = new PubSub()
const notifications = createNotificationsHandler(store, pubsub)

const handlers = {
  messages: createMessagesHandler(store, pubsub),
  schedule: createScheduleHandler(store, pubsub, notifications),
  notifications,
  session: createSessionHandler(store),
}

const handleNavigation = createNavigationRequestHandler()

const httpServer = createServer(async (req, res) => {
  if (req.url?.startsWith('/api/navigation')) {
    return handleNavigation(req, res)
  }
  if (existsSync(DIST)) {
    serveStatic(req, res)
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('StudentCompass API running')
  }
})

// TCP binary server (internal, not exposed externally)
const dispatch = createDispatcher(store)
createTCPServer(dispatch)

// WebSocket attached to the same HTTP server
const wsBridge = new WSBridge(pubsub, store, handlers, httpServer)

httpServer.listen(PORT, () => {
  console.log(`[StudentCompass] Server started on port ${PORT}`)
})

setInterval(() => {
  const expired = store.processExpired()
  if (expired > 0) console.log(`[Store] Expired ${expired} keys`)
}, 100)

setInterval(() => {
  const metrics = {
    ...store.stats(),
    wsClients: wsBridge.clientCount,
    pubsubChannels: pubsub.channelCount(),
    timestamp: Date.now(),
  }
  eventBus.emitMetrics(metrics)
}, 1000)

process.on('SIGINT', () => {
  console.log('\n[StudentCompass] Shutting down...')
  process.exit(0)
})
