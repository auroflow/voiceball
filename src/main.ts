import './style.css'
import { state, TOTAL_LIVES } from './state'
import './bat'
import { Ball, getLifeMsg } from './ball'
import { startGun, stopGun } from './gun'
import './mic'

let initPitchButton = document.querySelector<HTMLButtonElement>('#init-pitch')!
let startGameButton = document.querySelector<HTMLButtonElement>('#start-game')!
let scoreElement = document.querySelector<HTMLSpanElement>('#score-number')!

startGameButton.addEventListener('click', () => {
  state.serveBallInterval = setInterval(() => {
    new Ball(state.gunY)
  }, 1000)
  initPitchButton.disabled = true
  startGameButton.disabled = true
  state.lives = TOTAL_LIVES
  scoreElement.innerText = getLifeMsg(state.lives)
  startGun()
})

export function gameOver() {
  scoreElement.innerText = 'Game over!'
  clearInterval(state.serveBallInterval)
  state.serveBallInterval = 0
  startGameButton.removeAttribute('disabled')
  initPitchButton.removeAttribute('disabled')
  stopGun()
}
