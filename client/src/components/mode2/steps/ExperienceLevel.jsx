import QuestionCard from '../QuestionCard'

const OPTIONS = ['Fresher / No Experience', '0–1 Year', '1–3 Years', '3–5 Years', '5+ Years']

export default function ExperienceLevel({ value, onChange, onNext, jd }) {
  const recommended = jd?.toLowerCase().includes('senior') ? '5+ Years'
    : jd?.toLowerCase().includes('junior') ? '0–1 Year'
    : '1–3 Years'

  return (
    <div className="flex flex-col gap-5">
      <QuestionCard
        question="How many years of professional experience do you have?"
        options={OPTIONS}
        selected={value}
        onSelect={onChange}
        recommended={recommended}
      />
      <button
        onClick={onNext}
        disabled={!value}
        className="py-2 px-6 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
      >
        Continue →
      </button>
    </div>
  )
}
