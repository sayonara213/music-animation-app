declare module 'dsp.js' {
  export class FFT {
    constructor(bufferSize: number, sampleRate: number)
    forward(buffer: Float32Array): void
    spectrum: Float32Array
  }
  // Add any other classes or functions you use from dsp.js
}
