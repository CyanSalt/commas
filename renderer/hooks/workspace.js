import { remote } from 'electron'
import { createIDGenerator } from '../utils/identity'
import { unreactive } from '../utils/helper'
import InternalPanel from '../components/internal-panel'
import SwitchControl from '../components/switch-control'
import LoadingSpinner from '../components/loading-spinner'
import { ui } from './core'
import intl from './i18n'

/**
 * @typedef {import('vue').Component} VueComponent
 *
 * @typedef {import('../utils/terminal').TerminalTab} TerminalTab
 *
 * @typedef InternalTerminalInfo
 * @property {string} icon
 * @property {VueComponent} component
 *
 * @typedef {TerminalTab} InternalTerminal
 * @property {InternalTerminalInfo} internal
 */

const generateID = createIDGenerator(id => id - 1)

/**
 * @typedef InternalTerminalOptions
 * @property {string} title
 * @property {string} icon
 * @property {VueComponent} component
 * @property {boolean} [i18n]
 *
 * @param {InternalTerminalOptions} options
 * @returns {InternalTerminal}
 */
const createInternalTerminal = ({ title, icon, component, i18n }) => unreactive({
  internal: {
    icon,
    component,
  },
  id: generateID(),
  process: remote.app.name,
  title: i18n ? intl.translate(title, i18n) : title,
  cwd: '',
})

/**
 * @type {VueComponent[]}
 */
const anchors = []

/**
 * @type {{[key: string]: InternalTerminal}}
 */
const panels = {}

/**
 * @type {{[name: string]: VueComponent}}
 */
const components = {
  'internal-panel': InternalPanel,
  'switch-control': SwitchControl,
  'loading-spinner': LoadingSpinner,
}

export default {
  component: {
    /**
     * @param {string} name
     */
    get(name) {
      return components[name]
    },
    /**
     * @param {string[]} names
     */
    pick(names) {
      return names.reduce((result, name) => {
        result[name] = components[name]
        return result
      }, {})
    },
  },
  anchor: {
    all() {
      return anchors
    },
    /**
     * @param {VueComponent} component
     */
    add(component) {
      if (anchors.includes(component)) return anchors.length
      return anchors.push(component)
    },
  },
  panel: {
    /**
     * @param {string} key
     * @param {InternalTerminalOptions} options
     */
    register(key, options) {
      if (panels[key]) {
        throw new Error(`Panel '${key}' has already exists`)
      }
      panels[key] = createInternalTerminal(options)
    },
    /**
     * @param {string} key
     */
    open(key) {
      if (!panels[key]) return false
      ui.store.dispatch('terminal/interact', panels[key])
      return true
    },
  },
}
