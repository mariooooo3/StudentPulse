export const STEP = { SELECT_UNI: 0, ENTER_EMAIL: 1, VERIFYING: 2, CONFIRMED: 3 }

export const STEP_LABEL_KEYS = ['selectUni', 'authenticate', 'verifying', 'confirmed']

export const VERIFICATION_PROGRESS = [
  { key: 'emailValidation', done: true },
  { key: 'detectFaculty', done: true },
  { key: 'createProfile', done: false },
]
