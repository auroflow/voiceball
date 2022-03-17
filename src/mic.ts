import { PitchDetector } from 'pitchy'
import { state, ALPHA } from './state'
import { setTop } from './bat'

// init pitch
let micInited = false
let isInitializing = false
let initPitchButton = document.querySelector<HTMLButtonElement>('#init-pitch')!
let startGameButton = document.querySelector<HTMLButtonElement>('#start-game')!
const appElement = document.querySelector<HTMLDivElement>('#app')!
const pitchElement = document.querySelector<HTMLSpanElement>('#pitch')!
const clarityElement = document.querySelector<HTMLSpanElement>('#clarity')!
const volumeElement = document.querySelector<HTMLSpanElement>('#volume')!
const minPitchElement = document.querySelector<HTMLSpanElement>('#min-pitch')!
const maxPitchElement = document.querySelector<HTMLSpanElement>('#max-pitch')!

initPitchButton.addEventListener('click', () => {
  if (!micInited) {
    micInited = true
    initMic()
  }
  if (!isInitializing) {
    state.minPitch = 0
    state.maxPitch = 0
    minPitchElement.innerText = '0'
    maxPitchElement.innerText = '0'
    isInitializing = true
    startGameButton.disabled = true
    initPitchButton.innerText = 'Stop setting pitch range'
  } else {
    isInitializing = false
    initPitchButton.innerText = 'Reset pitch range'
    if (state.minPitch && state.maxPitch) {
      startGameButton.removeAttribute('disabled')
    }
  }
})

function initMic() {
  console.log('initing')
  const audioContext = new window.AudioContext()
  const analyser = audioContext.createAnalyser()

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    audioContext.createMediaStreamSource(stream).connect(analyser)
    const detector = PitchDetector.forFloat32Array(analyser.fftSize)
    const input = new Float32Array(detector.inputLength)
    trackPitch(analyser, detector, input, audioContext.sampleRate)
    initPitchButton.removeAttribute('disabled')
  })
}

function trackPitch(
  analyser: AnalyserNode,
  detector: PitchDetector<Float32Array>,
  input: Float32Array,
  sampleRate: number
) {
  let start: number
  let timeElapsed = 0

  const nextFrame = (timestamp: number) => {
    if (start === undefined) {
      start = timestamp
    }
    timeElapsed = timestamp - start
    if (timeElapsed >= 16) {
      start = timestamp
      let [pitch, clarity, volume] = getPitch(
        analyser,
        detector,
        input,
        sampleRate
      )
      update(pitch, clarity, volume)
    }
    requestAnimationFrame(nextFrame)
  }

  nextFrame(0)
}

function getPitch(
  analyser: AnalyserNode,
  detector: PitchDetector<Float32Array>,
  input: Float32Array,
  sampleRate: number
) {
  analyser.getFloatTimeDomainData(input)
  const [pitch, clarity] = detector.findPitch(input, sampleRate)
  let sumSquares = 0.0
  for (const amplitude of input) {
    sumSquares += amplitude * amplitude
  }
  const volume = sumSquares / input.length
  return [pitch, clarity, volume]
}

function update(pitch: number, clarity: number, volume: number) {
  if (isInitializing) {
    if (volume >= 0.006 && clarity >= 0.95) {
      state.minPitch = state.minPitch ? Math.min(state.minPitch, pitch) : pitch
      state.maxPitch = state.maxPitch ? Math.max(state.maxPitch, pitch) : pitch
      minPitchElement.innerHTML = state.minPitch.toFixed(2)
      maxPitchElement.innerHTML = state.maxPitch.toFixed(2)
    }
  } else {
    pitchElement.innerHTML = pitch.toFixed(2)
    clarityElement.innerHTML = clarity.toFixed(2)
    volumeElement.innerHTML = volume.toFixed(5)

    if (volume >= 0.006 && clarity >= 0.98) {
      const percentage = getPercentage(pitch)
      const height = appElement.clientHeight
      const top = height * 0.7 * (1 - percentage)
      let batY = (1 - ALPHA) * state.batY + ALPHA * top
      setTop(batY)
    }
  }
}

function getPercentage(pitch: number) {
  const percentage =
    (Math.log(pitch) - Math.log(state.minPitch)) /
    (Math.log(state.maxPitch) - Math.log(state.minPitch))
  if (percentage < 0) return 0
  else if (percentage > 1) return 1
  else return percentage
}
