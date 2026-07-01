import { STATUSES } from '../lib/status'

const FEATURES = [
  { title: 'Import from anywhere', body: 'Drop in a CSV or Excel spreadsheet of properties, or add jobs by hand. It finds the address, postcode and dates for you.' },
  { title: 'A real retrofit workflow', body: 'Every job moves through Booking, Assessment, Coordination / Design, Compiling documents and Submitted — with a guard so nothing advances before its documents are in.' },
  { title: 'Notes & files per stage', body: 'Keep a paper trail on each property: tick off outstanding items and upload PDFs and documents into a folder for every stage.' },
  { title: 'Group by street & postcode', body: 'Properties on the same road and postcode roll up into a project automatically, so a whole-street scheme is one view.' },
  { title: 'Costing & profit', body: 'At coordination, cost up each job line by line, enter the projected revenue, and see the profit and margin instantly.' },
  { title: 'Calendar & pipeline', body: 'See the whole pipeline at a glance and every install on a timeline — no spreadsheets to wrangle.' },
]

// Marketing / explainer landing page. Explains what the tool is and that it was
// built specifically for retrofit delivery, with a clear way into the app.
export default function Landing({ onEnter }) {
  return (
    <div className="landing">
      <header className="landing__bar">
        <div className="landing__brand">Retrofit Project Management Tool</div>
        <button className="btn btn--primary" onClick={onEnter}>Open the app</button>
      </header>

      <section className="landing__hero">
        <p className="eyebrow">Built specifically for retrofit</p>
        <h1 className="landing__headline">Run every retrofit project from one place.</h1>
        <p className="landing__lead">
          A job management tool devised for retrofit delivery teams — track each property through the
          full compliance workflow, keep its documents and notes together, group whole-street schemes
          into projects, and cost jobs up to see the profit. No spreadsheets scattered across drives.
        </p>
        <div className="landing__cta">
          <button className="btn btn--primary btn--lg" onClick={onEnter}>Open the app →</button>
          <span className="landing__cta-note">Runs in your browser · your data stays on your device</span>
        </div>

        <div className="landing__flow" aria-hidden>
          {STATUSES.map((s, i) => (
            <span key={s.value} className="landing__flow-item">
              <span className="landing__flow-dot" style={{ background: s.color }} />
              {s.label}
              {i < STATUSES.length - 1 && <span className="landing__flow-arrow">›</span>}
            </span>
          ))}
        </div>
      </section>

      <section className="landing__features">
        {FEATURES.map((f) => (
          <div key={f.title} className="landing__feature">
            <h3 className="landing__feature-title">{f.title}</h3>
            <p className="landing__feature-body">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="landing__foot">
        <span>Retrofit Project Management Tool</span>
        <button className="btn btn--sm" onClick={onEnter}>Open the app</button>
      </footer>
    </div>
  )
}
