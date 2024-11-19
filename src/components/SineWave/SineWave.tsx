import React, { useRef, useEffect } from 'react'
import { useAnalyserStore } from 'src/stores/analyserStore'

const FrequencyVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Access the FFT data (in decibels) from the store
  const soundArray = useAnalyserStore((state) => state.soundArray)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = 600 // Set desired height
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationFrameId: number

    const renderFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create gradient for the stroke
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, '#57076B')
      gradient.addColorStop(0.25, '#D058EE')
      gradient.addColorStop(0.5, '#C110EB')
      gradient.addColorStop(0.75, '#5E286B')
      gradient.addColorStop(1, '#950DB8')

      ctx.strokeStyle = gradient

      ctx.beginPath()

      const bufferLength = soundArray.length - 20
      const sliceWidth = canvas.width / bufferLength

      const minDb = -100 // Adjust based on expected range
      const maxDb = 100

      for (let i = 0; i < bufferLength; i++) {
        // Get decibel value and clamp it
        let dbValue = soundArray[i]
        dbValue = Math.max(minDb, Math.min(maxDb, dbValue))

        // Normalize to 0–1 range
        const linearValue = (dbValue - minDb) / (maxDb - minDb)

        // Map to canvas height (invert y-axis)
        const y = (1 - linearValue) * canvas.height

        const x = i * sliceWidth

        // Optional: Add random noise to y-value
        const noise = Math.random() * 10 - 5 // Adjust as needed
        const yWithNoise = y + noise

        // Optional: Random line width
        ctx.lineWidth = Math.random() * 10 + 1 // Random line width between 1 and 11

        if (i === 0) {
          ctx.moveTo(x, yWithNoise)
        } else {
          ctx.lineTo(x, yWithNoise)
        }
      }

      // Optional: Fill the area under the curve
      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.closePath()

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)' // Adjust fill color as desired
      ctx.fill()

      // Apply shadow effects
      ctx.shadowColor = '#F6055D'
      ctx.shadowBlur = 20
      ctx.shadowOffsetY = 5

      ctx.stroke()

      // Loop the animation
      animationFrameId = requestAnimationFrame(renderFrame)
    }

    renderFrame()

    // Cleanup on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [soundArray])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 'auto' }}></canvas>
}

export default FrequencyVisualizer
