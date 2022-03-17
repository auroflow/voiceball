import { state } from './state'

const bat = document.querySelector<HTMLDivElement>('#bat')!
bat.style.top = state.batY + 'px'

export function setTop(top: number) {
  console.log('set top ' + top)
  state.batY = top
  bat.style.top = state.batY.toFixed(0) + 'px'
}
