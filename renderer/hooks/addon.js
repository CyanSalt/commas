import hooks from './index'

/**
 * @typedef Addon
 * @property {(hooks: typeof hooks) => void} install
 */

/**
 * @type {{[namespace: string]: any[]}}
 */
const sharedData = {}

export default {
  /**
   * @param {Addon} addon
   */
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
    /**
     * @param {string} namespace
     */
    get(namespace) {
      if (!sharedData[namespace]) sharedData[namespace] = []
      return sharedData[namespace]
    },
    /**
     * @param {string} namespace
     * @param {any} data
     */
    add(namespace, data) {
      if (!sharedData[namespace]) sharedData[namespace] = []
      sharedData[namespace].push(data)
    },
    /**
     * @param {string} namespace
     * @param {any} data
     */
    remove(namespace, data) {
      if (sharedData[namespace]) {
        sharedData[namespace] = sharedData[namespace].filter(value => value !== data)
      }
    },
  },
}
