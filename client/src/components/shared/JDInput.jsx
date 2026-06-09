export default function JDInput({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Job Description</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Paste the full job description here..."
        className="border border-gray-300 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-blue-500"
      />
    </div>
  )
}
