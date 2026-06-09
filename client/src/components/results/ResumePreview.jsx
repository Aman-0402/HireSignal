import { useState } from 'react'

export default function ResumePreview({ resume, onResumeChange }) {
  const [editingField, setEditingField] = useState(null)

  if (!resume) return null

  function update(field, value) {
    onResumeChange({ ...resume, [field]: value })
    setEditingField(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Full Resume Preview</h2>
      <div className="font-mono text-sm border border-gray-200 rounded-lg p-6 bg-gray-50 space-y-4">

        <div>
          <p className="text-xs text-gray-400 mb-1">NAME</p>
          {editingField === 'name'
            ? <input autoFocus defaultValue={resume.name} onBlur={(e) => update('name', e.target.value)}
                className="w-full border border-blue-400 rounded px-2 py-1 text-sm" />
            : <p className="text-lg font-bold cursor-pointer hover:bg-blue-50 rounded px-1" onClick={() => setEditingField('name')}>{resume.name}</p>
          }
        </div>

        {resume.summary && (
          <div>
            <p className="text-xs text-gray-400 mb-1">SUMMARY</p>
            {editingField === 'summary'
              ? <textarea autoFocus defaultValue={resume.summary} onBlur={(e) => update('summary', e.target.value)} rows={3}
                  className="w-full border border-blue-400 rounded px-2 py-1 text-sm resize-none" />
              : <p className="cursor-pointer hover:bg-blue-50 rounded px-1" onClick={() => setEditingField('summary')}>{resume.summary}</p>
            }
          </div>
        )}

        {resume.experience?.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-1 font-semibold">EXPERIENCE</p>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <p className="font-semibold">{exp.title} — {exp.company}</p>
                <p className="text-gray-500 text-xs">{exp.start} – {exp.end}</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {resume.skills?.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-1 font-semibold">SKILLS</p>
            <p>{Array.isArray(resume.skills) ? resume.skills.join(', ') : resume.skills}</p>
          </div>
        )}

        {resume.projects?.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-1 font-semibold">PROJECTS</p>
            {resume.projects.map((p, i) => (
              <div key={i} className="mb-2">
                <p className="font-semibold">{p.name}</p>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {resume.education && (
          <div>
            <p className="text-xs text-gray-400 mb-1 font-semibold">EDUCATION</p>
            <p>{resume.education.degree} — {resume.education.institution} ({resume.education.year})</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">Click any field to edit before downloading.</p>
    </div>
  )
}
