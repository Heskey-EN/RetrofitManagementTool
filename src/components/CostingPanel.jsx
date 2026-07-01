import { useEffect, useMemo, useRef, useState } from 'react'

// Per-job costing (used at the Coordination / Design stage). Line items with
// costs auto-total; a projected revenue figure gives the profit and margin.
// Edits are debounced and saved back onto the job.

const money = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 })
const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}
const uid = () => Math.random().toString(36).slice(2, 9)

export default function CostingPanel({ costing, onSave }) {
  const [items, setItems] = useState(() =>
    costing?.items?.length ? costing.items : [{ id: uid(), description: '', cost: '' }],
  )
  const [revenue, setRevenue] = useState(() => costing?.revenue ?? '')

  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const t = setTimeout(() => onSaveRef.current({ items, revenue }), 500)
    return () => clearTimeout(t)
  }, [items, revenue])

  const total = useMemo(() => items.reduce((s, it) => s + num(it.cost), 0), [items])
  const rev = num(revenue)
  const profit = rev - total
  const margin = rev > 0 ? (profit / rev) * 100 : null

  const setItem = (id, patch) => setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  const addItem = () => setItems((list) => [...list, { id: uid(), description: '', cost: '' }])
  const removeItem = (id) => setItems((list) => (list.length > 1 ? list.filter((it) => it.id !== id) : list))

  return (
    <div className="costing">
      <div className="costing__items">
        <div className="costing__row costing__row--head">
          <span>Item</span>
          <span>Cost</span>
          <span aria-hidden />
        </div>
        {items.map((it) => (
          <div className="costing__row" key={it.id}>
            <input
              className="costing__desc"
              placeholder="e.g. Cavity wall insulation — labour & materials"
              value={it.description}
              onChange={(e) => setItem(it.id, { description: e.target.value })}
            />
            <div className="costing__cost">
              <span className="costing__gbp">£</span>
              <input
                type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00"
                value={it.cost}
                onChange={(e) => setItem(it.id, { cost: e.target.value })}
              />
            </div>
            <button
              className="costing__remove" onClick={() => removeItem(it.id)}
              aria-label="Remove item" disabled={items.length <= 1}
            >×</button>
          </div>
        ))}
        <button className="btn btn--sm costing__add" onClick={addItem}>＋ Add item</button>
      </div>

      <dl className="costing__totals">
        <div className="costing__total-row">
          <dt>Total costs</dt>
          <dd className="mono">{money(total)}</dd>
        </div>
        <div className="costing__total-row">
          <dt>Projected revenue</dt>
          <dd>
            <div className="costing__cost costing__cost--rev">
              <span className="costing__gbp">£</span>
              <input
                type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
              />
            </div>
          </dd>
        </div>
        <div className={`costing__total-row costing__profit ${profit >= 0 ? 'is-pos' : 'is-neg'}`}>
          <dt>
            Profit
            {margin != null && <span className="costing__margin">{margin.toFixed(1)}% margin</span>}
          </dt>
          <dd className="mono">{money(profit)}</dd>
        </div>
      </dl>
    </div>
  )
}
