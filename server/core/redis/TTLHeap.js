// Min-heap keyed by expiry timestamp — port of heap.cpp from Redis-from-scratch lab 14
export class TTLHeap {
  #data = []   // [{ key, expireAt }]
  #idx = new Map()  // key → position in #data

  #siftUp(pos) {
    while (pos > 0) {
      const parent = (pos - 1) >> 1
      if (this.#data[parent].expireAt <= this.#data[pos].expireAt) break
      this.#swap(parent, pos)
      pos = parent
    }
  }

  #siftDown(pos) {
    const n = this.#data.length
    while (true) {
      let min = pos
      const l = 2 * pos + 1
      const r = 2 * pos + 2
      if (l < n && this.#data[l].expireAt < this.#data[min].expireAt) min = l
      if (r < n && this.#data[r].expireAt < this.#data[min].expireAt) min = r
      if (min === pos) break
      this.#swap(pos, min)
      pos = min
    }
  }

  #swap(a, b) {
    const tmp = this.#data[a]
    this.#data[a] = this.#data[b]
    this.#data[b] = tmp
    this.#idx.set(this.#data[a].key, a)
    this.#idx.set(this.#data[b].key, b)
  }

  insert(key, expireAt) {
    if (this.#idx.has(key)) {
      this.remove(key)
    }
    const pos = this.#data.length
    this.#data.push({ key, expireAt })
    this.#idx.set(key, pos)
    this.#siftUp(pos)
  }

  remove(key) {
    const pos = this.#idx.get(key)
    if (pos === undefined) return false
    const last = this.#data.length - 1
    if (pos !== last) {
      this.#swap(pos, last)
      this.#data.pop()
      this.#idx.delete(key)
      this.#siftDown(pos)
      this.#siftUp(pos)
    } else {
      this.#data.pop()
      this.#idx.delete(key)
    }
    return true
  }

  // Collect expired keys — same 2000-batch cap as C++ process_timers()
  collectExpired(now = Date.now(), limit = 2000) {
    const expired = []
    while (this.#data.length > 0 && this.#data[0].expireAt <= now && expired.length < limit) {
      expired.push(this.#data[0].key)
      this.remove(this.#data[0].key)
    }
    return expired
  }

  nextExpiry() {
    return this.#data.length > 0 ? this.#data[0].expireAt : null
  }

  ttl(key, now = Date.now()) {
    const pos = this.#idx.get(key)
    if (pos === undefined) return -1
    return this.#data[pos].expireAt - now
  }

  has(key) { return this.#idx.has(key) }
  get size() { return this.#data.length }
}
