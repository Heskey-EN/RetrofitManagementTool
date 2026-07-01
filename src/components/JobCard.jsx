import StatusSelect from './StatusSelect'
import { statusColor } from '../lib/status'
import { jobAddress, jobReference, jobPostcode, jobCustomer, jobMeasure, formatDateShort } from '../lib/display'

// One card per job. The property address is the headline; the reference,
// postcode and dates are set in mono to read as precise, measured data.
export default function JobCard({ job, onStatusChange, onOpen }) {
  const reference = jobReference(job)
  const postcode = jobPostcode(job)
  const customer = jobCustomer(job)
  const measure = jobMeasure(job)
  const start = formatDateShort(job.start_date)
  const end = job.end_date && job.end_date !== job.start_date ? formatDateShort(job.end_date) : null

  return (
    <article
      className="card"
      style={{ '--status-color': statusColor(job.status) }}
      onClick={() => onOpen(job)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(job) }}
    >
      <span className="card__rail" aria-hidden />
      <div className="card__body">
        <div className="card__eyebrow">
          {reference && <span className="card__ref mono">{reference}</span>}
          {measure && <span className="card__measure">{measure}</span>}
        </div>
        <h3 className="card__title">{jobAddress(job)}</h3>
        <div className="card__meta">
          {postcode && <span className="mono card__postcode">{postcode}</span>}
          {customer && <span className="card__customer">{customer}</span>}
        </div>
        <div className="card__foot">
          <span className="card__dates mono">
            {start ? (
              <>{start}{end && <span className="card__dates-sep"> → {end}</span>}</>
            ) : (
              <span className="card__nodate">No dates</span>
            )}
          </span>
          <StatusSelect
            value={job.status}
            size="sm"
            onChange={(value) => onStatusChange(job, value)}
          />
        </div>
      </div>
    </article>
  )
}
