-- ═══════════════════════════════════════════════════════════════════════
-- PETRA DESIGNS — Supabase Database Schema
-- Run this entire file in your Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PROFILES ─────────────────────────────────────────────────────────────────
-- One row per auth user. role = 'admin' | 'student'. status = 'pending' | 'approved' | 'suspended'
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text not null,
  avatar_url   text,
  role         text not null default 'student' check (role in ('admin', 'student')),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'suspended')),
  bio          text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New Student'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── COURSES ──────────────────────────────────────────────────────────────────
create table public.courses (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  slug         text not null unique,
  description  text,
  thumbnail_url text,
  is_published boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── MODULES ──────────────────────────────────────────────────────────────────
create table public.modules (
  id           uuid primary key default uuid_generate_v4(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  title        text not null,
  description  text,
  sort_order   int not null default 0,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── LESSONS ──────────────────────────────────────────────────────────────────
create table public.lessons (
  id              uuid primary key default uuid_generate_v4(),
  module_id       uuid not null references public.modules(id) on delete cascade,
  title           text not null,
  description     text,
  video_url       text,          -- YouTube unlisted URL
  duration_mins   int,
  sort_order      int not null default 0,
  is_published    boolean not null default false,
  has_assignment  boolean not null default false,
  assignment_brief text,         -- The task instructions shown to students
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── LESSON RESOURCES (PDFs, worksheets) ──────────────────────────────────────
create table public.lesson_resources (
  id          uuid primary key default uuid_generate_v4(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  title       text not null,
  file_url    text not null,     -- Supabase Storage URL
  file_size   bigint,            -- bytes
  file_type   text,              -- 'pdf', 'zip', etc.
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── ENROLLMENTS ──────────────────────────────────────────────────────────────
create table public.enrollments (
  id          uuid primary key default uuid_generate_v4(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique(student_id, course_id)
);

-- ─── LESSON PROGRESS ──────────────────────────────────────────────────────────
create table public.lesson_progress (
  id           uuid primary key default uuid_generate_v4(),
  student_id   uuid not null references public.profiles(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  watch_seconds int not null default 0,  -- for auto-save progress
  updated_at   timestamptz not null default now(),
  unique(student_id, lesson_id)
);

-- ─── SUBMISSIONS (assignment uploads) ─────────────────────────────────────────
create table public.submissions (
  id            uuid primary key default uuid_generate_v4(),
  student_id    uuid not null references public.profiles(id) on delete cascade,
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  file_url      text,            -- Supabase Storage URL
  file_name     text,
  written_answer text,
  status        text not null default 'submitted' check (status in ('submitted', 'reviewed')),
  submitted_at  timestamptz not null default now(),
  -- Feedback from Petra
  feedback_text text,
  star_rating   int check (star_rating between 1 and 5),
  reviewed_at   timestamptz,
  unique(student_id, lesson_id)  -- one submission per lesson
);

-- ─── COMMUNITY POSTS ──────────────────────────────────────────────────────────
create table public.community_posts (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  is_pinned   boolean not null default false,
  is_removed  boolean not null default false,  -- soft delete by admin
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.community_replies (
  id       uuid primary key default uuid_generate_v4(),
  post_id  uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content  text not null,
  is_removed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
create table public.announcements (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null,   -- 'feedback_posted' | 'lesson_published' | 'approved' | 'announcement'
  title       text not null,
  body        text,
  link        text,            -- e.g. /courses/.../lessons/...
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─── PAYMENTS (placeholder — provider TBC) ────────────────────────────────────
create table public.payments (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references public.profiles(id) on delete cascade,
  course_id       uuid references public.courses(id),
  amount_pence    int not null,   -- store in smallest currency unit
  currency        text not null default 'GBP',
  status          text not null default 'pending' check (status in ('pending','succeeded','failed','refunded')),
  provider        text,           -- 'stripe' | 'paystack' | 'selar'
  provider_ref    text,           -- provider's payment/transaction ID
  promo_code      text,
  discount_pence  int default 0,
  created_at      timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.profiles           enable row level security;
alter table public.courses            enable row level security;
alter table public.modules            enable row level security;
alter table public.lessons            enable row level security;
alter table public.lesson_resources   enable row level security;
alter table public.enrollments        enable row level security;
alter table public.lesson_progress    enable row level security;
alter table public.submissions        enable row level security;
alter table public.community_posts    enable row level security;
alter table public.community_replies  enable row level security;
alter table public.announcements      enable row level security;
alter table public.notifications      enable row level security;
alter table public.payments           enable row level security;

-- Helper function: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper function: is the current user an approved student?
create or replace function public.is_approved()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'student' and status = 'approved'
  );
$$;

-- ─── profiles policies ────────────────────────────────────────────────────────
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admin can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin can update any profile"
  on public.profiles for update
  using (public.is_admin());

-- ─── courses policies ─────────────────────────────────────────────────────────
create policy "Approved students can read published courses"
  on public.courses for select
  using (is_published = true and public.is_approved());

create policy "Admin full access on courses"
  on public.courses for all
  using (public.is_admin());

-- ─── modules policies ─────────────────────────────────────────────────────────
create policy "Approved students can read published modules"
  on public.modules for select
  using (is_published = true and public.is_approved());

create policy "Admin full access on modules"
  on public.modules for all
  using (public.is_admin());

-- ─── lessons policies ─────────────────────────────────────────────────────────
create policy "Approved students can read published lessons"
  on public.lessons for select
  using (is_published = true and public.is_approved());

create policy "Admin full access on lessons"
  on public.lessons for all
  using (public.is_admin());

-- ─── lesson_resources policies ────────────────────────────────────────────────
create policy "Approved students can read resources for published lessons"
  on public.lesson_resources for select
  using (
    public.is_approved() and exists (
      select 1 from public.lessons l where l.id = lesson_id and l.is_published = true
    )
  );

create policy "Admin full access on resources"
  on public.lesson_resources for all
  using (public.is_admin());

-- ─── enrollments policies ─────────────────────────────────────────────────────
create policy "Students can read own enrollment"
  on public.enrollments for select
  using (auth.uid() = student_id);

create policy "Admin full access on enrollments"
  on public.enrollments for all
  using (public.is_admin());

-- ─── lesson_progress policies ─────────────────────────────────────────────────
create policy "Students can manage own progress"
  on public.lesson_progress for all
  using (auth.uid() = student_id);

create policy "Admin can read all progress"
  on public.lesson_progress for select
  using (public.is_admin());

-- ─── submissions policies ─────────────────────────────────────────────────────
create policy "Students can manage own submissions"
  on public.submissions for all
  using (auth.uid() = student_id);

create policy "Admin full access on submissions"
  on public.submissions for all
  using (public.is_admin());

-- ─── community policies ───────────────────────────────────────────────────────
create policy "Approved students can read non-removed posts"
  on public.community_posts for select
  using (public.is_approved() and is_removed = false);

create policy "Approved students can insert posts"
  on public.community_posts for insert
  with check (public.is_approved() and auth.uid() = author_id);

create policy "Authors can update own posts"
  on public.community_posts for update
  using (auth.uid() = author_id);

create policy "Admin full access on community"
  on public.community_posts for all
  using (public.is_admin());

create policy "Approved students can read replies"
  on public.community_replies for select
  using (public.is_approved() and is_removed = false);

create policy "Approved students can post replies"
  on public.community_replies for insert
  with check (public.is_approved() and auth.uid() = author_id);

create policy "Admin full access on replies"
  on public.community_replies for all
  using (public.is_admin());

-- ─── announcements policies ───────────────────────────────────────────────────
create policy "Approved students can read announcements"
  on public.announcements for select
  using (public.is_approved());

create policy "Admin full access on announcements"
  on public.announcements for all
  using (public.is_admin());

-- ─── notifications policies ───────────────────────────────────────────────────
create policy "Users can manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id);

create policy "Admin can insert notifications for anyone"
  on public.notifications for insert
  with check (public.is_admin());

-- ─── payments policies ────────────────────────────────────────────────────────
create policy "Students can read own payments"
  on public.payments for select
  using (auth.uid() = student_id);

create policy "Admin full access on payments"
  on public.payments for all
  using (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════
-- SEED: Create Petra's admin account
-- After running this, go to Supabase Auth > Users and manually invite
-- petra@petradesigns.org (or whichever email she uses).
-- Then update the resulting profile row:
--   update public.profiles set role = 'admin', status = 'approved'
--   where email = 'petra@petradesigns.org';
-- ═══════════════════════════════════════════════════════════════════════
