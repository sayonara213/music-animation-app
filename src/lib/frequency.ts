import { hexToRgb } from './utils'

// Normalize a value between a range
export const normalize = (value: number, min: number, max: number): number => (value - min) / (max - min)

export const decibelsToScaleLog = (dbValue: number, minDb = -120, maxDb = -10, scaleMax = 1000): number => {
  const normalizedValue = Math.pow((dbValue - minDb) / (maxDb - minDb), 2) // Exponential scaling
  return dbValue < minDb ? 0 : Math.max(0, Math.min(normalizedValue * scaleMax, scaleMax))
}

// Convert a frequency value to an RGB color
export const freqToColor = (frequency: number): string => {
  const r = Math.min(255, frequency * 255) // Amplify red
  const g = Math.min(255, 255 - frequency * 255) // Reduce green
  const b = Math.min(255, 128 + frequency * 255) // Add blue tint
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

// Calculate average frequency
export const calculateAverageFrequency = (dataArray: Float32Array): number =>
  dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length

// Calculate overall volume (sum of all frequencies)
export const calculateVolume = (dataArray: Float32Array): number => dataArray.reduce((sum, val) => sum + val, 0)

// Normalize all frequencies in a given array
export const normalizeFrequencies = (dataArray: Float32Array): Float32Array => {
  const max = Math.max(...dataArray)
  return dataArray.map((value) => normalize(value, 0, max))
}

export const calculateFrequencyRangeAverage = (
  dataArray: Float32Array,
  rangeStart: number,
  rangeEnd: number,
): number => {
  let sum = 0
  let count = 0

  for (let i = rangeStart; i <= rangeEnd; i++) {
    sum += dataArray[i] || 0 // Ensure valid index
    count++ // Track the number of bins processed
  }

  return count > 0 ? sum / count : 0 // Avoid division by zero
}

export const calculateFrequalcyRangeHighest = (
  dataArray: Float32Array,
  rangeStart: number,
  rangeEnd: number,
): number => {
  let max = -Infinity // Start with the smallest possible value

  for (let i = rangeStart; i <= rangeEnd; i++) {
    max = Math.max(max, dataArray[i] || 0) // Update max if the current bin is louder
  }

  return max // Return the maximum amplitude in the range
}

// Split frequencies into low, mid, and high ranges
export const calculateLowMidHighVelocity = (dataArray: Float32Array): { low: number; mid: number; high: number } => {
  const totalBands = dataArray.length

  const lowRange = { start: 2, end: 4 } // First third
  const midRange = {
    start: 24,
    end: Math.floor(totalBands * 0.66),
  } // Second third
  const highRange = { start: 64, end: totalBands - 1 } // Last third

  return {
    low: calculateFrequalcyRangeHighest(dataArray, lowRange.start, lowRange.end),
    mid: calculateFrequencyRangeAverage(dataArray, midRange.start, midRange.end),
    high: calculateFrequalcyRangeHighest(dataArray, highRange.start, highRange.end),
  }
}

export const volumeToColor = (volume: number, colorHex: string, minVolume = 0, maxVolume = 1000): string => {
  // Clamp volume to the valid range
  const clampedVolume = Math.max(minVolume, Math.min(maxVolume, volume))

  // Normalize volume to a 0–1 range
  const normalizedVolume = (clampedVolume - minVolume) / (maxVolume - minVolume)
  const alpha = normalizedVolume // Alpha increases with volume

  // Convert hex color to RGB
  const rgb = hexToRgb(colorHex)
  if (!rgb) {
    throw new Error('Invalid color format. Please provide a valid hex color code.')
  }

  // Return the RGBA color as a string
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`
}

export const findMaxVolumeThresholdInDb = (dataArray: Float32Array): number => {
  let max = -Infinity

  for (let i = 0; i < dataArray.length; i++) {
    max = Math.max(max, dataArray[i])
  }

  return max
}

export const binToFrequency = (bin: number, sampleRate: number, fftSize: number): number => (bin * sampleRate) / fftSize

export const lerp = (current: number, target: number, factor: number): number => {
  return current + (target - current) * factor
}
