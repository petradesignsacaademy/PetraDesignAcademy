// ── Static course data ────────────────────────────────────────────────────────
// Videos are hardcoded here so the course works without Supabase content entry.
// To add a lesson, insert an object into the correct module's lessons array.
// Lesson keys (m0-l0, m1-l2, etc.) auto-generate from module + lesson index.
//
// Module 2 is PDF-only (no videos). Add Google Drive file IDs to the pdfs array:
//   { title: 'Worksheet name', driveId: 'the_id_from_the_google_drive_url' }
// Use the /preview URL so students can read but not download.

export const COURSE = {
  title: 'Professional Brand Identity Masterclass',
  description: 'A complete, structured programme covering everything you need to design, price, and deliver professional brand identity projects for real clients.',
  modules: [

    // ── MODULE 1 ──────────────────────────────────────────────────────────────
    {
      title: 'Course Orientation',
      color: '#9896B8',
      icon: '◉',
      lessons: [
        {
          title: 'What is Brand Identity? (Logo vs Identity vs Branding)',
          videoId: 'heLzt8pf5S8',
          description: 'Understand the difference between a logo, a brand identity, and branding — and why it matters before you design anything.',
          pdf: { title: 'Introduction — Welcome to the World of Brand Identity', driveId: '1pudjLOSXcM_THAqcCHh-P7aTpwQonyVi' },
        },
      ],
    },

    // ── MODULE 2 ──────────────────────────────────────────────────────────────
    {
      title: 'Essential Tools Training',
      color: '#47C6EB',
      icon: '⚙',
      lessons: [
        {
          title: 'What Makes a Logo Effective?',
          videoId: 'TAdCeAy2qnE',
          description: 'Break down the principles behind logos that stand the test of time — simplicity, scalability, distinction, and versatility.',
          pdf: { title: 'RGB vs. CMYK', driveId: '11usF2pnef7xFzdddUXeYxgiyjZ_lhySd' },
        },
        {
          title: 'Adobe Illustrator Basics — Your Logo Design Workspace',
          videoId: 'pzI3NBFIJfo',
          description: 'Set up your Illustrator workspace for logo design. Learn the essential tools, shortcuts, and workflow you will use every day.',
        },
        {
          title: 'Adobe Illustrator Advanced — Crafting with Precision',
          videoId: '85YLY5c4TNo',
          description: 'Go deeper into Illustrator with advanced techniques for creating precise, professional vector artwork.',
        },
      ],
    },

    // ── MODULE 3 — PDF ONLY ───────────────────────────────────────────────────
    // Add Google Drive file IDs to the pdfs array below.
    // Share each file as "Anyone with the link → Viewer" in Google Drive,
    // then copy the ID from the URL: drive.google.com/file/d/THIS_PART/view
    {
      title: 'Design Resources & Templates',
      color: '#99569F',
      icon: '📄',
      pdfOnly: true,
      description: 'Downloadable worksheets, brand strategy templates, and design reference guides to support your work throughout the course.',
      lessons: [],
      pdfs: [
        { title: 'Brand Strategy Worksheet',  driveId: '1NNg9WiNgCtZwvHB2wsBC6b2bYAU99IIT' },
        { title: 'Creative Brief Template',   driveId: '1ukGeW6OdAIVPRURNZnhWrjPXQ4IcVDsu' },
        { title: 'Client Questionnaire',      driveId: '1txyIXtYgXOhSqx3tMRRncONtFsgwkxaB' },
        { title: 'Design Reference Guide',    driveId: '1fF1j6zG-5BNnlfGjjBt6iuhO2rtMMXZp' },
      ],
    },

    // ── MODULE 4 ──────────────────────────────────────────────────────────────
    {
      title: 'Brand Strategy Core',
      color: '#F9A534',
      icon: '◈',
      lessons: [
        {
          title: 'Client Discovery & The Creative Brief',
          videoId: 'kdLSOYv0ajU',
          description: 'Learn how to run a discovery session with a new client, ask the right questions, and translate their answers into a clear creative brief.',
        },
        {
          title: 'Defining Brand Core',
          videoId: 'avtxlD1f8XI',
          description: 'Define the brand\'s mission, vision, values, and personality — the strategic foundation everything else is built on.',
        },
        {
          title: 'Competitor & Market Analysis',
          videoId: 'T7ethYqchCk',
          description: 'Research the competitive landscape to find white space, avoid clichés, and position your client\'s brand with intention.',
        },
      ],
    },

    // ── MODULE 5 ──────────────────────────────────────────────────────────────
    {
      title: 'Logo Design',
      color: '#ED518E',
      icon: '◆',
      lessons: [
        {
          title: 'The Ideation Phase — Mind Mapping & Sketching',
          videoId: 'LPYZywpZuvw',
          description: 'Go from brief to rough ideas using mind mapping and rapid sketching techniques before touching the computer.',
        },
        {
          title: 'Logo Grid Systems',
          videoId: 'NVRlSti_7GM',
          description: 'Use grid systems to create logos with mathematical precision, balance, and proportional harmony.',
          pdf: { title: 'Precision and Structure — Using Logo Grids & Geometry', driveId: '1o-WQ60IXJfjc9lXcLd-zZERrm8rpP0Az' },
        },
        {
          title: 'Digital Execution in Illustrator (Part A)',
          videoId: 'RjOlSGEChoI',
          description: 'Take your sketches into Illustrator and start building clean vector logo marks with professional technique.',
        },
        {
          title: 'Digital Execution in Illustrator (Part B)',
          videoId: 'dHd2ZsnQYng',
          description: 'Continue refining your digital logo — typography pairing, colour application, and final vector polish.',
        },
        {
          title: 'Concept Presentation & Client Feedback',
          videoId: 'zR1zgojfLnk',
          description: 'Present your logo concepts professionally, guide client feedback constructively, and handle revision rounds with confidence.',
        },
      ],
    },

    // ── MODULE 6 ──────────────────────────────────────────────────────────────
    {
      title: 'Brand Identity Execution',
      color: '#22C55E',
      icon: '▣',
      lessons: [
        {
          title: 'The Initial Client Conversation & Qualification',
          videoId: 'kUUtPnCLKQ8',
          description: 'How to run your first call with a potential client — qualify the project, set expectations, and decide if it\'s the right fit.',
        },
        {
          title: 'Brand Proposal',
          videoId: 'Mthty1AkGUU',
          description: 'Write and present a brand proposal that wins projects — scope, timeline, investment, and how to frame your value.',
        },
        {
          title: 'The Onboarding Process — Contracts & Invoice',
          videoId: '7-jAGsTq7EQ',
          description: 'Set up the project correctly from day one — contracts, deposits, invoicing, and protecting yourself legally.',
        },
        {
          title: 'The Deep Dive Client Questionnaire & Strategy Workshop',
          videoId: '5yQyNggQrGY',
          description: 'Run a structured strategy workshop with your client to extract everything you need to make strategic design decisions.',
          hasAssignment: true,
          assignmentBrief: 'Complete the deep dive questionnaire with a real or practice client. Submit your filled questionnaire and a one-page summary of what you discovered about the brand.',
        },
        {
          title: 'The Creative Brief & Project Roadmap',
          videoId: 'dwUg-eqw5To',
          description: 'Translate your research into a clear creative brief and project roadmap that keeps the project on track.',
          hasAssignment: true,
          assignmentBrief: 'Create a complete creative brief document for a brand project (real or fictitious). Include target audience, brand personality, key messages, and visual direction.',
        },
        {
          title: 'Brand Strategy Document',
          videoId: 'zh0UjTUQwNE',
          description: 'Build the full brand strategy document you\'ll present to your client before any design work begins.',
          hasAssignment: true,
          assignmentBrief: 'Produce a brand strategy document for your chosen brand. It should cover: brand positioning, core values, audience personas, tone of voice, and competitor differentiation.',
        },
        {
          title: 'Creating a Moodboard (Part 1)',
          videoId: '2j_HgGjwKOI',
          description: 'Learn how to build a direction-setting moodboard that aligns your client on the visual tone before design begins.',
        },
        {
          title: 'Creating a Moodboard (Part 2)',
          videoId: 'hqd8AOOJuwI',
          description: 'Continue building and refining your moodboard — sourcing references, creating cohesion, and presenting it to the client.',
          hasAssignment: true,
          assignmentBrief: 'Create a professional moodboard for your brand project. Present at least two visual directions. Submit as a PDF or image.',
        },
        {
          title: 'The Design Phase — Logo Concepts (Part A)',
          videoId: 'upK1Bk1ojhw',
          description: 'Begin the design phase — ideating logo concepts from the strategy, sketching, and moving into digital execution.',
        },
        {
          title: 'The Design Phase — Logo Concepts (Part B)',
          videoId: 'C4xDZ3xmN4c',
          description: 'Continue developing logo concepts in Illustrator, exploring different directions and refining the strongest ideas.',
        },
        {
          title: 'The Design Phase — Logo Concepts (Part C)',
          videoId: 'eIkIkiB3wTc',
          description: 'Finalise your logo concepts, prepare presentation mockups, and select the strongest options to show the client.',
        },
        {
          title: 'The Design Phase — Logo Concepts (Part D)',
          videoId: 'Ct5INwXlhPE',
          description: 'Complete the full logo suite — primary logo, variations, icon, and responsive versions across all formats.',
          hasAssignment: true,
          assignmentBrief: 'Submit your complete logo concept set — primary logo, secondary logo, icon/symbol, and at least one colour variation. Present on mockups.',
        },
        {
          title: 'Brand Presentation (Part 1)',
          videoId: 'kRXli-f8w2o',
          description: 'Build a compelling brand presentation deck that sells the design rationale and walks the client through your decisions.',
        },
        {
          title: 'Brand Presentation (Part 2)',
          videoId: 'pP5QJIwmXCA',
          description: 'Complete and deliver the presentation — how to present live, handle questions, and lead the client to a clear decision.',
          hasAssignment: true,
          assignmentBrief: 'Create your full brand presentation deck (minimum 10 slides). Include strategy recap, moodboard, logo rationale, and mockups. Submit as PDF.',
        },
        {
          title: 'Creating a Brand Guideline Document (Part A)',
          videoId: 'U14A1C-4zlU',
          description: 'Design a professional brand guidelines document — logo usage rules, colour palette, and typography system.',
        },
        {
          title: 'Creating a Brand Guideline Document (Part B)',
          videoId: 'Ztbs7YB6p0U',
          description: 'Complete the brand guidelines with imagery style, tone of voice, and real-world application examples.',
          hasAssignment: true,
          assignmentBrief: 'Produce a complete brand guidelines document. It must include: logo rules, colour system, typography, imagery guidelines, and do/don\'t examples. Minimum 12 pages.',
        },
        {
          title: 'Final Delivery & Offboarding',
          videoId: 'GcMPsZ0JvnE',
          description: 'Wrap up the project professionally — file delivery, final invoice, client offboarding, and how to ask for referrals and testimonials.',
        },
      ],
    },

    // ── MODULE 7 ──────────────────────────────────────────────────────────────
    {
      title: 'Building Your Design Career',
      color: '#8B5CF6',
      icon: '✦',
      lessons: [
        {
          title: 'Building a Portfolio',
          videoId: 'ugKro873jfw',
          description: 'Build a portfolio that wins clients — what to include, how to present case studies, and where to host your work.',
        },
        {
          title: 'Personal Branding',
          videoId: 'TF5fS0xKpow',
          description: 'Define your own brand as a designer: your niche, voice, aesthetic, and positioning in the market.',
        },
      ],
    },

    // ── MODULE 8 ──────────────────────────────────────────────────────────────
    {
      title: 'Pricing & Getting Clients',
      color: '#E85D04',
      icon: '◐',
      lessons: [
        {
          title: 'Pricing Your Work',
          videoId: 'Yl3mRNtvdxE',
          description: 'Learn how to price logo and brand identity projects — value-based pricing, packages, and how to stop undercharging.',
        },
        {
          title: 'Finding Your First Client',
          videoId: '03xfEn3PKA8',
          description: 'Practical strategies for landing your first paid client — outreach, referrals, platforms, and how to start conversations.',
        },
        {
          title: 'What Next',
          videoId: 'HzBuUCLsxpg',
          description: 'Where do you go from here? Next steps for growing your design business, raising your rates, and building long-term success.',
        },
      ],
    },

    // ── MODULE 9 ──────────────────────────────────────────────────────────────
    {
      title: 'The Designer Mindset',
      color: '#06B6D4',
      icon: '◎',
      lessons: [
        {
          title: 'Why Creation is Important as a Designer',
          videoId: 'YS-ENhLyvLs',
          description: 'Explore the mindset shift from consumer to creator and why building a body of work is essential to a sustainable design career.',
        },
        {
          title: 'Building the Right Mindset',
          videoId: 'LgG9JDmp2j4',
          description: 'Develop the professional mindset of a working designer — how to handle feedback, manage creative blocks, and stay consistent.',
        },
        {
          title: 'What Type of Content to Post',
          videoId: 'NkSrQRVOVVo',
          description: 'Learn what to share online as a designer, how to attract your ideal clients through content, and what platforms to focus on.',
        },
      ],
    },

  ],
}

// ── Derived helpers ───────────────────────────────────────────────────────────

// Attach stable string keys to every lesson: m0-l0, m0-l1, m1-l0, etc.
// pdfOnly modules have no lessons so they are skipped automatically.
COURSE.modules.forEach((mod, mIdx) => {
  mod.index = mIdx
  mod.lessons.forEach((lesson, lIdx) => {
    lesson.key       = `m${mIdx}-l${lIdx}`
    lesson.moduleIdx = mIdx
    lesson.lessonIdx = lIdx
  })
})

// Flat list of all video lessons in order (excludes pdfOnly modules)
export const ALL_LESSONS = COURSE.modules
  .filter(m => !m.pdfOnly)
  .flatMap(m => m.lessons)

// Look up a lesson by its key
export function getLessonByKey(key) {
  return ALL_LESSONS.find(l => l.key === key) || null
}

// Look up a lesson by module + lesson index
export function getLesson(mIdx, lIdx) {
  return COURSE.modules[mIdx]?.lessons[lIdx] || null
}

// Previous / next lesson (across module boundaries, skipping pdfOnly modules)
export function getAdjacentLessons(mIdx, lIdx) {
  const flat  = ALL_LESSONS
  const idx   = flat.findIndex(l => l.moduleIdx === mIdx && l.lessonIdx === lIdx)
  return {
    prev: idx > 0               ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  }
}