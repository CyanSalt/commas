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

function shareDataIntoArray(name, data) {
  const sharedArray = shareArray(name)
  sharedArray.push(data)
  this.$.app.onCleanup(() => {
    const index = sharedArray.indexOf(data)
    sharedArray.splice(index, 1)
  })
}

module.exports = {
  shareArray,
  shareDataIntoArray,
}
