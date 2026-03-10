import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

// ── Modules data — update titles when Notion content is ready ─────────────────
const modules = [
  { id: 1, title: 'Typography Foundations',  lessons: 6, color: '#99569F', icon: '✦' },
  { id: 2, title: 'Colour Theory',            lessons: 5, color: '#47C6EB', icon: '◈' },
  { id: 3, title: 'Layout & Composition',     lessons: 7, color: '#ED518E', icon: '▣' },
  { id: 4, title: 'Brand Identity Design',    lessons: 8, color: '#F9A534', icon: '◆' },
]

// ── Reusable animated section wrapper ─────────────────────────────────────────
function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 40) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 48px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'var(--bg2)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Replace the div below with <img src="/logo.png" /> when logo is ready */}
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #99569F, #ED518E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, fontFamily: 'Cormorant Upright, serif' }}>P</span>
          </div>
          <span style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>Petra Designs</span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {['Course', 'How it works', 'About'].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(/ /g, '-')}`} style={{ padding: '6px 16px', fontSize: 13, fontWeight: 500, color: 'var(--text2)', textDecoration: 'none', borderRadius: 999, fontFamily: 'Poppins, sans-serif', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--purple)'}
              onMouseLeave={e => e.target.style.color = 'var(--text2)'}
            >{label}</a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggleTheme} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 13px', cursor: 'pointer', color: 'var(--text2)', fontSize: 13, fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/login" style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none', fontFamily: 'Poppins, sans-serif', border: '1.5px solid var(--border)', borderRadius: 999, transition: 'all 0.2s' }}>
            Sign in
          </Link>
          <Link to="/register" style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #99569F, #ED518E)', borderRadius: 999, transition: 'opacity 0.2s' }}>
            Request access
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 48px 80px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>

        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(153,86,159,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(71,198,235,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(237,81,142,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />

        {/* Badge */}
        <div style={{ opacity: 0, animation: 'fadeUp 0.6s 0.1s ease forwards', marginBottom: 24 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(153,86,159,0.1)', border: '1px solid rgba(153,86,159,0.25)', color: '#99569F', padding: '6px 18px', borderRadius: 999, fontSize: 12, fontWeight: 700, fontFamily: 'Poppins, sans-serif', letterSpacing: 1 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#99569F', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
            NOW ENROLLING — LIMITED SPOTS
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ opacity: 0, animation: 'fadeUp 0.7s 0.2s ease forwards', fontFamily: 'Cormorant Upright, serif', fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 700, lineHeight: 1.0, color: 'var(--text)', marginBottom: 12, maxWidth: 900, letterSpacing: '-1px' }}>
          Learn graphic design<br />
          <span style={{ fontStyle: 'italic', background: 'linear-gradient(135deg, #99569F, #ED518E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            the right way.
          </span>
        </h1>

        {/* Sub */}
        <p style={{ opacity: 0, animation: 'fadeUp 0.7s 0.35s ease forwards', fontFamily: 'Poppins, sans-serif', fontSize: 18, color: 'var(--text2)', maxWidth: 540, lineHeight: 1.75, marginBottom: 40, fontWeight: 400 }}>
          A structured, premium course experience for complete beginners to intermediate designers — built by Petra, for serious creatives.
        </p>

        {/* CTAs */}
        <div style={{ opacity: 0, animation: 'fadeUp 0.7s 0.45s ease forwards', display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', padding: '15px 36px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 32px rgba(153,86,159,0.35)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(153,86,159,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(153,86,159,0.35)' }}
          >
            Request access →
          </Link>
          <a href="#course" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface)', color: 'var(--text2)', padding: '15px 36px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1.5px solid var(--border)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#99569F'; e.currentTarget.style.color = '#99569F' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}
          >
            Preview the course
          </a>
        </div>

        {/* Stats bar */}
        <div style={{ opacity: 0, animation: 'fadeUp 0.7s 0.55s ease forwards', display: 'flex', gap: 0, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
          {[
            ['248+', 'Students enrolled'],
            ['4', 'Course modules'],
            ['26+', 'Video lessons'],
            ['100%', 'Personal feedback'],
          ].map(([val, label], i) => (
            <div key={i} style={{ padding: '0 40px', borderRight: i < 3 ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 36, fontWeight: 700, color: 'var(--text)' }}>{val}</div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COURSE MODULES ─────────────────────────────────────────────────── */}
      <section id="course" style={{ padding: '100px 48px', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--purple)' }}>THE CURRICULUM</span>
              <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 54, fontWeight: 700, color: 'var(--text)', marginTop: 12, lineHeight: 1.1 }}>
                What you'll <span style={{ fontStyle: 'italic' }}>master</span>
              </h2>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 15, marginTop: 16, maxWidth: 480, margin: '16px auto 0' }}>
                Four carefully structured modules taking you from foundations to full brand identity design.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {modules.map((m, i) => (
              <FadeIn key={m.id} delay={i * 80}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${m.color}20` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  {/* Coloured top strip */}
                  <div style={{ background: `linear-gradient(135deg, ${m.color}22, ${m.color}08)`, borderBottom: `1px solid ${m.color}20`, padding: '28px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--text3)', marginBottom: 10 }}>MODULE {m.id}</div>
                      <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>{m.title}</h3>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: m.color, flexShrink: 0 }}>
                      {m.icon}
                    </div>
                  </div>
                  {/* Bottom info */}
                  <div style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontFamily: 'Poppins, sans-serif', color: 'var(--text3)' }}>🎬 {m.lessons} video lessons</span>
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 700, color: m.color, background: `${m.color}12`, padding: '4px 12px', borderRadius: 999 }}>
                      + PDF resources
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--pink)' }}>THE EXPERIENCE</span>
              <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 54, fontWeight: 700, color: 'var(--text)', marginTop: 12, lineHeight: 1.1 }}>
                Structured like the<br /><span style={{ fontStyle: 'italic', color: 'var(--purple)' }}>world's best platforms.</span>
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { icon: '🎬', title: 'Video lesson', desc: 'Every lesson is a professional video — watch at your own pace, pause, rewind, rewatch as many times as you need.', color: '#99569F' },
              { icon: '📄', title: 'PDF resources', desc: 'Each lesson comes with downloadable PDF notes, worksheets, and task briefs. Yours to keep forever.', color: '#47C6EB' },
              { icon: '✏️', title: 'Practical task', desc: 'Every module has a real design assignment. You submit your work directly on the platform and Petra personally reviews it.', color: '#ED518E' },
              { icon: '🏆', title: 'Certificate', desc: 'Complete the full course and receive a Petra Designs certificate of completion — proof of your new skills.', color: '#F9A534' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px', height: '100%', transition: 'transform 0.25s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: `${item.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>{item.icon}</div>
                  <h4 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{item.title}</h4>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)', lineHeight: 1.75 }}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT PETRA ────────────────────────────────────────────────────── */}
      <section id="about" style={{ padding: '100px 48px', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <FadeIn>
  <img
    src="/petra-photo.jpg"
    alt="Petra"
    style={{
      width: '100%',
      height: '560px',
      borderRadius: 28,
      objectFit: 'cover',
      objectPosition: 'top',
      display: 'block',
    }}
  />
</FadeIn>

          <FadeIn delay={150}>
            <div>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--amber)' }}>YOUR INSTRUCTOR</span>
              <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 52, fontWeight: 700, color: 'var(--text)', marginTop: 12, marginBottom: 20, lineHeight: 1.1 }}>
                Meet <span style={{ fontStyle: 'italic', color: 'var(--purple)' }}>Petra</span>
              </h2>
              {/* Replace this placeholder text with Petra's real bio */}
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--text2)', lineHeight: 1.85, marginBottom: 16 }}>
                Petra is a professional graphic designer with years of experience creating visual identities, brand systems, and design that communicates — not just decorates.
              </p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--text2)', lineHeight: 1.85, marginBottom: 32 }}>
                This course is everything she wishes she'd had when starting out — structured, honest, and focused on building real skills that get results.
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                {[['248+', 'Students taught'], ['4.9★', 'Average rating'], ['100%', 'Personal feedback']].map(([val, label]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{val}</div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TESTIMONIALS (placeholder) ──────────────────────────────────────── */}
      <section style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--blue)' }}>STUDENT STORIES</span>
              <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 54, fontWeight: 700, color: 'var(--text)', marginTop: 12 }}>
                What students <span style={{ fontStyle: 'italic' }}>say</span>
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { name: 'Amara O.', quote: 'This course completely changed how I approach design. The feedback from Petra is genuinely invaluable.', role: 'Graphic Design Student' },
              { name: 'Tunde A.', quote: 'I went from knowing nothing about typography to confidently designing brand identities. Highly recommend.', role: 'Freelance Designer' },
              { name: 'Jess L.', quote: "The structure is unlike anything I've seen. Every lesson builds on the last — it genuinely makes sense.", role: 'Marketing Professional' },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 28px 24px', position: 'relative' }}>
                  <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 60, color: 'var(--purple)', opacity: 0.2, lineHeight: 1, position: 'absolute', top: 16, left: 24 }}>"</div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 24, position: 'relative', paddingTop: 16 }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #99569F, #ED518E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'Poppins, sans-serif', flexShrink: 0 }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{t.name}</div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 48px 100px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ background: 'linear-gradient(135deg, #12133C 0%, #2D1060 50%, #12133C 100%)', borderRadius: 32, padding: '72px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(153,86,159,0.2)' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(71,198,235,0.1)' }} />
              <div style={{ position: 'relative' }}>
                <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 56, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
                  Ready to start<br /><span style={{ fontStyle: 'italic', color: '#ED518E' }}>your design journey?</span>
                </h2>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 36, lineHeight: 1.7 }}>
                  Enrollment is by approval only. Request your spot — Petra reviews every application personally.
                </p>
                <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', padding: '16px 40px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 32px rgba(237,81,142,0.35)' }}>
                  Request access →
                </Link>
                <p style={{ marginTop: 20, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                  Already approved? <Link to="/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600 }}>Sign in here</Link>
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #99569F, #ED518E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 14, fontFamily: 'Cormorant Upright, serif' }}>P</span>
          </div>
          <span style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 17, fontWeight: 600, color: 'var(--text2)' }}>Petra Designs</span>
        </div>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>
          © {new Date().getFullYear()} Petra Designs. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/login" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)', textDecoration: 'none' }}>Sign in</Link>
          <Link to="/register" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>Request access</Link>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}
