import { useState } from 'react'

const PROJECT_TYPES = ['Web App', 'Mobile App', 'API / Backend Service', 'Chrome Extension', 'CLI Tool', 'Open Source']

export default function Projects({ data, onChange, onNext }) {
  const [enhancingIdx, setEnhancingIdx] = useState(null)

  function addProject() {
    onChange([...data, { name: '', type: '', stack: [], description: '' }])
  }

  function updateProject(idx, updates) {
    const updated = [...data]
    updated[idx] = { ...updated[idx], ...updates }
    onChange(updated)
  }

  async function enhanceDescription(idx) {
    const project = data[idx]
    setEnhancingIdx(idx)
    try {
      const res = await fetch('/api/enhance-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: project.name, stack: project.stack, description: project.description }),
      })
      const { description } = await res.json()
      updateProject(idx, { description })
    } finally {
      setEnhancingIdx(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-800">Projects</h2>

      {data.map((project, idx) => (
        <div key={idx} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">Project {idx + 1}</p>
          <input
            placeholder="Project name"
            value={project.name}
            onChange={(e) => updateProject(idx, { name: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="flex flex-wrap gap-2">
            {PROJECT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => updateProject(idx, { type: t })}
                className={`px-3 py-1 rounded-lg border text-sm ${project.type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <textarea
              placeholder="What does it do? What was the impact?"
              value={project.description}
              onChange={(e) => updateProject(idx, { description: e.target.value })}
              rows={3}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => enhanceDescription(idx)}
              disabled={!project.description || enhancingIdx === idx}
              className="px-3 py-2 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50 self-start"
            >
              {enhancingIdx === idx ? '...' : '✨ Enhance'}
            </button>
          </div>
        </div>
      ))}

      {data.length < 4 && (
        <button onClick={addProject} className="text-sm text-blue-600 hover:underline self-start">
          + Add project
        </button>
      )}

      <button
        onClick={onNext}
        className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium"
      >
        Continue →
      </button>
    </div>
  )
}
