import { memo, useCallback, useState } from 'react'
import { useSequencerStore } from '../../store/sequencerStore'
import type { Channel, ChannelId } from '../../types'
import { StepButton } from './StepButton'

interface Props {
  channel: Channel
  currentStep: number
  isPlaying: boolean
}

export const SequencerRow = memo(function SequencerRow({ channel, currentStep, isPlaying }: Props) {
  const { toggleStep } = useSequencerStore()
  const [isPainting, setIsPainting] = useState(false)
  const [, setPaintValue] = useState(false)
  const { id, steps, color } = channel

  const handleMouseDown = useCallback(
    (stepIndex: number) => {
      const newVal = !steps[stepIndex].active
      setIsPainting(true)
      setPaintValue(newVal)
      toggleStep(id as ChannelId, stepIndex)
    },
    [steps, id, toggleStep]
  )

  const handleMouseUp = useCallback(() => setIsPainting(false), [])

  return (
    <div
      className="flex items-center gap-1 py-0.5"
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      {steps.map((step, i) => {
        // Group every 4 steps visually
        const groupStart = i > 0 && i % 4 === 0

        return (
          <div
            key={i}
            className={`flex-1 min-w-0 min-h-0 ${groupStart ? 'ml-1' : ''} ${
              currentStep === i && isPlaying ? 'playhead-col' : ''
            }`}
          >
            <StepButton
              active={step.active}
              playing={currentStep === i && isPlaying}
              velocity={step.velocity}
              color={color}
              stepIndex={i}
              groupStart={false}
              onToggle={() => handleMouseDown(i)}
              isPainting={isPainting}
            />
          </div>
        )
      })}
    </div>
  )
})
