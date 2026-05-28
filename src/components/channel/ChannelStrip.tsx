import { memo } from 'react'
import { motion } from 'framer-motion'
import { useSequencerStore } from '../../store/sequencerStore'
import type { Channel, ChannelId } from '../../types'
import { AudioDropZone } from './AudioDropZone'

interface Props {
  channel: Channel
  isSelected: boolean
  onSelect: () => void
}

export const ChannelStrip = memo(function ChannelStrip({ channel, isSelected, onSelect }: Props) {
  const { toggleMute, toggleSolo, setVolume } = useSequencerStore()
  if (!channel) return null
  const { id, label, color, volume, muted, solo } = channel

  return (
    <motion.div
      layout
      className={`flex flex-col gap-1.5 p-2 rounded-xl transition-all duration-150 cursor-pointer
        ${isSelected ? 'bg-white ring-2' : 'bg-white hover:bg-surface-100 ring-1 ring-panel-border'}
      `}
      style={isSelected ? { '--tw-ring-color': color + '55' } as React.CSSProperties : {}}
      onClick={onSelect}
      whileHover={{ scale: 1.005 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}60` }} />
        <span className="text-xs font-mono font-semibold tracking-widest flex-1" style={{ color }}>
          {label}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); toggleSolo(id as ChannelId) }}
          className={`text-xs font-mono px-1.5 py-0.5 rounded transition-all
            ${solo ? 'bg-primary/15 text-primary ring-1 ring-primary/40' : 'text-ink/25 hover:text-ink/55'}`}
        >S</button>

        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(id as ChannelId) }}
          className={`text-xs font-mono px-1.5 py-0.5 rounded transition-all
            ${muted ? 'bg-red-100 text-red-500 ring-1 ring-red-300' : 'text-ink/25 hover:text-ink/55'}`}
        >M</button>
      </div>

      <AudioDropZone
        channelId={id as ChannelId}
        color={color}
        fileName={channel.fileName}
        waveformData={channel.waveformData}
        audioUrl={channel.audioUrl}
      />

      <div className="flex items-center gap-2">
        <svg className="w-3 h-3 flex-shrink-0 text-ink/25" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" />
        </svg>
        <input type="range" min={0} max={1} step={0.01} value={volume}
          onChange={(e) => { e.stopPropagation(); setVolume(id as ChannelId, parseFloat(e.target.value)) }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 h-1" style={{ accentColor: color }} />
        <span className="text-xs font-mono text-ink/30 w-7 text-right">{Math.round(volume * 100)}</span>
      </div>
    </motion.div>
  )
})
