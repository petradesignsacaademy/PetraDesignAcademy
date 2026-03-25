import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'

const SELAR_URL = 'https://selar.com/2625473152'

const CATEGORIES = [
  { key: 'all',    label: 'All' },
  { key: 'brand',  label: 'Brand Identity' },
  { key: 'visual', label: 'Visual Design' },
  { key: 'print',  label: 'Print & Packaging' },
  { key: 'social', label: 'Social Media' },
  { key: 'event',  label: 'Events' },
  { key: 'web',    label: 'Website Design' },
]

const CAT_LABEL = {
  brand:  'Brand Identity',
  visual: 'Visual Design',
  print:  'Print & Packaging',
  social: 'Social Media',
  event:  'Events',
  web:    'Website Design',
}

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

export default function PortfolioPage() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [projects,     setProjects]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [lightbox,     setLightbox]     = useState(null) // { project, imageIdx }

  useEffect(() => {
    loadProjects()
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!lightbox) return
    function handler(e) {
      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowRight') {
        const imgs = getImages(lightbox.project)
        if (imgs.length > 1) setLightbox(l => ({ ...l, imageIdx: (l.imageIdx + 1) % imgs.length }))
      } else if (e.key === 'ArrowLeft') {
        const imgs = getImages(lightbox.project)
        if (imgs.length > 1) setLightbox(l => ({ ...l, imageIdx: (l.imageIdx - 1 + imgs.length) % imgs.length }))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  async function loadProjects() {
    try {
      const { data } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      setProjects(data || [])
    } catch (err) {
      console.error('[Portfolio]', err)
    } finally {
      setLoading(false)
    }
  }

  function getImages(project) {
    return [project.cover_url, ...(project.images || [])].filter(Boolean)
  }

  function openLightbox(project) {
    setLightbox({ project, imageIdx: 0 })
    document.body.style.overflow = 'hidden'
  }

  function closeLightbox() {
    setLightbox(null)
    document.body.style.overflow = ''
  }

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter(p => p.category === activeFilter)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 40px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled || menuOpen ? 'var(--bg2)' : 'transparent',
        borderBottom: scrolled || menuOpen ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }} onClick={() => setMenuOpen(false)}>
          <img src="/logo.png" alt="Petra Designs" style={{ height: 36, width: 'auto', objectFit: 'contain', filter: theme === 'dark' ? 'brightness(1)' : 'brightness(0) saturate(100%) invert(11%) sepia(45%) saturate(900%) hue-rotate(210deg) brightness(95%)' }} />
        </Link>

        <div className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link to="/portfolio" style={{ padding: '6px 16px', fontSize: 13, fontWeight: 700, color: 'var(--purple)', textDecoration: 'none', borderRadius: 999, fontFamily: 'Poppins, sans-serif' }}>Portfolio</Link>
          <a href="/#course" style={{ padding: '6px 16px', fontSize: 13, fontWeight: 500, color: 'var(--text2)', textDecoration: 'none', borderRadius: 999, fontFamily: 'Poppins, sans-serif', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='var(--purple)'} onMouseLeave={e => e.target.style.color='var(--text2)'}>Course</a>
          <a href="/#how-it-works" style={{ padding: '6px 16px', fontSize: 13, fontWeight: 500, color: 'var(--text2)', textDecoration: 'none', borderRadius: 999, fontFamily: 'Poppins, sans-serif', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='var(--purple)'} onMouseLeave={e => e.target.style.color='var(--text2)'}>How it works</a>
          <a href="/#about" style={{ padding: '6px 16px', fontSize: 13, fontWeight: 500, color: 'var(--text2)', textDecoration: 'none', borderRadius: 999, fontFamily: 'Poppins, sans-serif', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='var(--purple)'} onMouseLeave={e => e.target.style.color='var(--text2)'}>About</a>
        </div>

        <div className="landing-nav-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggleTheme} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 13px', cursor: 'pointer', color: 'var(--text2)', fontSize: 13, fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/login" style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none', fontFamily: 'Poppins, sans-serif', border: '1.5px solid var(--border)', borderRadius: 999, transition: 'all 0.2s' }}>Sign in</Link>
          <a href={SELAR_URL} target="_blank" rel="noopener noreferrer" style={{ padding: '9px 22px', fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #99569F, #ED518E)', borderRadius: 999 }}>Enroll — ₦25,000</a>
        </div>

        <button className="landing-nav-hamburger" onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.25s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'opacity 0.25s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.25s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 68, left: 0, right: 0, zIndex: 199, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '16px 20px 24px', animation: 'slideDown 0.22s ease' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            <Link to="/portfolio" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '13px 16px', borderRadius: 12, fontSize: 15, fontWeight: 700, color: 'var(--purple)', textDecoration: 'none', fontFamily: 'Poppins, sans-serif' }}>Portfolio</Link>
            {[['Course', '/#course'], ['How it works', '/#how-it-works'], ['About', '/#about']].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '13px 16px', borderRadius: 12, fontSize: 15, fontWeight: 600, color: 'var(--text)', textDecoration: 'none', fontFamily: 'Poppins, sans-serif' }}>{label}</a>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <button onClick={() => { toggleTheme(); setMenuOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif', textAlign: 'left' }}>
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span> {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <Link to="/login" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none', border: '1.5px solid var(--border)', fontFamily: 'Poppins, sans-serif' }}>Sign in</Link>
            <a href={SELAR_URL} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg, #99569F, #ED518E)', fontFamily: 'Poppins, sans-serif' }}>Enroll Now — ₦25,000 →</a>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ paddingTop: 'clamp(100px, 14vw, 140px)', paddingBottom: 'clamp(48px, 6vw, 64px)', paddingLeft: 'clamp(20px, 5vw, 48px)', paddingRight: 'clamp(20px, 5vw, 48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(153,86,159,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(237,81,142,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ opacity: 0, animation: 'fadeUp 0.6s 0.1s ease forwards' }}>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--text3)' }}>SELECTED WORK</span>
        </div>
        <h1 style={{ opacity: 0, animation: 'fadeUp 0.7s 0.2s ease forwards', fontFamily: 'Cormorant Upright, serif', fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: 700, lineHeight: 1.05, color: 'var(--text)', marginTop: 12, marginBottom: 16 }}>
          Petra's <span style={{ fontStyle: 'italic', color: 'var(--purple)' }}>Portfolio</span>
        </h1>
        <p style={{ opacity: 0, animation: 'fadeUp 0.7s 0.35s ease forwards', fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(14px, 2vw, 17px)', color: 'var(--text2)', maxWidth: 520, lineHeight: 1.75, margin: '0 auto', fontWeight: 400 }}>
          A curated look at brand identities, visual systems, and design work crafted for real clients.
        </p>
      </section>

      {/* ── FILTER BAR ── */}
      <div style={{ padding: '0 clamp(20px, 5vw, 48px)', marginBottom: 'clamp(24px, 4vw, 40px)' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="filter-bar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveFilter(cat.key)}
              style={{
                background: activeFilter === cat.key ? 'linear-gradient(135deg, #99569F, #ED518E)' : 'var(--surface)',
                color:      activeFilter === cat.key ? '#fff' : 'var(--text2)',
                border:     activeFilter === cat.key ? 'none' : '1.5px solid var(--border)',
                borderRadius: 999,
                padding:   '9px 20px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize:   13,
                cursor:     'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >{cat.label}</button>
          ))}
        </div>
      </div>

      {/* ── PROJECT GRID ── */}
      <section style={{ padding: '0 clamp(20px, 5vw, 48px)', paddingBottom: 'clamp(60px, 10vw, 100px)', minHeight: '40vh' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'clamp(60px, 10vw, 100px) 0' }}>
            <p style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 36, fontStyle: 'italic', color: 'var(--text3)' }}>Portfolio coming soon.</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text3)', marginTop: 8 }}>Check back soon — new work is being added.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="portfolio-grid">
            {filtered.map((project, i) => (
              <FadeIn key={project.id} delay={i * 50}>
                <div
                  onClick={() => openLightbox(project)}
                  className="portfolio-card"
                  style={{
                    background:    'var(--surface)',
                    border:        '1px solid var(--border)',
                    borderRadius:  20,
                    overflow:      'hidden',
                    cursor:        'pointer',
                    transition:    'transform 0.25s, box-shadow 0.25s',
                    gridColumn:    project.is_featured ? 'span 2' : 'span 1',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'none' }}
                >
                  {/* Cover */}
                  <div style={{ position: 'relative', aspectRatio: project.is_featured ? '16/7' : '4/3', background: 'var(--bg3)', overflow: 'hidden' }}>
                    {project.cover_url ? (
                      <img
                        src={project.cover_url}
                        alt={project.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #12133C, #2D1060)' }}>
                        <span style={{ fontSize: 40, opacity: 0.25 }}>🖼️</span>
                      </div>
                    )}
                    <div className="card-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,13,38,0.45) 0%, transparent 60%)', opacity: 0, transition: 'opacity 0.3s' }} />
                  </div>
                  {/* Footer */}
                  <div style={{ padding: '14px 18px 18px' }}>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--purple)', marginBottom: 5 }}>{CAT_LABEL[project.category] || project.category}</div>
                    <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{project.title}</div>
                    {project.year && <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{project.year}</div>}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: 'clamp(24px, 4vw, 32px) clamp(20px, 5vw, 48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <img src="/logo.png" alt="Petra Designs" style={{ height: 28, width: 'auto', opacity: 0.7 }} />
        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>
          © {new Date().getFullYear()} Petra Designs. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/portfolio" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>Portfolio</Link>
          <Link to="/login" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)', textDecoration: 'none' }}>Sign in</Link>
          <a href={SELAR_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>Enroll now</a>
        </div>
      </footer>

      {/* ── LIGHTBOX ── */}
      {lightbox && (() => {
        const { project, imageIdx } = lightbox
        const images = getImages(project)
        const currentImage = images[imageIdx]
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(12,13,38,0.95)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fadeIn 0.2s ease' }}
            onClick={closeLightbox}
          >
            <div
              style={{ display: 'flex', width: '100%', maxWidth: 1160, maxHeight: '92vh', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}
              className="lightbox-inner"
            >
              {/* Image panel */}
              <div style={{ flex: '0 0 60%', background: '#07081a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 400 }} className="lightbox-img-panel">
                {currentImage ? (
                  <img src={currentImage} alt={project.title} style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', display: 'block' }} />
                ) : (
                  <div style={{ opacity: 0.2, textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🖼️</div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#fff' }}>No images</p>
                  </div>
                )}

                {/* Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => { const imgs = getImages(lightbox.project); setLightbox(l => ({ ...l, imageIdx: (l.imageIdx - 1 + imgs.length) % imgs.length })) }}
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', lineHeight: 1 }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#99569F,#ED518E)'; e.currentTarget.style.border = 'none' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)' }}
                    >‹</button>
                    <button
                      onClick={() => { const imgs = getImages(lightbox.project); setLightbox(l => ({ ...l, imageIdx: (l.imageIdx + 1) % imgs.length })) }}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', lineHeight: 1 }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#99569F,#ED518E)'; e.currentTarget.style.border = 'none' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)' }}
                    >›</button>
                    {/* Dots */}
                    <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                      {images.map((_, i) => (
                        <div key={i} onClick={() => setLightbox(l => ({ ...l, imageIdx: i }))}
                          style={{ height: 6, width: i === imageIdx ? 20 : 6, borderRadius: 999, background: i === imageIdx ? 'linear-gradient(135deg,#99569F,#ED518E)' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.3s' }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Info panel */}
              <div style={{ flex: '0 0 40%', background: 'var(--bg2)', padding: '40px 36px', display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto' }} className="lightbox-info-panel">
                {/* Close */}
                <button
                  onClick={closeLightbox}
                  style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text3)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >✕</button>

                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: 'var(--purple)', marginBottom: 12 }}>
                    {CAT_LABEL[project.category] || project.category}
                  </div>
                  <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: 8 }}>{project.title}</h2>
                  {project.year && (
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>{project.year}</div>
                  )}
                  <div style={{ width: 40, height: 2, background: 'var(--purple)', borderRadius: 999, marginBottom: 20 }} />
                  {project.description && (
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text2)', lineHeight: 1.85, fontWeight: 300 }}>{project.description}</p>
                  )}
                  {images.length > 1 && (
                    <div style={{ marginTop: 20, fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>{images.length} images · use arrow keys to navigate</div>
                  )}
                </div>

                {project.website_url && (
                  <a
                    href={project.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', width: '100%', marginTop: 28, background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', textAlign: 'center', padding: '13px 20px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxSizing: 'border-box' }}
                  >Visit Website →</a>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      <style>{`
        @keyframes fadeUp    { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .portfolio-card:hover .card-overlay { opacity: 1 !important; }
        .filter-bar::-webkit-scrollbar { display: none; }
        @media (max-width: 960px) {
          .portfolio-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .portfolio-grid .portfolio-card { grid-column: span 1 !important; }
        }
        @media (max-width: 580px) {
          .portfolio-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .landing-nav-links     { display: none !important; }
          .landing-nav-right     { display: none !important; }
          .landing-nav-hamburger { display: flex !important; }
          .lightbox-inner        { flex-direction: column !important; border-radius: 20px !important; max-height: 95vh; overflow-y: auto; }
          .lightbox-img-panel    { min-height: 55vmin !important; flex: none !important; }
          .lightbox-info-panel   { flex: none !important; }
        }
      `}</style>
    </div>
  )
}