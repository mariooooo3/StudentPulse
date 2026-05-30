export const APP_NAME = 'StudentPulse'
export const APP_VERSION = '2.0.0'
export const APP_TAGLINE = 'De la pierdut, la acasă.'

export const VIEWS = {
  DASHBOARD: 'dashboard',
  NAVIGATOR: 'navigator',
  CITY: 'city',
  SCHEDULE: 'schedule',
  THESIS: 'thesis',
  TUTORING: 'tutoring',
  MESSAGES: 'messages',
}

export const CITY_VIEWS = {
  HUB: 'hub',
  ARRIVAL: 'arrival',
  HOUSING: 'housing',
  DISCOUNTS: 'discounts',
  TIPS: 'tips',
  SAFETY: 'safety',
  TRANSPORT: 'transport',
}

// Auth states — mirrors future Supabase session states
export const AUTH_STATE = {
  LOADING: 'loading',
  UNAUTHENTICATED: 'unauthenticated',
  AUTHENTICATED: 'authenticated',
}

// Profile completion stages — drives post-auth routing
export const PROFILE_STAGE = {
  NONE: 'none',
  ONBOARDING: 'onboarding',
  COMPLETE: 'complete',
}

// Faculty types — used for dynamic onboarding schema selection
export const FACULTY_TYPE = {
  CS: 'CS',
  SCIENCES: 'SCIENCES',
  HUMANITIES: 'HUMANITIES',
  ECONOMICS: 'ECONOMICS',
  MEDICINE: 'MEDICINE',
  ENGINEERING: 'ENGINEERING',
  ARTS: 'ARTS',
}

// Arrival origin types — city adaptation branching
export const ORIGIN_TYPE = {
  LOCAL: 'local',       // From the same city
  NATIONAL: 'national', // From another Romanian city
  ERASMUS: 'erasmus',   // International exchange
  FOREIGN: 'foreign',   // Non-Erasmus international
}
