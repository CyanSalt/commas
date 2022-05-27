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

export function diligent<T>(fn: () => T) {
  const value = fn()
  return () => value
}

export interface Deferred {
  resolved: boolean,
  promise: Promise<void>,
  resolve: () => void,
}

export function createDeferred() {
  const deferred = {
    resolved: false,
  } as Deferred
  deferred.promise = new Promise<void>(resolve => {
    deferred.resolve = () => {
      deferred.resolved = true
      resolve()
    }
  })
  return deferred
}
