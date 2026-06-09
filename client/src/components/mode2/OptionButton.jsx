export default function OptionButton({ label, selected, onClick, recommended }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
        ${selected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
        }
        ${recommended ? 'ring-2 ring-green-400' : ''}
      `}
    >
      {label}
      {recommended && <span className="ml-1 text-xs text-green-600">★ Recommended</span>}
    </button>
  )
}
