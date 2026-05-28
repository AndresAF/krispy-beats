import { useEffect, useRef } from 'react'

interface Props {
  data: number[]
  color: string
  height?: number
  className?: string
}

export function WaveformDisplay({ data, color, height = 40, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const w = canvas.offsetWidth
    const h = height
    ctx.clearRect(0, 0, w, h)

    const barW = Math.max(1, w / data.length - 0.5)
    const mid = h / 2

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, w, 0)
    grad.addColorStop(0, color + '40')
    grad.addColorStop(0.5, color + 'cc')
    grad.addColorStop(1, color + '40')

    ctx.fillStyle = grad
    ctx.beginPath()

    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * w
      const barH = Math.max(1, data[i] * mid * 0.9)
      ctx.rect(x, mid - barH, barW, barH * 2)
    }

    ctx.fill()
  }, [data, color, height])

  return (
    <canvas
      ref={canvasRef}
      style={{ height, width: '100%' }}
      className={`waveform-canvas rounded ${className}`}
    />
  )
}
