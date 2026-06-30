import Papa from 'papaparse'

// Column-name fragments we use to guess which CSV columns mean what. The UI is
// intentionally generic (no retrofit-specific fields yet), so we only auto-map
// the few things the app actually needs: a display title and timeline dates.
const TITLE_HINTS = [
  'job', 'name', 'title', 'reference', 'ref', 'address', 'property',
  'customer', 'client', 'site', 'id',
]
const START_HINTS = ['start', 'install', 'begin', 'scheduled', 'date', 'visit', 'survey']
const END_HINTS = ['end', 'finish', 'complete', 'completion', 'due', 'target']

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

function pickColumn(headers, hints) {
  for (const hint of hints) {
    const match = headers.find((h) => norm(h).includes(norm(hint)))
    if (match) return match
  }
  return null
}

// Accepts a wide range of human date formats and returns YYYY-MM-DD or null.
export function parseDate(value) {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null

  // DD/MM/YYYY or DD-MM-YYYY (UK convention — common in Eco Futures data)
  const dmy = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/)
  if (dmy) {
    let [, d, m, y] = dmy
    if (y.length === 2) y = `20${y}`
    const dd = String(d).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    if (Number(mm) > 12) return null
    return `${y}-${mm}-${dd}`
  }

  // ISO-ish YYYY-MM-DD already
  const iso = raw.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/)
  if (iso) {
    const [, y, m, d] = iso
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  // Fall back to Date parsing (e.g. "12 Jan 2026", "Jan 12 2026")
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }
  return null
}

function buildTitle(row, titleCol) {
  if (titleCol && row[titleCol]) return String(row[titleCol]).trim()
  // No obvious title column: join the first couple of non-empty values.
  const vals = Object.values(row).map((v) => String(v ?? '').trim()).filter(Boolean)
  return vals.slice(0, 2).join(' · ') || 'Untitled job'
}

// Parse a File (or raw text) into normalised job objects. Returns a Promise.
export function parseCsv(input, { batchId } = {}) {
  return new Promise((resolve, reject) => {
    const config = {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        try {
          const headers = results.meta.fields || []
          const titleCol = pickColumn(headers, TITLE_HINTS)
          const startCol = pickColumn(headers, START_HINTS)
          // Don't let end-date reuse the same column we chose for start.
          const endCol = pickColumn(
            headers.filter((h) => h !== startCol),
            END_HINTS,
          )

          const jobs = results.data
            .filter((row) => Object.values(row).some((v) => String(v ?? '').trim() !== ''))
            .map((row) => {
              const start = startCol ? parseDate(row[startCol]) : null
              const end = endCol ? parseDate(row[endCol]) : null
              return {
                title: buildTitle(row, titleCol),
                status: 'Not Started',
                start_date: start,
                end_date: end || start,
                data: row,
                batch_id: batchId || null,
              }
            })

          resolve({ jobs, headers, mapping: { titleCol, startCol, endCol } })
        } catch (err) {
          reject(err)
        }
      },
      error: (err) => reject(err),
    }

    if (typeof input === 'string') {
      Papa.parse(input, config)
    } else {
      Papa.parse(input, config)
    }
  })
}
