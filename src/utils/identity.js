export const createIDGenerator = () => {
  let counter = 0
  return () => ++counter
}
