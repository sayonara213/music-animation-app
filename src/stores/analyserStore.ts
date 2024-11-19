import { create } from 'zustand'

interface VolumeLevels {
  low: number
  mid: number
  high: number
}

interface Section {
  startTime: number
  endTime: number
}

interface AnalyserState {
  volumes: VolumeLevels
  audioBuffer: AudioBuffer | null
  soundArray: Float32Array
  highEnergyFrames: number[]
  chorusSections: Section[]
  setHighEnergyFrames: (frames: number[]) => void
  updateVolumes: (volumes: VolumeLevels) => void
  updateSoundArray: (soundArray: Float32Array) => void
  setAudioData: (audioBuffer: AudioBuffer) => void
  setChorusSections: (sections: Section[]) => void
}

export const useAnalyserStore = create<AnalyserState>((set) => ({
  volumes: { low: 0, mid: 0, high: 0 },
  soundArray: new Float32Array(),
  audioBuffer: null,
  highEnergyFrames: [],
  chorusSections: [],
  setHighEnergyFrames: (frames) => set({ highEnergyFrames: frames }),
  updateVolumes: (volumes) => set({ volumes }),
  updateSoundArray: (soundArray) => set({ soundArray }),
  setAudioData: (audioBuffer) => set({ audioBuffer }),
  setChorusSections: (sections) => set({ chorusSections: sections }),
}))
