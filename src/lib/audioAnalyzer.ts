export class AudioAnalyserManager {
  private static instance: AudioAnalyserManager
  private audioContext: AudioContext | null = null
  private analyserNode: AnalyserNode | null = null
  private source: MediaElementAudioSourceNode | null = null
  private audioElement: HTMLAudioElement | null = null

  private constructor() {
    // Private constructor, singleton
  }

  public static getInstance(): AudioAnalyserManager {
    if (!AudioAnalyserManager.instance) {
      AudioAnalyserManager.instance = new AudioAnalyserManager()
    }
    return AudioAnalyserManager.instance
  }

  public init(audioElement: HTMLAudioElement): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }

    if (this.audioElement !== audioElement) {
      this.audioElement = audioElement
      this.source?.disconnect()
      this.source = this.audioContext.createMediaElementSource(audioElement)
    }

    if (!this.analyserNode) {
      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = 512
      this.source?.connect(this.analyserNode)
      this.analyserNode.connect(this.audioContext.destination)
    }
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode
  }

  public getAudioContext(): AudioContext | null {
    return this.audioContext
  }
}
