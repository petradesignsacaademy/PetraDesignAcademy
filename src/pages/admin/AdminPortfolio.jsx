import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'

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
  cover_url: '', website_url: '', sort_order: 0, is_featured: false, is_visible: true,
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
  const [coverFile,      setCoverFile]      = useState(null)
  const [coverPreview,   setCoverPreview]   = useState(null)
  const [extraFiles,     setExtraFiles]     = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [toasts,         setToasts]         = useState([])
  const [sort,           setSort]           = useState('newest')
  const coverRef = useRef(null)
  const extraRef = useRef(null)

  useEffect(() => { loadProjects() }, [])

  function addToast(message, type = 'success') {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }

  async function loadProjects() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      setProjects(data || [])
    } catch (err) {
      console.error('[AdminPortfolio]', err)
    } finally {
      setLoading(false)
    }
  }

  async function uploadImage(file) {
    const ext  = file.name.split('.').pop()
    const path = `projects/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('portfolio-images').upload(path, file, { upsert: false })
    if (error) throw error
    const { data: urlData } = supabase.storage.from('portfolio-images').getPublicUrl(path)
    return urlData.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.category) return
    setSaving(true)
    try {
      let coverUrl = editingId ? (form.cover_url || null) : null
      if (coverFile) coverUrl = await uploadImage(coverFile)

      const imageUrls = [...existingImages]
      for (const f of extraFiles) {
        imageUrls.push(await uploadImage(f))
      }

      const payload = {
        title:       form.title,
        category:    form.category,
        year:        form.year        || null,
        description: form.description || null,
        cover_url:   coverUrl,
        images:      imageUrls,
        website_url: form.website_url || null,
        sort_order:  parseInt(form.sort_order) || 0,
        is_featured: form.is_featured,
        is_visible:  form.is_visible,
        updated_at:  new Date().toISOString(),
      }

      if (editingId) {
        await supabase.from('portfolio_projects').update(payload).eq('id', editingId)
        addToast('Project updated.')
      } else {
        await supabase.from('portfolio_projects').insert(payload)
        addToast('Project added.')
      }
      resetForm()
      loadProjects()
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
      cover_url:   project.cover_url   || '',
      website_url: project.website_url || '',
      sort_order:  project.sort_order  || 0,
      is_featured: project.is_featured || false,
      is_visible:  project.is_visible  !== false,
    })
    setExistingImages(project.images || [])
    setCoverPreview(project.cover_url || null)
    setCoverFile(null)
    setExtraFiles([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setCoverFile(null)
    setCoverPreview(null)
    setExtraFiles([])
    setExistingImages([])
    setDeleteConfirm(null)
  }

  async function toggleVisibility(project) {
    await supabase.from('portfolio_projects').update({ is_visible: !project.is_visible }).eq('id', project.id)
    setProjects(ps => ps.map(p => p.id === project.id ? { ...p, is_visible: !p.is_visible } : p))
  }

  async function deleteProject(id) {
    if (deleteConfirm !== id) { setDeleteConfirm(id); return }
    try {
      await supabase.from('portfolio_projects').delete().eq('id', id)
      setProjects(ps => ps.filter(p => p.id !== id))
      if (editingId === id) resetForm()
      setDeleteConfirm(null)
      addToast('Project deleted.', 'error')
    } catch (err) {
      addToast('Failed to delete.', 'error')
    }
  }

  const sortedProjects = [...projects].sort((a, b) => {
    if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
    if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
    if (sort === 'order')  return (a.sort_order || 0) - (b.sort_order || 0)
    if (sort === 'cat')    return a.category.localeCompare(b.category)
    return 0
  })

  const inp = {
    width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)',
    borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--text)',
    fontFamily: 'Poppins, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  }
  const lbl = { display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 12, color: 'var(--text3)', marginBottom: 6 }
  const focus = e => { e.target.style.borderColor = '#99569F' }
  const blur  = e => { e.target.style.borderColor = 'var(--border)' }

  const totalExtraImages = existingImages.length + extraFiles.length

  return (
    <AdminLayout>
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }} className="portfolio-admin-wrap">

        {/* ── LEFT PANEL: Form ── */}
        <div style={{ width: 360, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 22px', position: 'sticky', top: 100, maxHeight: 'calc(100vh - 130px)', overflowY: 'auto' }} className="portfolio-form-panel">
          <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
            {editingId ? 'Edit Project' : 'Add Project'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Title */}
            <div>
              <label style={lbl}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Project title" required style={inp} onFocus={focus} onBlur={blur} />
            </div>

            {/* Category */}
            <div>
              <label style={lbl}>Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inp, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label style={lbl}>Year</label>
              <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="e.g. 2024" style={inp} onFocus={focus} onBlur={blur} />
            </div>

            {/* Description */}
            <div>
              <label style={lbl}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the project..." rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} onFocus={focus} onBlur={blur} />
            </div>

            {/* Cover image */}
            <div>
              <label style={lbl}>Cover Image</label>
              <div
                onClick={() => coverRef.current?.click()}
                style={{ border: `2px dashed ${coverPreview ? 'var(--purple)' : 'var(--border)'}`, borderRadius: 12, padding: 12, textAlign: 'center', cursor: 'pointer', background: coverPreview ? 'rgba(153,86,159,0.04)' : 'transparent', transition: 'border-color 0.2s' }}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                ) : (
                  <>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>🖼️</div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>Click to upload cover</div>
                  </>
                )}
                <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                  const f = e.target.files[0]
                  if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)) }
                }} />
              </div>
              {coverPreview && (
                <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); setForm(f => ({ ...f, cover_url: '' })) }}
                  style={{ marginTop: 6, background: 'none', border: 'none', color: '#EF4444', fontFamily: 'Poppins, sans-serif', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                  Remove cover
                </button>
              )}
            </div>

            {/* Additional images */}
            <div>
              <label style={lbl}>Additional Images ({totalExtraImages}/4)</label>
              {existingImages.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {existingImages.map((url, i) => (
                    <div key={i} style={{ position: 'relative', width: 56, height: 56 }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                      <button type="button" onClick={() => setExistingImages(imgs => imgs.filter((_, j) => j !== i))}
                        style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {extraFiles.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {extraFiles.map((f, i) => (
                    <div key={i} style={{ position: 'relative', width: 56, height: 56 }}>
                      <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '2px solid var(--purple)' }} />
                      <button type="button" onClick={() => setExtraFiles(files => files.filter((_, j) => j !== i))}
                        style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {totalExtraImages < 4 && (
                <button type="button" onClick={() => extraRef.current?.click()}
                  style={{ width: '100%', background: 'var(--bg2)', border: '1.5px dashed var(--border)', borderRadius: 10, padding: '10px', fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', cursor: 'pointer' }}>
                  + Add image
                  <input ref={extraRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => {
                    const files = Array.from(e.target.files || [])
                    const remaining = 4 - totalExtraImages
                    setExtraFiles(ef => [...ef, ...files.slice(0, remaining)])
                  }} />
                </button>
              )}
            </div>

            {/* Website URL — web only */}
            {form.category === 'web' && (
              <div>
                <label style={lbl}>Website URL</label>
                <input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://clientsite.com" style={inp} onFocus={focus} onBlur={blur} />
              </div>
            )}

            {/* Sort order */}
            <div>
              <label style={lbl}>Sort Order <span style={{ fontWeight: 400 }}>(lower = first)</span></label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} placeholder="0" style={{ ...inp, width: '50%' }} onFocus={focus} onBlur={blur} />
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

        {/* ── RIGHT AREA: Project list ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
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

          {/* List */}
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

                  {/* Thumbnail */}
                  <div style={{ width: 64, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--bg3)' }}>
                    {project.cover_url
                      ? <img src={project.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, opacity: 0.3 }}>🖼️</div>
                    }
                  </div>

                  {/* Info */}
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

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => startEdit(project)} title="Edit"
                      style={{ width: 34, height: 34, borderRadius: 10, background: editingId === project.id ? 'rgba(249,165,52,0.1)' : 'var(--bg2)', border: `1px solid ${editingId === project.id ? 'rgba(249,165,52,0.4)' : 'var(--border)'}`, color: editingId === project.id ? 'var(--amber)' : 'var(--text2)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      onMouseEnter={e => { if (editingId !== project.id) { e.currentTarget.style.background = 'rgba(249,165,52,0.1)'; e.currentTarget.style.color = 'var(--amber)' }}}
                      onMouseLeave={e => { if (editingId !== project.id) { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text2)' }}}
                    >✏️</button>

                    <button onClick={() => toggleVisibility(project)} title={project.is_visible ? 'Hide from portfolio' : 'Show on portfolio'}
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