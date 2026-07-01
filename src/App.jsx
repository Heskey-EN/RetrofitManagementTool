import { useMemo, useState, useCallback } from 'react'
import { useJobs } from './hooks/useJobs'
import { storeMode } from './lib/jobsStore'
import { statusIndex } from './lib/status'
import { jobReference, jobPostcode, jobCustomer, jobMeasure } from './lib/display'
import Pipeline from './components/Pipeline'
import CsvUpload from './components/CsvUpload'
import JobList from './components/JobList'
import ProjectsView from './components/ProjectsView'
import CalendarTimeline from './components/CalendarTimeline'
import JobView from './components/JobView'
import AddJobModal from './components/AddJobModal'
import StageMoveDialog from './components/StageMoveDialog'

export default function App() {
  const { jobs, loading, error, addJobs, updateJob, clearAll } = useJobs()
  const [view, setView] = useState('list')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [activeJob, setActiveJob] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [stageMove, setStageMove] = useState(null)
  const [toast, setToast] = useState(null)

  const pushToast = useCallback((t) => {
    setToast(t)
    window.clearTimeout(pushToast._t)
    pushToast._t = window.setTimeout(() => setToast(null), 4500)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return jobs.filter((job) => {
      if (statusFilter && job.status !== statusFilter) return false
      if (!q) return true
      const haystack = [
        job.title, jobReference(job), jobPostcode(job), jobCustomer(job), jobMeasure(job),
        ...Object.values(job.data || {}),
      ].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [jobs, query, statusFilter])

  const openJob = useMemo(
    () => (activeJob ? jobs.find((j) => j.id === activeJob.id) || activeJob : null),
    [activeJob, jobs],
  )

  // Advancing a job to a later stage requires confirming documents are in place.
  // Moving backward (or to the same stage) applies immediately.
  const requestStatusChange = useCallback((job, newStatus) => {
    if (!job || newStatus === job.status) return
    if (statusIndex(newStatus) > statusIndex(job.status)) {
      setStageMove({ job, toStatus: newStatus })
    } else {
      updateJob(job.id, { status: newStatus })
    }
  }, [updateJob])

  async function handleClear() {
    if (window.confirm('Remove all jobs and their documents? This cannot be undone.')) {
      await clearAll()
      setActiveJob(null)
      setStatusFilter(null)
    }
  }

  const showEmptyHero = !loading && jobs.length === 0

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__title">Retrofit Project Management Tool</div>
        <div className="topbar__actions">
          <span className={`mode-chip mode-chip--${storeMode}`} title={storeMode === 'supabase' ? 'Live multi-user sync' : 'Stored locally in this browser'}>
            <span className="mode-chip__dot" />
            {storeMode === 'supabase' ? 'Live sync' : 'Local'}
          </span>
          <CsvUpload variant="compact" onJobs={addJobs} onToast={pushToast} />
          <button className="btn btn--primary" onClick={() => setAddOpen(true)}>
            <span aria-hidden>＋</span> Add job
          </button>
        </div>
      </header>

      {error && <div className="alert" role="alert">Something went wrong: {error}</div>}

      <main className="shell">
        {jobs.length > 0 && (
          <Pipeline jobs={jobs} activeStatus={statusFilter} onSelect={setStatusFilter} />
        )}

        {showEmptyHero ? (
          <section className="empty-hero">
            <div className="empty-hero__inner">
              <p className="eyebrow">Get started</p>
              <h1 className="empty-hero__title">Start tracking retrofit jobs</h1>
              <p className="empty-hero__lead">
                Add a property by hand, or import a spreadsheet (CSV or Excel) to load a whole
                batch. Each job moves through booking, assessment, coordination, compiling
                documents and submission — with its own notes and files along the way.
              </p>
              <div className="empty-hero__actions">
                <button className="btn btn--primary btn--lg" onClick={() => setAddOpen(true)}>
                  ＋ Add a property
                </button>
                <CsvUpload variant="dropzone" onJobs={addJobs} onToast={pushToast} />
              </div>
            </div>
          </section>
        ) : (
          <section className="board">
            <div className="board__toolbar">
              <div className="segmented" role="tablist" aria-label="View">
                <button
                  role="tab" aria-selected={view === 'list'}
                  className={`segmented__btn${view === 'list' ? ' is-active' : ''}`}
                  onClick={() => setView('list')}
                >Jobs</button>
                <button
                  role="tab" aria-selected={view === 'projects'}
                  className={`segmented__btn${view === 'projects' ? ' is-active' : ''}`}
                  onClick={() => setView('projects')}
                >Projects</button>
                <button
                  role="tab" aria-selected={view === 'calendar'}
                  className={`segmented__btn${view === 'calendar' ? ' is-active' : ''}`}
                  onClick={() => setView('calendar')}
                >Calendar</button>
              </div>

              <div className="board__right">
                {view !== 'calendar' && (
                  <div className="search">
                    <span className="search__icon" aria-hidden>⌕</span>
                    <input
                      type="search"
                      placeholder="Search address, postcode, reference…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                )}
                <span className="board__count">
                  {filtered.length}<span className="board__count-of"> / {jobs.length}</span>
                </span>
                <button className="btn btn--ghost btn--sm" onClick={handleClear}>Clear all</button>
              </div>
            </div>

            {statusFilter && (
              <div className="filter-note">
                Showing <strong>{statusFilter}</strong>
                <button className="filter-note__clear" onClick={() => setStatusFilter(null)}>clear</button>
              </div>
            )}

            {loading ? (
              <div className="placeholder">Loading jobs…</div>
            ) : view === 'list' ? (
              <JobList jobs={filtered} onStatusChange={requestStatusChange} onOpen={setActiveJob} />
            ) : view === 'projects' ? (
              <ProjectsView jobs={filtered} onOpen={setActiveJob} />
            ) : (
              <CalendarTimeline jobs={filtered} onOpen={setActiveJob} />
            )}
          </section>
        )}
      </main>

      {openJob && (
        <JobView
          job={openJob}
          onClose={() => setActiveJob(null)}
          onUpdate={updateJob}
          onStatusChange={requestStatusChange}
        />
      )}

      {addOpen && (
        <AddJobModal
          onClose={() => setAddOpen(false)}
          onCreate={async (job) => {
            const created = await addJobs([job])
            if (created && created[0]) setActiveJob(created[0])
          }}
        />
      )}

      {stageMove && (
        <StageMoveDialog
          job={stageMove.job}
          toStatus={stageMove.toStatus}
          onCancel={() => setStageMove(null)}
          onConfirm={() => {
            updateJob(stageMove.job.id, { status: stageMove.toStatus })
            setStageMove(null)
          }}
        />
      )}

      {toast && (
        <div className={`toast toast--${toast.type}`} role="status">{toast.text}</div>
      )}
    </div>
  )
}
