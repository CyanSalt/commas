const defined: Record<string, any> = Object.create(null)

function define(data: Record<string, any>) {
  Object.assign(defined, data)
}

let context = __non_webpack_require__

function connect(data) {
  context = data
}

function extract(request: string) {
  return defined[request]
    ? __webpack_require__(defined[request])
    : context(`./${request}`)
}

export {
  connect,
  define,
  extract,
}
