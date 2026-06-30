import { useMemo, useState } from 'react'
import JobCard from './JobCard'
import { STATUS_VALUES } from '../lib/status'

// The list view: a searchable / status-filterable grid of job cards.
export default function JobList({ jobs, onStatusChange, onOpen }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return jobs.filter((job) => {
      if (statusFilter !== 'All' && job.status !== statusFilter) return false
      if (!q) return true
      const haystack = [job.title, ...Object.values(job.data || {})]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [jobs, query, statusFilter])

  if (!jobs.length) {
    return (
      <div className="empty">
        <p>No jobs yet. Upload a CSV to get started.</p>
      </div>
    )
  }

  return (
    <div className="job-list">
      <div className="job-list__controls">
        <input
          className="search"
          type="search"
          placeholder="Search jobs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="All">All statuses</option>
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="job-list__count">
          {filtered.length} of {jobs.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <p>No jobs match your filters.</p>
        </div>
      ) : (
        <div className="job-grid">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onStatusChange={onStatusChange}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  )
}
