import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import StudentLayout from '../../components/layout/StudentLayout'

function Avatar({ name, size = 36 }) {
  const initial = (name || 'S')[0].toUpperCase()
  const colors = ['#99569F','#47C6EB','#ED518E','#F9A534','#12133C']
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color: '#fff', fontFamily: 'Cormorant Upright, serif', fontSize: size * 0.4, fontWeight: 700 }}>{initial}</span>
    </div>
  )
}

export default function CommunityPage() {
  const { user, profile } = useAuth()
  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [newPost, setNewPost]   = useState('')
  const [posting, setPosting]   = useState(false)
  const [replyTo, setReplyTo]   = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying]   = useState(false)

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('community_posts')
        .select(`*, profiles(full_name), community_replies(id, content, created_at, profiles(full_name))`)
        .eq('is_removed', false)
        .order('created_at', { ascending: false })
      setPosts(data || [])
    } catch (err) {
      console.error('[Community] loadPosts error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function submitPost(e) {
    e.preventDefault()
    if (!newPost.trim()) return
    setPosting(true)
    await supabase.from('community_posts').insert({ author_id: user.id, content: newPost.trim() })
    setNewPost('')
    setPosting(false)
    loadPosts()
  }

  async function submitReply(e, postId) {
    e.preventDefault()
    if (!replyText.trim()) return
    setReplying(true)
    await supabase.from('community_replies').insert({ post_id: postId, author_id: user.id, content: replyText.trim() })
    setReplyText('')
    setReplyTo(null)
    setReplying(false)
    loadPosts()
  }

  function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
    return `${Math.floor(diff/86400)}d ago`
  }

  return (
    <StudentLayout>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 32px' }} className="page-wrap">

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Community</h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Share, ask questions, and connect with fellow students.</p>
        </div>

        {/* New post box */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <Avatar name={profile?.full_name} size={40} />
            <form onSubmit={submitPost} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Share something with the community..."
                rows={3}
                style={{ width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: 'var(--text)', fontFamily: 'Poppins, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#99569F'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={posting || !newPost.trim()} style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 24px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: posting || !newPost.trim() ? 'not-allowed' : 'pointer', opacity: !newPost.trim() ? 0.5 : 1 }}>
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 28, color: 'var(--text)', marginBottom: 8 }}>Be the first to post</h3>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Start a conversation — ask a question, share a win, or introduce yourself!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {posts.map(post => (
              <div key={post.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}>
                {/* Post header */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <Avatar name={post.profiles?.full_name} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{post.profiles?.full_name || 'Student'}</span>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>{timeAgo(post.created_at)}</span>
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginTop: 6, marginBottom: 0 }}>{post.content}</p>
                  </div>
                </div>

                {/* Replies */}
                {post.community_replies?.length > 0 && (
                  <div style={{ marginLeft: 50, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {post.community_replies
                      .sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
                      .map(reply => (
                      <div key={reply.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--bg2)', borderRadius: 12, padding: '10px 14px' }}>
                        <Avatar name={reply.profiles?.full_name} size={28} />
                        <div>
                          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{reply.profiles?.full_name || 'Student'} </span>
                          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>{timeAgo(reply.created_at)}</span>
                          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginTop: 4, marginBottom: 0 }}>{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                <div style={{ marginLeft: 50 }}>
                  {replyTo === post.id ? (
                    <form onSubmit={e => submitReply(e, post.id)} style={{ display: 'flex', gap: 8 }}>
                      <input
                        autoFocus value={replyText} onChange={e => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        style={{ flex: 1, background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 999, padding: '8px 16px', fontSize: 13, color: 'var(--text)', fontFamily: 'Poppins, sans-serif', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#99569F'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                      <button type="submit" disabled={replying || !replyText.trim()} style={{ background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 999, padding: '8px 18px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                        {replying ? '...' : 'Reply'}
                      </button>
                      <button type="button" onClick={() => { setReplyTo(null); setReplyText('') }} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}>Cancel</button>
                    </form>
                  ) : (
                    <button onClick={() => setReplyTo(post.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '4px 0' }}>
                      💬 Reply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .page-wrap { padding: 24px 16px !important; } }
      `}</style>
    </StudentLayout>
  )
}
