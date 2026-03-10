import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'

// ── Small modal wrapper ───────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', width: '100%', maxWidth: 540, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text3)', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
      <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = { background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--text)', fontFamily: 'Poppins, sans-serif', outline: 'none', width: '100%' }
const MODULE_COLORS = ['#99569F', '#47C6EB', '#ED518E', '#F9A534']

export default function AdminCourses() {
  const [course, setCourse]   = useState(null)
  const [modules, setModules] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modal, setModal] = useState(null) // 'course' | 'module' | 'lesson' | 'resource'
  const [editing, setEditing] = useState(null) // the item being edited
  const [parentId, setParentId] = useState(null) // moduleId when adding lesson

  // Form fields
  const [form, setForm] = useState({})

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const { data: courseData } = await supabase.from('courses').select('*').order('sort_order').limit(1).maybeSingle()
    if (courseData) {
      setCourse(courseData)
      const { data: modData } = await supabase
        .from('modules')
        .select('*, lessons(*, lesson_resources(*))')
        .eq('course_id', courseData.id)
        .order('sort_order')
      const sorted = (modData || []).map(m => ({
        ...m,
        lessons: (m.lessons || []).sort((a, b) => a.sort_order - b.sort_order),
      }))
      setModules(sorted)
      if (sorted.length > 0 && !expanded) setExpanded(sorted[0].id)
    }
    setLoading(false)
  }

  function openModal(type, item = {}, pid = null) {
    setModal(type)
    setEditing(item.id ? item : null)
    setParentId(pid)
    setForm(item.id ? { ...item } : {})
  }

  function closeModal() { setModal(null); setEditing(null); setForm({}) }

  async function saveCourse() {
    const payload = { title: form.title, description: form.description, slug: form.slug || form.title?.toLowerCase().replace(/\s+/g, '-'), is_published: form.is_published || false }
    if (editing) {
      await supabase.from('courses').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('courses').insert(payload)
    }
    closeModal(); loadAll()
  }

  async function saveModule() {
    const payload = { title: form.title, description: form.description, sort_order: parseInt(form.sort_order) || 0, is_published: form.is_published || false, course_id: course.id }
    if (editing) {
      await supabase.from('modules').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('modules').insert(payload)
    }
    closeModal(); loadAll()
  }

  async function saveLesson() {
    const payload = {
      title: form.title, description: form.description,
      video_url: form.video_url, duration_mins: parseInt(form.duration_mins) || null,
      sort_order: parseInt(form.sort_order) || 0,
      is_published: form.is_published || false,
      has_assignment: form.has_assignment || false,
      assignment_brief: form.assignment_brief || null,
      module_id: parentId || editing?.module_id,
    }
    if (editing) {
      await supabase.from('lessons').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('lessons').insert(payload)
    }
    closeModal(); loadAll()
  }

  async function saveResource() {
    const payload = {
      title: form.title, file_url: form.file_url,
      file_type: form.file_type || 'pdf',
      sort_order: parseInt(form.sort_order) || 0,
      lesson_id: parentId || editing?.lesson_id,
    }
    if (editing) {
      await supabase.from('lesson_resources').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('lesson_resources').insert(payload)
    }
    closeModal(); loadAll()
  }

  async function togglePublish(table, id, current) {
    await supabase.from(table).update({ is_published: !current }).eq('id', id)
    loadAll()
  }

  async function deleteItem(table, id) {
    if (!window.confirm('Are you sure you want to delete this? This cannot be undone.')) return
    await supabase.from(table).delete().eq('id', id)
    loadAll()
  }

  const btnSave = { background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '11px 24px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%', marginTop: 8 }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Course Content</h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Add and manage modules, lessons, and resources</p>
        </div>
        {!course && !loading && (
          <button onClick={() => openModal('course')} style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 22px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            + Create Course
          </button>
        )}
      </div>

      {loading && <div style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14, padding: 24 }}>Loading...</div>}

      {/* Course header card */}
      {course && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '20px 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--text3)', marginBottom: 4 }}>COURSE</div>
            <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{course.title}</h2>
            {course.description && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)' }}>{course.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ background: course.is_published ? 'rgba(34,197,94,0.1)' : 'var(--bg3)', color: course.is_published ? '#22C55E' : 'var(--text3)', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, fontFamily: 'Poppins, sans-serif' }}>
              {course.is_published ? '● Published' : '○ Draft'}
            </span>
            <button onClick={() => openModal('course', course)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '7px 14px', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Edit</button>
            <button onClick={() => openModal('module')} style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>+ Add Module</button>
          </div>
        </div>
      )}

      {/* Modules */}
      {modules.map((mod, modIdx) => {
        const color = MODULE_COLORS[modIdx % 4]
        const isOpen = expanded === mod.id
        return (
          <div key={mod.id} style={{ background: 'var(--surface)', border: `1px solid ${isOpen ? color + '40' : 'var(--border)'}`, borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
            {/* Module header */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: `4px solid ${color}` }}>
              <div onClick={() => setExpanded(isOpen ? null : mod.id)} style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 18, transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', color: 'var(--text3)' }}>›</div>
                <div>
                  <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{mod.title}</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>{mod.lessons?.length || 0} lessons</div>
                </div>
              </div>
              <span style={{ background: mod.is_published ? 'rgba(34,197,94,0.1)' : 'var(--bg3)', color: mod.is_published ? '#22C55E' : 'var(--text3)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }} onClick={() => togglePublish('modules', mod.id, mod.is_published)}>
                {mod.is_published ? '● Published' : '○ Draft'}
              </span>
              <button onClick={() => openModal('module', mod)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Edit</button>
              <button onClick={() => openModal('lesson', {}, mod.id)} style={{ background: `${color}18`, border: `1px solid ${color}30`, color, padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>+ Lesson</button>
              <button onClick={() => deleteItem('modules', mod.id)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '5px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>🗑</button>
            </div>

            {/* Lessons */}
            {isOpen && (
              <div style={{ borderTop: `1px solid ${color}20` }}>
                {(mod.lessons || []).length === 0 ? (
                  <div style={{ padding: '20px 24px', fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>No lessons yet — click "+ Lesson" to add one</div>
                ) : (
                  mod.lessons.map((lesson, li) => (
                    <div key={lesson.id} style={{ padding: '14px 20px 14px 36px', borderBottom: li < mod.lessons.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{lesson.title}</div>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {lesson.duration_mins && <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)' }}>🎬 {lesson.duration_mins} min</span>}
                            {lesson.video_url && <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--blue)' }}>▶ Video linked</span>}
                            {lesson.has_assignment && <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--pink)' }}>✏️ Has assignment</span>}
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)' }}>📄 {lesson.lesson_resources?.length || 0} resources</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                          <span onClick={() => togglePublish('lessons', lesson.id, lesson.is_published)} style={{ background: lesson.is_published ? 'rgba(34,197,94,0.1)' : 'var(--bg3)', color: lesson.is_published ? '#22C55E' : 'var(--text3)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}>
                            {lesson.is_published ? '● Live' : '○ Draft'}
                          </span>
                          <button onClick={() => openModal('resource', {}, lesson.id)} style={{ background: 'rgba(71,198,235,0.1)', border: '1px solid rgba(71,198,235,0.2)', color: 'var(--blue)', padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>+ PDF</button>
                          <button onClick={() => openModal('lesson', lesson, mod.id)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Edit</button>
                          <button onClick={() => deleteItem('lessons', lesson.id)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '4px 8px', borderRadius: 7, fontSize: 11, cursor: 'pointer' }}>🗑</button>
                        </div>
                      </div>
                      {/* Resources */}
                      {lesson.lesson_resources?.length > 0 && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {lesson.lesson_resources.map(r => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px' }}>
                              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>📄 {r.title}</span>
                              <button onClick={() => openModal('resource', r, lesson.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 11, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', padding: 0 }}>edit</button>
                              <button onClick={() => deleteItem('lesson_resources', r.id)} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 11, cursor: 'pointer', padding: 0 }}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {/* Course modal */}
      <Modal open={modal === 'course'} onClose={closeModal} title={editing ? 'Edit Course' : 'Create Course'}>
        <Field label="Course title"><input style={inputStyle} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Graphic Design Foundations" /></Field>
        <Field label="Description"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description of the course" /></Field>
        <Field label="Published">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.is_published || false} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
            Make this course visible to approved students
          </label>
        </Field>
        <button style={btnSave} onClick={saveCourse}>{editing ? 'Save changes' : 'Create course'}</button>
      </Modal>

      {/* Module modal */}
      <Modal open={modal === 'module'} onClose={closeModal} title={editing ? 'Edit Module' : 'Add Module'}>
        <Field label="Module title"><input style={inputStyle} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Typography Foundations" /></Field>
        <Field label="Description (optional)"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></Field>
        <Field label="Sort order"><input type="number" style={inputStyle} value={form.sort_order || 0} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} placeholder="0, 1, 2..." /></Field>
        <Field label="Published">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.is_published || false} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
            Make this module visible to students
          </label>
        </Field>
        <button style={btnSave} onClick={saveModule}>{editing ? 'Save changes' : 'Add module'}</button>
      </Modal>

      {/* Lesson modal */}
      <Modal open={modal === 'lesson'} onClose={closeModal} title={editing ? 'Edit Lesson' : 'Add Lesson'}>
        <Field label="Lesson title"><input style={inputStyle} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. What is Typography?" /></Field>
        <Field label="Description / overview"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What students will learn in this lesson" /></Field>
        <Field label="YouTube video URL">
          <input style={inputStyle} value={form.video_url || ''} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://youtu.be/... or https://youtube.com/watch?v=..." />
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Paste the full YouTube URL — the video must be Unlisted or Public</span>
        </Field>
        <Field label="Duration (minutes)"><input type="number" style={inputStyle} value={form.duration_mins || ''} onChange={e => setForm(f => ({ ...f, duration_mins: e.target.value }))} placeholder="e.g. 24" /></Field>
        <Field label="Sort order"><input type="number" style={inputStyle} value={form.sort_order || 0} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} /></Field>
        <Field label="Options">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
            <input type="checkbox" checked={form.is_published || false} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
            Published (visible to students)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.has_assignment || false} onChange={e => setForm(f => ({ ...f, has_assignment: e.target.checked }))} />
            This lesson has an assignment
          </label>
        </Field>
        {form.has_assignment && (
          <Field label="Assignment brief">
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} value={form.assignment_brief || ''} onChange={e => setForm(f => ({ ...f, assignment_brief: e.target.value }))} placeholder="Describe the task students need to complete and submit..." />
          </Field>
        )}
        <button style={btnSave} onClick={saveLesson}>{editing ? 'Save changes' : 'Add lesson'}</button>
      </Modal>

      {/* Resource modal */}
      <Modal open={modal === 'resource'} onClose={closeModal} title={editing ? 'Edit Resource' : 'Add PDF Resource'}>
        <Field label="Resource name"><input style={inputStyle} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Lesson Notes — Typography.pdf" /></Field>
        <Field label="File URL (from Supabase Storage)">
          <input style={inputStyle} value={form.file_url || ''} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." />
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Upload the PDF to Supabase Storage → copy the public URL → paste it here</span>
        </Field>
        <Field label="File type"><input style={inputStyle} value={form.file_type || 'pdf'} onChange={e => setForm(f => ({ ...f, file_type: e.target.value }))} placeholder="pdf" /></Field>
        <Field label="Sort order"><input type="number" style={inputStyle} value={form.sort_order || 0} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} /></Field>
        <button style={btnSave} onClick={saveResource}>{editing ? 'Save changes' : 'Add resource'}</button>
      </Modal>
    </AdminLayout>
  )
}
