import { useEffect } from 'react'
import StatusSelect from './StatusSelect'
import DocumentsPanel from './DocumentsPanel'
import { jobAddress, jobReference, jobPostcode, jobCustomer, jobMeasure } from '../lib/display'

// Slide-in panel for a single property: stage, timeline dates, key details,
// documents (by folder), and every original field. Closes on Escape / backdrop.
export default function JobDetailDrawer({ job, onClose, onUpdate }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!job) return null

  const reference = jobReference(job)
  const details = [
    ['Postcode', jobPostcode(job), true],
    ['Customer', jobCustomer(job), false],
    ['Measure', jobMeasure(job), false],
  ].filter(([, v]) => v)

  const shownKeys = new Set(['Reference', 'Job Reference', 'Ref', 'Postcode', 'Post Code', 'Customer', 'Client', 'Measure', 'Work Type', 'Address', 'Property Address'])
  const extraFields = Object.entries(job.data || {}).filter(
    ([k, v]) => String(v ?? '').trim() !== '' && !shownKeys.has(k),
  )

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Job details">
        <header className="drawer__header">
          <div className="drawer__heading">
            {reference && <p className="eyebrow mono">{reference}</p>}
            <h2 className="drawer__title">{jobAddress(job)}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="drawer__bar">
          <StatusSelect value={job.status} onChange={(value) => onUpdate(job.id, { status: value })} />
        </div>

        {details.length > 0 && (
          <div className="drawer__details">
            {details.map(([label, value, mono]) => (
              <div key={label} className="drawer__detail">
                <dt>{label}</dt>
                <dd className={mono ? 'mono' : undefined}>{value}</dd>
              </div>
            ))}
          </div>
        )}

        <section className="drawer__section">
          <h3 className="drawer__legend">Schedule</h3>
          <div className="drawer__dates">
            <label className="field">
              <span>Start</span>
              <input type="date" value={job.start_date || ''} onChange={(e) => onUpdate(job.id, { start_date: e.target.value || null })} />
            </label>
            <label className="field">
              <span>End</span>
              <input type="date" value={job.end_date || ''} onChange={(e) => onUpdate(job.id, { end_date: e.target.value || null })} />
            </label>
          </div>
        </section>

        <section className="drawer__section">
          <h3 className="drawer__legend">Documents &amp; notes</h3>
          <DocumentsPanel jobId={job.id} jobStatus={job.status} />
        </section>

        {extraFields.length > 0 && (
          <section className="drawer__section">
            <h3 className="drawer__legend">All fields</h3>
            <dl className="drawer__data">
              {extraFields.map(([k, v]) => (
                <div key={k} className="drawer__data-row">
                  <dt>{k}</dt>
                  <dd>{String(v)}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </aside>
    </div>
  )
}
