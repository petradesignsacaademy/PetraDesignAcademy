// ── Portfolio data layer ───────────────────────────────────────────────────────
// Projects are stored as a JSON array in JSONBin.
// Images are uploaded to Cloudinary via unsigned upload preset.
//
// Required env vars (add to .env and Vercel dashboard):
//   VITE_JSONBIN_BIN_ID   — the bin ID from jsonbin.io
//   VITE_JSONBIN_KEY      — your JSONBin X-Access-Key (for writes)
//   VITE_CLOUDINARY_CLOUD — your Cloudinary cloud name
//   VITE_CLOUDINARY_PRESET — your Cloudinary unsigned upload preset name

const BIN_ID  = import.meta.env.VITE_JSONBIN_BIN_ID
const BIN_KEY = import.meta.env.VITE_JSONBIN_KEY
const CLOUD   = import.meta.env.VITE_CLOUDINARY_CLOUD
const PRESET  = import.meta.env.VITE_CLOUDINARY_PRESET
const JBAPI   = 'https://api.jsonbin.io/v3/b'

// ── Read all projects from JSONBin ────────────────────────────────────────────
export async function fetchProjects() {
  const res  = await fetch(`${JBAPI}/${BIN_ID}/latest`, {
    headers: { 'X-Access-Key': BIN_KEY },
  })
  const data = await res.json()
  return data.record?.projects || []
}

// ── Write full projects array to JSONBin ──────────────────────────────────────
export async function pushProjects(projects) {
  await fetch(`${JBAPI}/${BIN_ID}`, {
    method:  'PUT',
    headers: {
      'Content-Type':    'application/json',
      'X-Access-Key':    BIN_KEY,
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
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/upload`, { method: 'POST', body: fd })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.secure_url
}

// ── Generate a simple unique ID ───────────────────────────────────────────────
export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}