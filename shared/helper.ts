type IDIterator = (id: number) => number

export function createIDGenerator(iterator?: IDIterator) {
  if (!iterator) {
    iterator = id => id + 1
  }
  let id = 0
  return () => {
    id = iterator!(id)
    return id
  }
}
