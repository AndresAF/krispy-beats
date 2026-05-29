import { memo } from 'react'
import { motion } from 'framer-motion'

interface Props {
  active: boolean
  playing: boolean
  velocity: number
  color: string
  stepIndex: number
  groupStart: boolean
  onToggle: () => void
  isPainting: boolean
  paintValue?: boolean
}

export const StepButton = memo(function StepButton({
  active,
  playing,
  velocity,
  color,
  stepIndex,
  groupStart,
  onToggle,
  isPainting,
}: Props) {
  const isCurrentlyPlaying = playing && active

  const bgStyle = active
    ? {
        backgroundColor: color,
        boxShadow: playing
          ? `0 0 14px ${color}, 0 0 28px ${color}50`
          : `0 0 5px ${color}70`,
      }
    : playing
    ? { backgroundColor: 'rgba(37,99,235,0.13)', boxShadow: 'inset 0 0 0 1px rgba(37,99,235,0.3)' }
    : {}

  return (
    <motion.button
      data-step={stepIndex}
      className={`
        relative w-full h-full rounded-md transition-colors duration-75 select-none
        ${active ? 'step-active' : 'bg-step-inactive hover:bg-step-hover'}
        ${groupStart ? 'ml-1' : ''}
      `}
      style={bgStyle}
      onMouseDown={onToggle}
      onMouseEnter={() => isPainting && onToggle()}
      whileTap={{ scale: 0.9 }}
      animate={isCurrentlyPlaying ? { scale: [1, 1.08, 1], transition: { duration: 0.12 } } : {}}
      aria-pressed={active}
    >
      {/* Velocity bar */}
      {active && (
        <div
          className="absolute bottom-0.5 left-1 right-1 rounded-sm"
          style={{
            height: `${Math.max(2, velocity * 5)}px`,
            backgroundColor: 'rgba(255,255,255,0.5)',
          }}
        />
      )}
    </motion.button>
  )
})
