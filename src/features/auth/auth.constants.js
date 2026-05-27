export const STEP = {
  LOGIN:          0,
  SELECT_UNI:     1,
  ENTER_DETAILS:  2,
  CREATING:       3,
  CONFIRMED:      4,
}

export const REGISTER_STEP_KEYS = ['selectUni', 'details', 'confirmed']

export const VERIFICATION_PROGRESS = [
  { key: 'emailValidation', done: true },
  { key: 'detectFaculty',   done: true },
  { key: 'createProfile',   done: false },
]
