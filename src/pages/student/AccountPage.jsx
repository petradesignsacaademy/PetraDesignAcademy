import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import StudentLayout from '../../components/layout/StudentLayout'

export default function AccountPage() {
  const { profile, user, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Password change
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass]         = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg]         = useState('')
  const [passError, setPassError]     = useState('')

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)
    if (err) { setError('Failed to save. Please try again.'); setSaving(false); return }
    await refreshProfile()
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  async function changePassword(e) {
    e.preventDefault()
    setPassError('')
    setPassMsg('')
    if (newPass.length < 8) { setPassError('New password must be at least 8 characters.'); return }
    if (newPass !== confirmPass) { setPassError('Passwords do not match.'); return }
    setPassLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password: newPass })
    if (err) { setPassError(err.message); setPassLoading(false); return }
    setPassMsg('Password updated successfully.')
    setCurrentPass(''); setNewPass(''); setConfirmPass('')
    setPassLoading(false)
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)',
    borderRadius: 12, padding: '12px 16px', fontSize: 14, color: 'var(--text)',
    fontFamily: 'Poppins, sans-serif', outline: 'none', boxSizing: 'border-box',
  }

  const initial = (profile?.full_name || user?.email || 'U')[0].toUpperCase()

  return (
    <StudentLayout>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 32px' }} className="page-wrap">

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>My Account</h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Manage your profile and password.</p>
        </div>

        {/* Avatar + name display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 28px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #99569F, #ED518E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontFamily: 'Cormorant Upright, serif', fontSize: 32, fontWeight: 700 }}>{initial}</span>
          </div>
          <div>
            <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>{profile?.full_name || 'Student'}</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{user?.email}</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
                ✓ Approved Student
              </span>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Profile Information</h2>
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Full name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#99569F'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Email address</label>
              <input value={user?.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>Email cannot be changed. Contact Petra if needed.</span>
            </div>
            {error && <div style={{ background: 'rgba(237,81,142,0.08)', border: '1px solid rgba(237,81,142,0.25)', borderRadius: 10, padding: '10px 14px', color: '#ED518E', fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>⚠️ {error}</div>}
            <button type="submit" disabled={saving} style={{ background: saved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg, #99569F, #ED518E)', color: saved ? '#22C55E' : '#fff', border: 'none', borderRadius: 999, padding: '12px 28px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', transition: 'all 0.2s' }}>
              {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Password form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Change Password</h2>
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>New password</label>
              <input type="password" placeholder="Minimum 8 characters" value={newPass} onChange={e => setNewPass(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#99569F'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Confirm new password</label>
              <input type="password" placeholder="Repeat new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#99569F'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            {passError && <div style={{ background: 'rgba(237,81,142,0.08)', border: '1px solid rgba(237,81,142,0.25)', borderRadius: 10, padding: '10px 14px', color: '#ED518E', fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>⚠️ {passError}</div>}
            {passMsg  && <div style={{ background: 'rgba(34,197,94,0.08)',  border: '1px solid rgba(34,197,94,0.25)',  borderRadius: 10, padding: '10px 14px', color: '#22C55E',  fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>✓ {passMsg}</div>}
            <button type="submit" disabled={passLoading} style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 999, padding: '12px 28px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, cursor: passLoading ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
              {passLoading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .page-wrap { padding: 24px 16px !important; } }`}</style>
    </StudentLayout>
  )
}
