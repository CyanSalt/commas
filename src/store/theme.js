import {readFileSync} from 'fs'
import {resolve} from 'path'
import defaultTheme from '../assets/themes/oceanic-next.json'
import {FileStorage} from '../plugins/storage'

function load(file) {
  const path = resolve(__dirname, `assets/themes/${file}.json`)
  try {
    return JSON.parse(readFileSync(path))
  } catch (e) {
    return null
  }
}

export default {
  states: {
    default: defaultTheme,
    user: {},
  },
  actions: {
    async load({state, action}) {
      const theme = defaultTheme
      const settings = state.get('settings.user')
      const specified = settings['terminal.theme.name']
      if (specified && specified !== 'oceanic-next') {
        const file = load(specified) ||
          await FileStorage.load(`themes/${specified}.json`)
        if (file) Object.assign(theme, file)
      }
      const customization = settings['terminal.theme.customization']
      if (customization) {
        Object.assign(theme, customization)
      }
      state.set([this, 'user'], theme)
      action.dispatch([this, 'inject'])
    },
    inject({state}) {
      const theme = state.get([this, 'user'])
      const settings = state.get('settings.user')
      const element = document.createElement('style')
      const properties = {}
      Object.keys(theme).forEach(key => {
        properties[`--theme-${key.toLowerCase()}`] = theme[key]
      })
      // TODO: use custom.css instead of styles in settings.json
      properties['font-size'] = settings['terminal.style.fontSize'] + 'px'
      properties['font-family'] = settings['terminal.style.fontFamily']
      const declarations = Object.keys(properties)
        .map(key => `${key}: ${properties[key]};`).join(' ')
      element.appendChild(document.createTextNode(`#main { ${declarations} }`))
      document.head.appendChild(element)
    },
  }
}
