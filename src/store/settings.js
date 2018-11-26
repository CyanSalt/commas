import defaultSettings from '../assets/settings.json'
import {FileStorage} from '../plugins/storage'

export default {
  states: {
    default: defaultSettings,
    user: {},
  },
  actions: {
    async load({state}) {
      // load user settings
      const copied = JSON.parse(JSON.stringify(defaultSettings))
      const declared = await FileStorage.load('settings.json')
      const data = declared ? {...copied, ...declared} : copied
      state.set([this, 'user'], data)
      return data
    },
    save({state}) {
      // filter default values on saving
      const data = state.get([this, 'user'])
      const reducer = (diff, [key, value]) => {
        if (JSON.stringify(value) !== JSON.stringify(data[key])) {
          diff[key] = data[key]
        }
        return diff
      }
      const computed = Object.entries(defaultSettings).reduce(reducer, {})
      FileStorage.save('settings.json', computed)
    },
  },
}
