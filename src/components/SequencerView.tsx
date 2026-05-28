import { motion } from 'framer-motion'
import { useSequencerStore } from '../store/sequencerStore'
import type { ChannelId } from '../types'
import { CHANNEL_ORDER } from '../types'
import { ChannelRow } from './ChannelRow'
import { BpmControl } from './controls/BpmControl'
import { PatternControls } from './controls/PatternControls'
import { MasterVolume } from './controls/MasterVolume'
import { PatternBank } from './modals/PatternBank'

export function SequencerView() {
  const { patterns, activePatternId, selectedChannelId, setSelectedChannel, playbackState, currentStep } = useSequencerStore()
  const pattern = patterns[activePatternId]
  const isPlaying = playbackState === 'playing'

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[1400px] mx-auto w-full">

      {/* Pattern name */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={isPlaying ? { scale: [1, 1.4, 1], opacity: [1, 0.4, 1] } : { scale: 1 }}
          transition={isPlaying ? { duration: 60 / pattern.bpm * 0.5, repeat: Infinity } : {}}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: isPlaying ? '#2563EB' : '#DBEAFE' }}
        />
        <h2 className="text-sm font-mono font-medium text-ink/55 tracking-wide">{pattern.name}</h2>
        <span className="text-xs font-mono text-ink/25">{pattern.patternLength} steps · {pattern.timeSignature}</span>
      </div>

      {/* Step ruler — offset to align with the steps panel */}
      <div className="flex" style={{ paddingLeft: '235px' }}>
        <div className="flex-1 flex items-center gap-1 px-3">
          {Array.from({ length: Math.ceil(pattern.patternLength / 4) }, (_, i) => (
            <div key={i} className="text-[9px] font-mono text-ink/20 tracking-widest"
              style={{ flex: '4 1 0', marginLeft: i > 0 ? '4px' : 0 }}>{i + 1}</div>
          ))}
        </div>
      </div>

      {/* Channel rows — each channel is one unified row */}
      <div className="flex flex-col gap-2">
        {CHANNEL_ORDER.map((id) => (
          <ChannelRow
            key={id}
            channel={pattern.channels[id as ChannelId]}
            currentStep={currentStep}
            isPlaying={isPlaying}
            isSelected={selectedChannelId === id}
            onSelect={() => setSelectedChannel(id as ChannelId)}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex" style={{ paddingLeft: '235px' }}>
        <div className="flex-1 px-3">
          <div className="h-1 bg-surface-200 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-primary"
              animate={{ width: isPlaying ? `${((currentStep + 1) / pattern.patternLength) * 100}%` : '0%' }}
              transition={{ duration: 0.05 }} />
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BpmControl />
        <PatternControls />
        <MasterVolume />
        <PatternBank />
      </div>
    </div>
  )
}
