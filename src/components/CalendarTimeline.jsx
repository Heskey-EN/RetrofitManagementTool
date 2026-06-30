import { useMemo } from 'react'
import { statusColor } from '../lib/status'

const DAY_MS = 24 * 60 * 60 * 1000
const DAY_WIDTH = 34 // px per day column

function toDay(iso) {
  if (!iso) return null
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function daysBetween(a, b) {
  return Math.round((b - a) / DAY_MS)
}

// A horizontally-scrolling Gantt-style timeline. Each dated job is a bar from
// its start date to its end date, coloured by status. Lightweight and
// dependency-free — built from plain divs.
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
    // Pad the range by a day each side for breathing room.
    min = new Date(min.getTime() - DAY_MS)
    max = new Date(max.getTime() + DAY_MS)
    const totalDays = daysBetween(min, max) + 1

    const days = Array.from({ length: totalDays }, (_, i) => new Date(min.getTime() + i * DAY_MS))

    // Group days into month spans for the header.
    const months = []
    for (const day of days) {
      const label = day.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
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
      <div className="empty">
        <p>No dated jobs to show. Upload a CSV with a date column to populate the timeline.</p>
      </div>
    )
  }

  const trackWidth = model.totalDays * DAY_WIDTH

  return (
    <div className="timeline">
      <div className="timeline__scroll">
        <div className="timeline__inner" style={{ width: trackWidth + 220 }}>
          {/* Header: months then days */}
          <div className="timeline__header">
            <div className="timeline__label-col timeline__label-col--head">Job</div>
            <div className="timeline__track-head" style={{ width: trackWidth }}>
              <div className="timeline__months">
                {model.months.map((m, i) => (
                  <div key={i} className="timeline__month" style={{ width: m.span * DAY_WIDTH }}>
                    {m.label}
                  </div>
                ))}
              </div>
              <div className="timeline__days">
                {model.days.map((d, i) => {
                  const weekend = d.getDay() === 0 || d.getDay() === 6
                  return (
                    <div
                      key={i}
                      className={`timeline__day${weekend ? ' timeline__day--weekend' : ''}`}
                      style={{ width: DAY_WIDTH }}
                    >
                      {d.getDate()}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="timeline__body">
            {model.todayOffset != null && (
              <div
                className="timeline__today"
                style={{ left: 220 + model.todayOffset * DAY_WIDTH + DAY_WIDTH / 2 }}
                title="Today"
              />
            )}
            {model.dated.map(({ job, start, end }) => {
              const offset = daysBetween(model.min, start)
              const span = Math.max(1, daysBetween(start, end || start) + 1)
              return (
                <div key={job.id} className="timeline__row">
                  <div className="timeline__label-col" title={job.title}>
                    {job.title}
                  </div>
                  <div className="timeline__track" style={{ width: trackWidth }}>
                    <button
                      type="button"
                      className="timeline__bar"
                      style={{
                        left: offset * DAY_WIDTH,
                        width: span * DAY_WIDTH - 4,
                        background: statusColor(job.status),
                      }}
                      onClick={() => onOpen(job)}
                      title={`${job.title} — ${job.status}`}
                    >
                      <span className="timeline__bar-label">{job.title}</span>
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
