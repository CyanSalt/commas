import {remote} from 'electron'
import {createIDGenerator} from '@/utils/identity'
import {translate} from '@/utils/i18n'
import {unreactive} from '@/utils/object'
import InternalPanel from '@/components/internal-panel'
import SwitchControl from '@/components/switch-control'
import LoadingSpinner from '@/components/loading-spinner'
import {ui} from './core'

const generateID = createIDGenerator(id => id - 1)

const createInternalTerminal = ({title, icon, component, i18n}) => unreactive({
  internal: {
    icon,
    component,
  },
  id: generateID(),
  process: remote.app.name,
  title: i18n ? translate(title, i18n) : title,
  cwd: '',
})

const anchors = []
const panels = {}
const components = {
  'internal-panel': InternalPanel,
  'switch-control': SwitchControl,
  'loading-spinner': LoadingSpinner,
}

export default {
  component: {
    get(name) {
      return components[name]
    },
    pick(names) {
      return names.reduce((result, name) => {
        result[name] = components[name]
        return result
      }, {})
    },
  },
  anchor: {
    all() {
      return anchors.concat()
    },
    add(components) {
      if (anchors.includes(components)) return anchors.length
      return anchors.push(components)
    },
  },
  panel: {
    register(key, options) {
      if (panels[key]) {
        throw new Error(`Panel '${key}' has already exists`)
      }
      panels[key] = createInternalTerminal(options)
    },
    open(key) {
      if (!panels[key]) return false
      ui.store.dispatch('terminal/interact', panels[key])
      return true
    },
  },
}
