import { useEffect, useMemo, useState } from 'react'
import { useDocuments } from '../hooks/useDocuments'
import { jobAddress } from '../lib/display'
import { statusColor } from '../lib/status'

// Guards advancing a job to a later stage. First asks whether the relevant
// documents for the current stage are uploaded; if not, asks the user to
// confirm they really want to continue without them.
export default function StageMoveDialog({ job, toStatus, onConfirm, onCancel }) {
  const [step, setStep] = useState('ask')
  const { docs } = useDocuments(job.id)
  const fromStatus = job.status

  const fileCount = useMemo(
    () => docs.filter((d) => (d.kind === 'file' || d.kind === 'link') && d.folder === fromStatus).length,
    [docs, fromStatus],
  )

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal modal--sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Move job stage">
        <div className="confirm">
          <div className="confirm__stages">
            <span className="confirm__stage" style={{ '--status-color': statusColor(fromStatus) }}>{fromStatus}</span>
            <span className="confirm__arrow" aria-hidden>→</span>
            <span className="confirm__stage" style={{ '--status-color': statusColor(toStatus) }}>{toStatus}</span>
          </div>

          {step === 'ask' ? (
            <>
              <h2 className="confirm__title">Have all the relevant documents been uploaded?</h2>
              <p className="confirm__text">
                Before moving <strong>{jobAddress(job)}</strong> to <strong>{toStatus}</strong>, confirm the
                documents for the <strong>{fromStatus}</strong> stage are in place.
              </p>
              <p className="confirm__meta">
                {fileCount === 0
                  ? `No files in ${fromStatus} yet.`
                  : `${fileCount} file${fileCount === 1 ? '' : 's'} in ${fromStatus}.`}
              </p>
              <div className="confirm__actions">
                <button className="btn" onClick={() => setStep('confirm')}>No, not yet</button>
                <button className="btn btn--primary" onClick={onConfirm}>Yes, move to {toStatus}</button>
              </div>
            </>
          ) : (
            <>
              <h2 className="confirm__title">Continue without the documents?</h2>
              <p className="confirm__text">
                Are you sure you want to move <strong>{jobAddress(job)}</strong> to <strong>{toStatus}</strong> without
                the relevant documents uploaded?
              </p>
              <div className="confirm__actions">
                <button className="btn" onClick={() => setStep('ask')}>Go back</button>
                <button className="btn btn--danger" onClick={onConfirm}>Continue anyway</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
