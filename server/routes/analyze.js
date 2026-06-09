import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
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
  } finally {
    if (req.file?.path) fs.unlink(req.file.path, () => {})
  }
})

export default router
