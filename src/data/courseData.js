// src/data/courseData.js
// Course structure matches Petra's Notion document exactly.
// Video IDs and Drive IDs are hardcoded — do not change them.
// moduleEndExercise = single exercise shown after ALL lessons in that module are done (Modules 0–3)
// hasAssignment + assignmentBrief = per-lesson exercise shown inside LessonPage (Modules 4–5)
// comingSoon: true = module shown greyed out with "Coming Soon" badge, not clickable (Modules 7–9)
// pdfOnly: true = module shows download cards only, no video lessons (Module 6)

export const COURSE = {
  title: 'Professional Brand Identity Masterclass',
  description: 'A complete, structured programme covering everything you need to design, price, and deliver professional brand identity projects for real clients.',

  // Final Course Project — separate from modules, required for certificate
  finalProject: {
    title: 'Final Course Project',
    color: '#F9A534',
    icon: '🏆',
    requiredForCertificate: true,
    brief: `Your final project is to design a complete brand identity from scratch for a real or fictional client of your choosing.

Deliverables:
1. Creative Brief — documenting your client discovery process
2. Brand Strategy Document — positioning, values, audience, tone of voice
3. Moodboard — minimum 2 visual directions presented
4. Logo Suite — primary logo, secondary version, icon/symbol, colour variations
5. Brand Presentation Deck — minimum 12 slides presenting your full process and outcome
6. Brand Guidelines Document — minimum 8 pages covering logo usage, colour system, and typography

This project is reviewed personally by Petra with written feedback. Completion of this project is required to qualify for your certificate of completion.`,
    submissionInstructions: 'Compile all deliverables into a single well-organised PDF and submit using the form below. Accepted formats: PDF, ZIP. Maximum file size: 50MB.',
  },

  modules: [

    // ── MODULE 0 ─────────────────────────────────────────────────────────────
    {
      title: 'Module 0: Course Orientation',
      color: '#9896B8',
      icon: '◉',
      moduleEndExercise: "Think of your three favourite brands. Can you identify one element of their brand identity (beyond their logo) that makes them recognisable? For example: Coca-Cola's specific red, the distinct photography of Airbnb, the playful typography of Mailchimp. Write a short paragraph (150–200 words) for each brand explaining what makes their identity work beyond just the logo.",
      lessons: [
        {
          title: 'What is Brand Identity? (Logo vs. Identity vs. Branding)',
          videoId: 'heLzt8pf5S8',
          description: 'Understand the critical difference between a logo, a brand identity, and branding itself — and why this distinction shapes every design decision you make.',
          pdf: { title: 'Course Welcome & Overview', driveId: '1pudjLOSXcM_THAqcCHh-P7aTpwQonyVi' },
        },
      ],
    },

    // ── MODULE 1 ─────────────────────────────────────────────────────────────
    {
      title: 'Module 1: Essential Tools Training',
      color: '#47C6EB',
      icon: '⚙',
      moduleEndExercise: 'Create Your First Mockup. Download a free business card mockup. Use the Smart Object technique in Photoshop to place a simple logo you have created onto the card. Save a high-quality JPEG of the final result and submit it here. This exercise introduces you to the presentation workflow you will use throughout your design career.',
      lessons: [
        {
          title: 'Lesson 1.1: RGB vs. CMYK — The First Decision You Make',
          videoId: 'TAdCeAy2qnE',
          description: "Learn the fundamental difference between RGB and CMYK colour modes and why choosing the wrong one can ruin a client's printed materials.",
          pdf: { title: 'RGB vs. CMYK Guide', driveId: '11usF2pnef7xFzdddUXeYxgiyjZ_lhySd' },
        },
        {
          title: 'Lesson 1.2: Adobe Illustrator Basics — Your Logo Design Workspace',
          videoId: 'pzI3NBFIJfo',
          description: 'Set up your Illustrator workspace for logo design. Master the essential tools, panels, shortcuts, and workflow you will use every day as a professional logo designer.',
        },
        {
          title: 'Lesson 1.3: Adobe Illustrator Advanced — Crafting with Precision',
          videoId: '85YLY5c4TNo',
          description: 'Go deeper into Illustrator — master the Pen tool, Pathfinder operations, grids, and the precision techniques that separate amateur from professional logo work.',
        },
      ],
    },

    // ── MODULE 2 ─────────────────────────────────────────────────────────────
    // NOT pdfOnly — these are real video lessons that also include PDF resources
    {
      title: 'Module 2: Foundations of Design & Theory',
      color: '#99569F',
      icon: '✦',
      moduleEndExercise: 'Font Pairing Challenge. You are designing a brand identity for a "Modern Organic Yoga Studio." Using Google Fonts, choose one display/headline font and one body font that work together and reflect the brand\'s personality — organic, calm, modern, and premium. Present your font pair in a simple document or image: show both fonts at different sizes, write a one-sentence explanation of why you chose each font, and explain how they work together. Submit as a PDF or JPEG.',
      lessons: [
        {
          title: 'Lesson 2.1: Principles of Design',
          videoId: 'kdLSOYv0ajU',
          description: 'A deep dive into the seven principles that govern great design — Contrast, Hierarchy, Alignment, Balance, Proximity, Repetition, and Space. Learn to see and apply them everywhere.',
          pdf: { title: 'Design Principles Cheat Sheet', driveId: '1NNg9WiNgCtZwvHB2wsBC6b2bYAU99IIT' },
        },
        {
          title: 'Lesson 2.2: The Psychology of Colour',
          videoId: 'avtxlD1f8XI',
          description: 'Colour is not decoration — it is communication. Learn colour theory, the psychology behind every major colour, how to build brand colour systems, and tools like Adobe Color.',
          pdf: { title: 'Colour Psychology Guide', driveId: '1ukGeW6OdAIVPRURNZnhWrjPXQ4IcVDsu' },
        },
        {
          title: 'Lesson 2.3: Typography That Talks',
          videoId: 'T7ethYqchCk',
          description: "Typography is a brand's voice made visible. Learn type anatomy, serif vs. sans-serif, font pairing principles, and how typography reflects a brand's personality and tone.",
          pdf: { title: 'Typography Glossary & Pairing Guide', driveId: '1txyIXtYgXOhSqx3tMRRncONtFsgwkxaB' },
        },
        {
          title: 'Lesson 2.4: Composition and Layout',
          videoId: 'LPYZywpZuvw',
          description: "Master grids, scaling, white space, and visual flow. Learn how professional designers use layout to guide the viewer's eye and create visual order from complexity.",
          pdf: { title: 'Composition & Layout Reference', driveId: '1fF1j6zG-5BNnlfGjjBt6iuhO2rtMMXZp' },
        },
      ],
    },

    // ── MODULE 3 ─────────────────────────────────────────────────────────────
    {
      title: 'Module 3: Brand Strategy Core',
      color: '#F9A534',
      icon: '◈',
      moduleEndExercise: 'SWOT Analysis. Pick a real or fictional local business (for example: "The Neighbourhood Coffee Shop" or "Eco-Friendly Pet Groomer"). Identify 3 main competitors for that business. Complete a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for one of those competitors. Then write a short paragraph explaining what visual gap you identified that your client\'s brand could fill. Submit as a PDF.',
      lessons: [
        {
          title: 'Lesson 3.1: Client Discovery & The Creative Brief',
          videoId: 'NVRlSti_7GM',
          description: 'Learn how to run a structured discovery session with a new client — the right questions to ask, how to extract what they really need, and how to translate it into a clear creative brief.',
          pdf: { title: 'Client Brief Template', driveId: '1o-WQ60IXJfjc9lXcLd-zZERrm8rpP0Az' },
        },
        {
          title: 'Lesson 3.2: Defining Brand Core',
          videoId: 'RjOlSGEChoI',
          description: 'Define the strategic foundation of a brand — its purpose, vision, mission, values, personality, and tone of voice. This is the foundation every visual decision is built on.',
        },
        {
          title: 'Lesson 3.3: Competitor & Market Analysis',
          videoId: 'dHd2ZsnQYng',
          description: "Research the competitive landscape to find visual white space, understand category conventions, and position your client's brand with strategic intention — not guesswork.",
        },
      ],
    },

    // ── MODULE 4 ─────────────────────────────────────────────────────────────
    // Each lesson has its OWN exercise — use hasAssignment + assignmentBrief
    {
      title: 'Module 4: The Logo Design Process',
      color: '#ED518E',
      icon: '◆',
      lessons: [
        {
          title: 'Lesson 4.1: What Makes a Logo Effective?',
          videoId: 'zR1zgojfLnk',
          description: 'The 5 universal principles of effective logo design — simplicity, memorability, versatility, relevance, and timelessness. Learn to evaluate any logo through the lens of strategy, not personal taste.',
          hasAssignment: true,
          assignmentBrief: 'Logo Deconstruction. Pick one famous logo (not one you designed). Redraw it simply on paper or digitally. Then write a short analysis (200–300 words) evaluating its effectiveness against the five principles: simplicity, memorability, versatility, relevance, and timelessness. What does it do well? What would you change? Submit your sketch and written analysis as a PDF.',
        },
        {
          title: 'Lesson 4.2: The Ideation Phase — Mind Mapping & Sketching',
          videoId: 'kUUtPnCLKQ8',
          description: 'Go from brief to concepts without touching the computer. Learn mind mapping techniques and rapid sketching methods that unlock creative thinking and generate more directions in less time.',
          hasAssignment: true,
          assignmentBrief: '30 Sketches Challenge. Using this brief: Company: "Rooted Coffee Co." — Core Values: Organic, Community, Growth. Step 1: Create a mind map of words, concepts, and visual ideas connected to this brief (10 minutes). Step 2: Produce at least 30 rough logo sketches — quantity over quality, push past the obvious ideas. Step 3: Circle your 3 strongest concepts and write one sentence explaining the idea behind each. Submit photos of your sketches as a PDF or JPEG.',
        },
        {
          title: 'Lesson 4.3: Precision and Structure — Logo Grids & Geometry',
          videoId: 'Mthty1AkGUU',
          description: 'Learn how world-class designers use mathematical grids and geometric construction to create logos with perfect proportional harmony, consistency, and professional precision.',
          pdf: { title: 'Logo Grids & Geometry Guide', driveId: '1o-WQ60IXJfjc9lXcLd-zZERrm8rpP0Az' },
          hasAssignment: true,
          assignmentBrief: 'Grid Deconstruction. Take one of the following geometrically constructed logos: Airbnb, Pinterest, or the original Twitter bird. Overlay a grid on top of it to reverse-engineer the geometric structure used to build it. Show the circles, lines, and shapes that form the underlying construction. Submit as a PDF or image file.',
        },
        {
          title: 'Lesson 4.4: Digital Execution in Adobe Illustrator',
          videoId: '7-jAGsTq7EQ',
          description: 'Take your strongest sketch from the ideation phase and execute it as a clean, professional vector logo in Illustrator. From scan to final vector with organised layers, precise paths, and correct file setup.',
          hasAssignment: true,
          assignmentBrief: 'From Sketch to Vector. Take your top-rated sketch from Lesson 4.2 and execute it in Adobe Illustrator. Deliverables: (1) A well-organised file with named layers — Sketch, Construction Lines, Final Artwork. (2) The final logo in solid black. (3) One exported PNG with a transparent background. (4) A screenshot showing the logo with its underlying grid construction visible. Submit all as a compiled PDF.',
        },
        {
          title: 'Lesson 4.5: Concept Presentation & Client Feedback',
          videoId: '5yQyNggQrGY',
          description: "Learn how to present your logo concepts professionally — how to frame your rationale, guide the client's feedback, handle revision requests constructively, and move the project forward.",
          hasAssignment: true,
          assignmentBrief: 'Create a Presentation Mockup. Place your logo from Lesson 4.4 onto a simple mockup — a business card, a tote bag, or a pen. Use Photoshop Smart Objects or a free mockup tool. Present this to a friend or in the course community and ask for specific feedback. Write a short paragraph documenting what feedback you received and how you would respond to it. Submit your mockup image and written response.',
        },
      ],
    },

    // ── MODULE 5 ─────────────────────────────────────────────────────────────
    // Each lesson has its OWN exercise — use hasAssignment + assignmentBrief
    {
      title: 'Module 5: Building the Full Brand Identity System',
      color: '#22C55E',
      icon: '▣',
      lessons: [
        {
          title: 'The Initial Client Conversation & Qualification',
          videoId: 'dwUg-eqw5To',
          description: "How to respond to a first inquiry, run a discovery call, qualify the client and project, and decide if it's the right fit — before investing any time in a proposal.",
          hasAssignment: true,
          assignmentBrief: "Write a client inquiry response. A potential client has sent you this message: \"Hi, I run a small bakery and I'm looking for a logo. How much do you charge?\" Write your professional response — acknowledge their inquiry, ask 3–4 qualifying questions (budget, timeline, scope), and end by proposing a brief discovery call. Keep it warm, professional, and concise. Submit as a written document.",
        },
        {
          title: 'Crafting the Proposal & Quote',
          videoId: 'zh0UjTUQwNE',
          description: 'Build a winning proposal — what to include, how to structure your pricing, how to write a clear scope of work, and how to present it professionally to secure the project.',
          hasAssignment: true,
          assignmentBrief: 'Write a project proposal. Using the bakery client from the previous lesson, write a full project proposal including: project overview and goals, your proposed process and timeline (at least 3 milestones), your investment (create a realistic price for a logo + brand identity package), scope of work with clear deliverables, and one sentence about what happens if the scope changes. Submit as a PDF.',
        },
        {
          title: 'The Onboarding Process — Contracts & Invoicing',
          videoId: '2j_HgGjwKOI',
          description: 'Protect yourself and your work legally. Learn the essential clauses in a design contract, how to set up invoicing, why you must collect a deposit before starting, and how to onboard clients professionally.',
          hasAssignment: true,
          assignmentBrief: 'Create an onboarding checklist. Write a step-by-step onboarding checklist you would send to a new client after they sign your contract. It should cover at minimum: what happens after signing, what the client needs to provide (assets, logins, questionnaire), the first milestone and its deadline, and how you will communicate throughout the project. Submit as a document or PDF.',
        },
        {
          title: 'The Deep Dive Client Questionnaire & Strategy Workshop',
          videoId: 'hqd8AOOJuwI',
          description: 'Design a comprehensive discovery questionnaire that goes beyond the basics. Learn how to run a live or async strategy workshop to extract brand purpose, audience personas, competitive landscape, and brand voice.',
          hasAssignment: true,
          assignmentBrief: 'Complete a strategy workshop. Using the client brief template from the course resources, conduct a strategy session with a real or fictional client. Fill out the full questionnaire and produce a one-page summary covering: what the brand does and for whom, 3 core brand values, the target audience, 2 direct competitors, and the brand voice in one sentence. Submit your completed questionnaire and summary as a PDF.',
        },
        {
          title: 'The Creative Brief & Project Roadmap',
          videoId: 'upK1Bk1ojhw',
          description: 'Synthesise everything you have gathered into a formal creative brief that aligns you and your client before design begins. Create a project roadmap with milestones that keeps everything on track.',
          hasAssignment: true,
          assignmentBrief: 'Write a creative brief. Using the strategy work from the previous lesson, write a full creative brief for your brand project. It must include: project overview, target audience, brand personality (5 adjectives), key messages, visual direction notes, deliverables, timeline, and budget. This should be presentable to a real client. Submit as a PDF.',
        },
        {
          title: 'Visual Direction — Creating & Presenting Moodboards',
          videoId: 'C4xDZ3xmN4c',
          description: "Translate your brand strategy into a visual direction before designing a single logo. Learn how to build a moodboard that aligns your client on colour, typography, imagery, and feel — preventing costly redesigns.",
          hasAssignment: true,
          assignmentBrief: 'Create a moodboard. For your brand project, create a professional moodboard presenting at least two distinct visual directions. Each direction should include: colour palette inspiration, typography style, imagery/photography references, and texture or pattern references. Use Pinterest, Milanote, or a designed PDF. Write a short explanation of how each direction connects to the brand strategy. Submit as a PDF.',
        },
        {
          title: 'Creating a Brand Strategy Document',
          videoId: 'eIkIkiB3wTc',
          description: 'Build the full brand strategy document that you will present to your client before any visual design work begins. This document is your strategic contract — it protects your decisions and prevents scope creep.',
          hasAssignment: true,
          assignmentBrief: 'Produce a brand strategy document. Create a complete brand strategy document for your chosen brand. It must cover: brand positioning statement, core values (minimum 3), target audience personas (minimum 2), tone of voice with examples, competitor differentiation, and one paragraph explaining the strategic visual direction. Minimum 4 pages. Submit as a PDF.',
        },
        {
          title: 'The Design Phase — Logo Concepts & Presentation',
          videoId: 'Ct5INwXlhPE',
          description: 'Walk through the complete design phase — from strategy to final logo concepts, building your full logo suite, preparing professional presentation mockups, and delivering your work to the client.',
          hasAssignment: true,
          assignmentBrief: 'Submit your complete logo concept set. Deliver: (1) Primary logo, (2) Secondary/horizontal version, (3) Icon or symbol mark, (4) Minimum one colour variation (reversed on dark). Present all versions on a minimum of 3 professional mockups. Submit as a compiled PDF presentation — this should look like something you would send to a real client.',
        },
      ],
    },

    // ── MODULE 6 — FREEBIES ───────────────────────────────────────────────────
    {
      title: 'Module 6: Freebies & Resources',
      color: '#8B5CF6',
      icon: '🎁',
      pdfOnly: true,
      description: 'Free downloadable resources to support your design journey — templates, guides, worksheets, and reference materials. Download and keep these forever.',
      lessons: [],
      pdfs: [
        { title: 'Brand Strategy Worksheet',    driveId: '1NNg9WiNgCtZwvHB2wsBC6b2bYAU99IIT' },
        { title: 'Creative Brief Template',     driveId: '1ukGeW6OdAIVPRURNZnhWrjPXQ4IcVDsu' },
        { title: 'Client Questionnaire',        driveId: '1txyIXtYgXOhSqx3tMRRncONtFsgwkxaB' },
        { title: 'Design Reference Guide',      driveId: '1fF1j6zG-5BNnlfGjjBt6iuhO2rtMMXZp' },
      ],
    },

    // ── MODULES 7–9 — COMING SOON ─────────────────────────────────────────────
    {
      title: 'Module 7: Building Your Design Career',
      color: '#E85D04',
      icon: '🚀',
      comingSoon: true,
      lessons: [],
    },
    {
      title: 'Module 8: Pricing & Getting Clients',
      color: '#06B6D4',
      icon: '💼',
      comingSoon: true,
      lessons: [],
    },
    {
      title: 'Module 9: The Designer Mindset',
      color: '#F43F5E',
      icon: '🧠',
      comingSoon: true,
      lessons: [],
    },

  ],
}

// ── Derived helpers ───────────────────────────────────────────────────────────

COURSE.modules.forEach((mod, mIdx) => {
  mod.index = mIdx
  mod.lessons.forEach((lesson, lIdx) => {
    lesson.key       = `m${mIdx}-l${lIdx}`
    lesson.moduleIdx = mIdx
    lesson.lessonIdx = lIdx
  })
})

// All countable lessons — excludes pdfOnly and comingSoon modules
export const ALL_LESSONS = COURSE.modules
  .filter(m => !m.pdfOnly && !m.comingSoon)
  .flatMap(m => m.lessons)

export function getLessonByKey(key) {
  return ALL_LESSONS.find(l => l.key === key) || null
}

export function getLesson(mIdx, lIdx) {
  return COURSE.modules[mIdx]?.lessons[lIdx] || null
}

export function getAdjacentLessons(mIdx, lIdx) {
  const flat = ALL_LESSONS
  const idx  = flat.findIndex(l => l.moduleIdx === mIdx && l.lessonIdx === lIdx)
  return {
    prev: idx > 0               ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  }
}