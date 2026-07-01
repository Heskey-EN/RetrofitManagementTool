import { useMemo, useState, useCallback, useEffect } from 'react'
import { useJobs } from './hooks/useJobs'
import { storeMode } from './lib/jobsStore'
import { statusIndex, statusLabel } from './lib/status'
import { jobReference, jobPostcode, jobCustomer, jobMeasure } from './lib/display'
import Pipeline from './components/Pipeline'
import CsvUpload from './components/CsvUpload'
import JobList from './components/JobList'
import ProjectsView from './components/ProjectsView'
import CalendarTimeline from './components/CalendarTimeline'
import JobView from './components/JobView'
import AddJobModal from './components/AddJobModal'
import StageMoveDialog from './components/StageMoveDialog'
import BulkActionsBar from './components/BulkActionsBar'
import TemplatesPage from './components/TemplatesPage'

export default function App() {
  const { jobs, loading, error, addJobs, updateJob, clearAll } = useJobs()
  const [view, setView] = useState('list')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [activeJob, setActiveJob] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [stageMove, setStageMove] = useState(null)
  const [scope, setScope] = useState('active')
  const [selectedTags, setSelectedTags] = useState([])
  const [selected, setSelected] = useState(() => new Set())
  const [anchorId, setAnchorId] = useState(null)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const pushToast = useCallback((t) => {
    setToast(t)
    window.clearTimeout(pushToast._t)
    pushToast._t = window.setTimeout(() => setToast(null), 4500)
  }, [])

  const activeJobs = useMemo(() => jobs.filter((j) => !j.archived), [jobs])
  const archivedCount = jobs.length - activeJobs.length

  const allTags = useMemo(() => {
    const set = new Set()
    for (const j of jobs) for (const t of j.tags || []) set.add(t)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [jobs])

  const filtered = useMemo(() => {
    const base = scope === 'archived' ? jobs.filter((j) => j.archived) : activeJobs
    const q = query.trim().toLowerCase()
    return base.filter((job) => {
      if (statusFilter && job.status !== statusFilter) return false
      if (selectedTags.length && !selectedTags.some((t) => (job.tags || []).includes(t))) return false
      if (!q) return true
      const haystack = [
        job.title, jobReference(job), jobPostcode(job), jobCustomer(job), jobMeasure(job),
        ...(job.tags || []), ...Object.values(job.data || {}),
      ].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [jobs, activeJobs, scope, query, statusFilter, selectedTags])

  const toggleTag = (t) => setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

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

  const archiveJob = useCallback((job) => {
    updateJob(job.id, { archived: !job.archived })
    setActiveJob(null)
    pushToast({ type: 'success', text: job.archived ? 'Job restored to active.' : 'Job archived.' })
  }, [updateJob, pushToast])

  // ---- Multi-select (Jobs list) ----
  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setAnchorId(id)
  }, [])

  // Shift-click: select every job between the anchor and this one, in view order.
  const selectRange = useCallback((id) => {
    setSelected((prev) => {
      const ids = filtered.map((j) => j.id)
      const anchor = anchorId ?? id
      const i1 = ids.indexOf(anchor)
      const i2 = ids.indexOf(id)
      const next = new Set(prev)
      if (i1 === -1 || i2 === -1) { next.add(id); return next }
      const [lo, hi] = i1 < i2 ? [i1, i2] : [i2, i1]
      for (let k = lo; k <= hi; k++) next.add(ids[k])
      return next
    })
    if (anchorId == null) setAnchorId(id)
  }, [filtered, anchorId])

  // Drag-box: replace (or, with a modifier, add to) the selection.
  const applyMarquee = useCallback((ids, additive) => {
    setSelected((prev) => {
      if (additive) { const next = new Set(prev); ids.forEach((id) => next.add(id)); return next }
      return new Set(ids)
    })
  }, [])

  const clearSelection = useCallback(() => { setSelected(new Set()); setAnchorId(null) }, [])

  const allVisibleSelected = filtered.length > 0 && filtered.every((j) => selected.has(j.id))
  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (filtered.every((j) => next.has(j.id))) filtered.forEach((j) => next.delete(j.id))
      else filtered.forEach((j) => next.add(j.id))
      return next
    })
  }

  const bulkSetStatus = useCallback((status) => {
    const n = selected.size
    for (const id of selected) updateJob(id, { status })
    pushToast({ type: 'success', text: `Moved ${n} job${n === 1 ? '' : 's'} to ${statusLabel(status)}.` })
  }, [selected, updateJob, pushToast])

  const bulkAddTag = useCallback((tag) => {
    const t = tag.trim()
    if (!t) return
    const n = selected.size
    for (const id of selected) {
      const job = jobs.find((j) => j.id === id)
      if (!job) continue
      const tags = job.tags || []
      if (!tags.some((x) => x.toLowerCase() === t.toLowerCase())) updateJob(id, { tags: [...tags, t] })
    }
    pushToast({ type: 'success', text: `Tagged ${n} job${n === 1 ? '' : 's'} “${t}”.` })
  }, [selected, jobs, updateJob, pushToast])

  const bulkArchive = useCallback(() => {
    const n = selected.size
    for (const id of selected) updateJob(id, { archived: true })
    setSelected(new Set())
    pushToast({ type: 'success', text: `Archived ${n} job${n === 1 ? '' : 's'}.` })
  }, [selected, updateJob, pushToast])

  // Selection only applies to the Jobs list; drop it when the view or scope changes.
  useEffect(() => { setSelected(new Set()); setAnchorId(null) }, [view, scope])

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
        <a className="topbar__title" href="#/" title="Back to home">Retrofit Project Management Tool</a>
        <div className="topbar__actions">
          <span className={`mode-chip mode-chip--${storeMode}`} title={storeMode === 'supabase' ? 'Live multi-user sync' : 'Stored locally in this browser'}>
            <span className="mode-chip__dot" />
            {storeMode === 'supabase' ? 'Live sync' : 'Local'}
          </span>
          <button className="btn" onClick={() => setTemplatesOpen(true)}>Templates</button>
          <CsvUpload variant="compact" onJobs={addJobs} onToast={pushToast} />
          <button className="btn btn--primary" onClick={() => setAddOpen(true)}>
            <span aria-hidden>＋</span> Add job
          </button>
        </div>
      </header>

      {error && <div className="alert" role="alert">Something went wrong: {error}</div>}

      <main className="shell">
        {jobs.length > 0 && (
          <Pipeline jobs={activeJobs} activeStatus={statusFilter} onSelect={setStatusFilter} />
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
                {view === 'list' && filtered.length > 0 && (
                  <label className="selectall" title="Select all shown">
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} />
                    All
                  </label>
                )}
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
                  {filtered.length}<span className="board__count-of"> / {scope === 'archived' ? archivedCount : activeJobs.length}</span>
                </span>
                {(archivedCount > 0 || scope === 'archived') && (
                  <button
                    className={`btn btn--sm${scope === 'archived' ? ' btn--primary' : ' btn--ghost'}`}
                    onClick={() => setScope(scope === 'archived' ? 'active' : 'archived')}
                  >
                    {scope === 'archived' ? 'Active jobs' : `Archived${archivedCount ? ` (${archivedCount})` : ''}`}
                  </button>
                )}
                <button className="btn btn--ghost btn--sm" onClick={handleClear}>Clear all</button>
              </div>
            </div>

            {(statusFilter || allTags.length > 0) && (
              <div className="filters">
                {statusFilter && (
                  <span className="filter-note">
                    Stage: <strong>{statusLabel(statusFilter)}</strong>
                    <button className="filter-note__clear" onClick={() => setStatusFilter(null)}>clear</button>
                  </span>
                )}
                {allTags.length > 0 && (
                  <div className="filters__tags">
                    <span className="filters__label">Tags</span>
                    {allTags.map((t) => (
                      <button
                        key={t}
                        className={`tag tag--toggle${selectedTags.includes(t) ? ' is-on' : ''}`}
                        onClick={() => toggleTag(t)}
                      >{t}</button>
                    ))}
                    {selectedTags.length > 0 && (
                      <button className="filter-note__clear" onClick={() => setSelectedTags([])}>clear</button>
                    )}
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="placeholder">Loading jobs…</div>
            ) : view === 'list' ? (
              <JobList
                jobs={filtered}
                onStatusChange={requestStatusChange}
                onOpen={setActiveJob}
                selectedIds={selected}
                onToggleSelect={toggleSelect}
                onSelectRange={selectRange}
                onApplyMarquee={applyMarquee}
                onClearSelection={clearSelection}
              />
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
          onArchive={archiveJob}
          onManageTemplates={() => setTemplatesOpen(true)}
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

      {view === 'list' && selected.size > 0 && (
        <BulkActionsBar
          count={selected.size}
          onSetStatus={bulkSetStatus}
          onAddTag={bulkAddTag}
          onArchive={bulkArchive}
          onClear={clearSelection}
        />
      )}

      {templatesOpen && <TemplatesPage onClose={() => setTemplatesOpen(false)} />}

      {toast && (
        <div className={`toast toast--${toast.type}`} role="status">{toast.text}</div>
      )}
    </div>
  )
}
