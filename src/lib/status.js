// Generic job statuses for the MVP. These are deliberately not
// retrofit-specific — Phase 2 can replace them with measure/compliance states.
export const STATUSES = [
  { value: 'Not Started', color: '#6b7280' },
  { value: 'Scheduled', color: '#2563eb' },
  { value: 'In Progress', color: '#d97706' },
  { value: 'On Hold', color: '#dc2626' },
  { value: 'Complete', color: '#16a34a' },
]

export const STATUS_VALUES = STATUSES.map((s) => s.value)

export function statusColor(value) {
  const found = STATUSES.find((s) => s.value === value)
  return found ? found.color : '#6b7280'
}
