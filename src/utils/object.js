export const clone = object => JSON.parse(JSON.stringify(object))

export const congruent = (source, target) => JSON.stringify(source) === JSON.stringify(target)

export const unreactive = object => new Proxy(object, {
  // Prevent `__ob__` and getters/setters
  defineProperty: () => true,
  // Prevent deep traversing
  ownKeys: () => [],
})
