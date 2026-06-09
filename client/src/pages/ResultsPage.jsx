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
