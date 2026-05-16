import { EventEmitter } from 'events'
import { TTLHeap } from './TTLHeap.js'

export class Store extends EventEmitter {
  #data = new Map()
  #ttl = new TTLHeap()
  #stats = { sets: 0, gets: 0, dels: 0, hits: 0, misses: 0, expired: 0 }

  set(key, value, ttlMs = 0) {
    this.#data.set(key, value)
    this.#stats.sets++
    if (ttlMs > 0) {
      this.#ttl.insert(key, Date.now() + ttlMs)
    } else {
      this.#ttl.remove(key)
    }
    this.emit('set', key, value)
    return 'OK'
  }

  get(key) {
    this.#stats.gets++
    // Lazy expiry check — same pattern as C++ cmd_get()
    if (this.#ttl.has(key) && this.#ttl.ttl(key) <= 0) {
      this.#expire(key)
      this.#stats.misses++
      return null
    }
    const val = this.#data.get(key) ?? null
    if (val !== null) this.#stats.hits++
    else this.#stats.misses++
    return val
  }

  del(key) {
    if (!this.#data.has(key)) return 0
    this.#data.delete(key)
    this.#ttl.remove(key)
    this.#stats.dels++
    this.emit('del', key)
    return 1
  }

  pexpire(key, ttlMs) {
    if (!this.#data.has(key)) return 0
    this.#ttl.insert(key, Date.now() + ttlMs)
    return 1
  }

  pttl(key) {
    if (!this.#data.has(key)) return -2
    const remaining = this.#ttl.ttl(key)
    return remaining === -1 ? -1 : Math.max(0, remaining)
  }

  keys(pattern = '*') {
    const all = [...this.#data.keys()]
    if (pattern === '*') return all
    const re = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
    return all.filter(k => re.test(k))
  }

  // Called by setInterval every 100ms — equivalent to process_timers() in C++
  processExpired() {
    const expired = this.#ttl.collectExpired()
    for (const key of expired) {
      this.#expire(key)
    }
    return expired.length
  }

  stats() {
    return { ...this.#stats, size: this.#data.size, ttlEntries: this.#ttl.size }
  }

  #expire(key) {
    this.#data.delete(key)
    this.#stats.expired++
    this.emit('expired', key)
    this.emit('del', key)
  }
}
