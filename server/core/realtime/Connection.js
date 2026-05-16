import { Protocol } from '../redis/Protocol.js'

const IDLE_TIMEOUT_MS = 5000  // same as C++ IDLE_TIMEOUT_MS

export class Connection {
  #socket
  #incoming = Buffer.alloc(0)
  #dispatch
  #idleTimer = null

  constructor(socket, dispatchFn) {
    this.#socket = socket
    this.#dispatch = dispatchFn

    socket.setNoDelay(true)
    socket.on('data', data => {
      this.#resetIdle()
      this.#incoming = Buffer.concat([this.#incoming, data])
      this.#processIncoming()
    })
    socket.on('close', () => this.#cleanup())
    socket.on('error', () => this.#cleanup())

    this.#resetIdle()
  }

  #resetIdle() {
    clearTimeout(this.#idleTimer)
    this.#idleTimer = setTimeout(() => this.#socket.destroy(), IDLE_TIMEOUT_MS)
  }

  #processIncoming() {
    // try_one_request() loop — same pattern as C++
    while (this.#incoming.length > 0) {
      let parsed
      try {
        parsed = Protocol.parseRequest(this.#incoming)
      } catch (err) {
        this.#socket.write(Protocol.writeErr(1, err.message))
        this.#socket.destroy()
        return
      }
      if (!parsed) break  // need more data

      this.#incoming = this.#incoming.slice(parsed.consumed)
      const response = this.#dispatch(parsed.args)
      this.#socket.write(response)
    }
  }

  #cleanup() {
    clearTimeout(this.#idleTimer)
  }
}
