const SKILL_GROUPS = {
  Languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C++'],
  Frontend: ['React', 'Next.js', 'Vue', 'Tailwind CSS', 'HTML/CSS'],
  Backend: ['Node.js', 'Express', 'FastAPI', 'Django', 'REST APIs'],
  Databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'],
  'DevOps/Cloud': ['Docker', 'AWS', 'Git', 'CI/CD', 'Linux'],
}

const SOFT_SKILLS = ['Team Collaboration', 'Problem Solving', 'Communication', 'Leadership', 'Agile/Scrum', 'Client Management']

export default function Skills({ data, onChange, onNext, jd }) {
  const jdLower = jd?.toLowerCase() || ''

  function toggle(category, skill) {
    const current = data[category] || []
    onChange({
      ...data,
      [category]: current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill],
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-800">Skills</h2>
      {Object.entries(SKILL_GROUPS).map(([group, skills]) => (
        <div key={group}>
          <p className="text-sm font-medium text-gray-500 mb-2">{group}</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const isJdMatch = jdLower.includes(skill.toLowerCase())
              const selected = data.technical?.includes(skill)
              return (
                <button
                  key={skill}
                  onClick={() => toggle('technical', skill)}
                  className={`px-3 py-1 rounded-full border text-sm font-medium transition-all
                    ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-600 hover:border-blue-400'}
                    ${isJdMatch ? 'ring-2 ring-green-300' : ''}
                  `}
                >
                  {skill}
                  {isJdMatch && <span className="ml-1 text-xs text-green-600">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">Soft Skills</p>
        <div className="flex flex-wrap gap-2">
          {SOFT_SKILLS.map((skill) => {
            const selected = data.soft?.includes(skill)
            return (
              <button
                key={skill}
                onClick={() => toggle('soft', skill)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-all
                  ${selected ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-300 text-gray-600 hover:border-purple-400'}
                `}
              >
                {skill}
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={(data.technical?.length || 0) === 0}
        className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        Continue →
      </button>
    </div>
  )
}
