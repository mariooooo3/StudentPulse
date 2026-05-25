import net from 'net'
import { Connection } from './Connection.js'

const PORT = Number(process.env.TCP_PORT || 1240)

export function createTCPServer(dispatchFn) {
  const server = net.createServer(socket => {
    new Connection(socket, dispatchFn)
  })

  server.listen(PORT, () => {
    console.log(`[TCP] Redis-compatible server listening on port ${PORT}`)
  })

  server.on('error', err => console.error('[TCP] Server error:', err))
  return server
}
