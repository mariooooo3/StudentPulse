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
import { createNavigationApiServer } from './handlers/navigation.js'

const store = new Store()
const pubsub = new PubSub()

const notifications = createNotificationsHandler(store, pubsub)

const handlers = {
  messages: createMessagesHandler(store, pubsub),
  schedule: createScheduleHandler(store, pubsub, notifications),
  notifications,
  session: createSessionHandler(store),
}

// TCP binary server (Redis-compatible, port 1234)
const dispatch = createDispatcher(store)
createTCPServer(dispatch)

// WebSocket bridge (JSON protocol, port 8080)
const wsBridge = new WSBridge(pubsub, store, handlers)
createNavigationApiServer(Number(process.env.NAV_PORT || 3001))

// TTL expiry timer — equivalent to process_timers() called from event loop in C++
setInterval(() => {
  const expired = store.processExpired()
  if (expired > 0) console.log(`[Store] Expired ${expired} keys`)
}, 100)

// Metrics broadcast every second
setInterval(() => {
  const metrics = {
    ...store.stats(),
    wsClients: wsBridge.clientCount,
    pubsubChannels: pubsub.channelCount(),
    timestamp: Date.now(),
  }
  eventBus.emitMetrics(metrics)
}, 1000)

console.log('[StudentCompass] Server started')

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[StudentCompass] Shutting down...')
  process.exit(0)
})
