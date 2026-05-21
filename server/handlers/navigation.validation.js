function badRequest(message) {
  const err = new Error(message)
  err.statusCode = 400
  return err
}

export function asObject(value, field = 'payload') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw badRequest(`${field} must be an object`)
  }
  return value
}

export function asString(value, field, { required = false, min = 0 } = {}) {
  if (value == null || value === '') {
    if (required) throw badRequest(`${field} is required`)
    return ''
  }
  if (typeof value !== 'string') throw badRequest(`${field} must be a string`)
  if (value.trim().length < min) throw badRequest(`${field} is too short`)
  return value
}

export function asArray(value, field) {
  if (value == null) return []
  if (!Array.isArray(value)) throw badRequest(`${field} must be an array`)
  return value
}
