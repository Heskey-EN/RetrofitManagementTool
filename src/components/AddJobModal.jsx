import { useEffect, useState } from 'react'
import { STATUSES, DEFAULT_STATUS } from '../lib/status'

// Modal form for creating a single job by hand (no CSV). Captures the fields the
// team cares about today — name, address, postcode, status and timeline dates —
// and stores address/postcode alongside any other details on the job record.
export default function AddJobModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '',
    address: '',
    postcode: '',
    status: DEFAULT_STATUS,
    start_date: '',
    end_date: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const title = form.title.trim() || form.address.trim() || 'Untitled job'
    setSaving(true)
    const data = {}
    if (form.address.trim()) data.Address = form.address.trim()
    if (form.postcode.trim()) data.Postcode = form.postcode.trim().toUpperCase()
    await onCreate({
      title,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || form.start_date || null,
      data,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Add job">
        <header className="modal__header">
          <h2>Add job</h2>
          <button className="drawer__close" onClick={onClose} aria-label="Close">×</button>
        </header>
        <form onSubmit={submit} className="modal__form">
          <label className="field">
            <span>Job name / reference</span>
            <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. RF-1009 or customer name" autoFocus />
          </label>
          <label className="field">
            <span>Address</span>
            <input type="text" value={form.address} onChange={set('address')} placeholder="Street, town" />
          </label>
          <div className="modal__row">
            <label className="field">
              <span>Postcode</span>
              <input type="text" value={form.postcode} onChange={set('postcode')} placeholder="PR1 2AB" />
            </label>
            <label className="field">
              <span>Status</span>
              <select value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.value}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="modal__row">
            <label className="field">
              <span>Start date</span>
              <input type="date" value={form.start_date} onChange={set('start_date')} />
            </label>
            <label className="field">
              <span>End date</span>
              <input type="date" value={form.end_date} onChange={set('end_date')} />
            </label>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Adding…' : 'Add job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
