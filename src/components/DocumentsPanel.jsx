import { useMemo, useRef, useState } from 'react'
import { useDocuments } from '../hooks/useDocuments'
import { documentsStore } from '../lib/documentsStore'
import { STATUS_VALUES, statusColor } from '../lib/status'

const MASTER = 'Master'

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Documents area for a single job: a Master folder (all documents) plus one
// folder per workflow status. Upload files or attach links into any folder.
export default function DocumentsPanel({ jobId, jobStatus }) {
  const { docs, addFile, addLink, move, remove } = useDocuments(jobId)
  const [folder, setFolder] = useState(MASTER)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const fileRef = useRef(null)

  const counts = useMemo(() => {
    const map = { [MASTER]: docs.length }
    for (const s of STATUS_VALUES) map[s] = 0
    for (const d of docs) if (map[d.folder] != null) map[d.folder] += 1
    return map
  }, [docs])

  // Where new uploads/links are filed: the selected folder, or the job's
  // current status when viewing the Master (all) folder.
  const targetFolder = folder === MASTER ? jobStatus : folder
  const visible = folder === MASTER ? docs : docs.filter((d) => d.folder === folder)

  async function onPickFile(e) {
    const files = Array.from(e.target.files || [])
    for (const file of files) await addFile(file, targetFolder)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function onAddLink(e) {
    e.preventDefault()
    const url = linkUrl.trim()
    if (!url) return
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`
    await addLink({ name: linkName.trim() || normalized, url: normalized, folder: targetFolder })
    setLinkName('')
    setLinkUrl('')
    setLinkOpen(false)
  }

  function openFile(doc) {
    const url = documentsStore.fileUrl(doc)
    if (url) window.open(url, '_blank', 'noopener')
  }

  const folders = [MASTER, ...STATUS_VALUES]

  return (
    <div className="docs">
      <div className="docs__folders" role="tablist">
        {folders.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={folder === f}
            className={`docs__folder${folder === f ? ' docs__folder--active' : ''}`}
            style={f === MASTER ? undefined : { '--status-color': statusColor(f) }}
            onClick={() => setFolder(f)}
          >
            {f !== MASTER && <span className="docs__folder-dot" />}
            {f === MASTER ? 'Master (all)' : f}
            <span className="docs__folder-count">{counts[f] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="docs__add">
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={onPickFile}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,application/pdf"
        />
        <button className="btn btn--sm" onClick={() => fileRef.current?.click()}>
          ⬆ Upload file
        </button>
        <button className="btn btn--sm" onClick={() => setLinkOpen((v) => !v)}>
          🔗 Add link
        </button>
        <span className="docs__target">
          filing into <strong>{targetFolder}</strong>
        </span>
      </div>

      {linkOpen && (
        <form className="docs__link-form" onSubmit={onAddLink}>
          <input
            type="text"
            placeholder="Label (optional)"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
          />
          <input
            type="text"
            placeholder="https://…"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            autoFocus
          />
          <button className="btn btn--sm btn--primary" type="submit">Add</button>
        </form>
      )}

      {visible.length === 0 ? (
        <p className="docs__empty muted">
          {folder === MASTER ? 'No documents yet.' : `Nothing in ${folder} yet.`}
        </p>
      ) : (
        <ul className="docs__list">
          {visible.map((doc) => (
            <li key={doc.id} className="docs__item">
              <span className="docs__icon" aria-hidden>{doc.kind === 'link' ? '🔗' : '📄'}</span>
              <div className="docs__meta">
                {doc.kind === 'link' ? (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="docs__name">
                    {doc.name}
                  </a>
                ) : (
                  <button className="docs__name docs__name--btn" onClick={() => openFile(doc)}>
                    {doc.name}
                  </button>
                )}
                <span className="docs__sub">
                  {doc.kind === 'file' && doc.size != null && `${formatSize(doc.size)} · `}
                  {/* In Master view, show which folder each doc lives in. */}
                  {folder === MASTER && (
                    <select
                      className="docs__folder-pick"
                      value={doc.folder}
                      onChange={(e) => move(doc.id, e.target.value)}
                      title="Move to folder"
                    >
                      {STATUS_VALUES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </span>
              </div>
              <button className="docs__remove" onClick={() => remove(doc.id)} aria-label="Remove">×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
