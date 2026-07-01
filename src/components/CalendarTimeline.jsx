import { useMemo } from 'react'
import { statusColor, statusLabel } from '../lib/status'
import { jobAddress, jobReference } from '../lib/display'

const DAY_MS = 24 * 60 * 60 * 1000
const DAY_WIDTH = 36
const LABEL_W = 240

function toDay(iso) {
  if (!iso) return null
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

const daysBetween = (a, b) => Math.round((b - a) / DAY_MS)

// A horizontally-scrolling Gantt-style timeline. Each dated job is a bar from
// its start to its end date, coloured by stage. Dependency-free, built from divs.
export default function CalendarTimeline({ jobs, onOpen }) {
  const model = useMemo(() => {
    const dated = jobs
      .map((job) => ({ job, start: toDay(job.start_date), end: toDay(job.end_date || job.start_date) }))
      .filter((d) => d.start)
      .sort((a, b) => a.start - b.start)
    if (!dated.length) return null

    let min = dated[0].start
    let max = dated[0].end || dated[0].start
    for (const d of dated) {
      if (d.start < min) min = d.start
      const e = d.end || d.start
      if (e > max) max = e
    }
    min = new Date(min.getTime() - DAY_MS)
    max = new Date(max.getTime() + DAY_MS)
    const totalDays = daysBetween(min, max) + 1
    const days = Array.from({ length: totalDays }, (_, i) => new Date(min.getTime() + i * DAY_MS))

    const months = []
    for (const day of days) {
      const label = day.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      const last = months[months.length - 1]
      if (last && last.label === label) last.span += 1
      else months.push({ label, span: 1 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOffset = today >= min && today <= max ? daysBetween(min, today) : null

    return { dated, min, totalDays, days, months, todayOffset }
  }, [jobs])

  if (!model) {
    return (
      <div className="placeholder">
        <p>No dated jobs to show. Add start dates to see them on the timeline.</p>
      </div>
    )
  }

  const trackWidth = model.totalDays * DAY_WIDTH

  return (
    <div className="timeline">
      <div className="timeline__scroll">
        <div className="timeline__inner" style={{ width: trackWidth + LABEL_W }}>
          <div className="timeline__header">
            <div className="timeline__label-col timeline__label-col--head">Property</div>
            <div className="timeline__track-head" style={{ width: trackWidth }}>
              <div className="timeline__months">
                {model.months.map((m, i) => (
                  <div key={i} className="timeline__month" style={{ width: m.span * DAY_WIDTH }}>{m.label}</div>
                ))}
              </div>
              <div className="timeline__days">
                {model.days.map((d, i) => {
                  const weekend = d.getDay() === 0 || d.getDay() === 6
                  return (
                    <div key={i} className={`timeline__day mono${weekend ? ' is-weekend' : ''}`} style={{ width: DAY_WIDTH }}>
                      {d.getDate()}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="timeline__body">
            {model.todayOffset != null && (
              <div className="timeline__today" style={{ left: LABEL_W + model.todayOffset * DAY_WIDTH + DAY_WIDTH / 2 }} title="Today" />
            )}
            {model.dated.map(({ job, start, end }) => {
              const offset = daysBetween(model.min, start)
              const span = Math.max(1, daysBetween(start, end || start) + 1)
              const ref = jobReference(job)
              const address = jobAddress(job)
              return (
                <div key={job.id} className="timeline__row">
                  <div className="timeline__label-col">
                    <span className="timeline__label-title" title={address}>{address}</span>
                    {ref && <span className="timeline__label-ref mono">{ref}</span>}
                  </div>
                  <div className="timeline__track" style={{ width: trackWidth }}>
                    <button
                      type="button"
                      className="timeline__bar"
                      style={{ left: offset * DAY_WIDTH, width: span * DAY_WIDTH - 5, background: statusColor(job.status) }}
                      onClick={() => onOpen(job)}
                      title={`${address} — ${statusLabel(job.status)}`}
                    >
                      <span className="timeline__bar-label">{address}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
