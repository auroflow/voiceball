import { state } from './state'

const gun = document.querySelector<HTMLDivElement>('#gun')!
gun.style.top = state.gunY + 'px'

const appElement = document.querySelector<HTMLDivElement>('#app')!

let moveGunInterval = 0
let moveDown = true

function moveGun() {
  let height = appElement.clientHeight

  if (moveDown) {
    state.gunY += 1
    if (state.gunY >= height - 20) {
      moveDown = false
    }
  } else {
    state.gunY -= 1
    if (state.gunY <= 20) {
      moveDown = true
    }
  }

  if (Math.random() < 0.005) {
    moveDown = !moveDown
  }

  gun.style.top = state.gunY + 'px'
}

export function startGun() {
  if (moveGunInterval) return

  moveGunInterval = setInterval(moveGun, 5)
}

export function stopGun() {
  clearInterval(moveGunInterval)
  moveGunInterval = 0
}
