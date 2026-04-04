import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import StudentLayout from '../../components/layout/StudentLayout'
import { COURSE } from '../../data/courseData'

export default function CertificatePage() {
  const { user, profile } = useAuth()
  const navigate   = useNavigate()
  const canvasRef  = useRef(null)

  const course = { title: COURSE.title }

  const [loading,     setLoading]     = useState(true)
  const [eligible,    setEligible]    = useState(false)
  const [completedAt, setCompletedAt] = useState(null)
  const [rendered,    setRendered]    = useState(false)

  useEffect(() => { if (user) loadData() }, [user])

  async function loadData() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('certificate_issued, certificate_issued_at')
        .eq('id', user.id)
        .maybeSingle()

      setEligible(data?.certificate_issued === true)
      if (data?.certificate_issued_at) {
        setCompletedAt(new Date(data.certificate_issued_at))
      }
    } catch (err) {
      console.error('[Certificate]', err)
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
    const W = 1400, H = 990
    canvas.width  = W
    canvas.height = H

    const logo = new Image()
    logo.onload  = () => render(logo)
    logo.onerror = () => render(null)
    logo.src = '/logo.png'

    function render(logoImg) {
      // ── Background ─────────────────────────────────────────────────────────
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, W, H)

      // Left panel — soft lavender/blush gradient
      const leftGrad = ctx.createLinearGradient(0, 0, 0, H)
      leftGrad.addColorStop(0, '#F8F4FF')
      leftGrad.addColorStop(1, '#FFF0F8')
      ctx.fillStyle = leftGrad
      ctx.fillRect(0, 0, 460, H)

      // ── Decorative arcs (bottom-left corner of left panel) ────────────────
      ;[
        { r: 280, color: 'rgba(237,81,142,0.06)', lw: 40 },
        { r: 200, color: 'rgba(153,86,159,0.04)', lw: 30 },
      ].forEach(({ r, color, lw }) => {
        ctx.beginPath()
        ctx.arc(0, H, r, 0, Math.PI * 0.5)
        ctx.strokeStyle = color
        ctx.lineWidth   = lw
        ctx.stroke()
      })

      // ── Vertical divider ──────────────────────────────────────────────────
      const divGrad = ctx.createLinearGradient(0, 60, 0, 930)
      divGrad.addColorStop(0,   'rgba(153,86,159,0.3)')
      divGrad.addColorStop(0.5, 'rgba(237,81,142,0.3)')
      divGrad.addColorStop(1,   'rgba(71,198,235,0.3)')
      ctx.strokeStyle = divGrad
      ctx.lineWidth   = 1
      ctx.beginPath(); ctx.moveTo(460, 60); ctx.lineTo(460, 930); ctx.stroke()

      // ── LEFT PANEL ────────────────────────────────────────────────────────
      const panelCX = 230

      // Logo
      if (logoImg) {
        const logoW = 160
        const logoH = (logoImg.height / logoImg.width) * logoW
        ctx.drawImage(logoImg, panelCX - logoW / 2, 140, logoW, logoH)
      }

      // Decorative rule
      const ruleGrad = ctx.createLinearGradient(panelCX - 30, 0, panelCX + 30, 0)
      ruleGrad.addColorStop(0, '#99569F'); ruleGrad.addColorStop(1, '#ED518E')
      ctx.fillStyle = ruleGrad
      ctx.fillRect(panelCX - 30, 340, 60, 2)

      // PETRA DESIGNS ACADEMY
      ctx.textAlign     = 'center'
      ctx.fillStyle     = 'rgba(153,86,159,0.7)'
      ctx.font          = '600 9px Poppins, sans-serif'
      ctx.letterSpacing = '3px'
      ctx.fillText('PETRA DESIGNS ACADEMY', panelCX, 390)
      ctx.letterSpacing = '0px'

      // Website
      ctx.fillStyle = 'rgba(100,100,120,0.5)'
      ctx.font      = '300 12px Poppins, sans-serif'
      ctx.fillText('petradesigns.org', panelCX, 430)

      // Date issued
      const dateStr = completedAt
        ? completedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

      ctx.fillStyle     = 'rgba(153,86,159,0.6)'
      ctx.font          = '600 9px Poppins, sans-serif'
      ctx.letterSpacing = '2px'
      ctx.fillText('DATE ISSUED', panelCX, 870)
      ctx.letterSpacing = '0px'
      ctx.fillStyle = '#333344'
      ctx.font      = '500 13px Poppins, sans-serif'
      ctx.fillText(dateStr, panelCX, 886)

      // ── RIGHT PANEL ───────────────────────────────────────────────────────
      const cx = 930

      // CERTIFICATE OF COMPLETION
      ctx.textAlign     = 'center'
      ctx.fillStyle     = 'rgba(153,86,159,0.6)'
      ctx.font          = '600 10px Poppins, sans-serif'
      ctx.letterSpacing = '4px'
      ctx.fillText('CERTIFICATE OF COMPLETION', cx, 130)
      ctx.letterSpacing = '0px'

      // Gradient bar
      const barGrad = ctx.createLinearGradient(cx - 24, 0, cx + 24, 0)
      barGrad.addColorStop(0, '#99569F'); barGrad.addColorStop(1, '#ED518E')
      ctx.fillStyle = barGrad
      ctx.fillRect(cx - 24, 170, 48, 2)

      // This is to certify that
      ctx.fillStyle = 'rgba(60,60,80,0.55)'
      ctx.font      = '300 15px Poppins, sans-serif'
      ctx.fillText('This is to certify that', cx, 260)

      // Student name — reduce size if too wide
      const name = profile.full_name || 'Student'
      ctx.font = '700 72px Cormorant Upright, Georgia, serif'
      const nameFontSize = ctx.measureText(name).width > 700 ? 58 : 72
      ctx.font      = `700 ${nameFontSize}px Cormorant Upright, Georgia, serif`
      ctx.fillStyle = '#12133C'
      ctx.fillText(name, cx, 360)

      // Name underline
      const nameW    = ctx.measureText(name).width
      const nameGrad = ctx.createLinearGradient(cx - nameW / 2, 0, cx + nameW / 2, 0)
      nameGrad.addColorStop(0, '#99569F')
      nameGrad.addColorStop(0.5, '#ED518E')
      nameGrad.addColorStop(1, '#47C6EB')
      ctx.strokeStyle = nameGrad
      ctx.lineWidth   = 2.5
      ctx.beginPath()
      ctx.moveTo(cx - nameW / 2, 364)
      ctx.lineTo(cx + nameW / 2, 364)
      ctx.stroke()

      // has successfully completed the course
      ctx.fillStyle = 'rgba(60,60,80,0.55)'
      ctx.font      = '300 15px Poppins, sans-serif'
      ctx.fillText('has successfully completed the course', cx, 430)

      // Course title — word-wrapped, max 2 lines
      ctx.fillStyle = '#12133C'
      ctx.font      = 'italic 32px Cormorant Upright, Georgia, serif'
      const titleWords = (COURSE.title || '').split(' ')
      const titleLines = []
      let titleLine    = ''
      for (const word of titleWords) {
        const test = titleLine ? `${titleLine} ${word}` : word
        if (ctx.measureText(test).width > 700 && titleLine) {
          titleLines.push(titleLine)
          titleLine = word
        } else {
          titleLine = test
        }
      }
      if (titleLine) titleLines.push(titleLine)
      titleLines.slice(0, 2).forEach((l, i) => ctx.fillText(l, cx, 530 + i * 42))
      const titleBottom = 530 + Math.min(titleLines.length, 2) * 42

      // Diamond row
      ctx.fillStyle = 'rgba(153,86,159,0.25)'
      ;[-20, 0, 20].forEach(offset => {
        ctx.save()
        ctx.translate(cx + offset, titleBottom + 48)
        ctx.rotate(Math.PI / 4)
        ctx.fillRect(-4, -4, 8, 8)
        ctx.restore()
      })

      // ── AUTHORISED BY ─────────────────────────────────────────────────────
      const authX = 1300, authY = 870
      ctx.textAlign     = 'right'
      ctx.fillStyle     = 'rgba(153,86,159,0.6)'
      ctx.font          = '600 9px Poppins, sans-serif'
      ctx.letterSpacing = '2px'
      ctx.fillText('AUTHORISED BY', authX, authY)
      ctx.letterSpacing = '0px'

      ctx.fillStyle = '#12133C'
      ctx.font      = 'italic 28px Cormorant Upright, Georgia, serif'
      ctx.fillText('Petra', authX, authY + 20)

      ctx.strokeStyle = 'rgba(153,86,159,0.35)'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(authX - 80, authY + 44)
      ctx.lineTo(authX, authY + 44)
      ctx.stroke()

      ctx.fillStyle = 'rgba(100,100,120,0.6)'
      ctx.font      = '400 11px Poppins, sans-serif'
      ctx.fillText('Founder, Petra Designs Academy', authX, authY + 58)

      // ── Outer border ──────────────────────────────────────────────────────
      ctx.strokeStyle = 'rgba(153,86,159,0.18)'
      ctx.lineWidth   = 1
      ctx.strokeRect(24, 24, W - 48, H - 48)

      // ── Corner accents (L-shapes) ─────────────────────────────────────────
      ctx.strokeStyle = '#99569F'
      ctx.lineWidth   = 2
      const cs = 20, ci = 24
      ;[
        [ci,     ci,     1,  1 ],
        [W - ci, ci,    -1,  1 ],
        [ci,     H - ci, 1, -1 ],
        [W - ci, H - ci,-1, -1 ],
      ].forEach(([x, y, dx, dy]) => {
        ctx.beginPath()
        ctx.moveTo(x + dx * cs, y)
        ctx.lineTo(x, y)
        ctx.lineTo(x, y + dy * cs)
        ctx.stroke()
      })

      setRendered(true)
    }
  }

  function downloadCertificate() {
    const link = document.createElement('a')
    link.download = `Petra-Designs-Certificate-${(profile?.full_name || 'Student').replace(/\s+/g, '-')}.png`
    link.href     = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <StudentLayout>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:16 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--border)', borderTopColor:'var(--purple)', animation:'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </StudentLayout>
    )
  }

  // ── Not eligible ──────────────────────────────────────────────────────────
  if (!eligible) {
    return (
      <StudentLayout>
        <div style={{ maxWidth: 520, margin: '100px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎓</div>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
            Coming soon
          </h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
            Once Petra reviews your final project and issues your certificate, it will appear here. You'll get a notification when it's ready.
          </p>
          <button
            onClick={() => navigate('/courses')}
            style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 36px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            Back to course →
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </StudentLayout>
    )
  }

  // ── Certificate ───────────────────────────────────────────────────────────
  return (
    <StudentLayout>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'40px 32px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ fontFamily:'Poppins, sans-serif', fontSize:11, fontWeight:700, letterSpacing:2, color:'var(--purple)', marginBottom:10 }}>
            CONGRATULATIONS 🎉
          </div>
          <h1 style={{ fontFamily:'Cormorant Upright, serif', fontSize:46, fontWeight:700, color:'var(--text)', marginBottom:10 }}>
            Your Certificate of Completion
          </h1>
          <p style={{ fontFamily:'Poppins, sans-serif', fontSize:14, color:'var(--text3)', lineHeight:1.7 }}>
            You've completed the <strong style={{ color:'var(--text2)' }}>{course?.title}</strong>. Your achievement is officially recognised.
          </p>
        </div>

        {/* Canvas */}
        <div style={{ borderRadius:24, overflow:'hidden', boxShadow:'0 32px 80px rgba(153,86,159,0.2)', background:'#fff', marginBottom:28 }}>
          <canvas ref={canvasRef} style={{ width:'100%', height:'auto', display:'block' }} />
        </div>

        {/* Buttons */}
        <div style={{ display:'flex', justifyContent:'center', gap:12, flexWrap:'wrap', marginBottom:20 }}>
          <button
            onClick={downloadCertificate}
            disabled={!rendered}
            style={{ background:'linear-gradient(135deg, #99569F, #ED518E)', color:'#fff', border:'none', borderRadius:999, padding:'14px 36px', fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:15, cursor:rendered ? 'pointer' : 'not-allowed', opacity:rendered ? 1 : 0.5, display:'flex', alignItems:'center', gap:8 }}
          >
            ⬇️ Download Certificate
          </button>
          <button
            onClick={() => navigate('/courses')}
            style={{ background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text2)', borderRadius:999, padding:'14px 36px', fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:15, cursor:'pointer' }}
          >
            ← Back to course
          </button>
        </div>

        {/* Share prompt */}
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'Poppins, sans-serif', fontSize:12, color:'var(--text3)', marginBottom:10 }}>
            Share your achievement
          </div>
          <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
            {['Instagram', 'LinkedIn', 'WhatsApp'].map(platform => (
              <span key={platform} style={{ fontFamily:'Poppins, sans-serif', fontSize:12, color:'var(--text3)', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:999, padding:'6px 16px' }}>
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </StudentLayout>
  )
}