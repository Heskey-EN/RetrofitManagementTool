import StatusSelect from './StatusSelect'
import { statusColor } from '../lib/status'

function formatDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// One card per job. Shows the detected title, a couple of preview fields, and
// an inline status control. Clicking the card opens the full detail drawer.
export default function JobCard({ job, onStatusChange, onOpen }) {
  const start = formatDate(job.start_date)
  const end = job.end_date && job.end_date !== job.start_date ? formatDate(job.end_date) : null

  // Show up to three extra fields from the raw CSV row as a quick preview.
  const preview = Object.entries(job.data || {})
    .filter(([, v]) => String(v ?? '').trim() !== '')
    .slice(0, 3)

  return (
    <article
      className="job-card"
      style={{ '--status-color': statusColor(job.status) }}
      onClick={() => onOpen(job)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen(job)
      }}
    >
      <div className="job-card__bar" aria-hidden />
      <div className="job-card__body">
        <h3 className="job-card__title">{job.title}</h3>
        {(start || end) && (
          <div className="job-card__dates">
            {start && <span>{start}</span>}
            {end && <span className="job-card__date-sep">→ {end}</span>}
          </div>
        )}
        {preview.length > 0 && (
          <dl className="job-card__preview">
            {preview.map(([k, v]) => (
              <div key={k} className="job-card__field">
                <dt>{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="job-card__actions">
        <StatusSelect
          value={job.status}
          size="sm"
          onChange={(value) => onStatusChange(job.id, { status: value })}
        />
      </div>
    </article>
  )
}
