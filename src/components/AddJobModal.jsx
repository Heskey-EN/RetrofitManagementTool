import { useEffect, useState } from 'react'
import { STATUSES, DEFAULT_STATUS } from '../lib/status'

// Modal form for creating a single job by hand. The property address is the
// job's identity (its headline everywhere in the app), so it leads the form.
export default function AddJobModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    address: '',
    postcode: '',
    reference: '',
    customer: '',
    measure: '',
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
    const address = form.address.trim()
    const reference = form.reference.trim()
    const title = address || reference || 'Untitled job'
    setSaving(true)
    const data = {}
    if (reference) data.Reference = reference
    if (address) data.Address = address
    const postcode = form.postcode.trim().toUpperCase()
    if (postcode) data.Postcode = postcode
    if (form.customer.trim()) data.Customer = form.customer.trim()
    if (form.measure.trim()) data.Measure = form.measure.trim()
    await onCreate({
      title,
      reference,
      postcode,
      customer: form.customer.trim(),
      measure: form.measure.trim(),
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
          <div>
            <p className="eyebrow">New job</p>
            <h2 className="modal__title">Add a property</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </header>
        <form onSubmit={submit} className="modal__form">
          <label className="field field--full">
            <span>Property address</span>
            <input type="text" value={form.address} onChange={set('address')} placeholder="e.g. 27 Larch Close, Preston" autoFocus />
          </label>
          <div className="modal__row">
            <label className="field">
              <span>Postcode</span>
              <input type="text" className="mono" value={form.postcode} onChange={set('postcode')} placeholder="PR2 8HJ" />
            </label>
            <label className="field">
              <span>Reference</span>
              <input type="text" className="mono" value={form.reference} onChange={set('reference')} placeholder="RF-3001" />
            </label>
          </div>
          <div className="modal__row">
            <label className="field">
              <span>Customer</span>
              <input type="text" value={form.customer} onChange={set('customer')} placeholder="Optional" />
            </label>
            <label className="field">
              <span>Measure</span>
              <input type="text" value={form.measure} onChange={set('measure')} placeholder="e.g. Cavity Wall Insulation" />
            </label>
          </div>
          <div className="modal__row">
            <label className="field">
              <span>Stage</span>
              <select value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.value}</option>
                ))}
              </select>
            </label>
            <div className="modal__row modal__row--tight">
              <label className="field">
                <span>Start</span>
                <input type="date" value={form.start_date} onChange={set('start_date')} />
              </label>
              <label className="field">
                <span>End</span>
                <input type="date" value={form.end_date} onChange={set('end_date')} />
              </label>
            </div>
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
