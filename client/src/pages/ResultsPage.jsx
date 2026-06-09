import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MatchScore from '../components/results/MatchScore'
import KeywordGaps from '../components/results/KeywordGaps'
import ProjectSuggestions from '../components/results/ProjectSuggestions'
import SectionFeedback from '../components/results/SectionFeedback'
import ResumePreview from '../components/results/ResumePreview'
import ATSPrediction from '../components/results/ATSPrediction'
import DownloadButton from '../components/shared/DownloadButton'
import { useHistory } from '../hooks/useHistory'

export default function ResultsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [resume, setResume] = useState(state?.analysis?.rewrittenResume || null)
  const { save } = useHistory()

  useEffect(() => {
    if (state?.analysis) save({ analysis: state.analysis, mode: state.mode })
  }, [])

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
        <ATSPrediction atsPrediction={analysis.atsPrediction} />
        <KeywordGaps missingKeywords={analysis.missingKeywords} />
        <ProjectSuggestions projectSuggestions={analysis.projectSuggestions} />
        <SectionFeedback sectionFeedback={analysis.sectionFeedback} />
        {resume && <ResumePreview resume={resume} onResumeChange={setResume} />}
        {resume && <DownloadButton resumeData={resume} />}
      </div>
    </div>
  )
}
