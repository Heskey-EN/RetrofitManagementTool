// The retrofit project workflow. Every job moves through these stages in order;
// each stage also doubles as a document folder (see documentsStore). Colours are
// a designed sequence — cool at intake, warming through coordination, resolving
// to emerald when submitted — rather than an arbitrary palette.
export const STATUSES = [
  { value: 'Booking', color: '#5b7fb9' },
  { value: 'Assessment', color: '#7c6fd6' },
  { value: 'Coordination', color: '#d9893a' },
  { value: 'Compiling documents', color: '#2ba6a0' },
  { value: 'Submitted', color: '#2e9e6b' },
]

export const STATUS_VALUES = STATUSES.map((s) => s.value)

// First stage is the default for new jobs (manual add and CSV import).
export const DEFAULT_STATUS = STATUSES[0].value

export function statusColor(value) {
  const found = STATUSES.find((s) => s.value === value)
  return found ? found.color : '#66756d'
}

export function statusIndex(value) {
  const i = STATUS_VALUES.indexOf(value)
  return i === -1 ? 0 : i
}
