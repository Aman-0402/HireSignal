import { Router } from 'express'
const router = Router()
router.post('/generate-pdf', (_req, res) => res.json({ stub: true }))
export default router
