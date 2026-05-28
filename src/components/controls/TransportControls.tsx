import { useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSequencerStore } from '../../store/sequencerStore'
import { audioEngine } from '../../engine/AudioEngine'

export function TransportControls() {
  const { patterns, activePatternId, playbackState, setPlaybackState, setCurrentStep, metronomeEnabled, toggleMetronome } = useSequencerStore()
  const pattern = patterns[activePatternId]

  const handlePlay = useCallback(async () => {
    if (playbackState === 'playing') { audioEngine.pause(); setPlaybackState('paused') }
    else if (playbackState === 'paused') { audioEngine.resume(); setPlaybackState('playing') }
    else { await audioEngine.start(pattern); setPlaybackState('playing') }
  }, [playbackState, pattern, setPlaybackState])

  const handleStop = useCallback(() => {
    audioEngine.stop(); setPlaybackState('stopped'); setCurrentStep(0)
  }, [setPlaybackState, setCurrentStep])

  useEffect(() => {
    if (playbackState === 'playing') { audioEngine.updatePattern(pattern); audioEngine.setMetronome(metronomeEnabled) }
  }, [pattern, playbackState, metronomeEnabled])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space') { e.preventDefault(); handlePlay() }
      if (e.code === 'Escape' || e.key === 's') handleStop()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handlePlay, handleStop])

  const isPlaying = playbackState === 'playing'

  return (
    <div className="flex items-center gap-3">
      {/* Stop */}
      <motion.button whileTap={{ scale: 0.92 }} onClick={handleStop}
        className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 flex items-center justify-center
          transition-colors"
        title="Stop (S)">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#2563EB' }} />
      </motion.button>

      {/* Play/Pause */}
      <motion.button whileTap={{ scale: 0.94 }} onClick={handlePlay}
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border
          ${isPlaying
            ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-glow-blue'
            : 'bg-blue-50 border-blue-300 text-[#2563EB] hover:bg-blue-100'
          }`}
        title="Play/Pause (Space)">
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.svg key="pause" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
            </motion.svg>
          ) : (
            <motion.svg key="play" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Metronome */}
      <motion.button whileTap={{ scale: 0.92 }} onClick={toggleMetronome}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border
          ${metronomeEnabled
            ? 'bg-violet/10 border-violet/40 text-violet'
            : 'bg-blue-50 border-blue-200 text-ink/45 hover:bg-blue-100 hover:text-ink/70'
          }`}
        title="Toggle Metronome">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L8 22h8L12 2zm0 3l2.5 13h-5L12 5zm-1 7h2v2h-2z" />
        </svg>
      </motion.button>

      {/* BPM readout */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-mono text-ink/35 uppercase tracking-wider">BPM</span>
        <span className={`text-lg font-mono font-bold leading-none transition-colors
          ${isPlaying ? 'text-primary' : 'text-ink/60'}`}>
          {pattern.bpm}
        </span>
      </div>
    </div>
  )
}
