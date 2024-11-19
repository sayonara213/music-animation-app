import React, { useEffect, useRef, useState } from 'react'
import FrequencyVisualizer from 'src/components/SineWave/SineWave'
import { Card } from 'src/components/ui/card'
import { useAudioAnalyser } from 'src/hooks/useAudio'
import { AudioAnalyserManager } from 'src/lib/audioAnalyzer'
import { decibelsToScaleLog, volumeToColor } from 'src/lib/frequency'
import { useAnalyserStore } from 'src/stores/analyserStore'
import './index.css'
import { cx } from 'class-variance-authority'
import { useCalculateHighEnergyFrames } from 'src/hooks/useCalculateBassMax'
import { useAudioDataLoader } from 'src/hooks/useAudioDataLoader'
import { FreqBlob } from 'src/components/FreqBlob/FreqBlob'
import { useDetectChorusSections } from 'src/hooks/useHighIntensitySections'

export const HomePage = () => {
  const [isKick, setIsKick] = useState(false)
  const [isConsideredKick, setIsConsideredKick] = useState(false)
  const [isChorus, setIsChorus] = useState(false)
  const [currentTimestamp, setCurrentTimestamp] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)

  useAudioAnalyser(audioRef)
  useAudioDataLoader('/song.mp3')
  useCalculateHighEnergyFrames()
  useDetectChorusSections()

  const highEnergyFrames = useAnalyserStore((state) => state.highEnergyFrames)
  const volumes = useAnalyserStore((state) => state.volumes)
  const chorusSections = useAnalyserStore((state) => state.chorusSections)

  const handlePlay = () => {
    if (audioRef.current) {
      const audioManager = AudioAnalyserManager.getInstance()
      const audioContext = audioManager.getAudioContext()
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume()
      }
      audioRef.current.play()
    }
  }

  useEffect(() => {
    if (isConsideredKick) {
      setTimeout(() => {
        setIsKick(true)
      }, 60)
      setTimeout(() => {
        setIsKick(false)
      }, 160)
    }
  }, [isConsideredKick])

  useEffect(() => {
    let animationFrameId: number

    const updateTimestamp = () => {
      if (audioRef.current) {
        setCurrentTimestamp(audioRef.current.currentTime)
      }
      animationFrameId = requestAnimationFrame(updateTimestamp)
    }

    animationFrameId = requestAnimationFrame(updateTimestamp)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current || !currentTimestamp || !highEnergyFrames) return

    const tolerance = 0.1 // 100 milliseconds

    const isKickFrame = highEnergyFrames.some((frameTime) => Math.abs(currentTimestamp - frameTime) <= tolerance)

    setIsConsideredKick(isKickFrame)
  }, [currentTimestamp, highEnergyFrames, audioRef])

  useEffect(() => {
    if (!audioRef.current || !currentTimestamp || !chorusSections) return

    const isInChorus = chorusSections.some(
      (section) => currentTimestamp >= section.startTime && currentTimestamp <= section.endTime,
    )

    if (isInChorus) {
      // Trigger chorus-related effects
      setIsChorus(true)
    } else {
      setIsChorus(false)
    }
  }, [currentTimestamp, chorusSections, audioRef])

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-black text-white"
      style={isKick ? { backgroundColor: '#ff00bf', transition: 'all 0.1s' } : {}}
    >
      <Card
        className={cx([
          'z-50 w-full max-w-md bg-white/10 p-10 text-center backdrop-blur-3xl',
          isKick && 'animate-wiggle ',
        ])}
      >
        <p className="text-white">{volumes.low.toFixed(3)} dB</p>
        <p className="text-white">{volumes.mid.toFixed(3)} dB</p>
        <p className="text-white">{volumes.high.toFixed(3)} dB</p>
        {isChorus && <p>Chorus</p>}

        <audio ref={audioRef} controls onPlay={handlePlay} className="w-full focus:outline-none">
          <source src="/song.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </Card>

      <div
        style={{
          backgroundColor: volumeToColor(decibelsToScaleLog(volumes.high), '#381131'),
        }}
        className="absolute left-0 top-0 h-full w-full rounded-lg"
      />
      <div className="absolute bottom-0 left-0 z-10 w-full">
        <FrequencyVisualizer />
      </div>
      <FreqBlob
        volume={decibelsToScaleLog(volumes.high) * 1.5}
        className="z-3 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        color="rgba(82, 18, 255, 0.8)"
      />
      <FreqBlob
        volume={decibelsToScaleLog(volumes.mid)}
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        color="rgba(245, 39, 245, 0.8)"
      />
      <div
        className="z-4 absolute h-full w-full bg-white"
        style={{
          background: `radial-gradient(circle, rgba(9,9,121,0) 52%, rgba(255,0,0,0.04) 73%, rgba(255,0,110,0.3) 100%)`,
          opacity: decibelsToScaleLog(volumes.low) / 1000,
        }}
      />
    </div>
  )
}
