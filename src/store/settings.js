import fallback from '../assets/settings.json'
import {FileStorage} from '../plugins/storage'

function clone(object) {
  return JSON.parse(JSON.stringify(object))
}

function congruent(source, target) {
  return JSON.stringify(source) === JSON.stringify(target)
}

export default {
  states: {
    default: fallback,
    user: clone(fallback),
    watcher: null,
  },
  actions: {
    async load({state, action}) {
      // load user settings
      const declared = await FileStorage.load('settings.json')
      if (!declared) return state.get([this, 'user'])
      const data = {...clone(fallback), ...declared}
      state.set([this, 'user'], data)
      return data
    },
    save({state}) {
      // filter default values on saving
      const data = state.get([this, 'user'])
      const reducer = (diff, [key, value]) => {
        if (!congruent(value, fallback[key])) {
          diff[key] = fallback[key]
        }
        return diff
      }
      // TODO: better data merging logic
      const computed = Object.entries(data).reduce(reducer, {})
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
