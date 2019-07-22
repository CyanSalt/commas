import {readFileSync} from 'fs'
import {resolve} from 'path'
import fallback from '@/assets/themes/oceanic-next.json'
import FileStorage from '@/utils/storage'

function load(file) {
  const path = resolve(__dirname, `assets/themes/${file}.json`)
  try {
    return JSON.parse(readFileSync(path))
  } catch (err) {
    return null
  }
}

export default {
  namespaced: true,
  state: {
    fallback,
    theme: null,
    watcher: null,
  },
  mutations: {
    setTheme(state, value) {
      state.theme = value
    },
    setWatcher(state, value) {
      state.watcher = value
    },
  },
  actions: {
    async load({commit, dispatch, rootState}) {
      const theme = {...fallback}
      const settings = rootState.settings.settings
      const specified = settings['terminal.theme.name']
      if (specified && specified !== 'oceanic-next') {
        let file = load(specified)
        if (!file) {
          file = await FileStorage.load(`themes/${specified}.json`)
          if (file) dispatch('watch', `themes/${specified}.json`)
        }
        if (file) Object.assign(theme, file)
      }
      const customization = settings['terminal.theme.customization']
      if (customization) {
        Object.assign(theme, customization)
      }
      await dispatch('eject')
      commit('setTheme', theme)
      dispatch('inject')
    },
    inject({state, rootState}) {
      const theme = state.theme
      const settings = rootState.settings.settings
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
      const theme = state.theme
      if (!theme) return
      // TODO: performance review
      const element = document.getElementById('app-theme')
      if (element) element.remove()
      document.body.classList.remove(theme.type)
    },
    watch({state, commit, dispatch}, file) {
      if (state.watcher) state.watcher.close()
      const watcher = FileStorage.watch(file, async () => {
        await dispatch('load')
        dispatch('terminal/refresh', null, {root: true})
      })
      commit('setWatcher', watcher)
    },
  },
}
