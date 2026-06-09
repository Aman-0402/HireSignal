# ResumeAI — Personal Resume Analyzer
## Full Project Documentation & Flow

---

## 1. Project Overview

**ResumeAI** is a personal, single-user AI-powered tool that:
- Accepts a resume (PDF) and a job description (text/PDF)
- Uses Claude API to analyze the match
- Highlights missing keywords, weak sections, and recommends projects
- Generates a rewritten, ATS-optimized PDF resume

**For:** Personal use only — no auth, no database, no multi-user complexity.  
**Stack:** React (frontend) + Node.js/Express (backend) + Claude API + pdf-lib / pdfmake (PDF generation)

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Tailwind CSS | UI, file upload, results display |
| Backend | Node.js + Express | API proxy, file handling, PDF generation |
| AI Engine | Claude API (claude-sonnet-4) | Resume parsing, analysis, rewriting |
| PDF Parsing | pdfplumber (Python) or pdf-parse (Node) | Extract text from uploaded PDF |
| PDF Generation | pdfmake or Puppeteer | Generate final optimized resume PDF |
| Storage | Local filesystem (temp) | Uploaded files, generated PDFs (no DB needed) |

---

## 3. Folder Structure

```
resume-ai/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPanel.jsx       # File + JD upload UI
│   │   │   ├── MatchScore.jsx        # Score dashboard
│   │   │   ├── KeywordGaps.jsx       # Missing keywords display
│   │   │   ├── ProjectSuggestions.jsx
│   │   │   ├── SectionFeedback.jsx   # Bullet-by-bullet feedback
│   │   │   ├── RewrittenResume.jsx   # AI-rewritten content preview
│   │   │   └── DownloadButton.jsx    # PDF export trigger
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   └── ResultsPage.jsx
│   │   ├── hooks/
│   │   │   └── useResumeAnalysis.js  # API call logic
│   │   └── App.jsx
│   └── package.json
│
├── server/                      # Node.js backend
│   ├── routes/
│   │   ├── analyze.js            # Main analysis endpoint
│   │   └── generate.js           # PDF generation endpoint
│   ├── services/
│   │   ├── claudeService.js      # All Claude API calls
│   │   ├── pdfParser.js          # Extract text from PDF
│   │   └── pdfGenerator.js       # Build output PDF
│   ├── prompts/
│   │   ├── analyzePrompt.js      # Analysis system prompt
│   │   └── rewritePrompt.js      # Rewrite system prompt
│   ├── uploads/                  # Temp uploaded files
│   ├── outputs/                  # Generated PDFs
│   └── index.js
│
└── README.md
```

---

## 4. Complete User Flow

```
┌─────────────────────────────────────────────────────────┐
│                     STEP 1: INPUT                        │
│                                                          │
│  User uploads Resume PDF  +  Pastes Job Description      │
│                    ↓                                     │
│         Click "Analyze Resume" button                    │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  STEP 2: BACKEND PROCESSING              │
│                                                          │
│  1. Receive PDF + JD text via multipart form             │
│  2. Extract text from PDF using pdf-parse                │
│  3. Send both to Claude API with analysis prompt         │
│  4. Claude returns structured JSON response              │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  STEP 3: AI ANALYSIS                     │
│                                                          │
│  Claude analyzes and returns:                            │
│  • Overall match score (0–100)                           │
│  • Score breakdown (skills, keywords, experience, role)  │
│  • Missing keywords (grouped by category)                │
│  • Project suggestions (2–4 tailored projects)           │
│  • Section feedback (per bullet rewrite suggestions)     │
│  • ATS pass/fail prediction                              │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  STEP 4: RESULTS DASHBOARD               │
│                                                          │
│  Frontend renders:                                       │
│  ├── Match Score Card (big visual score)                 │
│  ├── Keyword Gap Panel (color-coded missing terms)       │
│  ├── Project Suggestions (copy-paste ready)              │
│  ├── Section-by-Section Feedback (old vs new bullets)    │
│  └── Full Rewritten Resume Preview                       │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  STEP 5: PDF GENERATION                  │
│                                                          │
│  User clicks "Download Optimized Resume"                 │
│  → Backend sends rewritten content to pdfmake            │
│  → Clean ATS-friendly PDF is generated                   │
│  → File downloads to user's machine                      │
└─────────────────────────────────────────────────────────┘
```

---

## 5. API Endpoints

### `POST /api/analyze`
Accepts resume PDF + job description, returns full analysis.

**Request:**
```
Content-Type: multipart/form-data
- resume: File (PDF)
- jobDescription: String (plain text)
```

**Response (JSON):**
```json
{
  "matchScore": 74,
  "scoreBreakdown": {
    "skills": 80,
    "keywords": 65,
    "experienceLevel": 78,
    "roleAlignment": 72
  },
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
  "atsPrediction": {
    "pass": false,
    "reason": "Missing 6 key ATS keywords found in JD"
  },
  "rewrittenResume": {
    "name": "Aman Sharma",
    "summary": "...",
    "experience": [...],
    "skills": [...],
    "projects": [...],
    "education": [...]
  }
}
```

---

### `POST /api/generate-pdf`
Accepts rewritten resume JSON, returns downloadable PDF.

**Request:**
```json
{ "resumeData": { ...rewrittenResume object } }
```

**Response:** Binary PDF stream (application/pdf)

---

## 6. Claude API Prompt Design

### Analysis Prompt (System)
```
You are an expert ATS resume analyst and career coach.

You will receive:
1. RESUME TEXT: Extracted text from the user's current resume
2. JOB DESCRIPTION: The target job posting

Your task is to return ONLY a valid JSON object (no markdown, no preamble) with this exact structure:
{
  "matchScore": number (0-100),
  "scoreBreakdown": { "skills": number, "keywords": number, "experienceLevel": number, "roleAlignment": number },
  "missingKeywords": { "technical": [], "tools": [], "softSkills": [], "certifications": [] },
  "projectSuggestions": [{ "title": string, "description": string, "reason": string }],
  "sectionFeedback": { "experience": [{ "original": string, "rewritten": string, "issue": string }] },
  "atsPrediction": { "pass": boolean, "reason": string },
  "rewrittenResume": { "name": string, "summary": string, "experience": [], "skills": [], "projects": [], "education": [] }
}

Rules:
- Match keywords naturally, never keyword-stuff awkwardly
- Quantify achievements wherever possible (add placeholder metrics if unknown)
- Keep rewritten bullets under 20 words each
- Suggest only realistic projects for a developer
- Return ONLY JSON, nothing else
```

---

## 7. Data Flow Diagram

```
[User Browser]
      │
      │ PDF + JD text (multipart form)
      ▼
[Express Server /api/analyze]
      │
      ├──► [pdf-parse] ──► Resume Text (string)
      │
      └──► [claudeService.js]
                │
                │ System prompt + resume text + JD
                ▼
          [Claude API]
                │
                │ Structured JSON response
                ▼
      [Parse & validate JSON]
                │
                ▼
      [Return to Frontend]
                │
                ▼
      [React Results Page]
                │
      ┌─────────┴──────────┐
      │                    │
  [Display UI]    [Download PDF]
                           │
                           ▼
                  [POST /api/generate-pdf]
                           │
                           ▼
                     [pdfmake]
                           │
                           ▼
                    [PDF Download]
```

---

## 8. Key Modules Breakdown

### `claudeService.js`
```javascript
// Handles all Claude API communication
const analyzeResume = async (resumeText, jobDescription) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`
      }]
    })
  });
  const data = await response.json();
  const text = data.content[0].text;
  return JSON.parse(text); // Claude returns clean JSON
};
```

### `pdfParser.js`
```javascript
// Extracts raw text from uploaded PDF using pdf-parse
const pdfParse = require("pdf-parse");

const extractText = async (fileBuffer) => {
  const data = await pdfParse(fileBuffer);
  return data.text;
};
```

### `pdfGenerator.js`
```javascript
// Generates ATS-friendly PDF from rewritten resume JSON
// Uses pdfmake for clean, structured output
const buildResumePDF = (resumeData) => {
  const docDefinition = {
    content: [
      { text: resumeData.name, style: "header" },
      { text: "SUMMARY", style: "sectionTitle" },
      { text: resumeData.summary },
      // ... map experience, skills, projects, education
    ],
    styles: {
      header: { fontSize: 22, bold: true },
      sectionTitle: { fontSize: 13, bold: true, margin: [0, 10, 0, 4] }
    }
  };
  return pdfMake.createPdf(docDefinition);
};
```

---

## 9. Frontend Components Map

```
App.jsx
├── HomePage.jsx
│   └── UploadPanel.jsx
│       ├── PDF Drag & Drop (resume)
│       └── JD Text Area (job description)
│
└── ResultsPage.jsx
    ├── MatchScore.jsx          ← Big circular score + breakdown bars
    ├── KeywordGaps.jsx         ← Colored tags: missing keywords by category
    ├── ProjectSuggestions.jsx  ← Cards with project title + description + reason
    ├── SectionFeedback.jsx     ← Side-by-side: original bullet vs rewritten
    ├── RewrittenResume.jsx     ← Full resume preview (editable text)
    └── DownloadButton.jsx      ← Triggers /api/generate-pdf
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

# Run both (development)
# Terminal 1 - Backend
cd server && node index.js

# Terminal 2 - Frontend
cd client && npm run dev

# App runs at http://localhost:5173
# API runs at http://localhost:3001
```

---

## 12. Development Phases

### Phase 1 — Core (Week 1)
- [ ] Setup React + Express boilerplate
- [ ] PDF upload + text extraction working
- [ ] Claude API integration returning JSON
- [ ] Basic results page rendering match score + keywords

### Phase 2 — Polish (Week 2)
- [ ] Section-by-section feedback UI
- [ ] Project suggestions component
- [ ] Rewritten resume preview
- [ ] PDF generation with pdfmake

### Phase 3 — Enhancements (Week 3+)
- [ ] ATS simulation score
- [ ] Multiple JD comparison mode
- [ ] Version history (localStorage)
- [ ] Editable resume before PDF export

---

## 13. Limitations & Decisions

| Decision | Reason |
|---|---|
| No database | Personal use only, files are temp |
| No auth | Single user, running locally |
| Claude for everything | One API, less complexity |
| pdfmake over Puppeteer | Easier, no headless browser needed |
| Text JD input (not PDF) | Most JDs are copy-pasted anyway |

---

*ResumeAI — Built for Aman, powered by Claude.*
