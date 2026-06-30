import { useRef, useState } from 'react'
import { parseCsv } from '../lib/csv'

// Drag-and-drop / click-to-browse CSV uploader. Parses the file in the browser
// and hands normalised job objects up to the parent for persistence.
export default function CsvUpload({ onJobs }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleFile(file) {
    if (!file) return
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      setMessage({ type: 'error', text: 'Please choose a .csv file.' })
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      const batchId = `${file.name}-${Date.now()}`
      const { jobs, mapping } = await parseCsv(file, { batchId })
      if (!jobs.length) {
        setMessage({ type: 'error', text: 'No rows found in that CSV.' })
        return
      }
      await onJobs(jobs)
      const dateNote = mapping.startCol
        ? ` Timeline dates read from "${mapping.startCol}"${mapping.endCol ? ` → "${mapping.endCol}"` : ''}.`
        : ' No date column detected — these jobs won\'t appear on the timeline yet.'
      setMessage({
        type: 'success',
        text: `Imported ${jobs.length} job${jobs.length === 1 ? '' : 's'} from ${file.name}.${dateNote}`,
      })
    } catch (err) {
      setMessage({ type: 'error', text: `Could not parse CSV: ${err.message || err}` })
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="uploader">
      <div
        className={`dropzone${dragging ? ' dropzone--active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="dropzone__icon" aria-hidden>＋</div>
        <div className="dropzone__title">
          {busy ? 'Importing…' : 'Upload a CSV of jobs'}
        </div>
        <div className="dropzone__hint">Drag a file here or click to browse</div>
      </div>
      {message && (
        <div className={`upload-msg upload-msg--${message.type}`} role="status">
          {message.text}
        </div>
      )}
    </div>
  )
}
