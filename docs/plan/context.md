# HireSignal — Project Context

> **For agentic workers:** Read this before touching code. Contains design decisions, tech rationale, and API contracts.

---

## What Is This

Single-user, local-only AI resume tool. No auth, no DB, no multi-tenancy.

Two modes:
- **Mode 1 (Analyze):** Upload PDF resume → paste JD → get analysis + optimized PDF
- **Mode 2 (Build):** 8-step wizard → collect info → Claude builds + analyzes → get PDF

---

## Tech Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind CSS | Fast setup, utility-first styling |
| Routing | React Router v6 | Standard SPA routing |
| Backend | Node.js 22 + Express | Simple API server, file handling |
| AI | Claude API (`claude-sonnet-4-20250514`) | Best-in-class resume analysis |
| PDF Parsing | `pdf-parse` | Extract text from uploaded PDFs |
| PDF Generation | `pdfmake` | ATS-friendly PDF output, no headless browser |
| State | React `useState` + `localStorage` | No DB needed for single user |
| File Uploads | `multer` | Multipart form handling |
| HTTP Client | Native `fetch` | No axios overhead needed |

---

## Project Structure

```
hiresignal/
├── client/                        # Vite + React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   │   ├── ModeSelector.jsx
│   │   │   │   ├── JDInput.jsx
│   │   │   │   └── DownloadButton.jsx
│   │   │   ├── mode1/
│   │   │   │   ├── UploadPanel.jsx
│   │   │   │   └── AnalyzeButton.jsx
│   │   │   ├── mode2/
│   │   │   │   ├── WizardShell.jsx
│   │   │   │   ├── QuestionCard.jsx
│   │   │   │   ├── OptionButton.jsx
│   │   │   │   └── steps/
│   │   │   │       ├── PersonalInfo.jsx
│   │   │   │       ├── ExperienceLevel.jsx
│   │   │   │       ├── WorkHistory.jsx
│   │   │   │       ├── Skills.jsx
│   │   │   │       ├── Projects.jsx
│   │   │   │       ├── Education.jsx
│   │   │   │       └── Extras.jsx
│   │   │   └── results/
│   │   │       ├── MatchScore.jsx
│   │   │       ├── KeywordGaps.jsx
│   │   │       ├── ProjectSuggestions.jsx
│   │   │       ├── SectionFeedback.jsx
│   │   │       └── ResumePreview.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── BuildPage.jsx
│   │   │   └── ResultsPage.jsx
│   │   ├── hooks/
│   │   │   ├── useResumeAnalysis.js   # Mode 1 API call + state
│   │   │   └── useWizardSession.js    # Mode 2 wizard state + localStorage
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── routes/
│   │   ├── analyze.js             # POST /api/analyze
│   │   ├── build.js               # POST /api/build-resume
│   │   └── generate.js            # POST /api/generate-pdf
│   ├── services/
│   │   ├── claudeService.js       # Anthropic SDK wrapper
│   │   ├── pdfParser.js           # pdf-parse wrapper
│   │   └── pdfGenerator.js        # pdfmake wrapper
│   ├── prompts/
│   │   ├── analyzePrompt.js       # Mode 1 system + user prompt builder
│   │   ├── buildPrompt.js         # Mode 2 build+analyze prompt builder
│   │   └── bulletPrompt.js        # Inline AI bullet suggest prompt
│   ├── uploads/                   # Temp uploaded PDFs (gitignored)
│   ├── outputs/                   # Generated PDFs (gitignored)
│   └── index.js                   # Express entry, mounts all routes
│
├── docs/plan/                     # This folder
└── .env                           # ANTHROPIC_API_KEY, PORT
```

---

## API Contracts

### `POST /api/analyze`
- **Request:** `multipart/form-data` — `resume: File`, `jobDescription: string`
- **Response:**
```json
{
  "matchScore": 74,
  "scoreBreakdown": { "skills": 80, "keywords": 65, "experienceLevel": 78, "roleAlignment": 72 },
  "missingKeywords": { "technical": [], "tools": [], "softSkills": [], "certifications": [] },
  "projectSuggestions": [{ "title": "", "description": "", "reason": "" }],
  "sectionFeedback": { "experience": [{ "original": "", "rewritten": "", "issue": "" }] },
  "atsPrediction": { "pass": false, "reason": "" },
  "rewrittenResume": { "name": "", "summary": "", "experience": [], "skills": [], "projects": [], "education": [] }
}
```

### `POST /api/build-resume`
- **Request:** `{ wizardData: object, jobDescription: string }`
- **Response:** Same shape as `/api/analyze` plus `builtResume` key

### `POST /api/generate-pdf`
- **Request:** `{ resumeData: object }`
- **Response:** Binary PDF stream (`application/pdf`)

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| No database | Personal use, wizard state in React |
| No auth | Single user, local only |
| JD collected before wizard | Lets Claude tailor every suggestion |
| Build + analyze in one Claude call | Fewer API calls, faster UX |
| pdfmake over Puppeteer | No headless browser dependency |
| Options + free text in wizard | Fast for common, flexible for custom |
| AI bullet suggest is optional | User stays in control |

---

## Environment Variables

```env
# server/.env
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=3001
```

---

## Dev Commands

```bash
# Install
cd client && npm install
cd ../server && npm install

# Run
cd server && node index.js    # :3001
cd client && npm run dev      # :5173 (proxies /api → :3001)
```

---

## Claude Model

Use `claude-sonnet-4-20250514` for all calls. Do not hardcode model strings — pull from a constant in `claudeService.js`.
