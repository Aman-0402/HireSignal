export default function ATSPrediction({ atsPrediction }) {
  if (!atsPrediction) return null
  const { pass, reason } = atsPrediction
  return (
    <div className={`rounded-2xl border p-4 ${pass ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
      <p className={`font-semibold text-sm ${pass ? 'text-green-700' : 'text-red-700'}`}>
        ATS Prediction: {pass ? '✓ Likely to Pass' : '✗ Likely to Fail'}
      </p>
      <p className="text-sm text-gray-600 mt-1">{reason}</p>
    </div>
  )
}
