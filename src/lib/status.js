// The retrofit project workflow. Every job moves through these stages in order;
// each stage also doubles as a document folder (see documentsStore).
export const STATUSES = [
  { value: 'Booking', color: '#2563eb' },
  { value: 'Assessment', color: '#7c3aed' },
  { value: 'Coordination', color: '#d97706' },
  { value: 'Compiling documents', color: '#0891b2' },
  { value: 'Submitted', color: '#16a34a' },
]

export const STATUS_VALUES = STATUSES.map((s) => s.value)

// First stage is the default for new jobs (manual add and CSV import).
export const DEFAULT_STATUS = STATUSES[0].value

export function statusColor(value) {
  const found = STATUSES.find((s) => s.value === value)
  return found ? found.color : '#6b7280'
}
