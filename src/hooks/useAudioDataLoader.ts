import { useEffect } from 'react'
import { useAnalyserStore } from '../stores/analyserStore'

export const useAudioDataLoader = (audioUrl: string) => {
  const setAudioData = useAnalyserStore((state) => state.setAudioData)

  useEffect(() => {
    const audioContext = new window.AudioContext()

    fetch(audioUrl)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        setAudioData(audioBuffer)
        audioContext.close()
      })
      .catch((error) => {
        console.error('Error decoding audio data:', error)
      })
  }, [audioUrl, setAudioData])
}
