import { EventEmitter } from 'events'

class EventBus extends EventEmitter {
  constructor() {
    super()
    this.setMaxListeners(100)
  }

  emitMessage(channel, message) {
    this.emit('message', { channel, message })
  }

  emitSwap(matchData) {
    this.emit('swap_match', matchData)
  }

  emitNotification(userId, notification) {
    this.emit('notification', { userId, notification })
  }

  emitMetrics(metrics) {
    this.emit('metrics', metrics)
  }
}

export const eventBus = new EventBus()
