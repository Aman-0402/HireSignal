const CERTS = ['AWS Cloud Practitioner', 'Google Cloud', 'Meta Front-End', 'Microsoft Azure', 'Coursera', 'Udemy']
const LANGS = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu']

export default function Extras({ data, onChange, onNext }) {
  function toggleArray(key, value) {
    const current = data[key] || []
    onChange({ ...data, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] })
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-800">Extras (Optional)</h2>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Certifications</p>
        <div className="flex flex-wrap gap-2">
          {CERTS.map((c) => (
            <button key={c} onClick={() => toggleArray('certifications', c)}
              className={`px-3 py-1 rounded-full border text-sm ${data.certifications?.includes(c) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Languages you speak</p>
        <div className="flex flex-wrap gap-2">
          {LANGS.map((l) => (
            <button key={l} onClick={() => toggleArray('languages', l)}
              className={`px-3 py-1 rounded-full border text-sm ${data.languages?.includes(l) ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {[['portfolio', 'Portfolio URL'], ['github', 'GitHub URL']].map(([key, label]) => (
          <div key={key}>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{label} (optional)</label>
            <input
              value={data[key] || ''}
              onChange={(e) => onChange({ ...data, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>

      <button onClick={onNext} className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium">
        Review My Info →
      </button>
    </div>
  )
}
