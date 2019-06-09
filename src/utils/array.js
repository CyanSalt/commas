export const updateItem = (array, target, patch) => {
  return array.map(item => {
    return item === target ? {...item, ...patch} : item
  })
}

export const removeIndex = (array, index) => {
  const result = [...array]
  result.splice(index, 1)
  return result
}
