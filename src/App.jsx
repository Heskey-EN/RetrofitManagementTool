import { useMemo, useState } from 'react'
import { useJobs } from './hooks/useJobs'
import { storeMode } from './lib/jobsStore'
import { STATUSES } from './lib/status'
import ConnectionBanner from './components/ConnectionBanner'
import CsvUpload from './components/CsvUpload'
import JobList from './components/JobList'
import CalendarTimeline from './components/CalendarTimeline'
import JobDetailDrawer from './components/JobDetailDrawer'
import AddJobModal from './components/AddJobModal'

export default function App() {
  const { jobs, loading, error, addJobs, updateJob, clearAll } = useJobs()
  const [view, setView] = useState('list')
  const [activeJob, setActiveJob] = useState(null)
  const [addOpen, setAddOpen] = useState(false)

  // Keep the open drawer in sync with realtime updates to the underlying job.
  const drawerJob = useMemo(
    () => (activeJob ? jobs.find((j) => j.id === activeJob.id) || activeJob : null),
    [activeJob, jobs],
  )

  const counts = useMemo(() => {
    const map = Object.fromEntries(STATUSES.map((s) => [s.value, 0]))
    for (const job of jobs) if (map[job.status] != null) map[job.status] += 1
    return map
  }, [jobs])

  async function handleClear() {
    if (window.confirm('Remove all jobs? This affects everyone connected.')) {
      await clearAll()
      setActiveJob(null)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <h1>Retrofit Job Management</h1>
          <span className={`app__mode app__mode--${storeMode}`}>
            {storeMode === 'supabase' ? '● Live sync' : '● Local mode'}
          </span>
        </div>
        <div className="app__stats">
          {STATUSES.map((s) => (
            <span key={s.value} className="stat" style={{ '--status-color': s.color }}>
              <span className="stat__dot" />
              {counts[s.value]} {s.value}
            </span>
          ))}
        </div>
      </header>

      <ConnectionBanner />
      {error && <div className="banner banner--error" role="alert">Error: {error}</div>}

      <main className="app__main">
        <CsvUpload onJobs={addJobs} />

        <div className="toolbar">
          <div className="tabs" role="tablist">
            <button
              role="tab"
              aria-selected={view === 'list'}
              className={`tab${view === 'list' ? ' tab--active' : ''}`}
              onClick={() => setView('list')}
            >
              List
            </button>
            <button
              role="tab"
              aria-selected={view === 'calendar'}
              className={`tab${view === 'calendar' ? ' tab--active' : ''}`}
              onClick={() => setView('calendar')}
            >
              Calendar
            </button>
          </div>
          <div className="toolbar__right">
            <button className="btn btn--primary" onClick={() => setAddOpen(true)}>
              + Add job
            </button>
            {jobs.length > 0 && (
              <button className="btn btn--ghost" onClick={handleClear}>
                Clear all
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="empty"><p>Loading jobs…</p></div>
        ) : view === 'list' ? (
          <JobList jobs={jobs} onStatusChange={updateJob} onOpen={setActiveJob} />
        ) : (
          <CalendarTimeline jobs={jobs} onOpen={setActiveJob} />
        )}
      </main>

      <JobDetailDrawer job={drawerJob} onClose={() => setActiveJob(null)} onUpdate={updateJob} />

      {addOpen && (
        <AddJobModal
          onClose={() => setAddOpen(false)}
          onCreate={async (job) => {
            const created = await addJobs([job])
            if (created && created[0]) setActiveJob(created[0])
          }}
        />
      )}
    </div>
  )
}
