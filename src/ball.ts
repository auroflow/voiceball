import { state } from './state'
import { gameOver } from './main'

let rootElement = document.querySelector('html')!
let appElement = document.querySelector<HTMLDivElement>('#app')!
let scoreElement = document.querySelector<HTMLSpanElement>('#score-number')!

export function getLifeMsg(numLives: number) {
  let msg = ''
  for (let i = 0; i < numLives; i++) {
    msg += '♥'
  }
  return msg
}

export class Ball {
  x: number
  y: number
  maxX: number
  element: HTMLDivElement
  interval: number
  hit: boolean
  missed: boolean

  constructor(y: number) {
    this.maxX = rootElement.clientWidth - 60
    this.x = this.maxX
    this.y = y
    this.hit = false
    this.missed = false

    this.element = document.createElement('div')
    this.element.classList.add('ball')
    this.element.style.top = this.y + 'px'
    this.element.style.left = this.x + 'px'
    appElement.append(this.element)

    this.interval = setInterval(() => {
      this.x += this.hit ? 2 : -2
      this.element.style.left = this.x + 'px'
      if (this.x <= 0 && !this.missed) {
        if (this.isInBat()) {
          this.hit = true
        } else {
          this.missed = true
          state.lives--
          if (state.lives <= 0) {
            gameOver()
          } else {
            scoreElement.innerText = getLifeMsg(state.lives)
          }
        }
      } else if (this.x <= -30 || this.x > this.maxX) {
        clearInterval(this.interval)
        this.element.remove()
      }
    }, 1)
  }

  isInBat() {
    return (
      this.y >= state.batY &&
      this.y <= state.batY + appElement.clientHeight * 0.3
    )
  }
}
