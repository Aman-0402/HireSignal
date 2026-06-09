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
