import OptionButton from './OptionButton'

export default function QuestionCard({ question, options, selected, onSelect, onCustom, customValue, recommended }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-800">{question}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <OptionButton
            key={opt}
            label={opt}
            selected={selected === opt}
            recommended={recommended === opt}
            onClick={() => onSelect(opt)}
          />
        ))}
        {onCustom && (
          <input
            type="text"
            placeholder="Other..."
            value={customValue || ''}
            onChange={(e) => onCustom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        )}
      </div>
    </div>
  )
}
