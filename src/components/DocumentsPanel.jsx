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

// Documents & notes for a single job. A Master folder (all items) plus one
// folder per workflow stage. Into any folder you can upload files, attach links,
// or add notes — a note with an unticked box is an outstanding / missing item.
export default function DocumentsPanel({ jobId, jobStatus }) {
  const { docs, addFile, addLink, addNote, setDone, move, remove } = useDocuments(jobId)
  const [folder, setFolder] = useState(MASTER)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const fileRef = useRef(null)

  const counts = useMemo(() => {
    const map = { [MASTER]: docs.length }
    for (const s of STATUS_VALUES) map[s] = 0
    for (const d of docs) if (map[d.folder] != null) map[d.folder] += 1
    return map
  }, [docs])

  // New items are filed into the selected folder, or the job's current stage
  // when viewing the Master (all) folder.
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

  async function onAddNote(e) {
    e.preventDefault()
    const text = noteText.trim()
    if (!text) return
    await addNote({ text, folder: targetFolder })
    setNoteText('')
    setNoteOpen(false)
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
        <button className="btn btn--sm" onClick={() => fileRef.current?.click()}>⬆ Upload file</button>
        <button className="btn btn--sm" onClick={() => { setLinkOpen((v) => !v); setNoteOpen(false) }}>🔗 Add link</button>
        <button className="btn btn--sm" onClick={() => { setNoteOpen((v) => !v); setLinkOpen(false) }}>✎ Add note</button>
        <span className="docs__target">into <strong>{targetFolder}</strong></span>
      </div>

      {linkOpen && (
        <form className="docs__link-form" onSubmit={onAddLink}>
          <input type="text" placeholder="Label (optional)" value={linkName} onChange={(e) => setLinkName(e.target.value)} />
          <input type="text" placeholder="https://…" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} autoFocus />
          <button className="btn btn--sm btn--primary" type="submit">Add</button>
        </form>
      )}

      {noteOpen && (
        <form className="docs__note-form" onSubmit={onAddNote}>
          <textarea
            placeholder="e.g. Missing EPC certificate — chase customer"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={2}
            autoFocus
          />
          <button className="btn btn--sm btn--primary" type="submit">Add note</button>
        </form>
      )}

      {visible.length === 0 ? (
        <p className="docs__empty">
          {folder === MASTER ? 'Nothing added yet.' : `Nothing in ${folder} yet.`}
        </p>
      ) : (
        <ul className="docs__list">
          {visible.map((doc) => (
            <li key={doc.id} className={`docs__item${doc.kind === 'note' ? ' docs__item--note' : ''}`}>
              {doc.kind === 'note' ? (
                <input
                  type="checkbox"
                  className="docs__check"
                  checked={!!doc.done}
                  onChange={(e) => setDone(doc.id, e.target.checked)}
                  title={doc.done ? 'Mark outstanding' : 'Mark done'}
                />
              ) : (
                <span className="docs__icon" aria-hidden>{doc.kind === 'link' ? '🔗' : '📄'}</span>
              )}

              <div className="docs__meta">
                {doc.kind === 'note' ? (
                  <span className={`docs__note-text${doc.done ? ' is-done' : ''}`}>{doc.text}</span>
                ) : doc.kind === 'link' ? (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="docs__name">{doc.name}</a>
                ) : (
                  <button className="docs__name docs__name--btn" onClick={() => openFile(doc)}>{doc.name}</button>
                )}
                <span className="docs__sub">
                  {doc.kind === 'note' && <span className="docs__kind">note</span>}
                  {doc.kind === 'file' && doc.size != null && <span>{formatSize(doc.size)}</span>}
                  {folder === MASTER && (
                    <select
                      className="docs__folder-pick"
                      value={doc.folder}
                      onChange={(e) => move(doc.id, e.target.value)}
                      title="Move to folder"
                    >
                      {STATUS_VALUES.map((s) => (<option key={s} value={s}>{s}</option>))}
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
