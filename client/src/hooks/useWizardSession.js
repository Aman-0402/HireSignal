import { useState, useEffect } from 'react'

const STORAGE_KEY = 'hiresignal_wizard'

const INITIAL_DATA = {
  personal: { name: '', location: '', email: '', phone: '', linkedin: '', github: '' },
  experienceLevel: '',
  workHistory: [],
  skills: { technical: [], tools: [], soft: [] },
  projects: [],
  education: { level: '', degree: '', institution: '', year: '' },
  extras: { certifications: [], languages: [], portfolio: '' },
}

export function useWizardSession() {
  const [step, setStep] = useState(1)
  const [jd, setJd] = useState('')
  const [wizardData, setWizardData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_DATA
    } catch {
      return INITIAL_DATA
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardData))
  }, [wizardData])

  function updateSection(key, value) {
    setWizardData((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setWizardData(INITIAL_DATA)
    setStep(1)
    setJd('')
    localStorage.removeItem(STORAGE_KEY)
  }

  return { step, setStep, jd, setJd, wizardData, updateSection, reset }
}
