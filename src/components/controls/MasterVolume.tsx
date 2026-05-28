import { useEffect } from 'react'
import { useSequencerStore } from '../../store/sequencerStore'
import { audioEngine } from '../../engine/AudioEngine'

export function MasterVolume() {
  const { masterVolume, setMasterVolume } = useSequencerStore()
  useEffect(() => { audioEngine.setMasterVolume(masterVolume) }, [masterVolume])

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-200 shadow-sm">
      <div className="flex flex-col items-start gap-1 flex-1">
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink/60 font-semibold">Master</span>
          <span className="text-xs font-mono text-ink/55 font-medium">{Math.round(masterVolume * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={masterVolume}
          onChange={(e) => setMasterVolume(parseFloat(e.target.value))} className="w-full" />
      </div>
      <div className="flex gap-0.5 items-end h-8">
        {Array.from({ length: 8 }, (_, i) => {
          const lit = masterVolume >= (i + 1) / 8
          const c = i < 5 ? '#2563EB' : i < 7 ? '#7C3AED' : '#0891B2'
          return (
            <div key={i} className="w-1.5 rounded-sm transition-all duration-75"
              style={{
                height: `${40 + i * 7}%`,
                backgroundColor: lit ? c : '#DBEAFE',
                boxShadow: lit ? `0 0 4px ${c}50` : 'none',
              }} />
          )
        })}
      </div>
    </div>
  )
}
