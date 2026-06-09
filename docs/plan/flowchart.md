# HireSignal — Application Flowchart

---

## Top-Level User Flow

```
User opens HireSignal
        │
        ▼
   ┌──────────┐
   │ HomePage │
   │ /        │
   └────┬─────┘
        │
   ┌────┴─────────────────┐
   │                      │
   ▼                      ▼
[Mode 1]             [Mode 2]
"I have a resume"    "Build from scratch"
   │                      │
   ▼                      ▼
/analyze             /build
   │                      │
   └──────────┬───────────┘
              ▼
         /results
              │
              ▼
         Download PDF
```

---

## Mode 1 — Upload & Analyze

```
/analyze page
    │
    ├── UploadPanel (drag & drop PDF)
    ├── JDInput (paste job description)
    └── AnalyzeButton
              │
              ▼ (on submit)
    POST /api/analyze
    multipart: { resume: File, jobDescription: string }
              │
              ├── pdfParser.js → extract text from PDF
              ├── analyzePrompt.js → build Claude prompt
              └── claudeService.js → call Claude API
                        │
                        ▼
              Claude returns structured JSON
                        │
                        ▼
              Navigate to /results
              (pass analysis data via router state)
```

---

## Mode 2 — Build from Scratch

```
/build page
    │
    ▼
[JD Input screen]
Paste job description first
    │
    ▼
[WizardShell — 8 steps]
Progress bar: ●●●○○○○○
    │
    ├── Step 1: PersonalInfo (name, location, contact)
    ├── Step 2: ExperienceLevel (chips: Fresher / 0-1yr / 1-3yr / 3-5yr / 5+)
    ├── Step 3: WorkHistory (title, company, dates, bullets + AI suggest)
    ├── Step 4: Previous Roles (repeatable, up to 3)
    ├── Step 5: Skills (multi-select chips, JD-matched highlighted)
    ├── Step 6: Projects (up to 4, AI-enhance description)
    ├── Step 7: Education (level, degree, institution, year)
    └── Step 8: Extras (certifications, languages, links)
    │
    ▼
[Review Screen]
Shows all answers, user can edit any section
    │
    ▼ (click "Build & Analyze")
POST /api/build-resume
{ wizardData: {...}, jobDescription: string }
    │
    ├── buildPrompt.js → build Claude prompt
    └── claudeService.js → call Claude API
              │
              ▼
    Claude builds resume + analyzes in ONE call
              │
              ▼
    Navigate to /results
```

---

## Results Page (Shared)

```
/results
    │
    ├── MatchScore.jsx
    │   └── Circular score (0-100) + 4 category bars
    │       (skills, keywords, experienceLevel, roleAlignment)
    │
    ├── KeywordGaps.jsx
    │   └── Color-coded chips by category
    │       (technical=red, tools=orange, softSkills=yellow, certifications=purple)
    │
    ├── ProjectSuggestions.jsx
    │   └── Cards with title + description + copy button
    │       (2-4 suggestions, JD-targeted)
    │
    ├── SectionFeedback.jsx
    │   └── Side-by-side: original bullet vs rewritten bullet
    │       Issue label above each pair
    │
    └── ResumePreview.jsx
        └── Full rewritten resume, editable before export
                │
                ▼ (click "Download Optimized Resume")
        POST /api/generate-pdf
        { resumeData: rewrittenResume }
                │
                ▼
        pdfGenerator.js → pdfmake → binary PDF
                │
                ▼
        File downloads to machine
```

---

## Inline AI Bullet Suggest (within WorkHistory wizard step)

```
WorkHistory step
    │
    └── For each bullet input:
        User types → clicks "✨ Suggest bullet"
                │
                ▼
        POST /api/suggest-bullet
        { title, company, jdExcerpt }
                │
                ▼
        bulletPrompt.js → claudeService
                │
                ▼
        Returns single bullet string
                │
                ▼
        Pre-fills input — user accepts / edits / skips
```

---

## Inline AI Project Enhance (within Projects wizard step)

```
Projects step
    │
    └── User writes project description → clicks "✨ AI-enhance"
                │
                ▼
        POST /api/enhance-description
        { projectName, stack, description, jdExcerpt }
                │
                ▼
        rewritePrompt.js → claudeService
                │
                ▼
        Returns enhanced description
                │
                ▼
        Replaces textarea content — user accepts / edits
```

---

## State Flow

```
Mode 1:
  useResumeAnalysis hook
  ├── analysisState: idle | loading | success | error
  ├── analysisData: null | AnalysisResponse
  └── submit(file, jd) → POST → sets analysisData → navigate to /results

Mode 2:
  useWizardSession hook
  ├── wizardData: WizardDataShape (persisted to localStorage)
  ├── currentStep: 0-8
  ├── setStep(n), updateSection(key, value)
  └── submit() → POST /api/build-resume → navigate to /results
```

---

## Data Shape — wizardData

```json
{
  "personal": {
    "name": "string",
    "location": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "github": "string"
  },
  "experienceLevel": "Fresher | 0-1 Year | 1-3 Years | 3-5 Years | 5+ Years",
  "workHistory": [
    {
      "title": "string",
      "company": "string",
      "start": "Mon YYYY",
      "end": "Mon YYYY | Present",
      "bullets": ["string"]
    }
  ],
  "skills": {
    "technical": ["string"],
    "tools": ["string"],
    "soft": ["string"]
  },
  "projects": [
    {
      "name": "string",
      "type": "Web App | Mobile App | API / Backend Service | ...",
      "stack": ["string"],
      "description": "string"
    }
  ],
  "education": {
    "level": "string",
    "degree": "string",
    "institution": "string",
    "year": "string"
  },
  "extras": {
    "certifications": ["string"],
    "languages": ["string"],
    "portfolio": "string"
  }
}
```
