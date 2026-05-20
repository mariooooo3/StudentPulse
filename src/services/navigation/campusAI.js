import {
  analyzeNavigationPhoto,
  askNavigationCopilot,
  askNavigationAssistant,
  askRecoAssistant,
  getNavigationRecommendations,
} from './navigationApi'

export async function askCampusAI(userMessage, history = []) {
  return askNavigationAssistant(userMessage, history)
}

export async function askRecoAI(userMessage, history = []) {
  return askRecoAssistant(userMessage, history)
}

export async function askCampusCopilot(payload) {
  return askNavigationCopilot(payload)
}

export async function analyzePhoto(base64Image, mimeType = 'image/jpeg', university = 'tuiasi') {
  return analyzeNavigationPhoto({ base64: base64Image, mimeType, university })
}

export async function getSmartRecommendations({ schedule }) {
  return getNavigationRecommendations({ schedule })
}
