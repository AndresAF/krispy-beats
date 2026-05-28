import { useCallback } from 'react'
import { useSequencerStore } from '../../store/sequencerStore'
import { audioEngine } from '../../engine/AudioEngine'

export function BpmControl() {
  const { patterns, activePatternId, setBpm, playbackState } = useSequencerStore()
  const bpm = patterns[activePatternId].bpm

  const handleChange = useCallback((val: number) => {
    const clamped = Math.min(220, Math.max(40, val))
    setBpm(clamped)
    if (playbackState === 'playing') audioEngine.setBpm(clamped)
  }, [setBpm, playbackState])

  return (
    <div className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-blue-200 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-ink/60 font-semibold">BPM</span>
        <input type="number" min={40} max={220} value={bpm}
          onChange={(e) => handleChange(parseInt(e.target.value) || 120)}
          className="w-14 text-right bg-transparent text-lg font-mono font-bold text-primary focus:outline-none" />
      </div>
      <input type="range" min={40} max={220} step={1} value={bpm}
        onChange={(e) => handleChange(parseInt(e.target.value))} className="w-full" />
      <div className="flex gap-1 flex-wrap">
        {[80, 100, 120, 140, 160].map((v) => (
          <button key={v} onClick={() => handleChange(v)}
            className={`text-xs font-mono px-2 py-0.5 rounded transition-all border
              ${bpm === v
                ? 'border-primary text-primary font-bold bg-blue-50'
                : 'border-blue-200 text-ink/55 hover:text-ink bg-blue-50'
              }`}>
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
