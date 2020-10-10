const { require: requireRenderer } = require('./module')

const { shallowReactive } = requireRenderer('vue')

const namespaces = shallowReactive({})

function shareArray(name) {
  if (namespaces[name]) {
    return namespaces[name]
  }
  namespaces[name] = shallowReactive([])
  return namespaces[name]
}

module.exports = {
  shareArray,
}
