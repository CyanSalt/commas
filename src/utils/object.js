export const unreactive = object => new Proxy(object, {
  // Prevent `__ob__` and getters/setters
  defineProperty: () => true,
  // Prevent deep traversing
  ownKeys: () => [],
})

export function regexp(expression) {
  const matches = expression.match(/^s\/(.+)\/([a-z]+)?$/)
  if (!matches) return null
  try {
    return new RegExp(matches[1], matches[2])
  } catch {
    return null
  }
}
