import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import analyzeRoute from './routes/analyze.js'
import buildRoute from './routes/build.js'
import generateRoute from './routes/generate.js'
import suggestRoute from './routes/suggest.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '10mb' }))

app.use('/api', analyzeRoute)
app.use('/api', buildRoute)
app.use('/api', generateRoute)
app.use('/api', suggestRoute)

app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Server running on :${PORT}`))
  .on('error', (err) => console.error('Server failed to start:', err))
