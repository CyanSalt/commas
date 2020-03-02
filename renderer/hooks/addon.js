import hooks from './index'

const sharedData = {}

export default {
  load(addon) {
    if (!addon || typeof addon.install !== 'function') {
      throw new Error('An addon must be an object with \'install\' method.')
    }
    try {
      addon.install(hooks)
    } catch (err) {
      console.error(err)
    }
  },
  data: {
    get(namespace) {
      if (!sharedData[namespace]) sharedData[namespace] = []
      return sharedData[namespace]
    },
    add(namespace, data) {
      if (!sharedData[namespace]) sharedData[namespace] = []
      sharedData[namespace].push(data)
    },
    remove(namespace, data) {
      if (sharedData[namespace]) {
        sharedData[namespace] = sharedData[namespace].filter(value => value !== data)
      }
    },
  },
}
