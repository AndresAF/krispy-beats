import type { Channel, ChannelId, Pattern, PatternLength, Step } from '../types'
import { CHANNEL_DEFAULTS } from '../types'

export function makeSteps(length: number): Step[] {
  return Array.from({ length }, () => ({ active: false, velocity: 0.8 }))
}

export function makeChannel(id: ChannelId, steps = 16): Channel {
  const defaults = CHANNEL_DEFAULTS[id]
  return {
    id,
    label: defaults.label,
    color: defaults.color,
    accentColor: defaults.accentColor,
    steps: makeSteps(steps),
    volume: 0.8,
    muted: false,
    solo: false,
    audioUrl: null,
    fileName: null,
    waveformData: null,
  }
}

export function makeDefaultPattern(id: string, name = 'Pattern 1'): Pattern {
  return {
    id,
    name,
    bpm: 120,
    swing: 0,
    patternLength: 16,
    timeSignature: '4/4',
    channels: {
      kick: makeChannel('kick'),
      bite: makeChannel('bite'),
      hat:  makeChannel('hat'),
      hat2: makeChannel('hat2'),
      hat3: makeChannel('hat3'),
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function resizeSteps(steps: Step[], newLength: PatternLength): Step[] {
  if (steps.length === newLength) return steps
  if (newLength > steps.length) {
    const extra = Array.from({ length: newLength - steps.length }, () => ({ active: false, velocity: 0.8 }))
    return [...steps, ...extra]
  }
  return steps.slice(0, newLength)
}

/** Returns true if any channel has solo enabled */
export function hasSolo(channels: Record<ChannelId, Channel>): boolean {
  return Object.values(channels).some(c => c.solo)
}

/** Returns whether a channel should actually play (accounting for solo) */
export function channelShouldPlay(channel: Channel, channels: Record<ChannelId, Channel>): boolean {
  if (channel.muted) return false
  if (hasSolo(channels) && !channel.solo) return false
  return true
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
