import { useMemo, useState } from 'react'
import { groupProjects } from '../lib/projects'
import { STATUSES, statusColor } from '../lib/status'
import { jobAddress, jobReference, jobPostcode } from '../lib/display'

// Jobs grouped into projects by road + postcode. Multi-property projects are
// expanded by default so schemes are immediately visible; single properties
// collapse to keep the list scannable.
export default function ProjectsView({ jobs, onOpen }) {
  const projects = useMemo(() => groupProjects(jobs), [jobs])
  const [overrides, setOverrides] = useState({})

  if (!jobs.length) {
    return <div className="placeholder"><p>No jobs to group yet.</p></div>
  }

  const multi = projects.filter((p) => p.jobs.length > 1).length
  const toggle = (key) => setOverrides((o) => ({ ...o, [key]: !(o[key] ?? false) }))

  return (
    <div className="projects">
      <p className="projects__lead">
        {projects.length} project{projects.length === 1 ? '' : 's'} · {multi} with multiple properties.
        Grouped by road and postcode.
      </p>
      <div className="projects__list">
        {projects.map((p) => {
          const many = p.jobs.length > 1
          const open = overrides[p.key] ?? many
          return (
            <div className={`project${many ? ' project--multi' : ''}`} key={p.key}>
              <button className="project__head" onClick={() => toggle(p.key)} aria-expanded={open}>
                <span className={`project__chevron${open ? ' is-open' : ''}`} aria-hidden>›</span>
                <span className="project__title">
                  <span className="project__road">{p.road}</span>
                  {p.outward && <span className="project__pc mono">{p.outward}</span>}
                </span>
                <span className="project__meta">
                  <span className="project__count mono">{p.jobs.length}</span>
                  <span>propert{p.jobs.length === 1 ? 'y' : 'ies'}</span>
                </span>
                <span className="project__stages">
                  {STATUSES.filter((s) => p.counts[s.value] > 0).map((s) => (
                    <span key={s.value} className="project__stage" style={{ '--status-color': s.color }} title={s.value}>
                      <span className="project__stage-dot" />{p.counts[s.value]}
                    </span>
                  ))}
                </span>
              </button>

              {open && (
                <ul className="project__jobs">
                  {p.jobs.map((job) => {
                    const ref = jobReference(job)
                    return (
                      <li
                        key={job.id}
                        className="project__job"
                        style={{ '--status-color': statusColor(job.status) }}
                        onClick={() => onOpen(job)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onOpen(job)}
                      >
                        <span className="project__job-rail" />
                        <span className="project__job-addr">{jobAddress(job)}</span>
                        {ref && <span className="project__job-ref mono">{ref}</span>}
                        <span className="project__job-pc mono">{jobPostcode(job)}</span>
                        <span className="project__job-stage">{job.status}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
