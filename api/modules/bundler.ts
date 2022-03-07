const cache: Record<string, any> = Object.create(null)

function connect(data, prefix?: string) {
  if (prefix) {
    Object.assign(cache, Object.fromEntries(Object.entries(data).map(([key, value]) => [
      key.startsWith(prefix) ? key.slice(prefix.length) : key, value,
    ])))
  } else {
    Object.assign(cache, data)
  }
}

function extract(request: string) {
  return cache[request]
}

export * from '../shim'

export {
  connect,
  extract,
}
