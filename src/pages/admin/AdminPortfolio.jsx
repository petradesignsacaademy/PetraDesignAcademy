import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { fetchProjects, pushProjects, uploadImage, uid } from '../../lib/portfolio'

const CATEGORIES = [
  { key: 'brand',  label: 'Brand Identity' },
  { key: 'visual', label: 'Visual Design' },
  { key: 'print',  label: 'Print & Packaging' },
  { key: 'social', label: 'Social Media' },
  { key: 'event',  label: 'Events' },
  { key: 'web',    label: 'Website Design' },
]

const CAT_LABEL = {
  brand: 'Brand Identity', visual: 'Visual Design', print: 'Print & Packaging',
  social: 'Social Media',  event: 'Events',          web: 'Website Design',
}

const EMPTY_FORM = {
  title: '', category: 'brand', year: '', description: '',
  website_url: '', sort_order: 0, is_featured: false, is_visible: true,
}

function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type === 'error' ? '#EF4444' : '#22C55E', color: '#fff', padding: '12px 20px', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: 'slideUp 0.2s ease' }}>
          {t.message}
        </div>
      ))}
    </div>
  )
}

export default function AdminPortfolio() {
  const [projects,       setProjects]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [form,           setForm]           = useState(EMPTY_FORM)
  const [editingId,      setEditingId]      = useState(null)
  const [saving,         setSaving]         = useState(false)
  const [deleteConfirm,  setDeleteConfirm]  = useState(null)
  const [mediaFiles,     setMediaFiles]     = useState([])   // new File objects not yet uploaded
  const [existingMedia,  setExistingMedia]  = useState([])   // already-uploaded URLs (editing)
  const [toasts,         setToasts]         = useState([])
  const [sort,           setSort]           = useState('newest')
  const mediaRef = useRef(null)

  useEffect(() => { load() }, [])

  function addToast(message, type = 'success') {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }

  async function load() {
    setLoading(true)
    try {
      setProjects(await fetchProjects())
    } catch (err) {
      console.error('[AdminPortfolio] load:', err)
      addToast('Failed to load projects.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.category) return
    setSaving(true)
    try {
      // Upload any new media files
      const newUrls = []
      for (const f of mediaFiles) newUrls.push(await uploadImage(f))
      const allMedia = [...existingMedia, ...newUrls]

      const proj = {
        id:          editingId || uid(),
        title:       form.title,
        category:    form.category,
        year:        form.year        || null,
        description: form.description || null,
        cover_url:   allMedia[0]      || null,
        images:      allMedia.slice(1),
        website_url: form.website_url || null,
        sort_order:  parseInt(form.sort_order) || 0,
        is_featured: form.is_featured,
        is_visible:  form.is_visible,
        updated_at:  Date.now(),
        created_at:  editingId
          ? (projects.find(p => p.id === editingId)?.created_at || Date.now())
          : Date.now(),
      }

      let updated
      if (editingId) {
        updated = projects.map(p => p.id === editingId ? proj : p)
        addToast('Project updated.')
      } else {
        updated = [proj, ...projects]
        addToast('Project added.')
      }

      await pushProjects(updated)
      setProjects(updated)
      resetForm()
    } catch (err) {
      console.error(err)
      addToast('Failed to save project.', 'error')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(project) {
    setEditingId(project.id)
    setForm({
      title:       project.title,
      category:    project.category,
      year:        project.year        || '',
      description: project.description || '',
      website_url: project.website_url || '',
      sort_order:  project.sort_order  || 0,
      is_featured: project.is_featured || false,
      is_visible:  project.is_visible  !== false,
    })
    setExistingMedia([project.cover_url, ...(project.images || [])].filter(Boolean))
    setMediaFiles([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setMediaFiles([])
    setExistingMedia([])
    setDeleteConfirm(null)
  }

  async function toggleVisibility(project) {
    const updated = projects.map(p =>
      p.id === project.id ? { ...p, is_visible: !p.is_visible } : p
    )
    await pushProjects(updated)
    setProjects(updated)
  }

  async function deleteProject(id) {
    if (deleteConfirm !== id) { setDeleteConfirm(id); return }
    try {
      const updated = projects.filter(p => p.id !== id)
      await pushProjects(updated)
      setProjects(updated)
      if (editingId === id) resetForm()
      setDeleteConfirm(null)
      addToast('Project deleted.', 'error')
    } catch {
      addToast('Failed to delete.', 'error')
    }
  }

  const sortedProjects = [...projects].sort((a, b) => {
    if (sort === 'newest') return (b.created_at || 0) - (a.created_at || 0)
    if (sort === 'oldest') return (a.created_at || 0) - (b.created_at || 0)
    if (sort === 'order')  return (a.sort_order || 0) - (b.sort_order || 0)
    if (sort === 'cat')    return a.category.localeCompare(b.category)
    return 0
  })

  const totalMedia = existingMedia.length + mediaFiles.length
  function isVideo(url) { return /\.(mp4|mov|webm|ogg)$/i.test(url) || url.includes('/video/upload/') }

  const inp = {
    width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)',
    borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--text)',
    fontFamily: 'Poppins, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  }
  const lbl    = { display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 12, color: 'var(--text3)', marginBottom: 6 }
  const onFocus = e => { e.target.style.borderColor = '#99569F' }
  const onBlur  = e => { e.target.style.borderColor = 'var(--border)' }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }} className="portfolio-admin-wrap">

        {/* ── LEFT: Form ── */}
        <div style={{ width: 360, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 22px', position: 'sticky', top: 100, maxHeight: 'calc(100vh - 130px)', overflowY: 'auto' }} className="portfolio-form-panel">
          <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
            {editingId ? 'Edit Project' : 'Add Project'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Title */}
            <div>
              <label style={lbl}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Project title" required style={inp} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Category */}
            <div>
              <label style={lbl}>Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inp, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label style={lbl}>Year</label>
              <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="e.g. 2024" style={inp} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Description */}
            <div>
              <label style={lbl}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the project..." rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Media — unified image + video picker */}
            <div>
              <label style={lbl}>Media — images & videos ({totalMedia}/10) <span style={{ fontWeight: 400, textTransform: 'none' }}>· first = cover</span></label>

              {totalMedia > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {existingMedia.map((url, i) => (
                    <div key={`ex-${i}`} style={{ position: 'relative', width: 60, height: 60 }}>
                      {isVideo(url)
                        ? <video src={url} muted style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        : <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />}
                      {i === 0 && <span style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 8, fontWeight: 700, background: 'var(--purple)', color: '#fff', padding: '1px 4px', borderRadius: 3 }}>Cover</span>}
                      <button type="button" onClick={() => setExistingMedia(m => m.filter((_, j) => j !== i))}
                        style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
                    </div>
                  ))}
                  {mediaFiles.map((f, i) => (
                    <div key={`new-${i}`} style={{ position: 'relative', width: 60, height: 60 }}>
                      {f.type.startsWith('video/')
                        ? <video src={URL.createObjectURL(f)} muted style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '2px solid var(--purple)' }} />
                        : <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '2px solid var(--purple)' }} />}
                      {existingMedia.length === 0 && i === 0 && <span style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 8, fontWeight: 700, background: 'var(--purple)', color: '#fff', padding: '1px 4px', borderRadius: 3 }}>Cover</span>}
                      <button type="button" onClick={() => setMediaFiles(mf => mf.filter((_, j) => j !== i))}
                        style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {totalMedia < 10 && (
                <button type="button" onClick={() => mediaRef.current?.click()}
                  style={{ width: '100%', background: 'var(--bg2)', border: `1.5px dashed ${totalMedia === 0 ? 'var(--border)' : 'var(--purple)'}`, borderRadius: 10, padding: '12px', fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', cursor: 'pointer' }}>
                  {totalMedia === 0 ? '🖼️  Click to add images & videos' : `+ Add more (${10 - totalMedia} remaining)`}
                  <input ref={mediaRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={e => {
                    const files = Array.from(e.target.files || [])
                    const remaining = 10 - totalMedia
                    setMediaFiles(mf => [...mf, ...files.slice(0, remaining)])
                    e.target.value = ''
                  }} />
                </button>
              )}
            </div>

            {/* Website URL — web only */}
            {form.category === 'web' && (
              <div>
                <label style={lbl}>Website URL</label>
                <input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://clientsite.com" style={inp} onFocus={onFocus} onBlur={onBlur} />
              </div>
            )}

            {/* Sort order */}
            <div>
              <label style={lbl}>Sort Order <span style={{ fontWeight: 400 }}>(lower = first)</span></label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} placeholder="0" style={{ ...inp, width: '50%' }} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Featured toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', borderRadius: 12, padding: '12px 14px' }}>
              <div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Featured</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Spans 2 columns on grid</div>
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', background: form.is_featured ? 'linear-gradient(135deg,#99569F,#ED518E)' : 'var(--bg3)', transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: form.is_featured ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            {/* Visible toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', borderRadius: 12, padding: '12px 14px' }}>
              <div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Visible</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Show on portfolio page</div>
              </div>
              <button type="button" onClick={() => setForm(f => ({ ...f, is_visible: !f.is_visible }))}
                style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', background: form.is_visible ? 'linear-gradient(135deg,#99569F,#ED518E)' : 'var(--bg3)', transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: form.is_visible ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={saving || !form.title}
              style={{ width: '100%', background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: 13, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: 4 }}>
              {saving ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}
                style={{ width: '100%', background: 'none', border: '1.5px solid var(--border)', borderRadius: 999, padding: 11, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text2)', cursor: 'pointer' }}>
                Cancel Edit
              </button>
            )}

            {/* Danger zone */}
            {editingId && (
              <div style={{ marginTop: 4, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => deleteProject(editingId)}
                  style={{ width: '100%', background: deleteConfirm === editingId ? 'rgba(239,68,68,0.08)' : 'none', border: `1.5px solid ${deleteConfirm === editingId ? '#EF4444' : 'rgba(239,68,68,0.35)'}`, borderRadius: 999, padding: '10px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: '#EF4444', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {deleteConfirm === editingId ? 'Click again to confirm delete' : 'Delete this project'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ── RIGHT: Project list ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>Portfolio Projects</h2>
              <span style={{ background: 'rgba(153,86,159,0.1)', color: 'var(--purple)', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, fontFamily: 'Poppins, sans-serif' }}>{projects.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['newest', 'Newest'], ['oldest', 'Oldest'], ['order', 'Sort Order'], ['cat', 'Category']].map(([key, label]) => (
                <button key={key} onClick={() => setSort(key)}
                  style={{ background: sort === key ? 'rgba(153,86,159,0.1)' : 'none', border: `1px solid ${sort === key ? 'rgba(153,86,159,0.3)' : 'var(--border)'}`, color: sort === key ? 'var(--purple)' : 'var(--text3)', borderRadius: 999, padding: '6px 12px', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : sortedProjects.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '60px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 28, fontStyle: 'italic', color: 'var(--text3)' }}>No projects yet.</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)', marginTop: 8 }}>Add your first project using the form on the left.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sortedProjects.map(project => (
                <div key={project.id}
                  style={{ background: 'var(--surface)', border: `1px solid ${editingId === project.id ? 'rgba(153,86,159,0.4)' : 'var(--border)'}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.2s' }}>

                  <div style={{ width: 64, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--bg3)' }}>
                    {project.cover_url
                      ? <img src={project.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, opacity: 0.3 }}>🖼️</div>
                    }
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--purple)', textTransform: 'uppercase' }}>{CAT_LABEL[project.category] || project.category}</span>
                      {project.year && <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)' }}>· {project.year}</span>}
                      {project.is_featured && (
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, fontWeight: 700, color: 'var(--amber)', border: '1px solid rgba(249,165,52,0.4)', borderRadius: 999, padding: '1px 7px' }}>FEATURED</span>
                      )}
                      {(project.images?.length > 0 || project.cover_url) && (
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)' }}>
                          {(project.images?.length || 0) + (project.cover_url ? 1 : 0)} images
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => startEdit(project)} title="Edit"
                      style={{ width: 34, height: 34, borderRadius: 10, background: editingId === project.id ? 'rgba(249,165,52,0.1)' : 'var(--bg2)', border: `1px solid ${editingId === project.id ? 'rgba(249,165,52,0.4)' : 'var(--border)'}`, color: editingId === project.id ? 'var(--amber)' : 'var(--text2)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      onMouseEnter={e => { if (editingId !== project.id) { e.currentTarget.style.background = 'rgba(249,165,52,0.1)'; e.currentTarget.style.color = 'var(--amber)' }}}
                      onMouseLeave={e => { if (editingId !== project.id) { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text2)' }}}
                    >✏️</button>

                    <button onClick={() => toggleVisibility(project)} title={project.is_visible ? 'Hide' : 'Show'}
                      style={{ width: 34, height: 34, borderRadius: 10, background: project.is_visible ? 'rgba(71,198,235,0.1)' : 'var(--bg2)', border: `1px solid ${project.is_visible ? 'rgba(71,198,235,0.3)' : 'var(--border)'}`, color: project.is_visible ? 'var(--blue)' : 'var(--text3)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    >{project.is_visible ? '👁️' : '🙈'}</button>

                    <button onClick={() => deleteProject(project.id)} title="Delete"
                      style={{ width: 34, height: 34, borderRadius: 10, background: deleteConfirm === project.id ? 'rgba(239,68,68,0.1)' : 'var(--bg2)', border: `1px solid ${deleteConfirm === project.id ? '#EF4444' : 'var(--border)'}`, color: deleteConfirm === project.id ? '#EF4444' : 'var(--text3)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      onMouseEnter={e => { if (deleteConfirm !== project.id) { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444' }}}
                      onMouseLeave={e => { if (deleteConfirm !== project.id) { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text3)' }}}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Toast toasts={toasts} />

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 960px) {
          .portfolio-admin-wrap { flex-direction: column !important; }
          .portfolio-form-panel { width: 100% !important; position: static !important; max-height: none !important; }
        }
      `}</style>
    </AdminLayout>
  )
}