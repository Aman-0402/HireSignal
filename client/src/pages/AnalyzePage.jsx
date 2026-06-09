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
