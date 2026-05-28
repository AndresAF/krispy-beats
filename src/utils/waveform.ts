/** Decode an audio file and return a normalized waveform array of `samples` points.
 *  Uses OfflineAudioContext so it works without a user gesture. */
export async function extractWaveform(file: File, samples = 120): Promise<number[]> {
  const arrayBuffer = await file.arrayBuffer()
  // OfflineAudioContext doesn't require user interaction (no speakers involved)
  const tempCtx = new OfflineAudioContext(1, 1, 44100)
  const buffer = await tempCtx.decodeAudioData(arrayBuffer)

  const raw = buffer.getChannelData(0)
  const blockSize = Math.floor(raw.length / samples)
  const waveform: number[] = []

  for (let i = 0; i < samples; i++) {
    let sum = 0
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(raw[i * blockSize + j])
    }
    waveform.push(sum / blockSize)
  }

  // Normalize to 0–1
  const max = Math.max(...waveform, 0.001)
  return waveform.map((v) => v / max)
}
