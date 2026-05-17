import {
  analyzeNavigationPhoto,
  askNavigationCopilot,
  askNavigationAssistant,
  getNavigationRecommendations,
} from './navigationApi'

export async function askCampusAI(userMessage, history = []) {
  return askNavigationAssistant(userMessage, history)
}

export async function askCampusCopilot(payload) {
  return askNavigationCopilot(payload)
}

export async function analyzePhoto(base64Image, mimeType = 'image/jpeg') {
  return analyzeNavigationPhoto({ base64: base64Image, mimeType })
}

export async function getSmartRecommendations({ schedule }) {
  return getNavigationRecommendations({ schedule })
}
