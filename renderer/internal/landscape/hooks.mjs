import { ref } from 'vue'

export const nonceRef = ref(Date.now())
export function useNonce() {
  return nonceRef
}

export function refreshLandscapeBackground() {
  nonceRef.value = Date.now()
}
