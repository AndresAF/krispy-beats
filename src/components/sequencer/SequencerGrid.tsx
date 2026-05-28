import { memo, useEffect } from 'react'
import { useSequencerStore } from '../../store/sequencerStore'
import { CHANNEL_ORDER } from '../../types'
import { SequencerRow } from './SequencerRow'
import { audioEngine } from '../../engine/AudioEngine'

export const SequencerGrid = memo(function SequencerGrid() {
  const {
    patterns,
    activePatternId,
    currentStep,
    playbackState,
    setCurrentStep,
  } = useSequencerStore()

  const pattern = patterns[activePatternId]
  const isPlaying = playbackState === 'playing'
  const stepCount = pattern.patternLength

  // Register step callback from audio engine
  useEffect(() => {
    const off = audioEngine.onStep((step) => setCurrentStep(step))
    return off
  }, [setCurrentStep])

  // Step number labels
  const stepLabels = Array.from({ length: stepCount }, (_, i) => i + 1)

  return (
    <div className="flex flex-col gap-1 select-none">
      {/* Step number ruler */}
      <div className="flex items-center gap-1 mb-1 pl-0">
        {stepLabels.map((n, i) => (
          <div
            key={i}
            className={`flex-1 text-center font-mono leading-none transition-colors duration-75
              ${i % 4 === 0 ? 'ml-1' : ''}
              ${i > 0 && i % 4 === 0 ? '' : ''}
            `}
            style={{
              fontSize: '9px',
              color: currentStep === i && isPlaying
                ? '#00ff87'
                : i % 4 === 0
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(255,255,255,0.12)',
            }}
          >
            {n}
          </div>
        ))}
      </div>

      {/* Channel rows */}
      {CHANNEL_ORDER.map((id) => (
        <SequencerRow
          key={id}
          channel={pattern.channels[id]}
          currentStep={currentStep}
          isPlaying={isPlaying}
        />
      ))}
    </div>
  )
})
