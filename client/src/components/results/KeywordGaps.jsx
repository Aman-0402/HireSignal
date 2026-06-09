const CATEGORY_STYLES = {
  technical: 'bg-red-100 text-red-700',
  tools: 'bg-orange-100 text-orange-700',
  softSkills: 'bg-yellow-100 text-yellow-800',
  certifications: 'bg-purple-100 text-purple-700',
}

export default function KeywordGaps({ missingKeywords }) {
  const entries = Object.entries(missingKeywords).filter(([, v]) => v.length > 0)

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Keyword Gaps</h2>
        <p className="text-sm text-green-600">No missing keywords detected!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Keyword Gaps</h2>
      {entries.map(([category, keywords]) => (
        <div key={category} className="mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">{category}</p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span key={kw} className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_STYLES[category]}`}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
