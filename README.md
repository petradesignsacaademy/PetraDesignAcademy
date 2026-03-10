# Petra Designs — Course Platform

A custom-built, members-only graphic design learning platform. Built with React + Vite + Supabase.

## Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | React 18 + Vite             |
| Routing   | React Router v6             |
| Database  | Supabase (Postgres)         |
| Auth      | Supabase Auth               |
| Storage   | Supabase Storage (PDFs)     |
| Video     | YouTube Unlisted (embedded) |
| Hosting   | Vercel                      |
| Domain    | petradesigns.org            |

---

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI: Button, Card, Input, Modal, Tag, Avatar
│   ├── layout/       # Navbar, StudentLayout, AdminLayout
│   ├── student/      # Student-specific components
│   ├── admin/        # Admin-specific components
│   └── RouteGuards   # ProtectedRoute, AdminRoute, GuestRoute
├── context/
│   ├── AuthContext   # Session, user profile, isAdmin, isApproved
│   └── ThemeContext  # Dark/light mode, persisted to localStorage
├── hooks/            # Custom hooks (useProgress, useSubmissions, etc.)
├── lib/
│   └── supabase.js   # Supabase client
├── pages/
│   ├── LandingPage
│   ├── LoginPage
│   ├── RegisterPage
│   ├── PendingPage
│   ├── student/      # Dashboard, Course, Lesson, Assignments, Community, etc.
│   └── admin/        # Overview, Students, Courses, Assignments, Announcements, Revenue
└── styles/
    └── globals.css   # Design tokens, dark/light themes, base styles
```

---

## Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/petra-designs.git
cd petra-designs
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Fill in your Supabase URL and anon key from:
**Supabase Dashboard → Project Settings → API**

### 4. Set up the database
- Open your Supabase project
- Go to **SQL Editor**
- Paste and run the entire contents of `supabase_schema.sql`

### 5. Create Petra's admin account
- In Supabase Dashboard → **Authentication → Users** → Invite user
- Use Petra's email address
- After she accepts, run this in the SQL editor:
```sql
update public.profiles
set role = 'admin', status = 'approved'
where email = 'petra@petradesigns.org';
```

### 6. Run the dev server
```bash
npm run dev
```
Open http://localhost:5173

---

## Deployment (Vercel)

1. Push to GitHub
2. Go to vercel.com → New Project → Import repo
3. Add environment variables (same as .env)
4. Deploy

### Connecting petradesigns.org
1. In Vercel: Project Settings → Domains → Add `petradesigns.org`
2. In her domain registrar: update DNS records to Vercel's nameservers
3. Vercel handles SSL automatically

---

## User Roles

| Role    | Access                                      |
|---------|---------------------------------------------|
| `admin` | Full platform control via /admin            |
| `student` (approved) | Full student platform         |
| `student` (pending)  | Holding page only             |

---

## Key Design Decisions

- **Approval flow**: Students register → Petra approves via admin panel → they get access
- **No open sign-up**: All registrations are manually approved
- **Video hosting**: YouTube Unlisted — free, reliable, no hosting cost
- **Dark/light mode**: Stored in localStorage, applied via `data-theme` attribute on `<html>`
- **Payments**: Schema ready for Stripe/Paystack/Selar — provider TBC
