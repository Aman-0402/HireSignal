import ModeSelector from '../components/shared/ModeSelector'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">HireSignal</h1>
        <p className="text-lg text-gray-500">AI-powered resume analyzer & builder</p>
      </div>
      <ModeSelector />
    </div>
  )
}
