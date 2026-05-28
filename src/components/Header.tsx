import { motion } from 'framer-motion'
import { TransportControls } from './controls/TransportControls'
import { ExportButton } from './controls/ExportButton'
import { useSequencerStore } from '../store/sequencerStore'

export function Header() {
  const { playbackState } = useSequencerStore()
  const isPlaying = playbackState === 'playing'

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-panel-border
      backdrop-blur sticky top-0 z-30 shadow-panel">
      <div className="flex items-center gap-3">
        <motion.div
          animate={isPlaying ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
          transition={isPlaying ? { duration: 0.8, repeat: Infinity } : {}}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 14l-4-4h2.5V9h3v4H16l-4 4z" />
          </svg>
        </motion.div>
        <div>
          <h1 className="text-sm font-mono font-bold tracking-widest text-ink">
            KRISPY<span className="text-primary">BEATS</span>
          </h1>
          <p className="text-[10px] font-mono text-ink/35 leading-none tracking-wider">STEP SEQUENCER</p>
        </div>
      </div>

      <TransportControls />

      <div className="flex items-center gap-2">
        <ExportButton />
        <div className="hidden md:flex flex-col text-[10px] font-mono text-ink/20 text-right leading-tight">
          <span>Space: play/pause</span>
          <span>1–5: select track</span>
        </div>
      </div>
    </header>
  )
}
