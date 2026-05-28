import { useEffect } from 'react'
import { useSequencerStore } from '../store/sequencerStore'
import type { ChannelId } from '../types'
import { CHANNEL_ORDER } from '../types'
import { audioEngine } from '../engine/AudioEngine'

export function useKeyboardShortcuts() {
  const {
    patterns,
    activePatternId,
    playbackState,
    setPlaybackState,
    setCurrentStep,
    setSelectedChannel,
  } = useSequencerStore()

  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      // Number keys 1–5 select channel
      const numMatch = e.key.match(/^[1-5]$/)
      if (numMatch && !e.ctrlKey && !e.metaKey) {
        const idx = parseInt(e.key) - 1
        setSelectedChannel(CHANNEL_ORDER[idx] as ChannelId)
        return
      }

      switch (e.code) {
        case 'Space': {
          e.preventDefault()
          const pattern = patterns[activePatternId]
          if (playbackState === 'playing') {
            audioEngine.pause()
            setPlaybackState('paused')
          } else if (playbackState === 'paused') {
            audioEngine.resume()
            setPlaybackState('playing')
          } else {
            await audioEngine.start(pattern)
            setPlaybackState('playing')
          }
          break
        }
        case 'Escape':
          audioEngine.stop()
          setPlaybackState('stopped')
          setCurrentStep(0)
          break
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [patterns, activePatternId, playbackState, setPlaybackState, setCurrentStep, setSelectedChannel])
}
