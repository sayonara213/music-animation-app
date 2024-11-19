import { useEffect } from 'react'
import { useAnalyserStore } from 'src/stores/analyserStore'
import Meyda from 'meyda'

export const useDetectChorusSections = () => {
  const audioBuffer = useAnalyserStore((state) => state.audioBuffer)
  const setChorusSections = useAnalyserStore((state) => state.setChorusSections)

  useEffect(() => {
    if (!audioBuffer) return

    const sampleRate = audioBuffer.sampleRate
    const channelData = audioBuffer.getChannelData(0)

    // **Set a smaller windowSize**
    const windowSize = 8192 // A smaller power of 2
    const hopSize = windowSize / 2 // 50% overlap
    const totalSamples = channelData.length
    const numWindows = Math.floor((totalSamples - windowSize) / hopSize)

    // Set Meyda configuration options
    Meyda.sampleRate = sampleRate
    Meyda.bufferSize = windowSize
    Meyda.windowingFunction = 'hamming'

    const spectralCentroids: number[] = []
    const rmsValues: number[] = []

    // **Process smaller windows**
    for (let i = 0; i < numWindows; i++) {
      const start = i * hopSize
      const window = channelData.slice(start, start + windowSize)

      // Extract features
      const features = Meyda.extract(['rms', 'spectralCentroid'], window)

      spectralCentroids.push(features!.spectralCentroid || 0)
      rmsValues.push(features!.rms || 0)
    }

    // **Aggregate features over longer durations**
    const aggregationWindow = 5 // seconds
    const aggregationSamples = aggregationWindow * sampleRate
    const windowsPerAggregation = Math.floor(aggregationSamples / hopSize)

    const aggregatedCentroids: number[] = []
    const aggregatedRms: number[] = []
    const aggregatedSections: { startTime: number; endTime: number }[] = []

    for (let i = 0; i < spectralCentroids.length; i += windowsPerAggregation) {
      const centroidSlice = spectralCentroids.slice(i, i + windowsPerAggregation)
      const rmsSlice = rmsValues.slice(i, i + windowsPerAggregation)

      const avgCentroid = centroidSlice.reduce((sum, val) => sum + val, 0) / centroidSlice.length
      const avgRms = rmsSlice.reduce((sum, val) => sum + val, 0) / rmsSlice.length

      aggregatedCentroids.push(avgCentroid)
      aggregatedRms.push(avgRms)

      // Determine start and end times for the aggregated window
      const startTime = (i * hopSize) / sampleRate
      const endTime = ((i + windowsPerAggregation) * hopSize) / sampleRate

      // Store the section if it meets the thresholds
      aggregatedSections.push({
        startTime,
        endTime,
      })
    }

    // Normalize aggregated features
    const maxRms = Math.max(...aggregatedRms)
    const normalizedRms = aggregatedRms.map((rms) => rms / maxRms)

    const maxCentroid = Math.max(...aggregatedCentroids)
    const normalizedCentroids = aggregatedCentroids.map((centroid) => centroid / maxCentroid)

    // Set thresholds
    const rmsThreshold = 0.5
    const centroidThreshold = 0.6

    // Detect chorus sections
    const chorusSections = aggregatedSections
      .filter(
        (section, index) => normalizedRms[index] >= rmsThreshold && normalizedCentroids[index] >= centroidThreshold,
      )
      .map((section) => ({
        startTime: section.startTime,
        endTime: section.endTime,
      }))

    // Store the detected sections
    setChorusSections(chorusSections)
  }, [audioBuffer, setChorusSections])
}
