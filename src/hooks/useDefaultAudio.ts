import { useEffect } from 'react'
import kickMp3 from '../assets/kick.mp3'
import biteMp3 from '../assets/bite.mp3'
import hatMp3 from '../assets/hat.mp3'
import hat2Mp3 from '../assets/hat2.mp3'
import hat3Mp3 from '../assets/hat3.mp3'
import { audioEngine } from '../engine/AudioEngine'
import { useSequencerStore } from '../store/sequencerStore'
import type { ChannelId } from '../types'

const DEFAULTS: { id: ChannelId; url: string; fileName: string }[] = [
  { id: 'kick', url: kickMp3,  fileName: 'kick.mp3'  },
  { id: 'bite', url: biteMp3,  fileName: 'bite.mp3'  },
  { id: 'hat',  url: hatMp3,   fileName: 'hat.mp3'   },
  { id: 'hat2', url: hat2Mp3,  fileName: 'hat2.mp3'  },
  { id: 'hat3', url: hat3Mp3,  fileName: 'hat3.mp3'  },
]

async function extractWaveformFromUrl(url: string, samples = 120): Promise<number[]> {
  const resp = await fetch(url)
  const arrayBuffer = await resp.arrayBuffer()
  const ctx = new OfflineAudioContext(1, 1, 44100)
  const buffer = await ctx.decodeAudioData(arrayBuffer)
  const raw = buffer.getChannelData(0)
  const blockSize = Math.floor(raw.length / samples)
  const waveform: number[] = []
  for (let i = 0; i < samples; i++) {
    let sum = 0
    for (let j = 0; j < blockSize; j++) sum += Math.abs(raw[i * blockSize + j] ?? 0)
    waveform.push(sum / blockSize)
  }
  const max = Math.max(...waveform, 0.001)
  return waveform.map(v => v / max)
}

export function useDefaultAudio() {
  const setAudio = useSequencerStore(s => s.setAudio)

  useEffect(() => {
    let cancelled = false
    async function load() {
      for (const { id, url, fileName } of DEFAULTS) {
        if (cancelled) return
        try {
          const [waveformData] = await Promise.all([
            extractWaveformFromUrl(url),
            audioEngine.loadAudio(id, url),
          ])
          if (!cancelled) setAudio(id, url, fileName, waveformData)
        } catch (err) {
          console.warn(`Could not load default audio for ${id}:`, err)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
