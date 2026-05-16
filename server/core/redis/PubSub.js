export class PubSub {
  #channels = new Map()       // channel → Set<client>
  #clientChannels = new Map() // client → Set<channel>

  subscribe(channel, client) {
    if (!this.#channels.has(channel)) this.#channels.set(channel, new Set())
    this.#channels.get(channel).add(client)

    if (!this.#clientChannels.has(client)) this.#clientChannels.set(client, new Set())
    this.#clientChannels.get(client).add(channel)
    return this.#clientChannels.get(client).size
  }

  unsubscribe(channel, client) {
    const subs = this.#channels.get(channel)
    if (subs) {
      subs.delete(client)
      if (subs.size === 0) this.#channels.delete(channel)
    }
    const chans = this.#clientChannels.get(client)
    if (chans) {
      chans.delete(channel)
      if (chans.size === 0) this.#clientChannels.delete(client)
    }
  }

  unsubscribeAll(client) {
    const chans = this.#clientChannels.get(client)
    if (!chans) return
    for (const ch of chans) {
      const subs = this.#channels.get(ch)
      if (subs) {
        subs.delete(client)
        if (subs.size === 0) this.#channels.delete(ch)
      }
    }
    this.#clientChannels.delete(client)
  }

  publish(channel, data) {
    const subs = this.#channels.get(channel)
    if (!subs || subs.size === 0) return 0
    let delivered = 0
    for (const client of subs) {
      try {
        client.send(JSON.stringify({ type: 'MESSAGE', channel, data }))
        delivered++
      } catch { /* client disconnected */ }
    }
    return delivered
  }

  channelCount() { return this.#channels.size }
  subscriberCount(channel) { return this.#channels.get(channel)?.size ?? 0 }
}
