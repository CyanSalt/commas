import { ref, unref } from 'vue'
import { createIDGenerator } from '../utils/helper'

const generateID = createIDGenerator()

export interface Firework {
  id: number,
  position: {
    x: number,
    y: number,
  },
}

const fireworksRef = ref<Firework[]>([])

export function useFireworks() {
  return fireworksRef
}

export function addFirework(position: Firework['position']) {
  const fireworks = unref(fireworksRef)
  fireworks.push({
    position,
    id: generateID(),
  })
}

export function removeFirework(target: Firework) {
  const fireworks = unref(fireworksRef)
  const targetIndex = fireworks.findIndex(item => item.id === target.id)
  if (targetIndex !== -1) {
    fireworks.splice(targetIndex, 1)
  }
}
