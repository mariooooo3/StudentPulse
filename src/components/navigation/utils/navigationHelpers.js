export function speak(text, enabled) {
  if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return
  const synth = window.speechSynthesis
  synth.cancel()
  // Chrome needs a brief pause after cancel() before speak() works reliably
  setTimeout(() => {
    const utt = new SpeechSynthesisUtterance(text)
    const voices = synth.getVoices()
    const roVoice = voices.find(v => v.lang.startsWith('ro')) || voices.find(v => v.lang.startsWith('en'))
    if (roVoice) utt.voice = roVoice
    utt.lang = roVoice?.lang || 'ro-RO'
    utt.rate = 0.92
    utt.onerror = () => {}
    synth.speak(utt)
  }, 80)
}

export function buildIndoorCinematicSteps(nodePath, indRooms, t) {
  const steps = []
  const startRoom = indRooms.find(r => r.id === nodePath[0])
  const floorLabel = (floor) => floor === 0 ? t('navigation.indoor.ground') : t('navigation.indoor.floor', { n: floor })
  steps.push({
    instruction: t('navigation.cinematic.stepStartAt', {
      label: startRoom?.label || nodePath[0],
      floor: startRoom ? floorLabel(startRoom.floor) : '',
    }),
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
      const nextFloor = nextRoom?.floor ?? ''
      steps.push({
        instruction: goingUp
          ? t('navigation.cinematic.stepGoUpStairs', { floor: nextFloor })
          : nextFloor === 0
            ? t('navigation.cinematic.stepGoDownToGround')
            : t('navigation.cinematic.stepGoDownStairs', { floor: nextFloor }),
        icon: '🪜',
        highlightRoom: id,
      })
    } else if (room) {
      steps.push({
        instruction: isLast
          ? t('navigation.cinematic.stepArrived', { label: room.label })
          : t('navigation.cinematic.stepContinue', { label: room.label, floor: floorLabel(room.floor) }),
        icon: isLast ? '✅' : '🚪',
        highlightRoom: id,
        isFinal: isLast,
      })
    }
  }
  return steps
}

export function buildOutdoorCinematicSteps(pathData, actions, fromBuilding, toBuilding, t) {
  const steps = []
  steps.push({
    instruction: t('navigation.cinematic.outdoorStart', { name: fromBuilding?.name || '' }),
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
    instruction: t('navigation.cinematic.outdoorArrived', { name: toBuilding?.name || '' }),
    icon: '✅',
    pathSlice: pathData,
    isFinal: true,
  })
  return steps
}

export function confidenceLabel(value, t) {
  if (!value) return t('navigation.helpers.unconfirmed')
  return `${Math.round(value * 100)}%`
}

export function withDestinationQuestion(text, t) {
  const cleanText = String(text || '').trim()
  if (/unde\s+vrei\s+sa\s+ajungi/i.test(cleanText)) return cleanText
  const base = cleanText || t('navigation.helpers.analyzedPhoto')
  return `${base}\n\n${t('navigation.helpers.destinationQuestion')}`
}
