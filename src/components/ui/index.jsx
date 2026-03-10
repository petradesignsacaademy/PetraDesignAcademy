import { forwardRef } from 'react'

/* ─── Button ─────────────────────────────────────────────────────────────────── */
const buttonStyles = {
  base: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer',
    border: 'none', borderRadius: 'var(--radius-full)', transition: 'all 0.2s',
    whiteSpace: 'nowrap', letterSpacing: '0.2px',
  },
  sizes: {
    sm:  { fontSize: 12, padding: '7px 16px'  },
    md:  { fontSize: 14, padding: '11px 24px' },
    lg:  { fontSize: 15, padding: '14px 32px' },
  },
  variants: {
    primary: { background: 'linear-gradient(135deg, var(--purple), var(--pink))', color: '#fff' },
    ghost:   { background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text2)' },
    navy:    { background: 'var(--navy)', color: '#fff' },
    danger:  { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' },
    success: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' },
  },
}

export function Button({
  children, variant = 'primary', size = 'md',
  fullWidth = false, disabled = false, onClick, style = {}, type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...buttonStyles.base,
        ...buttonStyles.sizes[size],
        ...buttonStyles.variants[variant],
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

/* ─── Card ───────────────────────────────────────────────────────────────────── */
export function Card({ children, style = {}, hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: hover ? 'transform 0.25s ease, box-shadow 0.25s ease' : undefined,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(153,86,159,0.2)'
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      } : undefined}
    >
      {children}
    </div>
  )
}

/* ─── Input ──────────────────────────────────────────────────────────────────── */
export const Input = forwardRef(function Input(
  { label, error, type = 'text', placeholder, value, onChange, style = {}, disabled = false },
  ref
) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-body)' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          background: 'var(--surface)',
          border: `1.5px solid ${error ? 'var(--pink)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '11px 16px',
          fontSize: 14,
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
          outline: 'none',
          transition: 'border-color 0.2s',
          width: '100%',
          ...style,
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--purple)' }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--pink)' : 'var(--border)' }}
      />
      {error && (
        <span style={{ fontSize: 12, color: 'var(--pink)', fontFamily: 'var(--font-body)' }}>{error}</span>
      )}
    </div>
  )
})

/* ─── Textarea ───────────────────────────────────────────────────────────────── */
export function Textarea({ label, error, placeholder, value, onChange, rows = 4, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-body)' }}>
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        style={{
          background: 'var(--surface)',
          border: `1.5px solid ${error ? 'var(--pink)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '11px 16px',
          fontSize: 14,
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
          outline: 'none',
          resize: 'vertical',
          transition: 'border-color 0.2s',
          width: '100%',
          lineHeight: 1.6,
          ...style,
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--purple)' }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--pink)' : 'var(--border)' }}
      />
      {error && (
        <span style={{ fontSize: 12, color: 'var(--pink)', fontFamily: 'var(--font-body)' }}>{error}</span>
      )}
    </div>
  )
}

/* ─── Tag / Badge ────────────────────────────────────────────────────────────── */
const tagColors = {
  purple: { bg: 'rgba(153,86,159,0.12)',  color: 'var(--purple)' },
  blue:   { bg: 'rgba(71,198,235,0.12)',  color: 'var(--blue)'   },
  pink:   { bg: 'rgba(237,81,142,0.12)',  color: 'var(--pink)'   },
  amber:  { bg: 'rgba(249,165,52,0.12)',  color: 'var(--amber)'  },
  green:  { bg: 'rgba(34,197,94,0.12)',   color: '#22C55E'       },
  gray:   { bg: 'var(--bg3)',             color: 'var(--text3)'  },
  navy:   { bg: 'rgba(18,19,60,0.08)',    color: 'var(--navy)'   },
}

export function Tag({ children, color = 'purple', style = {} }) {
  const c = tagColors[color] || tagColors.purple
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 12px',
      borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.5px', fontFamily: 'var(--font-body)',
      background: c.bg, color: c.color, ...style,
    }}>
      {children}
    </span>
  )
}

/* ─── Avatar ─────────────────────────────────────────────────────────────────── */
export function Avatar({ name = '', src, size = 36, style = {} }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div style={{
      width: size, height: size, borderRadius: size > 48 ? 'var(--radius-lg)' : 12,
      background: 'linear-gradient(135deg, var(--purple), var(--pink))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden', ...style,
    }}>
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: '#fff', fontWeight: 700, fontSize: size * 0.35, fontFamily: 'var(--font-body)' }}>{initials}</span>
      }
    </div>
  )
}

/* ─── Progress Bar ───────────────────────────────────────────────────────────── */
export function ProgressBar({ value = 0, height = 6, color, style = {} }) {
  return (
    <div className="progress-track" style={{ height, ...style }}>
      <div
        className="progress-fill"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: color || undefined,
        }}
      />
    </div>
  )
}

/* ─── Modal ──────────────────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 200, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)', width: '100%', maxWidth: width,
          padding: 32, boxShadow: 'var(--shadow-lg)',
          animation: 'fadeUp 0.25s ease both',
        }}
      >
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--text)' }}>{title}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text3)', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

/* ─── Empty State ────────────────────────────────────────────────────────────── */
export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>{title}</h3>
      {message && <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: action ? 24 : 0 }}>{message}</p>}
      {action}
    </div>
  )
}

/* ─── Divider ────────────────────────────────────────────────────────────────── */
export function Divider({ style = {} }) {
  return <div style={{ height: 1, background: 'var(--border)', margin: '24px 0', ...style }} />
}
