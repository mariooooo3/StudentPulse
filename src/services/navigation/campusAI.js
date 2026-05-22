import {
  analyzeNavigationPhoto,
  askNavigationCopilot,
  askNavigationAssistant,
  askRecoAssistant,
  getNavigationRecommendations,
} from './navigationApi'

export async function askCampusAI(userMessage, history = [], university = 'tuiasi') {
  return askNavigationAssistant(userMessage, history, university)
}

export async function askRecoAI(userMessage, history = [], university = 'tuiasi') {
  return askRecoAssistant(userMessage, history, university)
}

export async function askCampusCopilot(payload) {
  return askNavigationCopilot(payload)
}

export async function analyzePhoto(base64Image, mimeType = 'image/jpeg', university = 'tuiasi', coords = null) {
  return analyzeNavigationPhoto({ base64: base64Image, mimeType, university, coords })
}

export async function getSmartRecommendations({ schedule, hour, totalUsers, university = 'tuiasi' }) {
  return getNavigationRecommendations({ schedule, hour, totalUsers }, university)
}
