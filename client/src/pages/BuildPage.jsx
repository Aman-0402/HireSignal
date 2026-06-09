import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWizardSession } from '../hooks/useWizardSession'
import WizardShell from '../components/mode2/WizardShell'
import JDInput from '../components/shared/JDInput'
import PersonalInfo from '../components/mode2/steps/PersonalInfo'
import ExperienceLevel from '../components/mode2/steps/ExperienceLevel'
import WorkHistory from '../components/mode2/steps/WorkHistory'
import Skills from '../components/mode2/steps/Skills'
import Projects from '../components/mode2/steps/Projects'
import Education from '../components/mode2/steps/Education'
import Extras from '../components/mode2/steps/Extras'

const TOTAL_STEPS = 8

export default function BuildPage() {
  const { step, setStep, jd, setJd, wizardData, updateSection } = useWizardSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/build-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wizardData, jobDescription: jd }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      navigate('/results', { state: { analysis: data, mode: 'build' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Show JD screen if no JD yet (regardless of step)
  if (!jd.trim()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-900">Build My Resume</h1>
          <p className="text-sm text-gray-500">Start with the job you're targeting so Claude can tailor every question.</p>
          <JDInput value={jd} onChange={setJd} />
          <button
            onClick={() => setStep(1)}
            disabled={!jd.trim()}
            className="py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            Start Building →
          </button>
        </div>
      </div>
    )
  }

  // Step 9 = Review before submit
  if (step === 9) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-900">Review Your Info</h2>
          <pre className="text-xs bg-gray-50 rounded-lg p-4 overflow-auto max-h-64">
            {JSON.stringify(wizardData, null, 2)}
          </pre>
          <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">← Edit answers</button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="py-3 px-6 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Building your resume...' : 'Build & Analyze My Resume →'}
          </button>
        </div>
      </div>
    )
  }

  const props = { jd, onNext: () => setStep(step + 1) }

  return (
    <WizardShell currentStep={step} totalSteps={TOTAL_STEPS} onBack={() => setStep(step - 1)}>
      {step === 1 && <PersonalInfo data={wizardData.personal} onChange={(v) => updateSection('personal', v)} {...props} />}
      {step === 2 && <ExperienceLevel value={wizardData.experienceLevel} onChange={(v) => updateSection('experienceLevel', v)} {...props} />}
      {step === 3 && <WorkHistory data={wizardData.workHistory} onChange={(v) => updateSection('workHistory', v)} {...props} />}
      {step === 4 && <Skills data={wizardData.skills} onChange={(v) => updateSection('skills', v)} {...props} />}
      {step === 5 && <Projects data={wizardData.projects} onChange={(v) => updateSection('projects', v)} {...props} />}
      {step === 6 && <Education data={wizardData.education} onChange={(v) => updateSection('education', v)} {...props} />}
      {step === 7 && <Extras data={wizardData.extras} onChange={(v) => updateSection('extras', v)} onNext={() => setStep(9)} jd={jd} />}
    </WizardShell>
  )
}
