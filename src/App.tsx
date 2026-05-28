import './index.css'
import { Header } from './components/Header'
import { SequencerView } from './components/SequencerView'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useDefaultAudio } from './hooks/useDefaultAudio'

function App() {
  useKeyboardShortcuts()
  useDefaultAudio()

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <main className="flex-1 overflow-auto">
        <SequencerView />
      </main>
    </div>
  )
}

export default App
