import {
  analyzeNavigationPhoto,
  askNavigationAssistant,
  getNavigationRecommendations,
} from './navigationApi'

export async function askCampusAI(userMessage, history = [], university = '') {
  return askNavigationAssistant(userMessage, history, university)
}

export async function analyzePhoto(base64Image, mimeType = 'image/jpeg', university = '') {
  return analyzeNavigationPhoto({ base64: base64Image, mimeType, university })
}

export async function getSmartRecommendations({ hour, totalUsers, schedule, university = '' }) {
  return getNavigationRecommendations({ hour, totalUsers, schedule, university })
}
