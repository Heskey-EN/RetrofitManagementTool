// The retrofit project workflow. `value` is what's stored on a job (stable);
// `label` is what's shown. Keeping them separate lets us rename a stage without
// migrating existing jobs or their document folders.
export const STATUSES = [
  { value: 'Booking', label: 'Booking', color: '#5b7fb9' },
  { value: 'Assessment', label: 'Assessment', color: '#7c6fd6' },
  { value: 'Coordination', label: 'Coordination / Design', color: '#d9893a' },
  { value: 'Compiling documents', label: 'Compiling documents', color: '#2ba6a0' },
  { value: 'Submitted', label: 'Submitted', color: '#2e9e6b' },
]

export const STATUS_VALUES = STATUSES.map((s) => s.value)

// First stage is the default for new jobs (manual add and CSV import).
export const DEFAULT_STATUS = STATUSES[0].value

export function statusColor(value) {
  const found = STATUSES.find((s) => s.value === value)
  return found ? found.color : '#66756d'
}

export function statusLabel(value) {
  const found = STATUSES.find((s) => s.value === value)
  return found ? found.label : value
}

export function statusIndex(value) {
  const i = STATUS_VALUES.indexOf(value)
  return i === -1 ? 0 : i
}
