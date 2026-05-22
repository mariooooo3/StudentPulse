export const STATUS_BADGE = {
  accepted: 'badge-green',
  rejected: 'badge-red',
}

export const STATUS_LABEL = {
  accepted: 'AprobatÄƒ',
  rejected: 'RespinsÄƒ',
}

export function buildSortedCombos(recoverySlots) {
  return [...new Set(
    Object.values(recoverySlots).flat().map(s => `${s.day}|${s.start}`)
  )].sort((a, b) => {
    const [da, sa] = a.split('|').map(Number)
    const [db, sb] = b.split('|').map(Number)
    return da !== db ? da - db : sa - sb
  })
}

export function groupCombosByDay(allCombos) {
  const byDay = {}
  allCombos.forEach(combo => {
    const [day] = combo.split('|')
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(combo)
  })
  return byDay
}
