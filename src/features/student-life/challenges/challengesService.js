const BASE = import.meta.env.VITE_API_URL || ''

export async function fetchChallenges(userId) {
  const res = await fetch(`${BASE}/api/challenges/${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error('Failed to load challenges')
  return res.json()
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
  challengeTitle, challengeDescription,
}) {
  let proofImage = null
  let proofImageMime = null

  if (verifyType === 'screenshot' && proofImageFile) {
    proofImage = await fileToBase64(proofImageFile)
    proofImageMime = proofImageFile.type || 'image/jpeg'
  }

  const res = await fetch(`${BASE}/api/challenges/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId, challengeId, challengeType, periodKey,
      proofText, proofImage, proofImageMime,
      verifyType,
      challengeTitle, challengeDescription,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Submit failed')
  }
  return res.json()
}
