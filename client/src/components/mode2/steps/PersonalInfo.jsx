const FIELDS = [
  { key: 'name', label: 'Full Name', placeholder: 'Aman Raj' },
  { key: 'location', label: 'City / Location', placeholder: 'Vadodara, Gujarat' },
  { key: 'email', label: 'Email', placeholder: 'you@email.com' },
  { key: 'phone', label: 'Phone', placeholder: '+91 98XXX XXXXX' },
  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/username' },
  { key: 'github', label: 'GitHub URL', placeholder: 'github.com/username' },
]

export default function PersonalInfo({ data, onChange, onNext }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-800">Personal Info</h2>
      {FIELDS.map(({ key, label, placeholder }) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <input
            type="text"
            value={data[key]}
            onChange={(e) => onChange({ ...data, [key]: e.target.value })}
            placeholder={placeholder}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      ))}
      <button
        onClick={onNext}
        disabled={!data.name || !data.email}
        className="mt-2 py-2 px-6 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        Continue →
      </button>
    </div>
  )
}
