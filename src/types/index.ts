export type ChannelId = 'kick' | 'bite' | 'hat' | 'hat2' | 'hat3'

export type PatternLength = 4 | 8 | 16 | 32

export type TimeSignature = '4/4' | '8/8' | '16/16'

export type PlaybackState = 'stopped' | 'playing' | 'paused'

export interface Step {
  active: boolean
  velocity: number // 0–1
}

export interface Channel {
  id: ChannelId
  label: string
  color: string
  accentColor: string
  steps: Step[]
  volume: number    // 0–1
  muted: boolean
  solo: boolean
  audioUrl: string | null
  fileName: string | null
  waveformData: number[] | null
}

export interface Pattern {
  id: string
  name: string
  bpm: number
  swing: number        // 0–0.5
  patternLength: PatternLength
  timeSignature: TimeSignature
  channels: Record<ChannelId, Channel>
  createdAt: number
  updatedAt: number
}

export interface SequencerState {
  patterns: Record<string, Pattern>
  activePatternId: string
  playbackState: PlaybackState
  currentStep: number
  metronomeEnabled: boolean
  masterVolume: number
  selectedChannelId: ChannelId | null

  // Actions
  setPlaybackState: (state: PlaybackState) => void
  setCurrentStep: (step: number) => void
  toggleStep: (channelId: ChannelId, stepIndex: number) => void
  setStepVelocity: (channelId: ChannelId, stepIndex: number, velocity: number) => void
  setVolume: (channelId: ChannelId, volume: number) => void
  setMasterVolume: (volume: number) => void
  toggleMute: (channelId: ChannelId) => void
  toggleSolo: (channelId: ChannelId) => void
  setBpm: (bpm: number) => void
  setSwing: (swing: number) => void
  setPatternLength: (length: PatternLength) => void
  setTimeSignature: (sig: TimeSignature) => void
  setAudio: (channelId: ChannelId, url: string, fileName: string, waveformData: number[]) => void
  clearAudio: (channelId: ChannelId) => void
  toggleMetronome: () => void
  setSelectedChannel: (channelId: ChannelId | null) => void
  randomizePattern: () => void
  clearPattern: () => void
  savePattern: (name: string) => void
  loadPattern: (patternId: string) => void
  deletePattern: (patternId: string) => void
  copyChannelPattern: (fromId: ChannelId, toId: ChannelId) => void
  renamePattern: (patternId: string, name: string) => void
}

export const CHANNEL_DEFAULTS: Record<ChannelId, { label: string; color: string; accentColor: string }> = {
  kick: { label: 'KICK', color: '#2563EB', accentColor: '#2563EB' },
  bite: { label: 'BITE', color: '#7C3AED', accentColor: '#7C3AED' },
  hat:  { label: 'HAT',  color: '#0891B2', accentColor: '#0891B2' },
  hat2: { label: 'HAT2', color: '#6366F1', accentColor: '#6366F1' },
  hat3: { label: 'HAT3', color: '#0EA5E9', accentColor: '#0EA5E9' },
}

export const CHANNEL_ORDER: ChannelId[] = ['kick', 'bite', 'hat', 'hat2', 'hat3']
