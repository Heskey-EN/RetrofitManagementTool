import { useRef, useState, useCallback } from 'react'
import JobCard from './JobCard'

// Presentational grid of job cards with two selection gestures:
//   - shift / ⌘-click on a card (handled in JobCard) for range / toggle
//   - drag a box on empty grid space (marquee) to select intersecting cards
export default function JobList({
  jobs, onStatusChange, onOpen,
  selectedIds, onToggleSelect, onSelectRange, onApplyMarquee, onClearSelection,
}) {
  const gridRef = useRef(null)
  const drag = useRef(null)
  const [rect, setRect] = useState(null)
  const [dragging, setDragging] = useState(false)

  const onPointerDown = useCallback((e) => {
    if (e.button !== 0 || !onApplyMarquee) return
    // Start a marquee only from empty space, never from a card/control.
    if (e.target.closest('.card')) return
    const box = gridRef.current.getBoundingClientRect()
    drag.current = {
      x0: e.clientX, y0: e.clientY,
      additive: e.shiftKey || e.metaKey || e.ctrlKey, moved: false, box,
    }

    const move = (ev) => {
      const d = drag.current
      if (!d) return
      if (!d.moved && Math.hypot(ev.clientX - d.x0, ev.clientY - d.y0) < 5) return
      if (!d.moved) { d.moved = true; setDragging(true) }
      const left = Math.min(d.x0, ev.clientX)
      const right = Math.max(d.x0, ev.clientX)
      const top = Math.min(d.y0, ev.clientY)
      const bottom = Math.max(d.y0, ev.clientY)
      setRect({ left: left - d.box.left, top: top - d.box.top, width: right - left, height: bottom - top })
      const ids = []
      gridRef.current.querySelectorAll('.card').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.left < right && r.right > left && r.top < bottom && r.bottom > top) ids.push(el.dataset.jobId)
      })
      onApplyMarquee(ids, d.additive)
    }

    const up = () => {
      const d = drag.current
      if (d && !d.moved && !d.additive) onClearSelection?.() // plain click on empty = clear
      drag.current = null
      setRect(null)
      setDragging(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }, [onApplyMarquee, onClearSelection])

  if (!jobs.length) {
    return (
      <div className="placeholder">
        <p>No jobs match the current filter.</p>
      </div>
    )
  }

  const selecting = selectedIds && selectedIds.size > 0

  return (
    <div
      ref={gridRef}
      className={`grid${selecting ? ' grid--selecting' : ''}${dragging ? ' is-dragging' : ''}`}
      onPointerDown={onPointerDown}
    >
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onStatusChange={onStatusChange}
          onOpen={onOpen}
          selected={selectedIds ? selectedIds.has(job.id) : false}
          onToggleSelect={onToggleSelect}
          onSelectRange={onSelectRange}
        />
      ))}
      {rect && (
        <div className="marquee" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }} />
      )}
    </div>
  )
}
