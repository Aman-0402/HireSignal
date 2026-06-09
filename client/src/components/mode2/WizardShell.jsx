import ProgressBar from './ProgressBar'

export default function WizardShell({ currentStep, totalSteps, onBack, children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <div className="mt-6">{children}</div>
        {currentStep > 1 && (
          <button
            onClick={onBack}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
