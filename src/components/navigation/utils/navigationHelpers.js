export function speak(text, enabled) {
  if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'ro-RO'
  utt.rate = 0.92
  window.speechSynthesis.speak(utt)
}

export function buildIndoorCinematicSteps(nodePath, indRooms) {
  const steps = []
  const startRoom = indRooms.find(r => r.id === nodePath[0])
  steps.push({
    instruction: `Ești la ${startRoom?.label || nodePath[0]}${startRoom ? ` — ${startRoom.floor === 0 ? 'Parter' : 'Etaj ' + startRoom.floor}` : ''}`,
    icon: '📍',
    highlightRoom: nodePath[0],
  })
  for (let i = 1; i < nodePath.length; i++) {
    const id = nodePath[i]
    const room = indRooms.find(r => r.id === id)
    const isLast = i === nodePath.length - 1
    if (id.startsWith('stairs_')) {
      const prevRoom = indRooms.find(r => r.id === nodePath[i - 1])
      const nextRoom = indRooms.find(r => r.id === nodePath[i + 1])
      const goingUp = nextRoom && prevRoom && nextRoom.floor > prevRoom.floor
      steps.push({
        instruction: goingUp
          ? `Mergi la scări și urcă la etajul ${nextRoom?.floor ?? ''}`
          : `Mergi la scări și coboară la etajul ${nextRoom?.floor === 0 ? 'parter' : nextRoom?.floor ?? ''}`,
        icon: '🪜',
        highlightRoom: id,
      })
    } else if (room) {
      steps.push({
        instruction: isLast
          ? `${room.label} — ai ajuns la destinație!`
          : `Continuă prin ${room.label} (${room.floor === 0 ? 'Parter' : 'Etaj ' + room.floor})`,
        icon: isLast ? '✅' : '🚪',
        highlightRoom: id,
        isFinal: isLast,
      })
    }
  }
  return steps
}

export function buildOutdoorCinematicSteps(pathData, actions, fromBuilding, toBuilding) {
  const steps = []
  steps.push({
    instruction: `Starting from ${fromBuilding?.name || 'your current location'}`,
    icon: '📍',
    pathSlice: pathData.slice(0, Math.max(1, Math.floor(pathData.length * 0.05))),
  })
  const acts = actions?.length > 0 ? actions : []
  acts.forEach((action, i) => {
    const ratio = (i + 1) / (acts.length + 1)
    const idx = Math.max(2, Math.floor(ratio * pathData.length))
    steps.push({ instruction: action, icon: '🚶', pathSlice: pathData.slice(0, idx) })
  })
  steps.push({
    instruction: `You've arrived!\n${toBuilding?.name || 'Destination'}`,
    icon: '✅',
    pathSlice: pathData,
    isFinal: true,
  })
  return steps
}

export function confidenceLabel(value) {
  if (!value) return 'neconfirmat'
  return `${Math.round(value * 100)}%`
}

export function withDestinationQuestion(text) {
  const cleanText = String(text || '').trim()
  if (/unde\s+vrei\s+sa\s+ajungi/i.test(cleanText)) return cleanText
  return `${cleanText || 'Am analizat poza.'}\n\nUnde vrei sa ajungi de aici?`
}
