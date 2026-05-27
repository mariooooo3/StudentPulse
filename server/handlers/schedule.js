import { eventBus } from '../core/events/EventBus.js'

export function createScheduleHandler(store, pubsub, notifications) {
  const pendingKey = 'schedule:swaps:pending'

  function getPending() {
    const raw = store.get(pendingKey)
    return raw ? JSON.parse(raw) : []
  }

  function savePending(list) {
    store.set(pendingKey, JSON.stringify(list))
  }

  function submitSwap(request, ws) {
    const pending = getPending()

    // Look for a matching request (someone offering what this user needs)
    const matchIdx = pending.findIndex(r =>
      r.course === request.course &&
      r.offerSlot === request.needSlot &&
      r.needSlot === request.offerSlot &&
      r.userId !== request.userId
    )

    if (matchIdx !== -1) {
      const match = pending[matchIdx]
      pending.splice(matchIdx, 1)
      savePending(pending)

      const matchData = {
        id: `match-${Date.now()}`,
        course: request.course,
        userA: match.userId,
        userB: request.userId,
        slotA: match.offerSlot,
        slotB: request.offerSlot,
        timestamp: new Date().toISOString(),
      }

      // Notify both users via their personal channels
      pubsub.publish(`user:${match.userId}:swaps`, matchData)
      pubsub.publish(`user:${request.userId}:swaps`, matchData)
      notifications?.push(match.userId, {
        title: 'Swap gasit',
        body: `Ai un match pentru ${request.course}.`,
        type: 'success',
        action: 'schedule.swap.match',
        meta: matchData,
      })
      notifications?.push(request.userId, {
        title: 'Swap gasit',
        body: `Ai un match pentru ${request.course}.`,
        type: 'success',
        action: 'schedule.swap.match',
        meta: matchData,
      })
      eventBus.emitSwap(matchData)

      return { matched: true, match: matchData }
    }

    // No match — add to pending pool
    const entry = {
      ...request,
      id: `swap-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    }
    pending.push(entry)
    savePending(pending)
    notifications?.push(request.userId, {
      title: 'Cerere swap publicata',
      body: `Cautam automat un coleg compatibil pentru ${request.course}.`,
      type: 'info',
      action: 'schedule.swap.pending',
      meta: { swapId: entry.id },
    })
    return { matched: false, swapId: entry.id }
  }

  function cancelSwap(swapId, userId) {
    const pending = getPending()
    const idx = pending.findIndex(r => r.id === swapId && r.userId === userId)
    if (idx === -1) return false
    pending.splice(idx, 1)
    savePending(pending)
    return true
  }

  return { submitSwap, cancelSwap, getPending }
}

export function createPersistentScheduleHandler(repository, pubsub, notifications) {
  async function submitSwap(request) {
    const pending = await repository.listPendingSwaps()
    const match = pending.find(r =>
      r.course === request.course &&
      r.offerSlot === request.needSlot &&
      r.needSlot === request.offerSlot &&
      r.userId !== request.userId
    )

    if (match) {
      await repository.deletePendingSwap(match.id)
      const matchData = {
        id: `match-${Date.now()}`,
        course: request.course,
        userA: match.userId,
        userB: request.userId,
        slotA: match.offerSlot,
        slotB: request.offerSlot,
        timestamp: new Date().toISOString(),
      }
      pubsub.publish(`user:${match.userId}:swaps`, matchData)
      pubsub.publish(`user:${request.userId}:swaps`, matchData)
      notifications?.push(match.userId, {
        title: 'Swap gasit',
        body: `Ai un match pentru ${request.course}.`,
        type: 'success',
        action: 'schedule.swap.match',
        meta: matchData,
      })
      notifications?.push(request.userId, {
        title: 'Swap gasit',
        body: `Ai un match pentru ${request.course}.`,
        type: 'success',
        action: 'schedule.swap.match',
        meta: matchData,
      })
      eventBus.emitSwap(matchData)
      return { matched: true, match: matchData }
    }

    const entry = await repository.addPendingSwap(request)
    notifications?.push(request.userId, {
      title: 'Cerere swap publicata',
      body: `Cautam automat un coleg compatibil pentru ${request.course}.`,
      type: 'info',
      action: 'schedule.swap.pending',
      meta: { swapId: entry.id },
    })
    return { matched: false, swapId: entry.id }
  }

  async function cancelSwap(swapId) {
    await repository.deletePendingSwap(swapId)
    return true
  }

  return { submitSwap, cancelSwap, getPending: () => repository.listPendingSwaps() }
}
