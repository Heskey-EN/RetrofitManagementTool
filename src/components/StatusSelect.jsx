import { STATUSES, statusColor } from '../lib/status'

// A compact status dropdown that colours itself to match the current status.
export default function StatusSelect({ value, onChange, size = 'md' }) {
  return (
    <select
      className={`status-select status-select--${size}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ '--status-color': statusColor(value) }}
      aria-label="Job status"
      onClick={(e) => e.stopPropagation()}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.value}
        </option>
      ))}
    </select>
  )
}
