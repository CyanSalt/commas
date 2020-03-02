export const createIDGenerator = iterator => {
  if (!iterator) iterator = id => id + 1
  let id = 0
  return () => {
    id = iterator(id)
    return id
  }
}
