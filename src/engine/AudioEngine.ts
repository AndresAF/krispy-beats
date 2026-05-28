import * as Tone from 'tone'
import type { ChannelId, Pattern } from '../types'
import { CHANNEL_ORDER } from '../types'
import { channelShouldPlay } from '../utils/pattern'

type StepCallback = (step: number) => void

class AudioEngine {
  private players: Map<ChannelId, Tone.Player> = new Map()
  private channelNodes: Map<ChannelId, Tone.Channel> = new Map()
  private masterGain: Tone.Gain = new Tone.Gain(0.8).toDestination()
  private sequence: Tone.Sequence | null = null
  private stepCallbacks: StepCallback[] = []
  private currentPattern: Pattern | null = null
  private metronomeEnabled = false

  constructor() {
    for (const id of CHANNEL_ORDER) {
      const ch = new Tone.Channel({ volume: 0, mute: false }).connect(this.masterGain)
      this.channelNodes.set(id, ch)
    }
  }

  onStep(cb: StepCallback) {
    this.stepCallbacks.push(cb)
    return () => {
      this.stepCallbacks = this.stepCallbacks.filter((f) => f !== cb)
    }
  }

  private notifyStep(step: number) {
    for (const cb of this.stepCallbacks) cb(step)
  }

  async loadAudio(channelId: ChannelId, url: string): Promise<void> {
    const existing = this.players.get(channelId)
    if (existing) {
      try { existing.stop() } catch {}
      existing.disconnect()
      existing.dispose()
    }
    // Create player without requiring audio context to be running yet.
    // Tone.Player fetches & decodes the buffer even in suspended context.
    const player = new Tone.Player({ url }).connect(this.channelNodes.get(channelId)!)
    this.players.set(channelId, player)
    // Wait for decode without blocking on Tone.start()
    await new Promise<void>((resolve) => {
      if (player.loaded) { resolve(); return }
      player.load(url).then(() => resolve()).catch(() => resolve())
    })
  }

  unloadAudio(channelId: ChannelId) {
    const player = this.players.get(channelId)
    if (player) {
      player.stop()
      player.disconnect()
      player.dispose()
      this.players.delete(channelId)
    }
  }

  setVolume(channelId: ChannelId, volume: number) {
    const ch = this.channelNodes.get(channelId)
    if (ch) ch.volume.value = Tone.gainToDb(volume)
  }

  setMasterVolume(volume: number) {
    this.masterGain.gain.value = volume
  }

  setMute(channelId: ChannelId, muted: boolean) {
    const ch = this.channelNodes.get(channelId)
    if (ch) ch.mute = muted
  }

  async start(pattern: Pattern) {
    await Tone.start()
    this.currentPattern = pattern
    this.stop()

    Tone.getTransport().bpm.value = pattern.bpm

    // Apply swing by offsetting even subdivisions
    // Swing of 0 = straight, 0.5 = max swing
    const stepCount = pattern.patternLength

    this.sequence = new Tone.Sequence(
      (time, idx: number) => {
        const stepIdx = idx as number
        this.notifyStep(stepIdx)

        if (!this.currentPattern) return

        // Metronome click on beat 1 of every bar
        if (this.metronomeEnabled && stepIdx % 4 === 0) {
          const synth = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
            volume: -10,
          }).toDestination()
          synth.triggerAttackRelease(stepIdx === 0 ? 'C5' : 'A4', '32n', time)
          setTimeout(() => synth.dispose(), 500)
        }

        for (const channelId of CHANNEL_ORDER) {
          const ch = this.currentPattern.channels[channelId]
          if (!channelShouldPlay(ch, this.currentPattern.channels)) continue

          const stepData = ch.steps[stepIdx]
          if (!stepData?.active) continue

          const player = this.players.get(channelId)
          if (!player || !player.loaded) continue

          // Swing offset for even 8th note positions
          let offset = 0
          if (this.currentPattern.swing > 0 && stepIdx % 2 === 1) {
            offset = this.currentPattern.swing * (60 / this.currentPattern.bpm) * 0.5
          }

          const vol = Tone.gainToDb(stepData.velocity * ch.volume)
          player.volume.setValueAtTime(vol, time + offset)
          player.start(time + offset)
        }
      },
      Array.from({ length: stepCount }, (_, i) => i),
      '16n'
    )

    this.sequence.loop = true
    this.sequence.start(0)
    Tone.getTransport().start()
  }

  pause() {
    Tone.getTransport().pause()
  }

  resume() {
    Tone.getTransport().start()
  }

  stop() {
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    if (this.sequence) {
      this.sequence.stop()
      this.sequence.dispose()
      this.sequence = null
    }
  }

  updatePattern(pattern: Pattern) {
    this.currentPattern = pattern
    Tone.getTransport().bpm.value = pattern.bpm
    // Update channel volumes/mutes in real time
    for (const id of CHANNEL_ORDER) {
      const ch = pattern.channels[id]
      this.setVolume(id, ch.volume)
    }
  }

  setMetronome(enabled: boolean) {
    this.metronomeEnabled = enabled
  }

  setBpm(bpm: number) {
    Tone.getTransport().bpm.value = bpm
  }

  /** Export the current pattern to a WAV blob */
  async exportWav(pattern: Pattern, durationBars = 2): Promise<Blob> {
    const bpm = pattern.bpm
    const secondsPerBeat = 60 / bpm
    const secondsPerStep = secondsPerBeat / 4
    const totalSteps = pattern.patternLength * durationBars
    const duration = totalSteps * secondsPerStep + 0.5 // small tail

    const sr = 44100
    const ctx = new OfflineAudioContext(2, Math.ceil(duration * sr), sr)
    const masterGain = ctx.createGain()
    masterGain.gain.value = pattern.channels ? 0.8 : 0.8
    masterGain.connect(ctx.destination)

    for (const channelId of CHANNEL_ORDER) {
      const ch = pattern.channels[channelId]
      if (!channelShouldPlay(ch, pattern.channels)) continue
      if (!ch.audioUrl) continue

      let arrayBuf: ArrayBuffer
      try {
        const resp = await fetch(ch.audioUrl)
        arrayBuf = await resp.arrayBuffer()
      } catch {
        continue
      }

      let audioBuf: AudioBuffer
      try {
        audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0))
      } catch {
        continue
      }

      for (let loop = 0; loop < durationBars; loop++) {
        for (let stepIdx = 0; stepIdx < pattern.patternLength; stepIdx++) {
          const step = ch.steps[stepIdx]
          if (!step.active) continue

          const baseStep = loop * pattern.patternLength + stepIdx
          let offset = baseStep * secondsPerStep
          if (pattern.swing > 0 && stepIdx % 2 === 1) {
            offset += pattern.swing * secondsPerBeat * 0.5
          }

          const src = ctx.createBufferSource()
          src.buffer = audioBuf
          const gainNode = ctx.createGain()
          gainNode.gain.value = step.velocity * ch.volume
          src.connect(gainNode)
          gainNode.connect(masterGain)
          src.start(offset)
        }
      }
    }

    const rendered = await ctx.startRendering()
    return audioBufferToWav(rendered)
  }
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const numFrames = buffer.length
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = numFrames * blockAlign
  const bufLen = 44 + dataSize

  const ab = new ArrayBuffer(bufLen)
  const view = new DataView(ab)

  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  write(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  write(8, 'WAVE')
  write(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true)
  write(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([ab], { type: 'audio/wav' })
}

export const audioEngine = new AudioEngine()
