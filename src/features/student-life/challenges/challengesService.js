import { apiRequest } from '../../../shared/api/session'

const BASE = import.meta.env.VITE_API_URL || ''

export async function fetchChallenges(userId) {
  return apiRequest(`${BASE}/api/challenges/${encodeURIComponent(userId)}`)
}

// Leaderboard is public (read-only) — no token required, but apiRequest still
// attaches one when available so logged-in users share a consistent path.
export async function fetchLeaderboard(scope) {
  const url = scope
    ? `${BASE}/api/challenges/leaderboard?scope=${encodeURIComponent(scope)}`
    : `${BASE}/api/challenges/leaderboard`
  return apiRequest(url)
}

// Reports an in-app action (focus-session, message-sent, career-apply,
// tutoring-booked) so the backend can auto-complete the matching challenges.
// The acting identity comes from the session token; userId is no longer sent.
export async function reportInAppAction(actionType, { userName, userScope } = {}) {
  return apiRequest(`${BASE}/api/challenges/in-app-action`, {
    method: 'POST',
    body: { actionType, userName, userScope },
  })
}

// Converts a File/Blob to base64 string
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // result is "data:image/jpeg;base64,XXXX" — strip the prefix
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function submitChallenge({
  userId, challengeId, challengeType, periodKey,
  proofText, proofImageFile,
  verifyType,
  challengeTitle, challengeDescription, challengePoints,
  userName, userScope,
}) {
  let proofImage = null
  let proofImageMime = null

  if (verifyType === 'screenshot' && proofImageFile) {
    proofImage = await fileToBase64(proofImageFile)
    proofImageMime = proofImageFile.type || 'image/jpeg'
  }

  return apiRequest(`${BASE}/api/challenges/submit`, {
    method: 'POST',
    body: {
      challengeId, challengeType, periodKey,
      proofText, proofImage, proofImageMime,
      verifyType,
      challengeTitle, challengeDescription, challengePoints,
      userName, userScope,
    },
  })
}
