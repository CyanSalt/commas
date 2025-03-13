type IDIterator = (id: bigint) => bigint

export function createIDGenerator(iterator?: IDIterator) {
  if (!iterator) {
    iterator = id => id + 1n
  }
  let id = 1n
  return () => {
    id = iterator(id)
    return id
  }
}

export function reuse<T>(fn: () => T) {
  const value = fn()
  return () => value
}

export type Generable<T, U, V> = U | Promise<U> | Generator<T, U, V> | AsyncGenerator<T, U, V>

export function isIterator(value: any): value is
  Iterator<unknown, unknown, unknown> | AsyncIterator<unknown, unknown, unknown> {
  return Boolean(value) && typeof value.next === 'function'
}

export async function *iterate<T, U, V>(iteratee: Generable<T, U, V>): AsyncGenerator<T, U, V> {
  if (!isIterator(iteratee)) {
    return iteratee as Awaited<U>
  }
  let payload: V
  let done: boolean | undefined
  while (!done) {
    const result = await iteratee.next(payload!)
    if (result.done) {
      return result.value as Awaited<U>
    } else {
      payload = yield result.value
    }
    done = result.done
  }
  return undefined as never
}

export async function flatAsync<T>(values: Iterable<T[] | PromiseLike<T[]>>) {
  const result = await Promise.all(values)
  return result.flat()
}
