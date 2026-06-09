# HireSignal — AI-Powered Resume Analyzer & Builder
## Full Project Documentation & Flow

---

## 1. Project Overview

**HireSignal** is a personal, single-user AI-powered resume tool with two core modes:

| Mode | Who it's for | What it does |
|---|---|---|
| **Mode 1 — Analyze** | You already have a resume | Upload PDF → analyze against JD → get optimized PDF |
| **Mode 2 — Build** | Starting from scratch | AI interviews you step by step → builds resume → analyzes against JD → generates PDF |

**For:** Personal use only — no auth, no database, no multi-user complexity.
**Stack:** React + Tailwind (frontend) · Node.js/Express (backend) · Claude API · pdfmake (PDF generation)

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Tailwind CSS | UI, file upload, wizard, results |
| Backend | Node.js + Express | API proxy, file handling, PDF generation |
| AI Engine | Claude API (claude-sonnet-4-20250514) | Parsing, interviewing, analysis, rewriting |
| PDF Parsing | pdf-parse (Node) | Extract text from uploaded resume PDF |
| PDF Generation | pdfmake | Generate final ATS-optimized resume PDF |
| State | React useState + localStorage | Wizard progress, session data — no DB needed |

---

## 3. Folder Structure

```
hiresignal/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   ├── ModeSelector.jsx       # Pick Mode 1 or Mode 2
│   │   │   │   ├── JDInput.jsx            # Job description textarea
│   │   │   │   └── DownloadButton.jsx     # Triggers PDF export
│   │   │   │
│   │   │   ├── mode1/                     # Upload & Analyze
│   │   │   │   ├── UploadPanel.jsx        # PDF drag & drop
│   │   │   │   └── AnalyzeButton.jsx
│   │   │   │
│   │   │   ├── mode2/                     # Build from Scratch
│   │   │   │   ├── WizardShell.jsx        # Step container + progress bar
│   │   │   │   ├── QuestionCard.jsx       # Single question UI with options
│   │   │   │   ├── OptionButton.jsx       # Selectable option chip
│   │   │   │   └── steps/
│   │   │   │       ├── PersonalInfo.jsx
│   │   │   │       ├── ExperienceLevel.jsx
│   │   │   │       ├── WorkHistory.jsx
│   │   │   │       ├── Skills.jsx
│   │   │   │       ├── Projects.jsx
│   │   │   │       ├── Education.jsx
│   │   │   │       └── Extras.jsx
│   │   │   │
│   │   │   └── results/                   # Shared results UI
│   │   │       ├── MatchScore.jsx
│   │   │       ├── KeywordGaps.jsx
│   │   │       ├── ProjectSuggestions.jsx
│   │   │       ├── SectionFeedback.jsx
│   │   │       └── ResumePreview.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.jsx               # Mode selector landing
│   │   │   ├── BuildPage.jsx              # Mode 2 wizard
│   │   │   └── ResultsPage.jsx            # Shared results page
│   │   │
│   │   ├── hooks/
│   │   │   ├── useResumeAnalysis.js       # Mode 1 API call
│   │   │   └── useWizardSession.js        # Mode 2 state management
│   │   │
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── routes/
│   │   ├── analyze.js                     # POST /api/analyze (Mode 1)
│   │   ├── build.js                       # POST /api/build-resume (Mode 2)
│   │   └── generate.js                    # POST /api/generate-pdf
│   │
│   ├── services/
│   │   ├── claudeService.js               # All Claude API calls
│   │   ├── pdfParser.js                   # PDF text extraction
│   │   └── pdfGenerator.js               # pdfmake resume builder
│   │
│   ├── prompts/
│   │   ├── analyzePrompt.js               # Mode 1 analysis prompt
│   │   ├── buildPrompt.js                 # Mode 2 resume build prompt
│   │   └── rewritePrompt.js              # JD-optimized rewrite prompt
│   │
│   ├── uploads/                           # Temp PDF uploads
│   ├── outputs/                           # Generated PDFs
│   └── index.js
│
└── README.md
```

---

## 4. Application Flow — Mode 1 (Upload & Analyze)

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 1 — HOME                                               │
│                                                              │
│  User lands on HomePage                                      │
│  Sees two cards:                                             │
│    [📄 I have a resume]     [✨ Build from scratch]          │
│                                                              │
│  User clicks → "I have a resume"                             │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 2 — INPUT                                              │
│                                                              │
│  ┌─────────────────────┐   ┌───────────────────────────┐    │
│  │  Upload Resume PDF  │   │  Paste Job Description    │    │
│  │  (drag & drop)      │   │  (textarea)               │    │
│  └─────────────────────┘   └───────────────────────────┘    │
│                                                              │
│              [ Analyze My Resume → ]                         │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 3 — BACKEND PROCESSING                                 │
│                                                              │
│  POST /api/analyze                                           │
│  1. pdf-parse extracts text from uploaded PDF                │
│  2. Resume text + JD sent to Claude API                      │
│  3. Claude returns structured JSON analysis                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 4 — CLAUDE ANALYSIS OUTPUT                             │
│                                                              │
│  Returns:                                                    │
│  • matchScore (0–100) + breakdown per category               │
│  • missingKeywords grouped by: technical / tools /           │
│    softSkills / certifications                               │
│  • projectSuggestions (2–4 tailored, copy-paste ready)       │
│  • sectionFeedback (original bullet → rewritten bullet)      │
│  • atsPrediction (pass/fail + reason)                        │
│  • rewrittenResume (full optimized resume as JSON)           │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 5 — RESULTS DASHBOARD                                  │
│                                                              │
│  ├── 🎯 Match Score Card (circular score + category bars)    │
│  ├── 🔑 Keyword Gaps (color-coded missing keyword chips)     │
│  ├── 💡 Project Suggestions (cards with copy button)         │
│  ├── ✏️  Section Feedback (side-by-side bullet comparison)   │
│  └── 📄 Full Rewritten Resume (preview + editable)           │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 6 — PDF EXPORT                                         │
│                                                              │
│  User clicks "Download Optimized Resume"                     │
│  → POST /api/generate-pdf with rewrittenResume JSON          │
│  → pdfmake builds clean ATS-friendly PDF                     │
│  → File downloads to machine                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Application Flow — Mode 2 (Build from Scratch)

### 5a. High-Level Flow

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 1 — HOME                                               │
│  User clicks → "Build from Scratch"                          │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 2 — JOB DESCRIPTION FIRST                              │
│                                                              │
│  Before the wizard starts, user pastes the Job Description   │
│  This lets Claude tailor every question and suggestion       │
│  to the specific role being targeted                         │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 3 — GUIDED WIZARD (8 sections)                         │
│                                                              │
│  Progress bar at top: ●●●●○○○○  Section 4 of 8              │
│                                                              │
│  Each section = QuestionCard component                       │
│  Each question has:                                          │
│    • Question text                                           │
│    • Smart options (chips to click)                          │
│    • "Other / Custom" free text fallback                     │
│    • AI-recommended option highlighted                       │
│    • Skip button for optional fields                         │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 4 — REVIEW COLLECTED DATA                              │
│                                                              │
│  Summary screen showing all answers before submission        │
│  User can go back and edit any section                       │
│  Click "Build & Analyze My Resume"                           │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 5 — BACKEND: BUILD + ANALYZE IN ONE CALL               │
│                                                              │
│  POST /api/build-resume                                      │
│  Sends: { wizardData, jobDescription }                       │
│                                                              │
│  Claude does two things in one prompt:                       │
│  1. Assembles a complete resume from wizard answers          │
│  2. Immediately analyzes it against the JD                   │
│  3. Returns: resume JSON + full analysis JSON                │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 6 — RESULTS DASHBOARD (same as Mode 1)                 │
│                                                              │
│  ├── 🎯 Match Score + breakdown                              │
│  ├── 🔑 Keyword Gaps                                         │
│  ├── 💡 Project Suggestions (JD-targeted)                    │
│  ├── ✏️  Section Feedback (AI-improved bullets)              │
│  └── 📄 Full Resume Preview (editable before export)         │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 7 — PDF EXPORT (same as Mode 1)                        │
└──────────────────────────────────────────────────────────────┘
```

---

### 5b. Wizard — Section by Section

```
SECTION 1 — Personal Info
─────────────────────────
Q: What's your full name?
   → Free text input

Q: Your current city/location?
   → Free text input

Q: Contact details (email, phone, LinkedIn, GitHub)?
   → Free text inputs (pre-filled if available)


SECTION 2 — Experience Level
──────────────────────────────
Q: How many years of professional experience do you have?
   Options: [Fresher / No Experience] [0–1 Year] [1–3 Years]
            [3–5 Years] [5+ Years]
   ★ Recommended based on JD: highlighted in green


SECTION 3 — Current / Most Recent Role
────────────────────────────────────────
Q: What is (or was) your most recent job title?
   Options: [Frontend Developer] [Full Stack Developer]
            [Backend Developer] [Software Engineer]
            [UI/UX Designer] [Other →]

Q: Company name?
   → Free text input

Q: Duration? (Start month/year → End or Present)
   → Date range picker or text inputs

Q: What were your main responsibilities? (Add up to 5)
   → For each: text input + AI suggestion button
     "✨ Suggest a bullet based on my role & JD"
   Claude suggests quantified, action-verb bullets
   User can accept / edit / skip each one


SECTION 4 — Previous Roles (Optional, Repeatable)
───────────────────────────────────────────────────
Q: Do you have previous work experience to add?
   Options: [Yes, add another role] [No, move on]

   If Yes → repeats Section 3 flow
   Can add up to 3 previous roles


SECTION 5 — Skills
────────────────────
Q: Select your technical skills:
   Options shown as multi-select chips, grouped:
   
   Languages:    [JavaScript] [TypeScript] [Python] [Java] [Go] ...
   Frontend:     [React] [Next.js] [Vue] [Tailwind] [HTML/CSS] ...
   Backend:      [Node.js] [Express] [FastAPI] [Django] ...
   Databases:    [MySQL] [PostgreSQL] [MongoDB] [Redis] ...
   DevOps/Cloud: [Docker] [AWS] [Git] [CI/CD] [Linux] ...
   
   ★ JD-matched skills highlighted with "JD Match" badge
   + "Add custom skill" text input at the bottom

Q: Soft skills (optional):
   Options: [Team Collaboration] [Problem Solving] [Communication]
            [Leadership] [Agile/Scrum] [Client Management] [Other]


SECTION 6 — Projects
──────────────────────
Q: Add a project (up to 4):

   Project Name → Free text
   
   What did you build?
   Options: [Web App] [Mobile App] [API / Backend Service]
            [Chrome Extension] [CLI Tool] [Open Source] [Other]

   Tech stack used → Multi-select chips (from skills list)

   Describe the impact / what it does:
   → Free text input
   → "✨ AI-enhance this description" button
      Claude rewrites it to be impactful + JD-aligned

Q: Add another project?
   Options: [Yes] [No, I'm done]


SECTION 7 — Education
───────────────────────
Q: Highest level of education:
   Options: [High School] [Diploma] [Bachelor's] [Master's] [PhD]
            [Self-taught / Bootcamp] [Prefer not to say]

Q: Degree / Field of study?
   → Free text (e.g. "B.Tech in Computer Science")

Q: Institution name?
   → Free text

Q: Graduation year?
   → Year picker


SECTION 8 — Extras (Optional)
───────────────────────────────
Q: Any certifications?
   Options: [AWS] [Google Cloud] [Meta] [Microsoft] [Coursera]
            [Udemy] [Other →] [Skip]

Q: Languages you speak?
   Options: [English] [Hindi] [Gujarati] [Other →] [Skip]

Q: Any links to add?
   → GitHub URL
   → Portfolio URL
   → LinkedIn URL
   (all optional)
```

---

### 5c. Wizard State Shape

The wizard accumulates a single `wizardData` object as user progresses:

```json
{
  "personal": {
    "name": "Aman Raj",
    "location": "Vadodara, Gujarat",
    "email": "aman@example.com",
    "phone": "+91 98765 43210",
    "linkedin": "linkedin.com/in/aman",
    "github": "github.com/aman"
  },
  "experienceLevel": "3-5 Years",
  "workHistory": [
    {
      "title": "Full Stack Developer",
      "company": "ARX Infotech",
      "start": "Jan 2022",
      "end": "Present",
      "bullets": [
        "Led development of 3 client websites using Next.js and Tailwind CSS",
        "Integrated Claude API into internal tools reducing manual effort by 40%"
      ]
    }
  ],
  "skills": {
    "technical": ["React", "Next.js", "Node.js", "Tailwind CSS", "MySQL"],
    "tools": ["Git", "Docker", "Figma"],
    "soft": ["Team Collaboration", "Problem Solving"]
  },
  "projects": [
    {
      "name": "FlowAI Task Manager",
      "type": "Web App",
      "stack": ["React", "Node.js", "Claude API"],
      "description": "AI-powered task manager with contextual awareness and three-panel layout"
    }
  ],
  "education": {
    "level": "Bachelor's",
    "degree": "B.Tech in Computer Science",
    "institution": "XYZ University",
    "year": "2021"
  },
  "extras": {
    "certifications": ["AWS Cloud Practitioner"],
    "languages": ["English", "Hindi", "Gujarati"],
    "portfolio": "arxinfo.tech"
  }
}
```

---

## 6. API Endpoints

### Mode 1 — `POST /api/analyze`

**Request:** `multipart/form-data`
```
resume: File (PDF)
jobDescription: String
```

**Response:**
```json
{
  "matchScore": 74,
  "scoreBreakdown": { "skills": 80, "keywords": 65, "experienceLevel": 78, "roleAlignment": 72 },
  "missingKeywords": {
    "technical": ["Docker", "Kubernetes", "CI/CD"],
    "tools": ["Figma", "Jira"],
    "softSkills": ["cross-functional collaboration"],
    "certifications": ["AWS Certified Developer"]
  },
  "projectSuggestions": [
    {
      "title": "CI/CD Pipeline Automation",
      "description": "Built automated deployment pipeline using GitHub Actions and Docker, reducing deployment time by 60%.",
      "reason": "JD heavily emphasizes DevOps and CI/CD experience"
    }
  ],
  "sectionFeedback": {
    "experience": [
      {
        "original": "Worked on backend APIs",
        "rewritten": "Engineered 12 RESTful APIs serving 50K+ daily requests, improving response time by 35%",
        "issue": "Too vague, no metrics"
      }
    ]
  },
  "atsPrediction": { "pass": false, "reason": "Missing 6 key ATS keywords found in JD" },
  "rewrittenResume": {
    "name": "Aman Sharma",
    "summary": "...",
    "experience": [],
    "skills": [],
    "projects": [],
    "education": []
  }
}
```

---

### Mode 2 — `POST /api/build-resume`

**Request:**
```json
{
  "wizardData": { ...collected wizard answers },
  "jobDescription": "string"
}
```

**Response:** Same shape as Mode 1 (`matchScore`, `missingKeywords`, `rewrittenResume`, etc.) — Claude builds and analyzes in a single call.

---

### Shared — `POST /api/generate-pdf`

**Request:**
```json
{ "resumeData": { ...rewrittenResume object } }
```

**Response:** Binary PDF stream (`application/pdf`)

---

## 7. Claude API Prompt Design

### Mode 1 — Analysis Prompt

```
You are an expert ATS resume analyst and career coach.

You will receive:
1. RESUME TEXT: Extracted text from the user's current resume
2. JOB DESCRIPTION: The target job posting

Return ONLY a valid JSON object with this exact structure (no markdown, no preamble):
{
  "matchScore": number,
  "scoreBreakdown": { "skills": n, "keywords": n, "experienceLevel": n, "roleAlignment": n },
  "missingKeywords": { "technical": [], "tools": [], "softSkills": [], "certifications": [] },
  "projectSuggestions": [{ "title": "", "description": "", "reason": "" }],
  "sectionFeedback": { "experience": [{ "original": "", "rewritten": "", "issue": "" }] },
  "atsPrediction": { "pass": boolean, "reason": "" },
  "rewrittenResume": { "name": "", "summary": "", "experience": [], "skills": [], "projects": [], "education": [] }
}

Rules:
- Integrate keywords naturally, never awkwardly
- Quantify every achievement (use placeholder ranges if real numbers unknown)
- Keep rewritten bullets under 20 words each
- Suggest only realistic, buildable projects
- Return ONLY JSON
```

---

### Mode 2 — Build + Analyze Prompt

```
You are an expert resume writer and ATS career coach.

You will receive:
1. WIZARD DATA: JSON object with all user-provided details
2. JOB DESCRIPTION: The target job posting

Your task is to:
1. Write a complete, professional resume from the wizard data
2. Immediately analyze it against the JD
3. Return the improved version + full analysis

Return ONLY a valid JSON object (no markdown) with this structure:
{
  "builtResume": {
    "name": "", "summary": "", "experience": [], "skills": [], "projects": [], "education": []
  },
  "matchScore": number,
  "scoreBreakdown": { "skills": n, "keywords": n, "experienceLevel": n, "roleAlignment": n },
  "missingKeywords": { "technical": [], "tools": [], "softSkills": [], "certifications": [] },
  "projectSuggestions": [{ "title": "", "description": "", "reason": "" }],
  "sectionFeedback": { "experience": [{ "original": "", "rewritten": "", "issue": "" }] },
  "atsPrediction": { "pass": boolean, "reason": "" },
  "rewrittenResume": { ...same as builtResume but fully optimized for the JD }
}

Rules:
- Write resume bullets using strong action verbs
- Add realistic quantified metrics where data allows
- Tailor the summary section directly to the JD
- Weave in JD keywords naturally
- Return ONLY JSON
```

---

### AI Bullet Suggest Prompt (Inline, during wizard)

```
You are a resume writing expert.

Given:
- Job Title: {title}
- Company: {company}
- Job Description target: {JD excerpt}

Write one strong resume bullet point for this role.
Rules: Start with an action verb. Under 20 words. Include a metric.
Return ONLY the bullet text, nothing else.
```

---

## 8. Full Data Flow Diagram

```
                         ┌─────────────┐
                         │  HomePage   │
                         │ Mode Select │
                         └──────┬──────┘
                    ┌───────────┴───────────┐
                    │                       │
             Mode 1 ▼                 Mode 2 ▼
          ┌──────────────┐        ┌──────────────┐
          │  UploadPanel │        │ JD Input     │
          │  + JD Input  │        │ → Wizard     │
          └──────┬───────┘        │   (8 steps)  │
                 │                └──────┬───────┘
                 │                       │
    POST /api/analyze          POST /api/build-resume
                 │                       │
                 └───────────┬───────────┘
                             ▼
                    ┌─────────────────┐
                    │  claudeService  │
                    │  .js            │
                    └────────┬────────┘
                             │
                             ▼
                       ┌──────────┐
                       │ Claude   │
                       │   API    │
                       └────┬─────┘
                            │ Structured JSON
                            ▼
                   ┌─────────────────┐
                   │  Results Page   │
                   ├─────────────────┤
                   │ MatchScore      │
                   │ KeywordGaps     │
                   │ ProjectCards    │
                   │ SectionFeedback │
                   │ ResumePreview   │
                   └────────┬────────┘
                            │ User clicks Download
                            ▼
                  POST /api/generate-pdf
                            │
                            ▼
                       ┌─────────┐
                       │ pdfmake │
                       └────┬────┘
                            │
                            ▼
                     PDF downloaded
```

---

## 9. Frontend Components Map

```
App.jsx
├── HomePage.jsx
│   └── ModeSelector.jsx          ← Two big mode cards
│
├── BuildPage.jsx                 ← Mode 2 only
│   ├── JDInput.jsx               ← First: collect JD
│   └── WizardShell.jsx
│       ├── ProgressBar.jsx
│       ├── QuestionCard.jsx
│       │   └── OptionButton.jsx
│       └── steps/
│           ├── PersonalInfo.jsx
│           ├── ExperienceLevel.jsx
│           ├── WorkHistory.jsx   ← Repeatable
│           ├── Skills.jsx        ← Multi-select chips
│           ├── Projects.jsx      ← Repeatable + AI enhance
│           ├── Education.jsx
│           └── Extras.jsx
│
└── ResultsPage.jsx               ← Shared by both modes
    ├── MatchScore.jsx
    ├── KeywordGaps.jsx
    ├── ProjectSuggestions.jsx
    ├── SectionFeedback.jsx
    ├── ResumePreview.jsx         ← Editable before export
    └── DownloadButton.jsx
```

---

## 10. Environment Variables

```env
# server/.env
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=3001
MAX_FILE_SIZE=10mb
```

---

## 11. Build & Run

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Run (development)
# Terminal 1
cd server && node index.js         # runs on :3001

# Terminal 2
cd client && npm run dev           # runs on :5173
```

---

## 12. Development Phases

### Phase 1 — Foundation (Week 1)
- [ ] Project scaffold: React + Express boilerplate
- [ ] HomePage with ModeSelector
- [ ] Mode 1: PDF upload + pdf-parse extraction
- [ ] Claude API integration (Mode 1 analysis prompt)
- [ ] Basic ResultsPage: match score + keyword gaps rendering

### Phase 2 — Mode 2 Wizard (Week 2)
- [ ] WizardShell with progress bar
- [ ] All 8 wizard step components
- [ ] wizardData state accumulation (useWizardSession hook)
- [ ] Inline AI bullet suggest (per WorkHistory step)
- [ ] Review screen before submission
- [ ] POST /api/build-resume + Claude build+analyze prompt

### Phase 3 — Results Polish (Week 3)
- [ ] ProjectSuggestions component with copy button
- [ ] SectionFeedback side-by-side diff view
- [ ] Editable ResumePreview before PDF export
- [ ] pdfmake PDF generation (clean ATS layout)
- [ ] Download flow end-to-end

### Phase 4 — Enhancements (Week 4+)
- [ ] ATS simulation detailed report
- [ ] Multiple JD comparison (upload 3 JDs, see best fit)
- [ ] localStorage version history
- [ ] Skill gap learning suggestions (link to resources)

---

## 13. Design Decisions

| Decision | Reason |
|---|---|
| No database | Personal use only; wizard data lives in React state |
| No auth | Single user, runs locally |
| JD collected before wizard starts | Lets Claude tailor every suggestion to the role |
| Build + Analyze in one Claude call (Mode 2) | Fewer API calls, faster UX |
| pdfmake over Puppeteer | No headless browser, simpler dependency |
| Options + free text in wizard | Fast for common answers, flexible for custom |
| AI bullet suggest is optional | User stays in control; AI just accelerates |

---

*HireSignal — Built for Aman*