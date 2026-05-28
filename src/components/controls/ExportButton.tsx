import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSequencerStore } from '../../store/sequencerStore'
import { audioEngine } from '../../engine/AudioEngine'

export function ExportButton() {
  const { patterns, activePatternId } = useSequencerStore()
  const pattern = patterns[activePatternId]
  const [exporting, setExporting] = useState(false)
  const [bars, setBars] = useState(4)
  const [open, setOpen] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await audioEngine.exportWav(pattern, bars)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${pattern.name.replace(/\s+/g, '_')}_${pattern.bpm}bpm.wav`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Export failed. Make sure channels have audio loaded.')
    } finally { setExporting(false); setOpen(false) }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono
          bg-blue-50 border border-blue-200 text-ink/55 hover:bg-blue-100 hover:text-ink/80
          transition-all shadow-sm">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export WAV
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            className="absolute right-0 top-full mt-1 z-50 bg-white
              ring-1 ring-panel-border rounded-xl p-3 min-w-[180px] shadow-panel">
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-ink/35 block mb-1.5">Bars</span>
                <div className="flex gap-1">
                  {[1, 2, 4, 8].map((b) => (
                    <button key={b} onClick={() => setBars(b)}
                      className={`flex-1 text-xs font-mono py-1 rounded transition-all
                        ${bars === b
                          ? 'border border-primary text-primary font-bold bg-blue-50'
                          : 'border border-blue-200 text-ink/55 hover:text-ink bg-blue-50'
                        }`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleExport} disabled={exporting}
                className="w-full text-xs font-mono py-2 rounded-lg
                  bg-primary/10 text-primary ring-1 ring-primary/25
                  hover:bg-primary/20 transition-all disabled:opacity-50">
                {exporting ? 'Rendering…' : `Export ${bars} bar${bars > 1 ? 's' : ''}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
