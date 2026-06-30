import { useEffect } from 'react'
import StatusSelect from './StatusSelect'
import DocumentsPanel from './DocumentsPanel'

// Slide-in panel showing every field from the original CSV row, plus editable
// status and timeline dates. Closes on Escape or backdrop click.
export default function JobDetailDrawer({ job, onClose, onUpdate }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!job) return null

  const fields = Object.entries(job.data || {}).filter(([, v]) => String(v ?? '').trim() !== '')

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Job details">
        <header className="drawer__header">
          <h2 className="drawer__title">{job.title}</h2>
          <button className="drawer__close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="drawer__section">
          <label className="drawer__field-label">Status</label>
          <StatusSelect value={job.status} onChange={(value) => onUpdate(job.id, { status: value })} />
        </div>

        <div className="drawer__section drawer__dates">
          <div>
            <label className="drawer__field-label">Start</label>
            <input
              type="date"
              value={job.start_date || ''}
              onChange={(e) => onUpdate(job.id, { start_date: e.target.value || null })}
            />
          </div>
          <div>
            <label className="drawer__field-label">End</label>
            <input
              type="date"
              value={job.end_date || ''}
              onChange={(e) => onUpdate(job.id, { end_date: e.target.value || null })}
            />
          </div>
        </div>

        <div className="drawer__section">
          <label className="drawer__field-label">Documents</label>
          <DocumentsPanel jobId={job.id} jobStatus={job.status} />
        </div>

        <div className="drawer__section">
          <label className="drawer__field-label">All fields</label>
          <dl className="drawer__data">
            {fields.length === 0 && <p className="muted">No additional fields.</p>}
            {fields.map(([k, v]) => (
              <div key={k} className="drawer__data-row">
                <dt>{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  )
}
