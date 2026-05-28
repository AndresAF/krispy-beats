import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSequencerStore } from '../../store/sequencerStore'

export function PatternBank() {
  const { patterns, activePatternId, loadPattern, savePattern, deletePattern, renamePattern } = useSequencerStore()
  const [saving, setSaving] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')

  const handleSave = () => {
    savePattern(saveName.trim() || `Pattern ${Object.keys(patterns).length + 1}`)
    setSaving(false); setSaveName('')
  }
  const handleRename = (id: string) => {
    if (renameVal.trim()) renamePattern(id, renameVal.trim())
    setRenamingId(null); setRenameVal('')
  }
  const sorted = Object.values(patterns).sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-blue-200 shadow-sm min-w-[200px]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-ink/60 font-semibold">Patterns</span>
        <button onClick={() => setSaving(!saving)}
          className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-all">
          + Save
        </button>
      </div>

      <AnimatePresence>
        {saving && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex gap-1 mt-1">
              <input autoFocus value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setSaving(false) }}
                placeholder="Pattern name…"
                className="flex-1 bg-blue-50 text-xs font-mono px-2 py-1 rounded
                  border border-blue-200 focus:outline-none focus:border-primary
                  text-ink placeholder-ink/30" />
              <button onClick={handleSave}
                className="text-xs font-mono px-2 py-1 rounded bg-primary/15 text-primary hover:bg-primary/25 transition-all border border-primary/25">
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
        {sorted.map((p) => (
          <motion.div key={p.id} layout
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all
              ${activePatternId === p.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-blue-50 border border-transparent'}`}
            onClick={() => loadPattern(p.id)}>
            {renamingId === p.id ? (
              <input autoFocus value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(p.id); if (e.key === 'Escape') setRenamingId(null) }}
                onBlur={() => handleRename(p.id)} onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-transparent text-xs font-mono text-ink focus:outline-none" />
            ) : (
              <span
                className={`flex-1 text-xs font-mono truncate
                  ${activePatternId === p.id ? 'text-primary font-semibold' : 'text-ink/65'}`}
                onDoubleClick={(e) => { e.stopPropagation(); setRenamingId(p.id); setRenameVal(p.name) }}>
                {p.name}
              </span>
            )}
            <span className="text-[10px] font-mono text-ink/35 flex-shrink-0">{p.bpm}</span>
            {sorted.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); deletePattern(p.id) }}
                className="text-[10px] text-ink/25 hover:text-red-400 transition-colors px-0.5">✕</button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
