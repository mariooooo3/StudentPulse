/**
 * Auth Service — wraps authentication logic.
 * Currently mocked. Future: swap body for Supabase Auth calls.
 *
 * Supabase integration points:
 *   import { createClient } from '@supabase/supabase-js'
 *   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
 *   supabase.auth.signInWithOtp({ email })
 *   supabase.auth.getSession()
 *   supabase.auth.signOut()
 */

import { apiPost } from '../api/client'
import { validateInstitutionalEmail, detectFacultyFromEmail } from '../config/universities'

// Simulates sending a magic link / OTP
export async function sendVerificationEmail(email, university) {
  if (!validateInstitutionalEmail(email, university)) {
    throw new Error(`Email-ul trebuie să fie de la @${university.emailDomain}`)
  }
  // Future: await supabase.auth.signInWithOtp({ email })
  await apiPost('/auth/send-otp', { email, universityId: university.id })
  return { sent: true }
}

// Simulates verifying OTP / magic link click
export async function verifyOTP(email, otp, university) {
  // Future: await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
  await apiPost('/auth/verify-otp', { email, otp })

  const faculty = detectFacultyFromEmail(email, university)

  return {
    userId: `mock-uid-${Date.now()}`,
    email,
    university,
    detectedFaculty: faculty,
    isNewUser: true, // triggers onboarding
  }
}

// Simulates restoring session from localStorage / Supabase session
export async function restoreSession() {
  // sessionStorage = per-tab isolation, so two tabs can be two different users
  const raw = sessionStorage.getItem('sc_session')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function persistSession(session) {
  sessionStorage.setItem('sc_session', JSON.stringify(session))
}

export function clearSession() {
  sessionStorage.removeItem('sc_session')
  sessionStorage.removeItem('sc_profile')
}

export async function signOut() {
  // Future: await supabase.auth.signOut()
  clearSession()
}
