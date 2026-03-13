import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import StudentLayout from '../../components/layout/StudentLayout'

export default function CertificatePage() {
  const { courseId } = useParams()
  const { user, profile } = useAuth()
  const navigate  = useNavigate()
  const canvasRef = useRef(null)

  const [course, setCourse]           = useState(null)
  const [loading, setLoading]         = useState(true)
  const [eligible, setEligible]       = useState(false)
  const [completedAt, setCompletedAt] = useState(null)
  const [rendered, setRendered]       = useState(false)

  useEffect(() => { loadData() }, [user, courseId])

  async function loadData() {
    if (!user || !courseId) return
    setLoading(true)
    try {
      const { data: courseData } = await supabase
        .from('courses').select('*').eq('id', courseId).maybeSingle()
      if (!courseData) { setLoading(false); return }
      setCourse(courseData)

      const { data: modules } = await supabase
        .from('modules')
        .select('lessons(id)')
        .eq('course_id', courseId)
        .eq('is_published', true)

      const allIds = (modules || []).flatMap(m => (m.lessons || []).map(l => l.id))
      if (allIds.length === 0) { setLoading(false); return }

      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('lesson_id, is_completed, updated_at')
        .eq('student_id', user.id)
        .in('lesson_id', allIds)

      const completed = (progress || []).filter(p => p.is_completed)
      const isEligible = completed.length === allIds.length
      setEligible(isEligible)

      if (isEligible) {
        const latest = new Date(Math.max(...completed.map(p => new Date(p.updated_at))))
        setCompletedAt(latest)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!eligible || !course || !profile || !canvasRef.current) return
    drawCertificate()
  }, [eligible, course, profile, completedAt])

  function drawCertificate() {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const W = 1200, H = 848
    canvas.width = W
    canvas.height = H

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#0D0E2E')
    bg.addColorStop(0.5, '#1A0A40')
    bg.addColorStop(1, '#0D0E2E')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Decorative circles
    ;[
      [80, 80, 200, 'rgba(153,86,159,0.08)'],
      [W - 80, H - 80, 240, 'rgba(71,198,235,0.06)'],
      [W - 120, 100, 160, 'rgba(237,81,142,0.07)'],
      [100, H - 100, 180, 'rgba(249,165,52,0.05)'],
    ].forEach(([x, y, r, color]) => {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    })

    // Outer border — gradient
    const borderGrad = ctx.createLinearGradient(0, 0, W, H)
    borderGrad.addColorStop(0, '#99569F')
    borderGrad.addColorStop(0.5, '#ED518E')
    borderGrad.addColorStop(1, '#47C6EB')
    ctx.strokeStyle = borderGrad
    ctx.lineWidth = 3
    ctx.strokeRect(28, 28, W - 56, H - 56)

    // Inner border
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    ctx.strokeRect(38, 38, W - 76, H - 76)

    // CERTIFICATE OF COMPLETION
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = '600 13px Poppins, sans-serif'
    ctx.letterSpacing = '4px'
    ctx.fillText('CERTIFICATE OF COMPLETION', W / 2, 110)
    ctx.letterSpacing = '0px'

    // Divider under header
    const hLineGrad = ctx.createLinearGradient(W / 2 - 160, 0, W / 2 + 160, 0)
    hLineGrad.addColorStop(0, 'transparent')
    hLineGrad.addColorStop(0.5, 'rgba(153,86,159,0.6)')
    hLineGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = hLineGrad
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(W / 2 - 160, 122); ctx.lineTo(W / 2 + 160, 122); ctx.stroke()

    // This certifies that
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '300 16px Poppins, sans-serif'
    ctx.fillText('This certifies that', W / 2, 175)

    // Student name
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 62px Cormorant Upright, Georgia, serif'
    ctx.fillText(profile.full_name || 'Student', W / 2, 258)

    // Name underline
    const nw = ctx.measureText(profile.full_name || 'Student').width
    const nameGrad = ctx.createLinearGradient(W / 2 - nw / 2, 0, W / 2 + nw / 2, 0)
    nameGrad.addColorStop(0, '#99569F'); nameGrad.addColorStop(0.5, '#ED518E'); nameGrad.addColorStop(1, '#47C6EB')
    ctx.strokeStyle = nameGrad; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(W / 2 - nw / 2, 268); ctx.lineTo(W / 2 + nw / 2, 268); ctx.stroke()

    // has successfully completed
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '300 16px Poppins, sans-serif'
    ctx.fillText('has successfully completed', W / 2, 318)

    // Course title — word wrapped
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 28px Cormorant Upright, Georgia, serif'
    const words = (course.title || '').split(' ')
    let lines = [], line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > 760 && line) { lines.push(line); line = word }
      else line = test
    }
    if (line) lines.push(line)
    const titleY = lines.length > 1 ? 368 : 378
    lines.forEach((l, i) => ctx.fillText(l, W / 2, titleY + i * 38))

    // Mid divider
    const divY = titleY + lines.length * 38 + 28
    const midGrad = ctx.createLinearGradient(W / 2 - 300, 0, W / 2 + 300, 0)
    midGrad.addColorStop(0, 'transparent')
    midGrad.addColorStop(0.2, 'rgba(153,86,159,0.4)')
    midGrad.addColorStop(0.8, 'rgba(71,198,235,0.4)')
    midGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = midGrad; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(W / 2 - 300, divY); ctx.lineTo(W / 2 + 300, divY); ctx.stroke()

    // Date + issuer
    const dateStr = completedAt
      ? completedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    const bottomY = divY + 48

    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '600 11px Poppins, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('DATE COMPLETED', 160, bottomY)
    ctx.letterSpacing = '0px'
    ctx.fillStyle = '#ffffff'
    ctx.font = '500 18px Poppins, sans-serif'
    ctx.fillText(dateStr, 160, bottomY + 28)

    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '600 11px Poppins, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('ISSUED BY', W - 160, bottomY)
    ctx.letterSpacing = '0px'
    const issuerGrad = ctx.createLinearGradient(W - 460, 0, W - 160, 0)
    issuerGrad.addColorStop(0, '#99569F'); issuerGrad.addColorStop(1, '#ED518E')
    ctx.fillStyle = issuerGrad
    ctx.font = '700 22px Cormorant Upright, Georgia, serif'
    ctx.fillText('Petra Designs Academy', W - 160, bottomY + 30)

    // Bottom URL
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.font = '400 13px Poppins, sans-serif'
    ctx.fillText('petradesigns.org', W / 2, H - 46)

    setRendered(true)
  }

  function downloadCertificate() {
    const canvas = canvasRef.current
    const link   = document.createElement('a')
    link.download = `Petra-Designs-Certificate-${(profile?.full_name || 'Student').replace(/\s+/g, '-')}.png`
    link.href    = canvas.toDataURL('image/png')
    link.click()
  }

  if (loading) {
    return (
      <StudentLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </StudentLayout>
    )
  }

  if (!eligible) {
    return (
      <StudentLayout>
        <div style={{ maxWidth: 560, margin: '100px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🏆</div>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Almost there!</h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
            Complete all lessons in the course to unlock your certificate. You're doing great — keep going!
          </p>
          <button
            onClick={() => navigate('/courses')}
            style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 36px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            Back to course →
          </button>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--purple)', fontFamily: 'Poppins, sans-serif', marginBottom: 8 }}>CONGRATULATIONS 🎉</div>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 48, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Your Certificate</h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>
            You've completed <strong style={{ color: 'var(--text2)' }}>{course?.title}</strong>. Download your certificate below.
          </p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={downloadCertificate}
            disabled={!rendered}
            style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 36px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, cursor: rendered ? 'pointer' : 'not-allowed', opacity: rendered ? 1 : 0.6, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            ⬇️ Download Certificate
          </button>
          <button
            onClick={() => navigate('/courses')}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 999, padding: '14px 36px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
          >
            ← Back to course
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </StudentLayout>
  )
}
