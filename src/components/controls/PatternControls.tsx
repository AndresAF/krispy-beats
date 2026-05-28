import { useSequencerStore } from '../../store/sequencerStore'
import type { PatternLength, TimeSignature } from '../../types'

const LENGTHS: PatternLength[] = [4, 8, 16, 32]
const TIME_SIGS: TimeSignature[] = ['4/4', '8/8', '16/16']

export function PatternControls() {
  const { patterns, activePatternId, setPatternLength, setTimeSignature, setSwing, randomizePattern, clearPattern } = useSequencerStore()
  const { patternLength, timeSignature, swing } = patterns[activePatternId]

  const activeBtn = 'border border-primary text-primary font-bold bg-blue-50'
  const idleBtn = 'border border-blue-200 text-ink/55 hover:text-ink bg-blue-50'

  return (
    <div className="flex flex-col gap-3 p-3 bg-white rounded-xl border border-blue-200 shadow-sm">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-ink/60 font-semibold block mb-1.5">Steps</span>
        <div className="flex gap-1">
          {LENGTHS.map((l) => (
            <button key={l} onClick={() => setPatternLength(l)}
              className={`flex-1 text-xs font-mono py-1 rounded transition-all ${patternLength === l ? activeBtn : idleBtn}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-ink/60 font-semibold block mb-1.5">Time</span>
        <div className="flex gap-1">
          {TIME_SIGS.map((ts) => (
            <button key={ts} onClick={() => setTimeSignature(ts)}
              className={`flex-1 text-xs font-mono py-1 rounded transition-all
                ${timeSignature === ts ? 'border border-violet text-violet font-bold bg-blue-50' : idleBtn}`}>
              {ts}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink/60 font-semibold">Swing</span>
          <span className="text-xs font-mono text-ink/55">{Math.round(swing * 200)}%</span>
        </div>
        <input type="range" min={0} max={0.4} step={0.01} value={swing}
          onChange={(e) => setSwing(parseFloat(e.target.value))} className="w-full" />
      </div>

      <div className="flex gap-2">
        <button onClick={randomizePattern}
          className="flex-1 text-xs font-mono py-1.5 rounded bg-violet/15 text-violet border border-violet/30 hover:bg-violet/25 transition-all">
          Randomize
        </button>
        <button onClick={clearPattern}
          className="flex-1 text-xs font-mono py-1.5 rounded bg-blue-50 text-ink/55 border border-blue-200 hover:text-ink transition-all">
          Clear
        </button>
      </div>
    </div>
  )
}
