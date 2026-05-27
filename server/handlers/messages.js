const MAX_HISTORY = 100
const TTL_MS = 24 * 60 * 60 * 1000  // 24h

export function createMessagesHandler(store, pubsub) {
  const historyKey = ch => `chat:history:${ch}`

  function getHistory(channel) {
    const raw = store.get(historyKey(channel))
    if (!raw) return []
    try {
      const history = JSON.parse(raw)
      return Array.isArray(history) ? history : []
    } catch {
      return []
    }
  }

  function addMessage(channel, message) {
    const key = historyKey(channel)
    const history = getHistory(channel)
    const entry = { ...message, channel }
    history.push(entry)
    if (history.length > MAX_HISTORY) history.shift()
    store.set(key, JSON.stringify(history), TTL_MS)
    return entry
  }

  function sendMessage(channel, senderId, content, senderName) {
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId,
      senderName,
      content,
      timestamp: new Date().toISOString(),
      channel,
    }
    addMessage(channel, message)
    pubsub.publish(channel, message)
    return message
  }

  return { getHistory, addMessage, sendMessage }
}

export function createPersistentMessagesHandler(repository, pubsub) {
  async function getHistory(channel) {
    return repository.getDirectMessages(channel)
  }

  async function addMessage(channel, message) {
    return repository.addDirectMessage(channel, { ...message, channel })
  }

  async function sendMessage(channel, senderId, content, senderName) {
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId,
      senderName,
      content,
      timestamp: new Date().toISOString(),
      channel,
    }
    await addMessage(channel, message)
    pubsub.publish(channel, message)
    return message
  }

  return { getHistory, addMessage, sendMessage }
}
