import { useState } from 'react'

export default function ProjectSuggestions({ projectSuggestions }) {
  const [copied, setCopied] = useState(null)

  function copy(idx, text) {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!projectSuggestions?.length) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Suggestions</h2>
      <div className="flex flex-col gap-4">
        {projectSuggestions.map((p, idx) => (
          <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-800">{p.title}</h3>
              <button
                onClick={() => copy(idx, `${p.title}: ${p.description}`)}
                className="text-xs text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
              >
                {copied === idx ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{p.description}</p>
            <p className="text-xs text-purple-600 mt-2 italic">{p.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
