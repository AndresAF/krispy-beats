import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { extractWaveform } from '../../utils/waveform'
import { audioEngine } from '../../engine/AudioEngine'
import { useSequencerStore } from '../../store/sequencerStore'
import type { ChannelId } from '../../types'
import { WaveformDisplay } from './WaveformDisplay'

interface Props {
  channelId: ChannelId
  color: string
  fileName: string | null
  waveformData: number[] | null
  audioUrl: string | null
}

const ACCEPTED = ['audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/mp3', 'audio/x-wav']

export function AudioDropZone({ channelId, color, fileName, waveformData, audioUrl }: Props) {
  const { setAudio, clearAudio } = useSequencerStore()
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(wav|mp3|ogg|m4a|aac)$/i)) {
      setError('Use WAV, MP3, or OGG.')
      return
    }
    setLoading(true); setError(null)
    try {
      const url = URL.createObjectURL(file)
      const wf = await extractWaveform(file)
      await audioEngine.loadAudio(channelId, url)
      setAudio(channelId, url, file.name, wf)
    } catch (e) { setError('Failed to load.'); console.error(e) }
    finally { setLoading(false) }
  }, [channelId, setAudio])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]; if (file) handleFile(file)
  }, [handleFile])

  return (
    <div
      className={`relative rounded-lg overflow-hidden transition-all duration-150 cursor-pointer select-none
        ${audioUrl ? 'bg-surface-100' : 'bg-surface-200 hover:bg-surface-300'}
        ring-1 ${dragging ? '' : 'ring-panel-border'}
      `}
      style={dragging ? { outline: `2px solid ${color}`, outlineOffset: '-1px' } : {}}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !audioUrl && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".wav,.mp3,.ogg,.m4a,.aac,audio/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

      <AnimatePresence mode="wait">
        {audioUrl && waveformData ? (
          <motion.div key="wf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-2 pt-1 pb-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-mono truncate max-w-[80%]" style={{ color }}>{fileName}</span>
              <button onClick={(e) => { e.stopPropagation(); audioEngine.unloadAudio(channelId); clearAudio(channelId) }}
                className="text-xs text-ink/25 hover:text-red-400 transition-colors ml-1 p-0.5">✕</button>
            </div>
            <WaveformDisplay data={waveformData} color={color} height={34} />
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-2 px-3 min-h-[58px]">
            {loading ? (
              <span className="text-xs text-ink/35 animate-pulse">Loading…</span>
            ) : (
              <>
                <svg className="w-4 h-4 mb-1 text-ink/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-xs text-ink/20 text-center leading-tight">
                  {dragging ? 'Drop here' : 'Drop or click'}
                </span>
                {error && <span className="text-xs text-red-400 mt-1">{error}</span>}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {dragging && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ border: `2px solid ${color}`, boxShadow: `0 0 10px ${color}40` }} />
      )}
    </div>
  )
}
