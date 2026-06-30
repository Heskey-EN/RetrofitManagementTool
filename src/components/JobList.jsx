import JobCard from './JobCard'

// Presentational grid of job cards. Filtering and search happen in App so the
// pipeline and search box can drive both the list and the calendar.
export default function JobList({ jobs, onStatusChange, onOpen }) {
  if (!jobs.length) {
    return (
      <div className="placeholder">
        <p>No jobs match the current filter.</p>
      </div>
    )
  }

  return (
    <div className="grid">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onStatusChange={onStatusChange} onOpen={onOpen} />
      ))}
    </div>
  )
}
