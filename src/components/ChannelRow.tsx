import { memo, useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSequencerStore } from '../store/sequencerStore'
import type { Channel, ChannelId } from '../types'
import { StepButton } from './sequencer/StepButton'
import { WaveformDisplay } from './channel/WaveformDisplay'
import { extractWaveform } from '../utils/waveform'
import { audioEngine } from '../engine/AudioEngine'

interface Props {
  channel: Channel
  currentStep: number
  isPlaying: boolean
  isSelected: boolean
  onSelect: () => void
}

const ACCEPTED = ['audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/mp3', 'audio/x-wav']

export const ChannelRow = memo(function ChannelRow({
  channel, currentStep, isPlaying, isSelected, onSelect,
}: Props) {
  const { toggleStep, toggleMute, toggleSolo, setVolume, setAudio, clearAudio } = useSequencerStore()
  const { id, label, color, steps, volume, muted, solo, waveformData, fileName, audioUrl } = channel

  const [isPainting, setIsPainting] = useState(false)
  const [, setPaintValue] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleMouseDown = useCallback((i: number) => {
    setPaintValue(!steps[i].active)
    setIsPainting(true)
    toggleStep(id as ChannelId, i)
  }, [steps, id, toggleStep])

  const handleMouseUp = useCallback(() => setIsPainting(false), [])

  const handleFile = useCallback(async (file: File) => {
    if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(wav|mp3|ogg|m4a)$/i)) return
    setLoading(true)
    try {
      const url = URL.createObjectURL(file)
      const wf = await extractWaveform(file)
      await audioEngine.loadAudio(id as ChannelId, url)
      setAudio(id as ChannelId, url, file.name, wf)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [id, setAudio])

  return (
    <motion.div
      layout
      className={`flex items-stretch gap-3 rounded-xl transition-all duration-150
        ${isSelected ? 'ring-2' : 'ring-1 ring-panel-border'}
      `}
      style={isSelected ? { '--tw-ring-color': color + '50' } as React.CSSProperties : {}}
    >
      {/* ── Left: channel info ─────────────────────────── */}
      <div
        className="flex flex-col justify-between bg-white rounded-xl p-2.5 cursor-pointer"
        style={{ width: '220px', flexShrink: 0 }}
        onClick={onSelect}
      >
        {/* Label row */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}60` }} />
          <span className="text-xs font-mono font-semibold tracking-widest flex-1" style={{ color }}>
            {label}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); toggleSolo(id as ChannelId) }}
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all
              ${solo ? 'bg-primary/15 text-primary ring-1 ring-primary/35' : 'text-ink/25 hover:text-ink/55'}`}
          >S</button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleMute(id as ChannelId) }}
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all
              ${muted ? 'bg-red-100 text-red-500 ring-1 ring-red-200' : 'text-ink/25 hover:text-ink/55'}`}
          >M</button>
        </div>

        {/* Waveform / drop zone */}
        <div
          className="flex-1 my-1.5 rounded-lg overflow-hidden cursor-pointer"
          onClick={(e) => { e.stopPropagation(); if (!audioUrl) inputRef.current?.click() }}
        >
          <input ref={inputRef} type="file" accept=".wav,.mp3,.ogg,audio/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

          {audioUrl && waveformData ? (
            <div className="relative group h-full">
              <WaveformDisplay data={waveformData} color={color} height={28} />
              {/* hover overlay to replace */}
              <div
                className="absolute inset-0 flex items-center justify-center bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                onClick={(e) => { e.stopPropagation(); audioEngine.unloadAudio(id as ChannelId); clearAudio(id as ChannelId) }}
              >
                <span className="text-[10px] text-ink/50 font-mono">✕ clear</span>
              </div>
            </div>
          ) : (
            <div className="h-7 flex items-center justify-center bg-surface-200 rounded-lg">
              {loading
                ? <span className="text-[10px] text-ink/30 font-mono animate-pulse">loading…</span>
                : <span className="text-[10px] text-ink/25 font-mono">
                    {fileName ?? 'drop or click'}
                  </span>
              }
            </div>
          )}
        </div>

        {/* Volume row */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <svg className="w-3 h-3 flex-shrink-0 text-ink/20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" />
          </svg>
          <input type="range" min={0} max={1} step={0.01} value={volume}
            onChange={(e) => setVolume(id as ChannelId, parseFloat(e.target.value))}
            className="flex-1" />
          <span className="text-[10px] font-mono text-ink/25 w-6 text-right">
            {Math.round(volume * 100)}
          </span>
        </div>
      </div>

      {/* ── Right: step buttons ─────────────────────────── */}
      <div
        className="flex-1 min-w-0 bg-white rounded-xl px-3 py-2"
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
      >
        <div className="flex gap-1 h-full" style={{ minHeight: '100%' }}>
          {steps.map((step, i) => {
            const groupStart = i > 0 && i % 4 === 0
            return (
              <div
                key={i}
                className={`flex-1 min-w-0 flex flex-col ${groupStart ? 'ml-1' : ''} ${
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
      </div>
    </motion.div>
  )
})
