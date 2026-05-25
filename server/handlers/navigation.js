import { createServer } from 'node:http'

import { sendJson } from './navigation.http.js'
import { handleAssistant } from './navigation/assistant.handler.js'
import { handlePhoto } from './navigation/photo.handler.js'
import { handleCopilot } from './navigation/copilot.handler.js'
import { handleRecommendations } from './navigation/recommendations.handler.js'
import { handleSupportAssistant } from './navigation/support.handler.js'
import { handleCVAnalysis } from './ai/cv.handler.js'
import { handleAdaptationProfile } from './ai/adaptation.handler.js'
import { handleCityAssistant } from './ai/city.handler.js'
import { handleSmartMatches } from './ai/matches.handler.js'

const ROUTE_HANDLERS = {
  '/api/navigation/assistant': handleAssistant,
  '/api/navigation/photo': handlePhoto,
  '/api/navigation/copilot': handleCopilot,
  '/api/navigation/recommendations': handleRecommendations,
  '/api/navigation/support-assistant': handleSupportAssistant,
  '/api/career/cv-analyze': handleCVAnalysis,
  '/api/ai/adaptation-profile': handleAdaptationProfile,
  '/api/ai/city-assistant': handleCityAssistant,
  '/api/ai/smart-matches': handleSmartMatches,
}

async function dispatchNavigationRoute(req, res, { allowAiRoutes = true } = {}) {
  if (req.method === 'OPTIONS') { sendJson(res, 204, {}); return }
  if (req.method !== 'POST') { sendJson(res, 404, { error: 'Not found' }); return }

  const url = req.url || ''
  const handler = ROUTE_HANDLERS[url]
  if (!handler) { sendJson(res, 404, { error: 'Not found' }); return }
  if (!allowAiRoutes && url.startsWith('/api/ai/')) { sendJson(res, 404, { error: 'Not found' }); return }

  await handler(req, res)
}

export function createNavigationRequestHandler() {
  return async (req, res) => {
    try {
      await dispatchNavigationRoute(req, res, { allowAiRoutes: true })
    } catch (error) {
      sendJson(res, error.statusCode || 500, { error: error.message || 'Navigation API error' })
    }
  }
}

export function createNavigationApiServer(port = 3000) {
  const server = createServer(async (req, res) => {
    try {
      await dispatchNavigationRoute(req, res, { allowAiRoutes: false })
    } catch (error) {
      sendJson(res, error.statusCode || 500, { error: error.message || 'Navigation API error' })
    }
  })

  server.listen(port, () => {
    console.log(`[StudentPulse] Navigation API started - HTTP:${port}`)
  })

  return server
}
