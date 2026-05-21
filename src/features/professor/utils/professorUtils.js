export function statusLabel(status) {
  return { pending: 'In asteptare', accepted: 'Acceptata', rejected: 'Respinsa' }[status] || status
}

export function consultationHoursFor(professor) {
  return professor.consultationHours || professor.officeHours || []
}
