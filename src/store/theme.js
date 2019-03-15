import {readFileSync} from 'fs'
import {resolve} from 'path'
import fallback from '../assets/themes/oceanic-next.json'
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
    default: fallback,
    user: null,
    watcher: null,
  },
  actions: {
    async load({state, action}) {
      const theme = {...fallback}
      const settings = state.get('settings.user')
      const specified = settings['terminal.theme.name']
      if (specified && specified !== 'oceanic-next') {
        let file = load(specified)
        if (!file) {
          file = await FileStorage.load(`themes/${specified}.json`)
          if (file) action.dispatch([this, 'watch'], `themes/${specified}.json`)
        }
        if (file) Object.assign(theme, file)
      }
      const customization = settings['terminal.theme.customization']
      if (customization) {
        Object.assign(theme, customization)
      }
      action.dispatch([this, 'eject'])
      state.set([this, 'user'], theme)
      action.dispatch([this, 'inject'])
    },
    inject({state}) {
      const theme = state.get([this, 'user'])
      const settings = state.get('settings.user')
      const element = document.createElement('style')
      element.id = 'app-theme'
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
      document.body.classList.add(theme.type)
    },
    eject({state}) {
      const theme = state.get([this, 'user'])
      if (!theme) return
      // TODO: performance review
      const element = document.getElementById('app-theme')
      if (element) element.remove()
      document.body.classList.remove(theme.type)
    },
    watch({state, action}, file) {
      state.update([this, 'watcher'], watcher => {
        if (watcher) watcher.close()
        return FileStorage.watch(file, async () => {
          await action.dispatch([this, 'load'])
          action.dispatch('terminal.refresh')
        })
      }, true)
    },
  },
}
