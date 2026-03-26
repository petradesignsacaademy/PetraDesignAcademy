// ── Portfolio data layer ───────────────────────────────────────────────────────
// Projects are stored as a JSON array in JSONBin (public bin — no auth needed).
// Images and videos are uploaded to Cloudinary via unsigned upload preset.

const BIN_ID  = '69c440c8c3097a1dd55d4d7f'
const CLOUD   = 'dtmco0xc9'
const PRESET  = 'petra portfolio'
const JBAPI   = 'https://api.jsonbin.io/v3/b'

// ── Read all projects from JSONBin ────────────────────────────────────────────
export async function fetchProjects() {
  const res  = await fetch(`${JBAPI}/${BIN_ID}/latest`)
  const data = await res.json()
  return data.record?.projects || []
}

// ── Write full projects array to JSONBin ──────────────────────────────────────
export async function pushProjects(projects) {
  await fetch(`${JBAPI}/${BIN_ID}`, {
    method:  'PUT',
    headers: {
      'Content-Type':     'application/json',
      'X-Bin-Versioning': 'false',
    },
    body: JSON.stringify({ projects }),
  })
}

// ── Upload a single image file to Cloudinary ─────────────────────────────────
export async function uploadImage(file) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', PRESET)
  fd.append('folder', 'petra-portfolio')
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, { method: 'POST', body: fd })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.secure_url
}

// ── Generate a simple unique ID ───────────────────────────────────────────────
export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}