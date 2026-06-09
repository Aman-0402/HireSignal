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
