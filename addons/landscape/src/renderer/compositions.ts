let nonce = $ref(Date.now())

export function useNonce() {
  return $$(nonce)
}

export function refreshLandscapeBackground() {
  nonce = Date.now()
}
