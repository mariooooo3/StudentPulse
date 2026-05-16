import { Protocol } from '../core/redis/Protocol.js'

const ERR_UNKNOWN = 1
const ERR_BAD_ARG = 4

// TCP binary protocol command dispatcher — port of do_request() from 14_server.cpp
export function createDispatcher(store) {
  return function dispatch(args) {
    if (args.length === 0) return Protocol.writeErr(ERR_BAD_ARG, 'empty command')

    const cmd = args[0].toUpperCase()

    switch (cmd) {
      case 'PING':
        return Protocol.writeStr(args.length > 1 ? args[1] : 'PONG')

      case 'GET': {
        if (args.length !== 2) return Protocol.writeErr(ERR_BAD_ARG, 'GET key')
        const val = store.get(args[1])
        return val === null ? Protocol.writeNil() : Protocol.writeStr(String(val))
      }

      case 'SET': {
        if (args.length < 3) return Protocol.writeErr(ERR_BAD_ARG, 'SET key value [PX ms]')
        let ttl = 0
        if (args.length >= 5 && args[3].toUpperCase() === 'PX') {
          ttl = parseInt(args[4])
          if (isNaN(ttl) || ttl <= 0) return Protocol.writeErr(ERR_BAD_ARG, 'invalid TTL')
        }
        store.set(args[1], args[2], ttl)
        return Protocol.writeStr('OK')
      }

      case 'DEL': {
        if (args.length < 2) return Protocol.writeErr(ERR_BAD_ARG, 'DEL key [key ...]')
        let deleted = 0
        for (let i = 1; i < args.length; i++) deleted += store.del(args[i])
        return Protocol.writeInt(deleted)
      }

      case 'PEXPIRE': {
        if (args.length !== 3) return Protocol.writeErr(ERR_BAD_ARG, 'PEXPIRE key ms')
        const ms = parseInt(args[2])
        if (isNaN(ms)) return Protocol.writeErr(ERR_BAD_ARG, 'invalid ms')
        return Protocol.writeInt(store.pexpire(args[1], ms))
      }

      case 'PTTL': {
        if (args.length !== 2) return Protocol.writeErr(ERR_BAD_ARG, 'PTTL key')
        return Protocol.writeInt(store.pttl(args[1]))
      }

      case 'KEYS': {
        const pattern = args[1] || '*'
        const keys = store.keys(pattern)
        const parts = [Protocol.writeArrHeader(keys.length)]
        for (const k of keys) parts.push(Protocol.writeStr(k))
        return Buffer.concat(parts)
      }

      case 'STATS': {
        const s = store.stats()
        return Protocol.writeStr(JSON.stringify(s))
      }

      default:
        return Protocol.writeErr(ERR_UNKNOWN, `unknown command '${cmd}'`)
    }
  }
}
