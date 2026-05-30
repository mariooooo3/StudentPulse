import net from 'net'
import { Connection } from './Connection.js'

const PORT = Number(process.env.TCP_PORT || 1240)
// Bind to loopback only — this is an internal datastore protocol with no auth
// and must never be reachable from outside the host.
const HOST = process.env.TCP_HOST || '127.0.0.1'

export function createTCPServer(dispatchFn) {
  const server = net.createServer(socket => {
    new Connection(socket, dispatchFn)
  })

  server.listen(PORT, HOST, () => {
    console.log(`[TCP] Internal datastore listening on ${HOST}:${PORT}`)
  })

  server.on('error', err => console.error('[TCP] Server error:', err))
  return server
}
