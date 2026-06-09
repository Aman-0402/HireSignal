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
