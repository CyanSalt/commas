export const unreactive = object => new Proxy(object, {
  // Prevent `__ob__` and getters/setters
  defineProperty: () => true,
  // Prevent deep traversing
  ownKeys: () => [],
})
