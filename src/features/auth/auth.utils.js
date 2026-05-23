export async function verifyTotpCode(code) {
  const res = await fetch('/api/auth/verify-totp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  const { valid } = await res.json()
  return Boolean(valid)
}

export function buildUniversityEmail(email, emailDomain) {
  return email ? `${email}@${emailDomain}` : `student@${emailDomain}`
}
