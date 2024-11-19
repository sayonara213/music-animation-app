import { useEffect } from 'react'
import { useAnalyserStore } from 'src/stores/analyserStore'

export const useCalculateHighEnergyFrames = () => {
  const audioBuffer = useAnalyserStore((state) => state.audioBuffer)
  const setHighEnergyFrames = useAnalyserStore((state) => state.setHighEnergyFrames)

  useEffect(() => {
    console.log('Calculating high energy frames')

    if (!audioBuffer) return

    const channelData = audioBuffer.getChannelData(0) // Assuming mono or first channel
    const sampleRate = audioBuffer.sampleRate

    const frameSize = Math.floor(0.05 * sampleRate) // 50 ms frames
    const hopSize = Math.floor(frameSize / 2) // 25 ms overlap
    const totalSamples = channelData.length
    const numFrames = Math.floor((totalSamples - frameSize) / hopSize)

    const rmsValues = []

    for (let i = 0; i < numFrames; i++) {
      const start = i * hopSize
      const end = start + frameSize
      const frame = channelData.slice(start, end)

      // Calculate RMS
      let sumSquares = 0
      for (let j = 0; j < frame.length; j++) {
        sumSquares += frame[j] * frame[j]
      }
      const rms = Math.sqrt(sumSquares / frame.length)
      rmsValues.push(rms)
    }

    // Normalize RMS values
    const maxRms = Math.max(...rmsValues)
    const normalizedRms = rmsValues.map((rms) => rms / maxRms)

    // Set a threshold (e.g., 0.8)
    const threshold = 0.7

    // Detect high-energy moments
    const highEnergyFrames = normalizedRms
      .map((value, index) => (value >= threshold ? index : -1))
      .filter((index) => index !== -1)

    const out = highEnergyFrames.map((frameIndex) => (frameIndex * hopSize) / sampleRate)
    console.log(out)
    console.log('finish calculating high energy frames')

    setHighEnergyFrames(out)

    // **Store the maximum bass amplitude in decibels in the store**
  }, [audioBuffer, setHighEnergyFrames])
}
