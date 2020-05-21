/**
 * @template {number} T
 * @param {(id: T) => T} iterator
 */
export const createIDGenerator = iterator => {
  if (!iterator) iterator = id => id + 1
  /** @type {T} */
  let id = 0
  return () => {
    id = iterator(id)
    return id
  }
}
