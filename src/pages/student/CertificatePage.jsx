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

      // ── BACKGROUND ────────────────────────────────────────────────────────────
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, W, H)

      // ── LEFT PANEL — dark navy ────────────────────────────────────────────────
      const leftW = 448
      const leftGrad = ctx.createLinearGradient(0, 0, 0, H)
      leftGrad.addColorStop(0,   '#12133C')
      leftGrad.addColorStop(0.6, '#1A0A3D')
      leftGrad.addColorStop(1,   '#12133C')
      ctx.fillStyle = leftGrad
      ctx.fillRect(0, 0, leftW, H)

      // Decorative arcs — bottom-left of left panel
      ;[
        { r: 360, color: 'rgba(237,81,142,0.07)', lw: 48 },
        { r: 260, color: 'rgba(153,86,159,0.06)', lw: 32 },
      ].forEach(({ r, color, lw }) => {
        ctx.beginPath()
        ctx.arc(0, H, r, 0, Math.PI * 0.55)
        ctx.strokeStyle = color
        ctx.lineWidth   = lw
        ctx.stroke()
      })

      // ── LEFT PANEL CONTENT — all centred at panelCX ──────────────────────────
      const panelCX = 224
      ctx.textAlign = 'center'

      // Logo — render white by drawing into offscreen canvas first
      if (logoImg) {
        const logoW = 180
        const logoH = (logoImg.height / logoImg.width) * logoW
        // Offscreen canvas: draw logo, then fill white using source-in
        // so only the logo's opaque pixels become white (shape is preserved)
        const off = document.createElement('canvas')
        off.width  = logoW
        off.height = logoH
        const offCtx = off.getContext('2d')
        offCtx.drawImage(logoImg, 0, 0, logoW, logoH)
        offCtx.globalCompositeOperation = 'source-in'
        offCtx.fillStyle = '#ffffff'
        offCtx.fillRect(0, 0, logoW, logoH)
        ctx.drawImage(off, panelCX - logoW / 2, 130)
      } else {
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 28px Georgia, serif'
        ctx.fillText('Petra Designs', panelCX, 175)
      }

      // Gradient rule under logo
      const ruleGrad = ctx.createLinearGradient(panelCX - 30, 0, panelCX + 30, 0)
      ruleGrad.addColorStop(0, '#99569F')
      ruleGrad.addColorStop(1, '#ED518E')
      ctx.fillStyle = ruleGrad
      ctx.fillRect(panelCX - 30, 310, 60, 2)

      // Academy name
      ctx.fillStyle     = 'rgba(255,255,255,0.45)'
      ctx.font          = '600 11px Poppins, sans-serif'
      ctx.letterSpacing = '2.5px'
      ctx.fillText('PETRA DESIGNS ACADEMY', panelCX, 358)
      ctx.letterSpacing = '0px'

      // URL
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.font      = '300 12px Poppins, sans-serif'
      ctx.fillText('petradesigns.org', panelCX, 386)

      // Date issued — bottom of left panel
      ctx.fillStyle     = 'rgba(153,86,159,0.7)'
      ctx.font          = '600 10px Poppins, sans-serif'
      ctx.letterSpacing = '2px'
      ctx.fillText('DATE ISSUED', panelCX, 870)
      ctx.letterSpacing = '0px'

      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.font      = '600 13px Poppins, sans-serif'
      const dateStr = completedAt
        ? completedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      ctx.fillText(dateStr, panelCX, 892)

      // ── VERTICAL DIVIDER ─────────────────────────────────────────────────────
      const divGrad = ctx.createLinearGradient(0, 50, 0, H - 50)
      divGrad.addColorStop(0,    'transparent')
      divGrad.addColorStop(0.15, 'rgba(153,86,159,0.25)')
      divGrad.addColorStop(0.5,  'rgba(237,81,142,0.25)')
      divGrad.addColorStop(0.85, 'rgba(71,198,235,0.25)')
      divGrad.addColorStop(1,    'transparent')
      ctx.strokeStyle = divGrad
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(leftW + 1, 50)
      ctx.lineTo(leftW + 1, H - 50)
      ctx.stroke()

      // ── RIGHT PANEL ──────────────────────────────────────────────────────────
      const rightStart = leftW + 2
      const rightW     = W - rightStart
      const cx         = rightStart + rightW / 2

      ctx.textAlign = 'center'

      // CERTIFICATE OF COMPLETION label
      ctx.fillStyle     = 'rgba(153,86,159,0.65)'
      ctx.font          = '600 12px Poppins, sans-serif'
      ctx.letterSpacing = '4px'
      ctx.fillText('CERTIFICATE OF COMPLETION', cx, 148)
      ctx.letterSpacing = '0px'

      // Short gradient bar under label
      const barGrad = ctx.createLinearGradient(cx - 28, 0, cx + 28, 0)
      barGrad.addColorStop(0, '#99569F')
      barGrad.addColorStop(1, '#ED518E')
      ctx.fillStyle = barGrad
      ctx.fillRect(cx - 28, 170, 56, 1.5)

      // "This is to certify that"
      ctx.fillStyle = 'rgba(60,60,80,0.5)'
      ctx.font      = 'italic 16px Poppins, sans-serif'
      ctx.fillText('This is to certify that', cx, 260)

      // Student name
      const name = profile?.full_name || 'Student'
      let nameFontSize = 72
      ctx.font = `700 72px Cormorant Upright, Georgia, serif`
      if (ctx.measureText(name).width > 680) {
        nameFontSize = 56
        ctx.font = `700 56px Cormorant Upright, Georgia, serif`
      }
      ctx.fillStyle = '#12133C'
      ctx.fillText(name, cx, 362)

      // Name underline — gradient, width matches name
      ctx.font = `700 ${nameFontSize}px Cormorant Upright, Georgia, serif`
      const nameW    = ctx.measureText(name).width
      const nameGrad = ctx.createLinearGradient(cx - nameW / 2, 0, cx + nameW / 2, 0)
      nameGrad.addColorStop(0,   '#99569F')
      nameGrad.addColorStop(0.5, '#ED518E')
      nameGrad.addColorStop(1,   '#47C6EB')
      ctx.strokeStyle = nameGrad
      ctx.lineWidth   = 2.5
      ctx.beginPath()
      ctx.moveTo(cx - nameW / 2, 370)
      ctx.lineTo(cx + nameW / 2, 370)
      ctx.stroke()

      // "has successfully completed the course"
      ctx.fillStyle = 'rgba(60,60,80,0.45)'
      ctx.font      = '300 15px Poppins, sans-serif'
      ctx.fillText('has successfully completed the course', cx, 432)

      // Course title — italic serif, centred, word-wrapped
      ctx.fillStyle = '#12133C'
      ctx.font      = 'italic 32px Cormorant Upright, Georgia, serif'
      const titleWords = (COURSE.title || '').split(' ')
      const titleLines = []
      let titleLine    = ''
      for (const word of titleWords) {
        const test = titleLine ? `${titleLine} ${word}` : word
        if (ctx.measureText(test).width > 680 && titleLine) {
          titleLines.push(titleLine)
          titleLine = word
        } else {
          titleLine = test
        }
      }
      if (titleLine) titleLines.push(titleLine)
      const titleStartY = 518
      titleLines.slice(0, 2).forEach((l, i) => ctx.fillText(l, cx, titleStartY + i * 44))
      const titleBottom = titleStartY + Math.min(titleLines.length, 2) * 44

      // Three diamonds — centred
      const diamondY = titleBottom + 44
      ;[-18, 0, 18].forEach((offset, i) => {
        ctx.save()
        ctx.translate(cx + offset, diamondY)
        ctx.rotate(Math.PI / 4)
        const size = i === 1 ? 7 : 5.5
        ctx.fillStyle = i === 1 ? 'rgba(237,81,142,0.28)' : 'rgba(153,86,159,0.22)'
        ctx.fillRect(-size / 2, -size / 2, size, size)
        ctx.restore()
      })

      // ── SIGNATURE — centred ───────────────────────────────────────────────────
      const sigY = diamondY + 52

      ctx.fillStyle     = 'rgba(153,86,159,0.55)'
      ctx.font          = '600 10px Poppins, sans-serif'
      ctx.letterSpacing = '2px'
      ctx.fillText('AUTHORISED BY', cx, sigY)
      ctx.letterSpacing = '0px'

      ctx.fillStyle = '#12133C'
      ctx.font      = 'italic 30px Cormorant Upright, Georgia, serif'
      ctx.fillText('Petra', cx, sigY + 34)

      ctx.strokeStyle = 'rgba(153,86,159,0.3)'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(cx - 50, sigY + 48)
      ctx.lineTo(cx + 50, sigY + 48)
      ctx.stroke()

      ctx.fillStyle = 'rgba(100,100,120,0.5)'
      ctx.font      = '400 12px Poppins, sans-serif'
      ctx.fillText('Founder, Petra Designs Academy', cx, sigY + 64)

      // ── OUTER BORDER ──────────────────────────────────────────────────────────
      ctx.strokeStyle = 'rgba(153,86,159,0.15)'
      ctx.lineWidth   = 1
      ctx.strokeRect(18, 18, W - 36, H - 36)

      // ── CORNER ACCENTS ────────────────────────────────────────────────────────
      ctx.strokeStyle = '#99569F'
      ctx.lineWidth   = 2
      ctx.globalAlpha = 0.6
      const cs = 18, ci = 18
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
      ctx.globalAlpha = 1

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