import { useRef, useState } from 'react'
import { parseFile } from '../lib/csv'

const ACCEPT = '.csv,.xlsx,.xls,.xlsm,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'

// Spreadsheet importer (CSV + Excel). Renders either as a compact toolbar button
// or a large drag-and-drop dropzone (the empty state), sharing one parse path.
export default function CsvUpload({ onJobs, onToast, variant = 'compact' }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleFile(file) {
    if (!file) return
    if (!/\.(csv|xlsx|xls|xlsm)$/i.test(file.name)) {
      onToast?.({ type: 'error', text: 'Please choose a CSV or Excel (.xlsx/.xls) file.' })
      return
    }
    setBusy(true)
    try {
      const batchId = `${file.name}-${Date.now()}`
      const { jobs, mapping } = await parseFile(file, { batchId })
      if (!jobs.length) {
        onToast?.({ type: 'error', text: 'No rows found in that CSV.' })
        return
      }
      await onJobs(jobs)
      const note = mapping.startCol ? ` · dates from “${mapping.startCol}”` : ''
      onToast?.({
        type: 'success',
        text: `Imported ${jobs.length} job${jobs.length === 1 ? '' : 's'} from ${file.name}${note}.`,
      })
    } catch (err) {
      onToast?.({ type: 'error', text: `Could not parse CSV: ${err.message || err}` })
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT}
      hidden
      onChange={(e) => handleFile(e.target.files?.[0])}
    />
  )

  if (variant === 'dropzone') {
    return (
      <div
        className={`dropzone${dragging ? ' is-active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]) }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      >
        {input}
        <div className="dropzone__title">{busy ? 'Importing…' : 'Import a spreadsheet'}</div>
        <div className="dropzone__hint">CSV or Excel — drag a file here or click to browse</div>
      </div>
    )
  }

  return (
    <button className="btn" onClick={() => inputRef.current?.click()} disabled={busy}>
      {input}
      <span aria-hidden>⇪</span> {busy ? 'Importing…' : 'Import'}
    </button>
  )
}
