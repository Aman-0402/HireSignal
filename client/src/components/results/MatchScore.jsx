export default function MatchScore({ matchScore, scoreBreakdown }) {
  const categories = [
    { key: 'skills', label: 'Skills' },
    { key: 'keywords', label: 'Keywords' },
    { key: 'experienceLevel', label: 'Experience' },
    { key: 'roleAlignment', label: 'Role Fit' },
  ]

  const color = matchScore >= 75 ? 'text-green-600' : matchScore >= 50 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Match Score</h2>
      <div className="flex items-center gap-8">
        <div className={`text-6xl font-bold ${color}`}>{matchScore}</div>
        <div className="flex-1 flex flex-col gap-3">
          {categories.map(({ key, label }) => (
            <div key={key}>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{label}</span>
                <span>{scoreBreakdown[key]}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${scoreBreakdown[key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
