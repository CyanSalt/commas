import defaultSettings from '../assets/settings.json'
import {FileStorage} from '../plugins/storage'

function clone(object) {
  return JSON.parse(JSON.stringify(object))
}

function congruent(source, target) {
  return JSON.stringify(source) === JSON.stringify(target)
}

export default {
  states: {
    default: defaultSettings,
    user: clone(defaultSettings),
    watcher: null,
  },
  actions: {
    async load({state, action}) {
      // load user settings
      const declared = await FileStorage.load('settings.json')
      if (!declared) return state.get([this, 'user'])
      const data = {...clone(defaultSettings), ...declared}
      state.set([this, 'user'], data)
      return data
    },
    save({state}) {
      // filter default values on saving
      const data = state.get([this, 'user'])
      const reducer = (diff, [key, value]) => {
        if (!congruent(value, data[key])) {
          diff[key] = data[key]
        }
        return diff
      }
      // TODO: better data merging logic
      const computed = Object.entries(defaultSettings).reduce(reducer, {})
      FileStorage.save('settings.json', computed)
    },
    watch({state, action}, callback) {
      state.update([this, 'watcher'], watcher => {
        if (watcher) watcher.close()
        return FileStorage.watch('settings.json', async () => {
          callback(await action.dispatch([this, 'load']))
        })
      }, true)
    },
  },
}
