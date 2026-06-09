# HireSignal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user AI-powered resume analyzer and builder with two modes — upload+analyze existing PDF (Mode 1) and build from scratch via wizard (Mode 2).

**Architecture:** React SPA (Vite) talks to an Express API server. Server handles file uploads, calls Claude API with structured prompts, returns JSON analysis. PDF generation done server-side via pdfmake. No database — wizard state lives in React + localStorage.

**Tech Stack:** React 18 + Vite + Tailwind CSS (client) · Node.js 22 + Express + multer (server) · Anthropic SDK (`@anthropic-ai/sdk`) · pdf-parse · pdfmake

---

## File Map

### Client files to create
```
client/src/App.jsx
client/src/pages/HomePage.jsx
client/src/pages/BuildPage.jsx
client/src/pages/ResultsPage.jsx
client/src/components/shared/ModeSelector.jsx
client/src/components/shared/JDInput.jsx
client/src/components/shared/DownloadButton.jsx
client/src/components/mode1/UploadPanel.jsx
client/src/components/mode1/AnalyzeButton.jsx
client/src/components/mode2/WizardShell.jsx
client/src/components/mode2/ProgressBar.jsx
client/src/components/mode2/QuestionCard.jsx
client/src/components/mode2/OptionButton.jsx
client/src/components/mode2/steps/PersonalInfo.jsx
client/src/components/mode2/steps/ExperienceLevel.jsx
client/src/components/mode2/steps/WorkHistory.jsx
client/src/components/mode2/steps/Skills.jsx
client/src/components/mode2/steps/Projects.jsx
client/src/components/mode2/steps/Education.jsx
client/src/components/mode2/steps/Extras.jsx
client/src/components/results/MatchScore.jsx
client/src/components/results/KeywordGaps.jsx
client/src/components/results/ProjectSuggestions.jsx
client/src/components/results/SectionFeedback.jsx
client/src/components/results/ResumePreview.jsx
client/src/hooks/useResumeAnalysis.js
client/src/hooks/useWizardSession.js
client/index.html
client/vite.config.js
client/tailwind.config.js
client/postcss.config.js
client/package.json
```

### Server files to create
```
server/index.js
server/routes/analyze.js
server/routes/build.js
server/routes/generate.js
server/routes/suggest.js
server/services/claudeService.js
server/services/pdfParser.js
server/services/pdfGenerator.js
server/prompts/analyzePrompt.js
server/prompts/buildPrompt.js
server/prompts/bulletPrompt.js
server/package.json
server/.env
```

---

## Phase 1 — Foundation

---

### Task 1: Project Scaffold

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/index.html`
- Create: `server/package.json`
- Create: `server/.env`

- [ ] **Step 1: Init client with Vite**

```bash
cd hiresignal
npm create vite@latest client -- --template react
cd client
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom
```

- [ ] **Step 2: Configure Tailwind**

Edit `client/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Edit `client/src/index.css` (replace contents):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Configure Vite proxy (so /api calls hit server)**

Edit `client/vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

- [ ] **Step 4: Init server**

```bash
cd ../server
npm init -y
npm install express multer cors dotenv
npm install @anthropic-ai/sdk
npm install pdf-parse
npm install pdfmake
```

- [ ] **Step 5: Create .env**

```env
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
PORT=3001
```

Add to `.gitignore` at root:
```
server/.env
server/uploads/
server/outputs/
node_modules/
client/node_modules/
```

- [ ] **Step 6: Create upload/output dirs**

```bash
mkdir server/uploads server/outputs
```

- [ ] **Step 7: Verify client runs**

```bash
cd client && npm run dev
```
Expected: Vite dev server at http://localhost:5173, React default page loads.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: scaffold client (Vite+React+Tailwind) and server (Express)"
```

---

### Task 2: Server Entry + Express Setup

**Files:**
- Create: `server/index.js`

- [ ] **Step 1: Write server entry**

Create `server/index.js`:
```js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import analyzeRoute from './routes/analyze.js'
import buildRoute from './routes/build.js'
import generateRoute from './routes/generate.js'
import suggestRoute from './routes/suggest.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api', analyzeRoute)
app.use('/api', buildRoute)
app.use('/api', generateRoute)
app.use('/api', suggestRoute)

app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Server running on :${PORT}`))
```

Add `"type": "module"` to `server/package.json`:
```json
{
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  }
}
```

- [ ] **Step 2: Create stub route files so server starts**

Create `server/routes/analyze.js`:
```js
import { Router } from 'express'
const router = Router()
router.post('/analyze', (_req, res) => res.json({ stub: true }))
export default router
```

Create `server/routes/build.js`:
```js
import { Router } from 'express'
const router = Router()
router.post('/build-resume', (_req, res) => res.json({ stub: true }))
export default router
```

Create `server/routes/generate.js`:
```js
import { Router } from 'express'
const router = Router()
router.post('/generate-pdf', (_req, res) => res.json({ stub: true }))
export default router
```

Create `server/routes/suggest.js`:
```js
import { Router } from 'express'
const router = Router()
router.post('/suggest-bullet', (_req, res) => res.json({ stub: true }))
router.post('/enhance-description', (_req, res) => res.json({ stub: true }))
export default router
```

- [ ] **Step 3: Verify server starts**

```bash
cd server && npm run dev
```
Expected: `Server running on :3001`

```bash
curl http://localhost:3001/health
```
Expected: `{"ok":true}`

- [ ] **Step 4: Commit**

```bash
git add server/
git commit -m "feat: express server entry with stub routes"
```

---

### Task 3: Claude API Service

**Files:**
- Create: `server/services/claudeService.js`

- [ ] **Step 1: Write claudeService**

Create `server/services/claudeService.js`:
```js
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const MODEL = 'claude-sonnet-4-20250514'
export const MAX_TOKENS = 4096

export async function callClaude(systemPrompt, userMessage) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  return response.content[0].text
}

export async function callClaudeJSON(systemPrompt, userMessage) {
  const text = await callClaude(systemPrompt, userMessage)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude returned no JSON object')
  return JSON.parse(jsonMatch[0])
}
```

- [ ] **Step 2: Smoke test**

Create a temporary test script `server/test-claude.js`:
```js
import dotenv from 'dotenv'
dotenv.config()
import { callClaude } from './services/claudeService.js'

const result = await callClaude('You are a helpful assistant.', 'Say "OK" only.')
console.log(result)
```

```bash
cd server && node test-claude.js
```
Expected: prints `OK` or similar short response.

Delete `server/test-claude.js` after verifying.

- [ ] **Step 3: Commit**

```bash
git add server/services/claudeService.js
git commit -m "feat: Claude API service wrapper with JSON helper"
```

---

### Task 4: PDF Parser Service

**Files:**
- Create: `server/services/pdfParser.js`

- [ ] **Step 1: Write pdfParser**

Create `server/services/pdfParser.js`:
```js
import pdfParse from 'pdf-parse'
import fs from 'fs'

export async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath)
  const data = await pdfParse(buffer)
  return data.text.trim()
}
```

- [ ] **Step 2: Commit**

```bash
git add server/services/pdfParser.js
git commit -m "feat: pdf-parse wrapper for text extraction"
```

---

### Task 5: Analyze Prompt

**Files:**
- Create: `server/prompts/analyzePrompt.js`

- [ ] **Step 1: Write analyze prompt builder**

Create `server/prompts/analyzePrompt.js`:
```js
export const ANALYZE_SYSTEM = `You are an expert ATS resume analyst and career coach.

You will receive:
1. RESUME TEXT: Extracted text from the user's current resume
2. JOB DESCRIPTION: The target job posting

Return ONLY a valid JSON object with this exact structure (no markdown, no preamble):
{
  "matchScore": number,
  "scoreBreakdown": { "skills": number, "keywords": number, "experienceLevel": number, "roleAlignment": number },
  "missingKeywords": { "technical": [], "tools": [], "softSkills": [], "certifications": [] },
  "projectSuggestions": [{ "title": "", "description": "", "reason": "" }],
  "sectionFeedback": { "experience": [{ "original": "", "rewritten": "", "issue": "" }] },
  "atsPrediction": { "pass": false, "reason": "" },
  "rewrittenResume": { "name": "", "summary": "", "experience": [], "skills": [], "projects": [], "education": [] }
}

Rules:
- Integrate keywords naturally, never awkwardly
- Quantify every achievement (use placeholder ranges if real numbers unknown)
- Keep rewritten bullets under 20 words each
- Suggest only realistic, buildable projects (2-4 suggestions)
- Return ONLY JSON, no explanation text`

export function buildAnalyzeMessage(resumeText, jobDescription) {
  return `RESUME TEXT:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`
}
```

- [ ] **Step 2: Commit**

```bash
git add server/prompts/analyzePrompt.js
git commit -m "feat: analyze prompt builder for Mode 1"
```

---

### Task 6: Analyze Route (Mode 1 Backend)

**Files:**
- Modify: `server/routes/analyze.js`

- [ ] **Step 1: Implement analyze route**

Overwrite `server/routes/analyze.js`:
```js
import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { extractTextFromPDF } from '../services/pdfParser.js'
import { callClaudeJSON } from '../services/claudeService.js'
import { ANALYZE_SYSTEM, buildAnalyzeMessage } from '../prompts/analyzePrompt.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const upload = multer({ dest: path.join(__dirname, '../uploads/') })
const router = Router()

router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription } = req.body
    if (!req.file) return res.status(400).json({ error: 'Resume file required' })
    if (!jobDescription) return res.status(400).json({ error: 'Job description required' })

    const resumeText = await extractTextFromPDF(req.file.path)
    const analysis = await callClaudeJSON(ANALYZE_SYSTEM, buildAnalyzeMessage(resumeText, jobDescription))

    res.json(analysis)
  } catch (err) {
    console.error('Analyze error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
```

- [ ] **Step 2: Test with curl**

```bash
curl -X POST http://localhost:3001/api/analyze \
  -F "resume=@/path/to/test.pdf" \
  -F "jobDescription=Looking for a React developer with 3 years experience"
```
Expected: JSON with `matchScore`, `missingKeywords`, etc.

- [ ] **Step 3: Commit**

```bash
git add server/routes/analyze.js
git commit -m "feat: POST /api/analyze — PDF parse + Claude analysis"
```

---

### Task 7: HomePage + ModeSelector

**Files:**
- Create: `client/src/App.jsx`
- Create: `client/src/pages/HomePage.jsx`
- Create: `client/src/components/shared/ModeSelector.jsx`

- [ ] **Step 1: Write App.jsx with routing**

Create `client/src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BuildPage from './pages/BuildPage'
import ResultsPage from './pages/ResultsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Write ModeSelector**

Create `client/src/components/shared/ModeSelector.jsx`:
```jsx
import { useNavigate } from 'react-router-dom'

export default function ModeSelector() {
  const navigate = useNavigate()

  return (
    <div className="flex gap-6 justify-center mt-12">
      <button
        onClick={() => navigate('/analyze')}
        className="flex flex-col items-center gap-3 p-8 w-64 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer bg-white"
      >
        <span className="text-4xl">📄</span>
        <h2 className="text-xl font-semibold text-gray-800">I have a resume</h2>
        <p className="text-sm text-gray-500 text-center">Upload your PDF and analyze it against a job description</p>
      </button>

      <button
        onClick={() => navigate('/build')}
        className="flex flex-col items-center gap-3 p-8 w-64 rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer bg-white"
      >
        <span className="text-4xl">✨</span>
        <h2 className="text-xl font-semibold text-gray-800">Build from scratch</h2>
        <p className="text-sm text-gray-500 text-center">Answer a few questions and let AI build your resume</p>
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Write HomePage**

Create `client/src/pages/HomePage.jsx`:
```jsx
import ModeSelector from '../components/shared/ModeSelector'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">HireSignal</h1>
        <p className="text-lg text-gray-500">AI-powered resume analyzer & builder</p>
      </div>
      <ModeSelector />
    </div>
  )
}
```

- [ ] **Step 4: Create stub pages (so router doesn't crash)**

Create `client/src/pages/BuildPage.jsx`:
```jsx
export default function BuildPage() {
  return <div className="p-8">Build Page — coming soon</div>
}
```

Create `client/src/pages/ResultsPage.jsx`:
```jsx
export default function ResultsPage() {
  return <div className="p-8">Results Page — coming soon</div>
}
```

- [ ] **Step 5: Update App to add /analyze route**

Add analyze page stub. Edit `client/src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AnalyzePage from './pages/AnalyzePage'
import BuildPage from './pages/BuildPage'
import ResultsPage from './pages/ResultsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

Create `client/src/pages/AnalyzePage.jsx`:
```jsx
export default function AnalyzePage() {
  return <div className="p-8">Analyze Page — coming soon</div>
}
```

- [ ] **Step 6: Verify in browser**

```bash
cd client && npm run dev
```
Open http://localhost:5173 — two mode cards visible, hover states work, clicking navigates.

- [ ] **Step 7: Commit**

```bash
git add client/src/
git commit -m "feat: HomePage with ModeSelector, routing scaffold"
```

---

### Task 8: Mode 1 UI — AnalyzePage

**Files:**
- Create: `client/src/components/mode1/UploadPanel.jsx`
- Create: `client/src/components/shared/JDInput.jsx`
- Create: `client/src/components/mode1/AnalyzeButton.jsx`
- Modify: `client/src/pages/AnalyzePage.jsx`

- [ ] **Step 1: Write UploadPanel**

Create `client/src/components/mode1/UploadPanel.jsx`:
```jsx
import { useRef, useState } from 'react'

export default function UploadPanel({ onFileSelect }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  function handleFile(f) {
    if (f?.type !== 'application/pdf') return
    setFile(f)
    onFileSelect(f)
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors
        ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
    >
      <span className="text-4xl">📄</span>
      {file
        ? <p className="text-sm font-medium text-green-600">{file.name}</p>
        : <p className="text-sm text-gray-500">Drag & drop your resume PDF, or click to browse</p>
      }
      <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  )
}
```

- [ ] **Step 2: Write JDInput**

Create `client/src/components/shared/JDInput.jsx`:
```jsx
export default function JDInput({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Job Description</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Paste the full job description here..."
        className="border border-gray-300 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-blue-500"
      />
    </div>
  )
}
```

- [ ] **Step 3: Write AnalyzeButton**

Create `client/src/components/mode1/AnalyzeButton.jsx`:
```jsx
export default function AnalyzeButton({ onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Analyzing...' : 'Analyze My Resume →'}
    </button>
  )
}
```

- [ ] **Step 4: Assemble AnalyzePage**

Overwrite `client/src/pages/AnalyzePage.jsx`:
```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadPanel from '../components/mode1/UploadPanel'
import JDInput from '../components/shared/JDInput'
import AnalyzeButton from '../components/mode1/AnalyzeButton'

export default function AnalyzePage() {
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleAnalyze() {
    if (!file || !jd.trim()) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('jobDescription', jd)
      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      navigate('/results', { state: { analysis: data, mode: 'analyze' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-900">Analyze My Resume</h1>
        <UploadPanel onFileSelect={setFile} />
        <JDInput value={jd} onChange={setJd} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <AnalyzeButton onClick={handleAnalyze} disabled={!file || !jd.trim()} loading={loading} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify in browser**

Confirm:
- Drag/drop and click-to-browse work for PDF only
- JD textarea accepts input
- Button disabled until both present
- Loading state shows on click

- [ ] **Step 6: Commit**

```bash
git add client/src/
git commit -m "feat: Mode 1 UI — UploadPanel, JDInput, AnalyzeButton"
```

---

### Task 9: Results Page — MatchScore + KeywordGaps

**Files:**
- Create: `client/src/components/results/MatchScore.jsx`
- Create: `client/src/components/results/KeywordGaps.jsx`
- Modify: `client/src/pages/ResultsPage.jsx`

- [ ] **Step 1: Write MatchScore**

Create `client/src/components/results/MatchScore.jsx`:
```jsx
export default function MatchScore({ matchScore, scoreBreakdown }) {
  const categories = [
    { key: 'skills', label: 'Skills' },
    { key: 'keywords', label: 'Keywords' },
    { key: 'experienceLevel', label: 'Experience' },
    { key: 'roleAlignment', label: 'Role Fit' },
  ]

  const color = matchScore >= 75 ? 'text-green-600' : matchScore >= 50 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Match Score</h2>
      <div className="flex items-center gap-8">
        <div className={`text-6xl font-bold ${color}`}>{matchScore}</div>
        <div className="flex-1 flex flex-col gap-3">
          {categories.map(({ key, label }) => (
            <div key={key}>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{label}</span>
                <span>{scoreBreakdown[key]}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${scoreBreakdown[key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write KeywordGaps**

Create `client/src/components/results/KeywordGaps.jsx`:
```jsx
const CATEGORY_STYLES = {
  technical: 'bg-red-100 text-red-700',
  tools: 'bg-orange-100 text-orange-700',
  softSkills: 'bg-yellow-100 text-yellow-800',
  certifications: 'bg-purple-100 text-purple-700',
}

export default function KeywordGaps({ missingKeywords }) {
  const entries = Object.entries(missingKeywords).filter(([, v]) => v.length > 0)

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Keyword Gaps</h2>
        <p className="text-sm text-green-600">No missing keywords detected!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Keyword Gaps</h2>
      {entries.map(([category, keywords]) => (
        <div key={category} className="mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">{category}</p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span key={kw} className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_STYLES[category]}`}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Wire up ResultsPage**

Overwrite `client/src/pages/ResultsPage.jsx`:
```jsx
import { useLocation, useNavigate } from 'react-router-dom'
import MatchScore from '../components/results/MatchScore'
import KeywordGaps from '../components/results/KeywordGaps'

export default function ResultsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No analysis data found.</p>
          <button onClick={() => navigate('/')} className="text-blue-600 underline">Go home</button>
        </div>
      </div>
    )
  }

  const { analysis } = state

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Your Results</h1>
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">← Start over</button>
        </div>
        <MatchScore matchScore={analysis.matchScore} scoreBreakdown={analysis.scoreBreakdown} />
        <KeywordGaps missingKeywords={analysis.missingKeywords} />
        <p className="text-sm text-gray-400 text-center">More sections coming in Phase 3</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: End-to-end test**

Run both client and server. Upload a real PDF, paste a JD, click Analyze.
Expected: Navigates to /results with score and keyword chips visible.

- [ ] **Step 5: Commit**

```bash
git add client/src/
git commit -m "feat: ResultsPage with MatchScore and KeywordGaps (Phase 1 complete)"
```

---

## Phase 2 — Mode 2 Wizard

---

### Task 10: Build Prompt + Build Route

**Files:**
- Create: `server/prompts/buildPrompt.js`
- Modify: `server/routes/build.js`

- [ ] **Step 1: Write build prompt**

Create `server/prompts/buildPrompt.js`:
```js
export const BUILD_SYSTEM = `You are an expert resume writer and ATS career coach.

You will receive:
1. WIZARD DATA: JSON object with all user-provided details
2. JOB DESCRIPTION: The target job posting

Your task:
1. Write a complete, professional resume from the wizard data
2. Immediately analyze it against the JD
3. Return the improved version + full analysis

Return ONLY a valid JSON object (no markdown) with this structure:
{
  "builtResume": { "name": "", "summary": "", "experience": [], "skills": [], "projects": [], "education": [] },
  "matchScore": number,
  "scoreBreakdown": { "skills": number, "keywords": number, "experienceLevel": number, "roleAlignment": number },
  "missingKeywords": { "technical": [], "tools": [], "softSkills": [], "certifications": [] },
  "projectSuggestions": [{ "title": "", "description": "", "reason": "" }],
  "sectionFeedback": { "experience": [{ "original": "", "rewritten": "", "issue": "" }] },
  "atsPrediction": { "pass": false, "reason": "" },
  "rewrittenResume": { "name": "", "summary": "", "experience": [], "skills": [], "projects": [], "education": [] }
}

Rules:
- Write resume bullets using strong action verbs
- Add realistic quantified metrics where data allows
- Tailor the summary section directly to the JD
- Weave in JD keywords naturally
- Return ONLY JSON`

export function buildBuildMessage(wizardData, jobDescription) {
  return `WIZARD DATA:\n${JSON.stringify(wizardData, null, 2)}\n\nJOB DESCRIPTION:\n${jobDescription}`
}
```

- [ ] **Step 2: Implement build route**

Overwrite `server/routes/build.js`:
```js
import { Router } from 'express'
import { callClaudeJSON } from '../services/claudeService.js'
import { BUILD_SYSTEM, buildBuildMessage } from '../prompts/buildPrompt.js'

const router = Router()

router.post('/build-resume', async (req, res) => {
  try {
    const { wizardData, jobDescription } = req.body
    if (!wizardData) return res.status(400).json({ error: 'wizardData required' })
    if (!jobDescription) return res.status(400).json({ error: 'jobDescription required' })

    const result = await callClaudeJSON(BUILD_SYSTEM, buildBuildMessage(wizardData, jobDescription))
    res.json(result)
  } catch (err) {
    console.error('Build error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
```

- [ ] **Step 3: Commit**

```bash
git add server/prompts/buildPrompt.js server/routes/build.js
git commit -m "feat: POST /api/build-resume — wizard data + Claude build+analyze"
```

---

### Task 11: Wizard Shell + Progress Bar

**Files:**
- Create: `client/src/components/mode2/ProgressBar.jsx`
- Create: `client/src/components/mode2/WizardShell.jsx`

- [ ] **Step 1: Write ProgressBar**

Create `client/src/components/mode2/ProgressBar.jsx`:
```jsx
export default function ProgressBar({ currentStep, totalSteps }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>Section {currentStep} of {totalSteps}</span>
        <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write WizardShell**

Create `client/src/components/mode2/WizardShell.jsx`:
```jsx
import ProgressBar from './ProgressBar'

export default function WizardShell({ currentStep, totalSteps, onBack, children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <div className="mt-6">{children}</div>
        {currentStep > 1 && (
          <button
            onClick={onBack}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/mode2/
git commit -m "feat: WizardShell + ProgressBar components"
```

---

### Task 12: QuestionCard + OptionButton

**Files:**
- Create: `client/src/components/mode2/OptionButton.jsx`
- Create: `client/src/components/mode2/QuestionCard.jsx`

- [ ] **Step 1: Write OptionButton**

Create `client/src/components/mode2/OptionButton.jsx`:
```jsx
export default function OptionButton({ label, selected, onClick, recommended }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
        ${selected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
        }
        ${recommended ? 'ring-2 ring-green-400' : ''}
      `}
    >
      {label}
      {recommended && <span className="ml-1 text-xs text-green-600">★ Recommended</span>}
    </button>
  )
}
```

- [ ] **Step 2: Write QuestionCard**

Create `client/src/components/mode2/QuestionCard.jsx`:
```jsx
import OptionButton from './OptionButton'

export default function QuestionCard({ question, options, selected, onSelect, onCustom, customValue, recommended }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-800">{question}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <OptionButton
            key={opt}
            label={opt}
            selected={selected === opt}
            recommended={recommended === opt}
            onClick={() => onSelect(opt)}
          />
        ))}
        {onCustom && (
          <input
            type="text"
            placeholder="Other..."
            value={customValue || ''}
            onChange={(e) => onCustom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/mode2/
git commit -m "feat: QuestionCard + OptionButton wizard components"
```

---

### Task 13: useWizardSession Hook

**Files:**
- Create: `client/src/hooks/useWizardSession.js`

- [ ] **Step 1: Write hook**

Create `client/src/hooks/useWizardSession.js`:
```js
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'hiresignal_wizard'

const INITIAL_DATA = {
  personal: { name: '', location: '', email: '', phone: '', linkedin: '', github: '' },
  experienceLevel: '',
  workHistory: [],
  skills: { technical: [], tools: [], soft: [] },
  projects: [],
  education: { level: '', degree: '', institution: '', year: '' },
  extras: { certifications: [], languages: [], portfolio: '' },
}

export function useWizardSession() {
  const [step, setStep] = useState(1)
  const [jd, setJd] = useState('')
  const [wizardData, setWizardData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_DATA
    } catch {
      return INITIAL_DATA
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardData))
  }, [wizardData])

  function updateSection(key, value) {
    setWizardData((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setWizardData(INITIAL_DATA)
    setStep(1)
    setJd('')
    localStorage.removeItem(STORAGE_KEY)
  }

  return { step, setStep, jd, setJd, wizardData, updateSection, reset }
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/hooks/useWizardSession.js
git commit -m "feat: useWizardSession hook with localStorage persistence"
```

---

### Task 14: Wizard Step Components

**Files:**
- Create: `client/src/components/mode2/steps/PersonalInfo.jsx`
- Create: `client/src/components/mode2/steps/ExperienceLevel.jsx`
- Create: `client/src/components/mode2/steps/WorkHistory.jsx`
- Create: `client/src/components/mode2/steps/Skills.jsx`
- Create: `client/src/components/mode2/steps/Projects.jsx`
- Create: `client/src/components/mode2/steps/Education.jsx`
- Create: `client/src/components/mode2/steps/Extras.jsx`

- [ ] **Step 1: Write PersonalInfo**

Create `client/src/components/mode2/steps/PersonalInfo.jsx`:
```jsx
const FIELDS = [
  { key: 'name', label: 'Full Name', placeholder: 'Aman Raj' },
  { key: 'location', label: 'City / Location', placeholder: 'Vadodara, Gujarat' },
  { key: 'email', label: 'Email', placeholder: 'you@email.com' },
  { key: 'phone', label: 'Phone', placeholder: '+91 98XXX XXXXX' },
  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/username' },
  { key: 'github', label: 'GitHub URL', placeholder: 'github.com/username' },
]

export default function PersonalInfo({ data, onChange, onNext }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-800">Personal Info</h2>
      {FIELDS.map(({ key, label, placeholder }) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <input
            type="text"
            value={data[key]}
            onChange={(e) => onChange({ ...data, [key]: e.target.value })}
            placeholder={placeholder}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      ))}
      <button
        onClick={onNext}
        disabled={!data.name || !data.email}
        className="mt-2 py-2 px-6 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        Continue →
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Write ExperienceLevel**

Create `client/src/components/mode2/steps/ExperienceLevel.jsx`:
```jsx
import QuestionCard from '../QuestionCard'

const OPTIONS = ['Fresher / No Experience', '0–1 Year', '1–3 Years', '3–5 Years', '5+ Years']

export default function ExperienceLevel({ value, onChange, onNext, jd }) {
  const recommended = jd?.toLowerCase().includes('senior') ? '5+ Years'
    : jd?.toLowerCase().includes('junior') ? '0–1 Year'
    : '1–3 Years'

  return (
    <div className="flex flex-col gap-5">
      <QuestionCard
        question="How many years of professional experience do you have?"
        options={OPTIONS}
        selected={value}
        onSelect={onChange}
        recommended={recommended}
      />
      <button
        onClick={onNext}
        disabled={!value}
        className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        Continue →
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Write WorkHistory**

Create `client/src/components/mode2/steps/WorkHistory.jsx`:
```jsx
import { useState } from 'react'

const JOB_TITLES = ['Frontend Developer', 'Full Stack Developer', 'Backend Developer', 'Software Engineer', 'UI/UX Designer']

export default function WorkHistory({ data, onChange, onNext, jd }) {
  const [suggestingIdx, setSuggestingIdx] = useState(null)
  const entry = data[0] || { title: '', company: '', start: '', end: '', bullets: [''] }

  function updateEntry(updates) {
    onChange([{ ...entry, ...updates }, ...data.slice(1)])
  }

  async function suggestBullet(idx) {
    setSuggestingIdx(idx)
    try {
      const res = await fetch('/api/suggest-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: entry.title, company: entry.company, jdExcerpt: jd?.slice(0, 400) }),
      })
      const { bullet } = await res.json()
      const bullets = [...entry.bullets]
      bullets[idx] = bullet
      updateEntry({ bullets })
    } finally {
      setSuggestingIdx(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-800">Most Recent Role</h2>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Job Title</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {JOB_TITLES.map((t) => (
            <button
              key={t}
              onClick={() => updateEntry({ title: t })}
              className={`px-3 py-1 rounded-lg border text-sm ${entry.title === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          placeholder="Or type custom title..."
          value={entry.title}
          onChange={(e) => updateEntry({ title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Company</label>
          <input value={entry.company} onChange={(e) => updateEntry({ company: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Duration</label>
          <div className="flex gap-2">
            <input placeholder="Jan 2022" value={entry.start} onChange={(e) => updateEntry({ start: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            <input placeholder="Present" value={entry.end} onChange={(e) => updateEntry({ end: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Responsibilities (up to 5)</label>
        {entry.bullets.map((b, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={b}
              onChange={(e) => { const bullets = [...entry.bullets]; bullets[i] = e.target.value; updateEntry({ bullets }) }}
              placeholder={`Bullet ${i + 1}`}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => suggestBullet(i)}
              disabled={!entry.title || suggestingIdx === i}
              className="px-3 py-2 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50"
            >
              {suggestingIdx === i ? '...' : '✨'}
            </button>
          </div>
        ))}
        {entry.bullets.length < 5 && (
          <button
            onClick={() => updateEntry({ bullets: [...entry.bullets, ''] })}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add bullet
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!entry.title || !entry.company}
        className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        Continue →
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Write Skills**

Create `client/src/components/mode2/steps/Skills.jsx`:
```jsx
const SKILL_GROUPS = {
  Languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C++'],
  Frontend: ['React', 'Next.js', 'Vue', 'Tailwind CSS', 'HTML/CSS'],
  Backend: ['Node.js', 'Express', 'FastAPI', 'Django', 'REST APIs'],
  Databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'],
  'DevOps/Cloud': ['Docker', 'AWS', 'Git', 'CI/CD', 'Linux'],
}

const SOFT_SKILLS = ['Team Collaboration', 'Problem Solving', 'Communication', 'Leadership', 'Agile/Scrum', 'Client Management']

export default function Skills({ data, onChange, onNext, jd }) {
  const jdLower = jd?.toLowerCase() || ''

  function toggle(category, skill) {
    const current = data[category] || []
    onChange({
      ...data,
      [category]: current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill],
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-800">Skills</h2>
      {Object.entries(SKILL_GROUPS).map(([group, skills]) => (
        <div key={group}>
          <p className="text-sm font-medium text-gray-500 mb-2">{group}</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const isJdMatch = jdLower.includes(skill.toLowerCase())
              const selected = data.technical?.includes(skill)
              return (
                <button
                  key={skill}
                  onClick={() => toggle('technical', skill)}
                  className={`px-3 py-1 rounded-full border text-sm font-medium transition-all
                    ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-600 hover:border-blue-400'}
                    ${isJdMatch ? 'ring-2 ring-green-300' : ''}
                  `}
                >
                  {skill}
                  {isJdMatch && <span className="ml-1 text-xs text-green-600">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Soft Skills</p>
        <div className="flex flex-wrap gap-2">
          {SOFT_SKILLS.map((skill) => {
            const selected = data.soft?.includes(skill)
            return (
              <button
                key={skill}
                onClick={() => toggle('soft', skill)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-all
                  ${selected ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-300 text-gray-600 hover:border-purple-400'}
                `}
              >
                {skill}
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={(data.technical?.length || 0) === 0}
        className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        Continue →
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Write Projects**

Create `client/src/components/mode2/steps/Projects.jsx`:
```jsx
import { useState } from 'react'

const PROJECT_TYPES = ['Web App', 'Mobile App', 'API / Backend Service', 'Chrome Extension', 'CLI Tool', 'Open Source']

export default function Projects({ data, onChange, onNext }) {
  const [enhancingIdx, setEnhancingIdx] = useState(null)

  function addProject() {
    onChange([...data, { name: '', type: '', stack: [], description: '' }])
  }

  function updateProject(idx, updates) {
    const updated = [...data]
    updated[idx] = { ...updated[idx], ...updates }
    onChange(updated)
  }

  async function enhanceDescription(idx) {
    const project = data[idx]
    setEnhancingIdx(idx)
    try {
      const res = await fetch('/api/enhance-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: project.name, stack: project.stack, description: project.description }),
      })
      const { description } = await res.json()
      updateProject(idx, { description })
    } finally {
      setEnhancingIdx(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-800">Projects</h2>

      {data.map((project, idx) => (
        <div key={idx} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">Project {idx + 1}</p>
          <input
            placeholder="Project name"
            value={project.name}
            onChange={(e) => updateProject(idx, { name: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="flex flex-wrap gap-2">
            {PROJECT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => updateProject(idx, { type: t })}
                className={`px-3 py-1 rounded-lg border text-sm ${project.type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <textarea
              placeholder="What does it do? What was the impact?"
              value={project.description}
              onChange={(e) => updateProject(idx, { description: e.target.value })}
              rows={3}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => enhanceDescription(idx)}
              disabled={!project.description || enhancingIdx === idx}
              className="px-3 py-2 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50 self-start"
            >
              {enhancingIdx === idx ? '...' : '✨ Enhance'}
            </button>
          </div>
        </div>
      ))}

      {data.length < 4 && (
        <button onClick={addProject} className="text-sm text-blue-600 hover:underline self-start">
          + Add project
        </button>
      )}

      <button
        onClick={onNext}
        className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium"
      >
        Continue →
      </button>
    </div>
  )
}
```

- [ ] **Step 6: Write Education**

Create `client/src/components/mode2/steps/Education.jsx`:
```jsx
import QuestionCard from '../QuestionCard'

const LEVELS = ["High School", "Diploma", "Bachelor's", "Master's", "PhD", "Self-taught / Bootcamp"]
const YEARS = Array.from({ length: 15 }, (_, i) => String(2025 - i))

export default function Education({ data, onChange, onNext }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-800">Education</h2>
      <QuestionCard
        question="Highest level of education"
        options={LEVELS}
        selected={data.level}
        onSelect={(v) => onChange({ ...data, level: v })}
      />
      {['degree', 'institution'].map((field) => (
        <div key={field}>
          <label className="text-sm font-medium text-gray-700 mb-1 block capitalize">{field === 'degree' ? 'Degree / Field of study' : 'Institution name'}</label>
          <input
            value={data[field]}
            onChange={(e) => onChange({ ...data, [field]: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      ))}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Graduation Year</label>
        <div className="flex flex-wrap gap-2">
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => onChange({ ...data, year: y })}
              className={`px-3 py-1 rounded-lg border text-sm ${data.year === y ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={onNext}
        disabled={!data.level}
        className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        Continue →
      </button>
    </div>
  )
}
```

- [ ] **Step 7: Write Extras**

Create `client/src/components/mode2/steps/Extras.jsx`:
```jsx
const CERTS = ['AWS Cloud Practitioner', 'Google Cloud', 'Meta Front-End', 'Microsoft Azure', 'Coursera', 'Udemy']
const LANGS = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu']

export default function Extras({ data, onChange, onNext }) {
  function toggleArray(key, value) {
    const current = data[key] || []
    onChange({ ...data, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] })
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-800">Extras (Optional)</h2>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Certifications</p>
        <div className="flex flex-wrap gap-2">
          {CERTS.map((c) => (
            <button key={c} onClick={() => toggleArray('certifications', c)}
              className={`px-3 py-1 rounded-full border text-sm ${data.certifications?.includes(c) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Languages you speak</p>
        <div className="flex flex-wrap gap-2">
          {LANGS.map((l) => (
            <button key={l} onClick={() => toggleArray('languages', l)}
              className={`px-3 py-1 rounded-full border text-sm ${data.languages?.includes(l) ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {[['portfolio', 'Portfolio URL'], ['github', 'GitHub URL']].map(([key, label]) => (
          <div key={key}>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{label} (optional)</label>
            <input
              value={data[key] || ''}
              onChange={(e) => onChange({ ...data, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>

      <button onClick={onNext} className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium">
        Review My Info →
      </button>
    </div>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add client/src/components/mode2/steps/
git commit -m "feat: all 7 wizard step components"
```

---

### Task 15: Inline AI Services (Bullet Suggest + Enhance)

**Files:**
- Create: `server/prompts/bulletPrompt.js`
- Modify: `server/routes/suggest.js`

- [ ] **Step 1: Write bullet prompt**

Create `server/prompts/bulletPrompt.js`:
```js
export const BULLET_SYSTEM = `You are a resume writing expert.
Given a job title, company, and job description excerpt, write ONE strong resume bullet point.
Rules: Start with an action verb. Under 20 words. Include a metric. Return ONLY the bullet text, nothing else.`

export const ENHANCE_SYSTEM = `You are a resume writing expert.
Rewrite a project description to be impactful, concise, and tailored to software engineering roles.
Rules: Under 30 words. Mention what was built and its impact. Return ONLY the rewritten description.`

export function buildBulletMessage(title, company, jdExcerpt) {
  return `Job Title: ${title}\nCompany: ${company}\nJD Excerpt: ${jdExcerpt || 'General software engineering role'}`
}

export function buildEnhanceMessage(projectName, stack, description) {
  return `Project: ${projectName}\nStack: ${stack.join(', ')}\nOriginal description: ${description}`
}
```

- [ ] **Step 2: Implement suggest routes**

Overwrite `server/routes/suggest.js`:
```js
import { Router } from 'express'
import { callClaude } from '../services/claudeService.js'
import { BULLET_SYSTEM, ENHANCE_SYSTEM, buildBulletMessage, buildEnhanceMessage } from '../prompts/bulletPrompt.js'

const router = Router()

router.post('/suggest-bullet', async (req, res) => {
  try {
    const { title, company, jdExcerpt } = req.body
    if (!title) return res.status(400).json({ error: 'title required' })
    const bullet = await callClaude(BULLET_SYSTEM, buildBulletMessage(title, company, jdExcerpt))
    res.json({ bullet: bullet.trim() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/enhance-description', async (req, res) => {
  try {
    const { projectName, stack, description } = req.body
    if (!description) return res.status(400).json({ error: 'description required' })
    const enhanced = await callClaude(ENHANCE_SYSTEM, buildEnhanceMessage(projectName, stack || [], description))
    res.json({ description: enhanced.trim() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

- [ ] **Step 3: Commit**

```bash
git add server/prompts/bulletPrompt.js server/routes/suggest.js
git commit -m "feat: AI bullet suggest + project description enhance routes"
```

---

### Task 16: BuildPage Assembly

**Files:**
- Modify: `client/src/pages/BuildPage.jsx`

- [ ] **Step 1: Assemble BuildPage with all wizard steps**

Overwrite `client/src/pages/BuildPage.jsx`:
```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizardSession } from '../hooks/useWizardSession'
import WizardShell from '../components/mode2/WizardShell'
import JDInput from '../components/shared/JDInput'
import PersonalInfo from '../components/mode2/steps/PersonalInfo'
import ExperienceLevel from '../components/mode2/steps/ExperienceLevel'
import WorkHistory from '../components/mode2/steps/WorkHistory'
import Skills from '../components/mode2/steps/Skills'
import Projects from '../components/mode2/steps/Projects'
import Education from '../components/mode2/steps/Education'
import Extras from '../components/mode2/steps/Extras'

const TOTAL_STEPS = 8

export default function BuildPage() {
  const { step, setStep, jd, setJd, wizardData, updateSection } = useWizardSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/build-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wizardData, jobDescription: jd }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      navigate('/results', { state: { analysis: data, mode: 'build' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 0 = JD collection (before wizard starts)
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-900">Build My Resume</h1>
          <p className="text-sm text-gray-500">Start with the job you're targeting so Claude can tailor every question.</p>
          <JDInput value={jd} onChange={setJd} />
          <button
            onClick={() => setStep(1)}
            disabled={!jd.trim()}
            className="py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            Start Building →
          </button>
        </div>
      </div>
    )
  }

  // Step 9 = Review before submit
  if (step === 9) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-900">Review Your Info</h2>
          <pre className="text-xs bg-gray-50 rounded-lg p-4 overflow-auto max-h-64">
            {JSON.stringify(wizardData, null, 2)}
          </pre>
          <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">← Edit answers</button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="py-3 px-6 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Building your resume...' : 'Build & Analyze My Resume →'}
          </button>
        </div>
      </div>
    )
  }

  const props = { jd, onNext: () => setStep(step + 1) }

  return (
    <WizardShell currentStep={step} totalSteps={TOTAL_STEPS} onBack={() => setStep(step - 1)}>
      {step === 1 && <PersonalInfo data={wizardData.personal} onChange={(v) => updateSection('personal', v)} {...props} />}
      {step === 2 && <ExperienceLevel value={wizardData.experienceLevel} onChange={(v) => updateSection('experienceLevel', v)} {...props} />}
      {step === 3 && <WorkHistory data={wizardData.workHistory} onChange={(v) => updateSection('workHistory', v)} {...props} />}
      {step === 4 && <Skills data={wizardData.skills} onChange={(v) => updateSection('skills', v)} {...props} />}
      {step === 5 && <Projects data={wizardData.projects} onChange={(v) => updateSection('projects', v)} {...props} />}
      {step === 6 && <Education data={wizardData.education} onChange={(v) => updateSection('education', v)} {...props} />}
      {step === 7 && <Extras data={wizardData.extras} onChange={(v) => updateSection('extras', v)} onNext={() => setStep(9)} jd={jd} />}
    </WizardShell>
  )
}
```

- [ ] **Step 2: Verify wizard flow in browser**

- Navigate to http://localhost:5173/build
- Paste a JD → "Start Building →" navigates to step 1
- Fill personal info → Continue → steps advance
- Progress bar updates
- Back button works
- Skills chips highlight JD-matched skills
- AI bullet suggest (✨) fires and pre-fills
- Step 7 Continue → Review screen
- Review → "Build & Analyze" → navigates to /results with data

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/BuildPage.jsx
git commit -m "feat: BuildPage — full 8-step wizard assembled end-to-end (Phase 2 complete)"
```

---

## Phase 3 — Results Polish

---

### Task 17: ProjectSuggestions + SectionFeedback Components

**Files:**
- Create: `client/src/components/results/ProjectSuggestions.jsx`
- Create: `client/src/components/results/SectionFeedback.jsx`

- [ ] **Step 1: Write ProjectSuggestions**

Create `client/src/components/results/ProjectSuggestions.jsx`:
```jsx
import { useState } from 'react'

export default function ProjectSuggestions({ projectSuggestions }) {
  const [copied, setCopied] = useState(null)

  function copy(idx, text) {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!projectSuggestions?.length) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Suggestions</h2>
      <div className="flex flex-col gap-4">
        {projectSuggestions.map((p, idx) => (
          <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-800">{p.title}</h3>
              <button
                onClick={() => copy(idx, `${p.title}: ${p.description}`)}
                className="text-xs text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
              >
                {copied === idx ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{p.description}</p>
            <p className="text-xs text-purple-600 mt-2 italic">{p.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write SectionFeedback**

Create `client/src/components/results/SectionFeedback.jsx`:
```jsx
export default function SectionFeedback({ sectionFeedback }) {
  const items = sectionFeedback?.experience || []
  if (!items.length) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Section Feedback</h2>
      <div className="flex flex-col gap-5">
        {items.map((item, idx) => (
          <div key={idx}>
            <p className="text-xs font-semibold text-red-500 uppercase mb-2">{item.issue}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-400 mb-1 font-medium">Original</p>
                <p className="text-sm text-gray-700">{item.original}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-500 mb-1 font-medium">Rewritten</p>
                <p className="text-sm text-gray-700">{item.rewritten}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/results/
git commit -m "feat: ProjectSuggestions + SectionFeedback result components"
```

---

### Task 18: Editable ResumePreview

**Files:**
- Create: `client/src/components/results/ResumePreview.jsx`

- [ ] **Step 1: Write ResumePreview**

Create `client/src/components/results/ResumePreview.jsx`:
```jsx
import { useState } from 'react'

export default function ResumePreview({ resume, onResumeChange }) {
  const [editingField, setEditingField] = useState(null)

  if (!resume) return null

  function update(field, value) {
    onResumeChange({ ...resume, [field]: value })
    setEditingField(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Full Resume Preview</h2>
      <div className="font-mono text-sm border border-gray-200 rounded-lg p-6 bg-gray-50 space-y-4">

        <div>
          <p className="text-xs text-gray-400 mb-1">NAME</p>
          {editingField === 'name'
            ? <input autoFocus defaultValue={resume.name} onBlur={(e) => update('name', e.target.value)}
                className="w-full border border-blue-400 rounded px-2 py-1 text-sm" />
            : <p className="text-lg font-bold cursor-pointer hover:bg-blue-50 rounded px-1" onClick={() => setEditingField('name')}>{resume.name}</p>
          }
        </div>

        {resume.summary && (
          <div>
            <p className="text-xs text-gray-400 mb-1">SUMMARY</p>
            {editingField === 'summary'
              ? <textarea autoFocus defaultValue={resume.summary} onBlur={(e) => update('summary', e.target.value)} rows={3}
                  className="w-full border border-blue-400 rounded px-2 py-1 text-sm resize-none" />
              : <p className="cursor-pointer hover:bg-blue-50 rounded px-1" onClick={() => setEditingField('summary')}>{resume.summary}</p>
            }
          </div>
        )}

        {resume.experience?.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-1 font-semibold">EXPERIENCE</p>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <p className="font-semibold">{exp.title} — {exp.company}</p>
                <p className="text-gray-500 text-xs">{exp.start} – {exp.end}</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {resume.skills?.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-1 font-semibold">SKILLS</p>
            <p>{Array.isArray(resume.skills) ? resume.skills.join(', ') : resume.skills}</p>
          </div>
        )}

        {resume.projects?.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-1 font-semibold">PROJECTS</p>
            {resume.projects.map((p, i) => (
              <div key={i} className="mb-2">
                <p className="font-semibold">{p.name}</p>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {resume.education && (
          <div>
            <p className="text-xs text-gray-400 mb-1 font-semibold">EDUCATION</p>
            <p>{resume.education.degree} — {resume.education.institution} ({resume.education.year})</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">Click any field to edit before downloading.</p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/results/ResumePreview.jsx
git commit -m "feat: editable ResumePreview component"
```

---

### Task 19: PDF Generator + Generate Route

**Files:**
- Create: `server/services/pdfGenerator.js`
- Modify: `server/routes/generate.js`

- [ ] **Step 1: Write pdfGenerator**

Create `server/services/pdfGenerator.js`:
```js
import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'

pdfMake.vfs = pdfFonts.pdfMake.vfs

export function generateResumePDF(resumeData) {
  const { name, summary, experience = [], skills = [], projects = [], education } = resumeData

  const content = []

  content.push({ text: name, style: 'name' })
  if (summary) content.push({ text: summary, style: 'summary', margin: [0, 4, 0, 8] })

  if (experience.length) {
    content.push({ text: 'EXPERIENCE', style: 'sectionHeader' })
    experience.forEach((exp) => {
      content.push({ text: `${exp.title} — ${exp.company}`, bold: true, fontSize: 10 })
      content.push({ text: `${exp.start} – ${exp.end}`, fontSize: 9, color: '#666', margin: [0, 1, 0, 2] })
      if (exp.bullets?.length) {
        content.push({ ul: exp.bullets, fontSize: 9, margin: [0, 0, 0, 6] })
      }
    })
  }

  if (skills.length) {
    content.push({ text: 'SKILLS', style: 'sectionHeader' })
    content.push({ text: Array.isArray(skills) ? skills.join(' · ') : skills, fontSize: 9, margin: [0, 0, 0, 8] })
  }

  if (projects.length) {
    content.push({ text: 'PROJECTS', style: 'sectionHeader' })
    projects.forEach((p) => {
      content.push({ text: p.name, bold: true, fontSize: 10 })
      content.push({ text: p.description, fontSize: 9, margin: [0, 1, 0, 6] })
    })
  }

  if (education) {
    content.push({ text: 'EDUCATION', style: 'sectionHeader' })
    content.push({ text: `${education.degree} — ${education.institution} (${education.year})`, fontSize: 9 })
  }

  const docDefinition = {
    content,
    styles: {
      name: { fontSize: 20, bold: true, margin: [0, 0, 0, 4] },
      summary: { fontSize: 10, color: '#444' },
      sectionHeader: { fontSize: 11, bold: true, color: '#1a1a1a', margin: [0, 8, 0, 4], decoration: 'underline' },
    },
    defaultStyle: { fontSize: 10, lineHeight: 1.3 },
    pageMargins: [40, 40, 40, 40],
  }

  return new Promise((resolve, reject) => {
    const pdfDoc = pdfMake.createPdf(docDefinition)
    pdfDoc.getBuffer((buffer) => {
      if (buffer) resolve(Buffer.from(buffer))
      else reject(new Error('PDF buffer generation failed'))
    })
  })
}
```

- [ ] **Step 2: Implement generate route**

Overwrite `server/routes/generate.js`:
```js
import { Router } from 'express'
import { generateResumePDF } from '../services/pdfGenerator.js'

const router = Router()

router.post('/generate-pdf', async (req, res) => {
  try {
    const { resumeData } = req.body
    if (!resumeData) return res.status(400).json({ error: 'resumeData required' })

    const pdfBuffer = await generateResumePDF(resumeData)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="resume.pdf"',
      'Content-Length': pdfBuffer.length,
    })
    res.send(pdfBuffer)
  } catch (err) {
    console.error('PDF generate error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
```

- [ ] **Step 3: Commit**

```bash
git add server/services/pdfGenerator.js server/routes/generate.js
git commit -m "feat: pdfmake PDF generator + POST /api/generate-pdf"
```

---

### Task 20: DownloadButton + Wire Up Full ResultsPage

**Files:**
- Create: `client/src/components/shared/DownloadButton.jsx`
- Modify: `client/src/pages/ResultsPage.jsx`

- [ ] **Step 1: Write DownloadButton**

Create `client/src/components/shared/DownloadButton.jsx`:
```jsx
import { useState } from 'react'

export default function DownloadButton({ resumeData }) {
  const [loading, setLoading] = useState(false)

  async function download() {
    setLoading(true)
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData }),
      })
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'optimized-resume.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={download}
      disabled={loading}
      className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Generating PDF...' : '⬇ Download Optimized Resume'}
    </button>
  )
}
```

- [ ] **Step 2: Assemble full ResultsPage**

Overwrite `client/src/pages/ResultsPage.jsx`:
```jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MatchScore from '../components/results/MatchScore'
import KeywordGaps from '../components/results/KeywordGaps'
import ProjectSuggestions from '../components/results/ProjectSuggestions'
import SectionFeedback from '../components/results/SectionFeedback'
import ResumePreview from '../components/results/ResumePreview'
import DownloadButton from '../components/shared/DownloadButton'

export default function ResultsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [resume, setResume] = useState(state?.analysis?.rewrittenResume || null)

  if (!state?.analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No analysis data found.</p>
          <button onClick={() => navigate('/')} className="text-blue-600 underline">Go home</button>
        </div>
      </div>
    )
  }

  const { analysis } = state

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Your Results</h1>
          <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">← Start over</button>
        </div>
        <MatchScore matchScore={analysis.matchScore} scoreBreakdown={analysis.scoreBreakdown} />
        <KeywordGaps missingKeywords={analysis.missingKeywords} />
        <ProjectSuggestions projectSuggestions={analysis.projectSuggestions} />
        <SectionFeedback sectionFeedback={analysis.sectionFeedback} />
        {resume && <ResumePreview resume={resume} onResumeChange={setResume} />}
        {resume && <DownloadButton resumeData={resume} />}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: End-to-end test**

Run both client and server. Test Mode 1 full flow:
- Upload PDF → paste JD → Analyze → Results page shows all 5 sections → Edit a field in preview → Download PDF → file saves.

Test Mode 2 full flow:
- Build from scratch → complete wizard → Build & Analyze → Results page → Download PDF.

- [ ] **Step 4: Commit**

```bash
git add client/src/
git commit -m "feat: DownloadButton + full ResultsPage — end-to-end PDF flow complete (Phase 3 done)"
```

---

## Phase 4 — Enhancements

> Tackle these independently after Phase 3 is stable.

---

### Task 21: ATS Prediction Display

Add `atsPrediction` to ResultsPage — a banner showing pass/fail + reason.

**Files:**
- Create: `client/src/components/results/ATSPrediction.jsx`
- Modify: `client/src/pages/ResultsPage.jsx`

- [ ] **Step 1: Write ATSPrediction component**

```jsx
export default function ATSPrediction({ atsPrediction }) {
  if (!atsPrediction) return null
  const { pass, reason } = atsPrediction
  return (
    <div className={`rounded-2xl border p-4 ${pass ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
      <p className={`font-semibold text-sm ${pass ? 'text-green-700' : 'text-red-700'}`}>
        ATS Prediction: {pass ? '✓ Likely to Pass' : '✗ Likely to Fail'}
      </p>
      <p className="text-sm text-gray-600 mt-1">{reason}</p>
    </div>
  )
}
```

- [ ] **Step 2: Add to ResultsPage after MatchScore**

Import `ATSPrediction` and add `<ATSPrediction atsPrediction={analysis.atsPrediction} />` after the MatchScore block.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/results/ATSPrediction.jsx client/src/pages/ResultsPage.jsx
git commit -m "feat: ATS prediction pass/fail banner in results"
```

---

### Task 22: localStorage Version History

Save each completed analysis to localStorage so user can revisit.

**Files:**
- Create: `client/src/hooks/useHistory.js`

- [ ] **Step 1: Write useHistory hook**

```js
import { useState, useEffect } from 'react'

const HISTORY_KEY = 'hiresignal_history'
const MAX_HISTORY = 5

export function useHistory() {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [] }
    catch { return [] }
  })

  function save(entry) {
    const updated = [{ ...entry, savedAt: new Date().toISOString() }, ...history].slice(0, MAX_HISTORY)
    setHistory(updated)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  }

  function clear() {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  return { history, save, clear }
}
```

- [ ] **Step 2: Call save() in ResultsPage on mount**

```jsx
const { save } = useHistory()
useEffect(() => {
  if (state?.analysis) save({ analysis: state.analysis, mode: state.mode })
}, [])
```

- [ ] **Step 3: Commit**

```bash
git add client/src/hooks/useHistory.js client/src/pages/ResultsPage.jsx
git commit -m "feat: localStorage version history (max 5 analyses)"
```

---

## Self-Review Checklist

- [x] Mode 1 full flow: PDF upload → analyze → results → PDF download
- [x] Mode 2 full flow: JD → wizard → review → build+analyze → results → PDF download
- [x] AI bullet suggest in WorkHistory step
- [x] AI project enhance in Projects step
- [x] All 5 result components implemented
- [x] ResumePreview editable before export
- [x] pdfmake generates ATS-clean PDF
- [x] localStorage wizard persistence
- [x] Tailwind throughout, no inline styles
- [x] No hardcoded Claude model string (uses constant from claudeService)
- [x] .env not committed, .gitignore covers uploads/ and outputs/
- [x] Every route has error handling and status 400/500 responses
