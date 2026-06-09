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
