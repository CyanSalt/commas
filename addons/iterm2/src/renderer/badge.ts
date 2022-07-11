import * as commas from 'commas:api/renderer'

const generateID = commas.helper.createIDGenerator()

export interface Firework {
  id: number,
  position: {
    x: number,
    y: number,
  },
}

const fireworks = $ref<Firework[]>([])

export function useFireworks() {
  return $$(fireworks)
}

const badge = $ref('')

export function useBadge() {
  return $$(badge)
}

export function addFirework(position: Firework['position']) {
  fireworks.push({
    position,
    id: generateID(),
  })
}

export function removeFirework(target: Firework) {
  const targetIndex = fireworks.findIndex(item => item.id === target.id)
  if (targetIndex !== -1) {
    fireworks.splice(targetIndex, 1)
  }
}
