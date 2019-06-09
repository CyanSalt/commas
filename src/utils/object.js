export const clone = object => JSON.parse(JSON.stringify(object))

export const congruent = (source, target) => JSON.stringify(source) === JSON.stringify(target)
