export function verifyTotpCode(code) {
  return Promise.resolve(code === '0000')
}

export function buildUniversityEmail(email, emailDomain) {
  return email ? `${email}@${emailDomain}` : `student@${emailDomain}`
}
