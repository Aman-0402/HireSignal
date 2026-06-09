# HireSignal

AI-powered resume analyzer and builder. Two modes: upload an existing PDF and analyze it against a job description, or build a resume from scratch via a guided wizard.

Personal use only — no auth, no database, runs locally.

---

## Modes

| Mode | Flow |
|---|---|
| **Analyze** | Upload resume PDF → paste JD → get match score, keyword gaps, rewritten bullets, optimized PDF |
| **Build** | Paste JD → 8-step wizard → AI builds + analyzes resume → download PDF |

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v3 |
| Routing | react-router-dom v7 |
| Backend | Node.js (ESM) + Express v5 |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| PDF Parsing | pdf-parse |
| PDF Generation | pdfmake |
| File Uploads | multer |
| State | React useState + localStorage (no DB) |

---

## Project Structure

```
hiresignal/
├── client/                              # Vite + React frontend (:5173)
│   └── src/
│       ├── pages/
│       │   ├── HomePage.jsx             # Mode selector landing
│       │   ├── AnalyzePage.jsx          # Mode 1 — upload + analyze
│       │   ├── BuildPage.jsx            # Mode 2 — wizard
│       │   └── ResultsPage.jsx          # Shared results dashboard
│       ├── components/
│       │   ├── shared/                  # ModeSelector, JDInput, DownloadButton
│       │   ├── mode1/                   # UploadPanel, AnalyzeButton
│       │   ├── mode2/                   # WizardShell, QuestionCard, OptionButton
│       │   │   └── steps/              # PersonalInfo → Extras (7 steps)
│       │   └── results/                 # MatchScore, KeywordGaps, ProjectSuggestions,
│       │                                # SectionFeedback, ResumePreview, ATSPrediction
│       └── hooks/
│           ├── useWizardSession.js      # Wizard state + localStorage persistence
│           └── useHistory.js            # Analysis history (max 5, localStorage)
│
├── server/                              # Express API (:3001)
│   ├── routes/
│   │   ├── analyze.js                   # POST /api/analyze
│   │   ├── build.js                     # POST /api/build-resume
│   │   ├── generate.js                  # POST /api/generate-pdf
│   │   └── suggest.js                   # POST /api/suggest-bullet
│   │                                    # POST /api/enhance-description
│   ├── services/
│   │   ├── claudeService.js             # Anthropic SDK wrapper
│   │   ├── pdfParser.js                 # pdf-parse wrapper
│   │   └── pdfGenerator.js             # pdfmake PDF builder
│   └── prompts/
│       ├── analyzePrompt.js             # Mode 1 Claude prompt
│       ├── buildPrompt.js               # Mode 2 build + analyze prompt
│       └── bulletPrompt.js             # Inline AI bullet + enhance prompts
│
└── docs/plan/                           # Implementation plan + progress tracker
```

---

## Setup

### Prerequisites

- Node.js 22+
- Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com)

### Install

```bash
# Client
cd client && npm install

# Server
cd ../server && npm install
```

### Configure

Create `server/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3001
```

### Run

```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/analyze` | Mode 1 — multipart PDF + JD → full analysis JSON |
| `POST` | `/api/build-resume` | Mode 2 — wizard data + JD → build + analysis JSON |
| `POST` | `/api/generate-pdf` | Resume JSON → binary PDF download |
| `POST` | `/api/suggest-bullet` | Job title + JD → single resume bullet |
| `POST` | `/api/enhance-description` | Project description → AI-enhanced version |
| `GET` | `/health` | Server health check |

---

## Analysis Response Shape

Both `/api/analyze` and `/api/build-resume` return:

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

---

## Features

- **Match Score** — 0–100 score with breakdown across skills, keywords, experience, role fit
- **ATS Prediction** — pass/fail prediction with reason
- **Keyword Gaps** — missing keywords color-coded by category (technical, tools, soft skills, certifications)
- **Project Suggestions** — 2–4 JD-targeted project ideas with one-click copy
- **Section Feedback** — side-by-side original vs AI-rewritten bullets with issue labels
- **Editable Resume Preview** — click any field to edit before downloading
- **PDF Export** — ATS-friendly PDF via pdfmake
- **Wizard AI Assist** — inline bullet suggest (✨) and project description enhance in Mode 2
- **Session Persistence** — wizard progress saved to localStorage, last 5 analyses stored

---

## Development Notes

- Vite proxies `/api/*` → `http://localhost:3001` — no CORS issues in dev
- Server uses Node.js ESM (`"type": "module"`) throughout
- `server/.env` is gitignored — never commit the API key
- `server/uploads/` is gitignored — temp files auto-deleted after PDF parse
- No migration files needed — no database
