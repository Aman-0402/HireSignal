import QuestionCard from '../QuestionCard'

const LEVELS = ["High School", "Diploma", "Bachelor's", "Master's", "PhD", "Self-taught / Bootcamp"]
const YEARS = Array.from({ length: 15 }, (_, i) => String(2025 - i))

export default function Education({ data, onChange, onNext }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-800">Education</h2>
      <QuestionCard
        question="Highest level of education"
        options={LEVELS}
        selected={data.level}
        onSelect={(v) => onChange({ ...data, level: v })}
      />
      {['degree', 'institution'].map((field) => (
        <div key={field}>
          <label className="text-sm font-medium text-gray-700 mb-1 block capitalize">{field === 'degree' ? 'Degree / Field of study' : 'Institution name'}</label>
          <input
            value={data[field]}
            onChange={(e) => onChange({ ...data, [field]: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      ))}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Graduation Year</label>
        <div className="flex flex-wrap gap-2">
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => onChange({ ...data, year: y })}
              className={`px-3 py-1 rounded-lg border text-sm ${data.year === y ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={onNext}
        disabled={!data.level}
        className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        Continue →
      </button>
    </div>
  )
}
