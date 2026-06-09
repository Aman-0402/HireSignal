export default function SectionFeedback({ sectionFeedback }) {
  const items = sectionFeedback?.experience || []
  if (!items.length) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Section Feedback</h2>
      <div className="flex flex-col gap-5">
        {items.map((item, idx) => (
          <div key={idx}>
            <p className="text-xs font-semibold text-red-500 uppercase mb-2">{item.issue}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-400 mb-1 font-medium">Original</p>
                <p className="text-sm text-gray-700">{item.original}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-500 mb-1 font-medium">Rewritten</p>
                <p className="text-sm text-gray-700">{item.rewritten}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
