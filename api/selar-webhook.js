import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://arizznwyilssuihycbjw.supabase.co'
const SITE_URL = 'https://petradesigns.org'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body

    // Selar webhook payload shape: { customer: { email, name }, reference, total }
    const email = body?.customer?.email?.trim().toLowerCase()
    const name  = body?.customer?.name?.trim() || ''
    const amount    = parseInt(body?.total ?? body?.amount ?? 25000, 10)
    const reference = body?.reference ?? body?.order_reference ?? ''

    if (!email) {
      console.error('[selar-webhook] No email in payload:', JSON.stringify(body))
      return res.status(400).json({ error: 'No email in payload' })
    }

    console.log(`[selar-webhook] Purchase for: ${email}`)

    const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // ── Step 1: check if this person already has an account ──────────────
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('email', email)
      .maybeSingle()

    let userId = null

    if (existingProfile) {
      // Already registered manually — just approve them
      userId = existingProfile.id
      await supabase
        .from('profiles')
        .update({ status: 'approved', full_name: existingProfile.full_name || name })
        .eq('id', userId)
      console.log(`[selar-webhook] Approved existing student: ${email}`)
    } else {
      // Brand new student — invite them via Supabase (sends invite email automatically)
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        email,
        {
          data: { full_name: name },
          redirectTo: `${SITE_URL}/login`,
        }
      )

      if (inviteError) {
        // Could be "User already registered" — find them via auth
        if (inviteError.message?.toLowerCase().includes('already')) {
          const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
          const match = users?.find(u => u.email?.toLowerCase() === email)
          if (match) {
            userId = match.id
            // Create missing profile and approve
            await supabase.from('profiles').upsert({
              id: userId, email, full_name: name, role: 'student', status: 'approved',
            }, { onConflict: 'id' })
            console.log(`[selar-webhook] Found existing auth user, approved: ${email}`)
          } else {
            console.error('[selar-webhook] Invite error (no match):', inviteError.message)
            return res.status(500).json({ error: 'Could not create user' })
          }
        } else {
          console.error('[selar-webhook] Invite error:', inviteError.message)
          return res.status(500).json({ error: 'Failed to invite user' })
        }
      } else {
        userId = inviteData?.user?.id
        // Create their profile straight away
        await supabase.from('profiles').upsert({
          id: userId, email, full_name: name, role: 'student', status: 'approved',
        }, { onConflict: 'id' })
        console.log(`[selar-webhook] Invited new student: ${email}`)
      }
    }

    // ── Step 2: record the payment ────────────────────────────────────────
    if (userId) {
      await supabase.from('payments').insert({
        user_id: userId,
        email,
        amount,
        currency: 'NGN',
        reference,
        provider: 'selar',
        status: 'succeeded',
      })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[selar-webhook] Unhandled error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}