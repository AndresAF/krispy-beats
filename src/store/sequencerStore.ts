import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  SequencerState,
  TimeSignature,
  Pattern,
} from '../types'
import { CHANNEL_ORDER } from '../types'
import {
  makeDefaultPattern,
  resizeSteps,
  makeSteps,
  generateId,
} from '../utils/pattern'

const INIT_ID = 'default'

function serializePatterns(patterns: Record<string, Pattern>): Record<string, Pattern> {
  // Strip object URLs from persistence (they're session-only)
  const cleaned: Record<string, Pattern> = {}
  for (const [id, p] of Object.entries(patterns)) {
    cleaned[id] = {
      ...p,
      channels: Object.fromEntries(
        Object.entries(p.channels).map(([cid, ch]) => [
          cid,
          {
            ...ch,
            audioUrl: ch.audioUrl?.startsWith('blob:') ? null : ch.audioUrl,
            waveformData: null, // don't persist large waveform arrays
          },
        ])
      ) as Pattern['channels'],
    }
  }
  return cleaned
}

export const useSequencerStore = create<SequencerState>()(
  persist(
    (set, get) => ({
      patterns: { [INIT_ID]: makeDefaultPattern(INIT_ID) },
      activePatternId: INIT_ID,
      playbackState: 'stopped',
      currentStep: 0,
      metronomeEnabled: false,
      masterVolume: 0.8,
      selectedChannelId: null,

      setPlaybackState: (state) => set({ playbackState: state }),
      setCurrentStep: (step) => set({ currentStep: step }),

      toggleStep: (channelId, stepIndex) =>
        set((s) => {
          const pattern = s.patterns[s.activePatternId]
          const steps = [...pattern.channels[channelId].steps]
          steps[stepIndex] = { ...steps[stepIndex], active: !steps[stepIndex].active }
          return {
            patterns: {
              ...s.patterns,
              [s.activePatternId]: {
                ...pattern,
                updatedAt: Date.now(),
                channels: {
                  ...pattern.channels,
                  [channelId]: { ...pattern.channels[channelId], steps },
                },
              },
            },
          }
        }),

      setStepVelocity: (channelId, stepIndex, velocity) =>
        set((s) => {
          const pattern = s.patterns[s.activePatternId]
          const steps = [...pattern.channels[channelId].steps]
          steps[stepIndex] = { ...steps[stepIndex], velocity }
          return {
            patterns: {
              ...s.patterns,
              [s.activePatternId]: {
                ...pattern,
                channels: {
                  ...pattern.channels,
                  [channelId]: { ...pattern.channels[channelId], steps },
                },
              },
            },
          }
        }),

      setVolume: (channelId, volume) =>
        set((s) => {
          const pattern = s.patterns[s.activePatternId]
          return {
            patterns: {
              ...s.patterns,
              [s.activePatternId]: {
                ...pattern,
                channels: {
                  ...pattern.channels,
                  [channelId]: { ...pattern.channels[channelId], volume },
                },
              },
            },
          }
        }),

      setMasterVolume: (masterVolume) => set({ masterVolume }),

      toggleMute: (channelId) =>
        set((s) => {
          const pattern = s.patterns[s.activePatternId]
          const ch = pattern.channels[channelId]
          return {
            patterns: {
              ...s.patterns,
              [s.activePatternId]: {
                ...pattern,
                channels: {
                  ...pattern.channels,
                  [channelId]: { ...ch, muted: !ch.muted },
                },
              },
            },
          }
        }),

      toggleSolo: (channelId) =>
        set((s) => {
          const pattern = s.patterns[s.activePatternId]
          const ch = pattern.channels[channelId]
          return {
            patterns: {
              ...s.patterns,
              [s.activePatternId]: {
                ...pattern,
                channels: {
                  ...pattern.channels,
                  [channelId]: { ...ch, solo: !ch.solo },
                },
              },
            },
          }
        }),

      setBpm: (bpm) =>
        set((s) => ({
          patterns: {
            ...s.patterns,
            [s.activePatternId]: { ...s.patterns[s.activePatternId], bpm },
          },
        })),

      setSwing: (swing) =>
        set((s) => ({
          patterns: {
            ...s.patterns,
            [s.activePatternId]: { ...s.patterns[s.activePatternId], swing },
          },
        })),

      setPatternLength: (patternLength) =>
        set((s) => {
          const pattern = s.patterns[s.activePatternId]
          const channels = Object.fromEntries(
            CHANNEL_ORDER.map((id) => [
              id,
              {
                ...pattern.channels[id],
                steps: resizeSteps(pattern.channels[id].steps, patternLength),
              },
            ])
          ) as Pattern['channels']
          return {
            patterns: {
              ...s.patterns,
              [s.activePatternId]: { ...pattern, patternLength, channels },
            },
          }
        }),

      setTimeSignature: (timeSignature: TimeSignature) =>
        set((s) => ({
          patterns: {
            ...s.patterns,
            [s.activePatternId]: { ...s.patterns[s.activePatternId], timeSignature },
          },
        })),

      setAudio: (channelId, url, fileName, waveformData) =>
        set((s) => {
          const pattern = s.patterns[s.activePatternId]
          return {
            patterns: {
              ...s.patterns,
              [s.activePatternId]: {
                ...pattern,
                channels: {
                  ...pattern.channels,
                  [channelId]: { ...pattern.channels[channelId], audioUrl: url, fileName, waveformData },
                },
              },
            },
          }
        }),

      clearAudio: (channelId) =>
        set((s) => {
          const pattern = s.patterns[s.activePatternId]
          const ch = pattern.channels[channelId]
          if (ch.audioUrl?.startsWith('blob:')) URL.revokeObjectURL(ch.audioUrl)
          return {
            patterns: {
              ...s.patterns,
              [s.activePatternId]: {
                ...pattern,
                channels: {
                  ...pattern.channels,
                  [channelId]: { ...ch, audioUrl: null, fileName: null, waveformData: null },
                },
              },
            },
          }
        }),

      toggleMetronome: () => set((s) => ({ metronomeEnabled: !s.metronomeEnabled })),

      setSelectedChannel: (selectedChannelId) => set({ selectedChannelId }),

      randomizePattern: () =>
        set((s) => {
          const pattern = s.patterns[s.activePatternId]
          const channels = Object.fromEntries(
            CHANNEL_ORDER.map((id) => {
              const density = id === 'kick' ? 0.25 : id === 'bite' ? 0.2 : id === 'hat' ? 0.35 : 0.15
              const steps = pattern.channels[id].steps.map((step) => ({
                ...step,
                active: Math.random() < density,
                velocity: 0.5 + Math.random() * 0.5,
              }))
              return [id, { ...pattern.channels[id], steps }]
            })
          ) as Pattern['channels']
          return {
            patterns: {
              ...s.patterns,
              [s.activePatternId]: { ...pattern, channels, updatedAt: Date.now() },
            },
          }
        }),

      clearPattern: () =>
        set((s) => {
          const pattern = s.patterns[s.activePatternId]
          const channels = Object.fromEntries(
            CHANNEL_ORDER.map((id) => [
              id,
              { ...pattern.channels[id], steps: makeSteps(pattern.patternLength) },
            ])
          ) as Pattern['channels']
          return {
            patterns: {
              ...s.patterns,
              [s.activePatternId]: { ...pattern, channels, updatedAt: Date.now() },
            },
          }
        }),

      savePattern: (name) => {
        const s = get()
        const newId = generateId()
        const source = s.patterns[s.activePatternId]
        const newPattern: Pattern = {
          ...JSON.parse(JSON.stringify(source)),
          id: newId,
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        // Clear blob URLs and waveforms in saved copy
        for (const ch of Object.values(newPattern.channels)) {
          if (ch.audioUrl?.startsWith('blob:')) ch.audioUrl = null
          ch.waveformData = null
        }
        set((s) => ({
          patterns: { ...s.patterns, [newId]: newPattern },
          activePatternId: newId,
        }))
      },

      loadPattern: (patternId) => set({ activePatternId: patternId, currentStep: 0, playbackState: 'stopped' }),

      deletePattern: (patternId) =>
        set((s) => {
          const remaining = { ...s.patterns }
          delete remaining[patternId]
          const ids = Object.keys(remaining)
          if (ids.length === 0) {
            const id = generateId()
            remaining[id] = makeDefaultPattern(id)
            return { patterns: remaining, activePatternId: id }
          }
          return {
            patterns: remaining,
            activePatternId: s.activePatternId === patternId ? ids[ids.length - 1] : s.activePatternId,
          }
        }),

      copyChannelPattern: (fromId, toId) =>
        set((s) => {
          const pattern = s.patterns[s.activePatternId]
          const fromSteps = pattern.channels[fromId].steps.map((st) => ({ ...st }))
          return {
            patterns: {
              ...s.patterns,
              [s.activePatternId]: {
                ...pattern,
                channels: {
                  ...pattern.channels,
                  [toId]: { ...pattern.channels[toId], steps: fromSteps },
                },
              },
            },
          }
        }),

      renamePattern: (patternId, name) =>
        set((s) => ({
          patterns: {
            ...s.patterns,
            [patternId]: { ...s.patterns[patternId], name, updatedAt: Date.now() },
          },
        })),
    }),
    {
      name: 'noisebeat-store',
      version: 2, // bump when channel IDs change to discard stale data
      partialize: (s) => ({
        patterns: serializePatterns(s.patterns),
        activePatternId: s.activePatternId,
        masterVolume: s.masterVolume,
        metronomeEnabled: s.metronomeEnabled,
      }),
    }
  )
)
