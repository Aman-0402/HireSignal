import { useState } from 'react'

const JOB_TITLES = ['Frontend Developer', 'Full Stack Developer', 'Backend Developer', 'Software Engineer', 'UI/UX Designer']

export default function WorkHistory({ data, onChange, onNext, jd }) {
  const [suggestingIdx, setSuggestingIdx] = useState(null)
  const entry = data[0] || { title: '', company: '', start: '', end: '', bullets: [''] }

  function updateEntry(updates) {
    onChange([{ ...entry, ...updates }, ...data.slice(1)])
  }

  async function suggestBullet(idx) {
    setSuggestingIdx(idx)
    try {
      const res = await fetch('/api/suggest-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: entry.title, company: entry.company, jdExcerpt: jd?.slice(0, 400) }),
      })
      const { bullet } = await res.json()
      const bullets = [...entry.bullets]
      bullets[idx] = bullet
      updateEntry({ bullets })
    } finally {
      setSuggestingIdx(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-800">Most Recent Role</h2>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Job Title</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {JOB_TITLES.map((t) => (
            <button
              key={t}
              onClick={() => updateEntry({ title: t })}
              className={`px-3 py-1 rounded-lg border text-sm ${entry.title === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          placeholder="Or type custom title..."
          value={entry.title}
          onChange={(e) => updateEntry({ title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Company</label>
          <input value={entry.company} onChange={(e) => updateEntry({ company: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Duration</label>
          <div className="flex gap-2">
            <input placeholder="Jan 2022" value={entry.start} onChange={(e) => updateEntry({ start: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            <input placeholder="Present" value={entry.end} onChange={(e) => updateEntry({ end: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Responsibilities (up to 5)</label>
        {entry.bullets.map((b, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={b}
              onChange={(e) => { const bullets = [...entry.bullets]; bullets[i] = e.target.value; updateEntry({ bullets }) }}
              placeholder={`Bullet ${i + 1}`}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => suggestBullet(i)}
              disabled={!entry.title || suggestingIdx === i}
              className="px-3 py-2 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50"
            >
              {suggestingIdx === i ? '...' : '✨'}
            </button>
          </div>
        ))}
        {entry.bullets.length < 5 && (
          <button
            onClick={() => updateEntry({ bullets: [...entry.bullets, ''] })}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add bullet
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!entry.title || !entry.company}
        className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        Continue →
      </button>
    </div>
  )
}
